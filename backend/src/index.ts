import { SignJWT, jwtVerify } from "jose";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

const encoder = new TextEncoder();

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      ...extraHeaders,
    },
  });
}

// Vite dev server origin. Adjust if you change ports.
const DEV_ORIGIN = "http://localhost:5173";

function corsHeaders(origin: string | null) {
  const allowOrigin = origin === DEV_ORIGIN ? origin : DEV_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

function hashPassword(password: string): string {
  const passwordBytes = encoder.encode(password);
  const hashBytes = sha256(passwordBytes);
  return bytesToHex(hashBytes);
}

// Helper: verify JWT, verify session not revoked/expired, return uid/jti
async function requireAuth(request: Request, env: Env) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false as const, res: json({ error: "Missing Bearer token" }, 401) };
  }

  const token = authHeader.substring(7);

  try {
    const { payload } = await jwtVerify(token, encoder.encode(env.JWT_SECRET));

    const session = await env.DB.prepare(
      "SELECT revoked_at, expires_at FROM auth_sessions WHERE jti = ?"
    )
      .bind(payload.jti)
      .first();

    if (!session) return { ok: false as const, res: json({ error: "Session not found" }, 401) };
    if (session.revoked_at) return { ok: false as const, res: json({ error: "Session revoked" }, 401) };

    if (new Date(session.expires_at as string) < new Date()) {
      return { ok: false as const, res: json({ error: "Session expired" }, 401) };
    }

    return {
      ok: true as const,
      uid: payload.uid as number,
      jti: payload.jti as string,
    };
  } catch {
    return { ok: false as const, res: json({ error: "Invalid token" }, 401) };
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // ----- CORS preflight -----
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("Origin")) });
    }

    const withCors = (res: Response) => {
      const headers = corsHeaders(request.headers.get("Origin"));
      Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    };

    // ---------------- SIGNUP ----------------
    if (url.pathname === "/auth/signup" && request.method === "POST") {
      const { email, password } = await request.json();
      if (!email || !password) {
        return withCors(json({ error: "Missing email or password" }, 400));
      }

      const password_hash = hashPassword(password);

      try {
        await env.DB.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)")
          .bind(email, password_hash)
          .run();
      } catch {
        return withCors(json({ error: "User already exists" }, 409));
      }

      return withCors(json({ ok: true }));
    }

    // ---------------- LOGIN ----------------
    if (url.pathname === "/auth/login" && request.method === "POST") {
      const { email, password } = await request.json();
      const password_hash = hashPassword(password);

      const user = await env.DB.prepare(
        "SELECT id FROM users WHERE email = ? AND password_hash = ?"
      )
        .bind(email, password_hash)
        .first();

      if (!user) {
        return withCors(json({ error: "Invalid credentials" }, 401));
      }

      const sessionId = crypto.randomUUID();
      const issuedAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const jwt = await new SignJWT({ uid: user.id, jti: sessionId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(encoder.encode(env.JWT_SECRET));

      await env.DB.prepare(
        "INSERT INTO auth_sessions (id, user_id, jti, issued_at, expires_at) VALUES (?, ?, ?, ?, ?)"
      )
        .bind(sessionId, user.id, sessionId, issuedAt, expiresAt)
        .run();

      // optional: track last login
      try {
        await env.DB.prepare("UPDATE users SET last_login_at = ? WHERE id = ?")
          .bind(new Date().toISOString(), user.id)
          .run();
      } catch {}

      return withCors(json({ token: jwt }));
    }

    // ---------------- GET USER INFO ----------------
    if (url.pathname === "/api/me" && request.method === "GET") {
      const auth = await requireAuth(request, env);
      if (!auth.ok) return withCors(auth.res);

      const user = await env.DB.prepare("SELECT id, email, role FROM users WHERE id = ?")
        .bind(auth.uid)
        .first();

      if (!user) return withCors(json({ error: "User not found" }, 404));

      return withCors(
        json({
          id: user.id,
          email: user.email,
          role: user.role || "client",
        })
      );
    }

    // ---------------- PROFILE ----------------
    if (url.pathname === "/api/profile" && request.method === "GET") {
      const auth = await requireAuth(request, env);
      if (!auth.ok) return withCors(auth.res);

      const profile = await env.DB.prepare(
        "SELECT user_id, first_name, last_name, phone, dob, emergency_name, emergency_phone FROM client_profiles WHERE user_id = ?"
      )
        .bind(auth.uid)
        .first();

      return withCors(json({ profile: profile || null }));
    }

    if (url.pathname === "/api/profile" && request.method === "PUT") {
      const auth = await requireAuth(request, env);
      if (!auth.ok) return withCors(auth.res);

      const body = await request.json();
      const {
        first_name = null,
        last_name = null,
        phone = null,
        dob = null,
        emergency_name = null,
        emergency_phone = null,
      } = body || {};

      await env.DB.prepare(
        `INSERT INTO client_profiles (user_id, first_name, last_name, phone, dob, emergency_name, emergency_phone)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           first_name=excluded.first_name,
           last_name=excluded.last_name,
           phone=excluded.phone,
           dob=excluded.dob,
           emergency_name=excluded.emergency_name,
           emergency_phone=excluded.emergency_phone`
      )
        .bind(auth.uid, first_name, last_name, phone, dob, emergency_name, emergency_phone)
        .run();

      return withCors(json({ ok: true }));
    }

    // ---------------- WAIVER STATUS ----------------
    if (url.pathname === "/api/waiver/status" && request.method === "GET") {
      const auth = await requireAuth(request, env);
      if (!auth.ok) return withCors(auth.res);

      const activeWaiver = await env.DB.prepare(
        "SELECT id, title, body FROM waivers WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1"
      ).first();

      if (!activeWaiver) return withCors(json({ error: "No active waiver configured" }, 500));

      const sig = await env.DB.prepare(
        "SELECT id, signed_at, signed_name FROM waiver_signatures WHERE user_id = ? AND waiver_id = ? ORDER BY signed_at DESC LIMIT 1"
      )
        .bind(auth.uid, activeWaiver.id)
        .first();

      return withCors(
        json({
          waiver: activeWaiver,
          signed: !!sig,
          signature: sig || null,
        })
      );
    }

    // ---------------- WAIVER SIGN ----------------
    if (url.pathname === "/api/waiver/sign" && request.method === "POST") {
      const auth = await requireAuth(request, env);
      if (!auth.ok) return withCors(auth.res);

      const { signed_name } = await request.json();
      if (!signed_name || String(signed_name).trim().length < 2) {
        return withCors(json({ error: "signed_name is required" }, 400));
      }

      const activeWaiver = await env.DB.prepare(
        "SELECT id FROM waivers WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1"
      ).first();

      if (!activeWaiver) return withCors(json({ error: "No active waiver configured" }, 500));

      const signatureId = crypto.randomUUID();
      const userAgent = request.headers.get("User-Agent");
      const ip = request.headers.get("CF-Connecting-IP");

      await env.DB.prepare(
        "INSERT INTO waiver_signatures (id, user_id, waiver_id, signed_name, user_agent, ip_address) VALUES (?, ?, ?, ?, ?, ?)"
      )
        .bind(signatureId, auth.uid, activeWaiver.id, String(signed_name).trim(), userAgent, ip)
        .run();

      return withCors(json({ ok: true }));
    }

    // ---------------- FALLBACK ----------------
    return withCors(new Response("Not Found", { status: 404 }));
  },
};