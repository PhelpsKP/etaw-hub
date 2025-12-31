import { SignJWT, jwtVerify } from "jose";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import bcrypt from "bcryptjs";

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  ALLOWED_ORIGINS?: string;
  EMAIL_FROM?: string;
  EMAIL_FROM_NAME?: string;
  MAILCHANNELS_API_KEY?: string;
  REMINDERS_DRY_RUN?: string;
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

// Helper: check if origin is allowed
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;

  // Allow local development on any port (localhost:* or 127.0.0.1:*)
  if (origin.match(/^http:\/\/localhost:\d+$/)) {
    return true;
  }
  if (origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
    return true;
  }

  // Allow Cloudflare Pages (both production and preview URLs)
  // Production: https://etaw-hub.pages.dev
  // Preview: https://etaw-hub-xxx.pages.dev or https://xxx.etaw-hub.pages.dev
  if (origin.match(/^https:\/\/.*\.pages\.dev$/)) {
    return true;
  }

  return false;
}

// Helper: generate CORS headers for allowed origins
function corsHeaders(origin: string | null) {
  const allowedOrigin = isAllowedOrigin(origin) ? origin : "http://localhost:5173";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

// Legacy SHA-256 hashing (for comparison with old hashes only)
function hashPasswordLegacy(password: string): string {
  const passwordBytes = encoder.encode(password);
  const hashBytes = sha256(passwordBytes);
  return bytesToHex(hashBytes);
}

// Modern bcrypt hashing (for new users and upgrades)
async function hashPasswordBcrypt(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Verify bcrypt hash
async function verifyPasswordBcrypt(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
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

// Helper: verify admin role
async function requireAdmin(request: Request, env: Env) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth;

  const user = await env.DB.prepare("SELECT role FROM users WHERE id = ?")
    .bind(auth.uid)
    .first();

  if (!user || user.role !== "admin") {
    return { ok: false as const, res: json({ error: "Admin access required" }, 403) };
  }

  return auth;
}

// Helper: get credit balance for a user and credit type
async function getCreditBalance(env: Env, user_id: number, credit_type_id: string): Promise<number> {
  const row = await env.DB.prepare(
    "SELECT balance FROM client_credit_balances WHERE user_id = ? AND credit_type_id = ?"
  )
    .bind(user_id, credit_type_id)
    .first();

  return row ? (row.balance as number) : 0;
}

// Helper: apply credit delta (grant or deduct)
async function applyCreditDelta(
  env: Env,
  params: {
    user_id: number;
    credit_type_id: string;
    delta: number;
    reason: string | null;
    created_by_user_id: number | null;
  }
): Promise<{ ok: boolean; balance?: number; error?: string }> {
  const { user_id, credit_type_id, delta, reason, created_by_user_id } = params;

  // Get current balance
  const currentBalance = await getCreditBalance(env, user_id, credit_type_id);
  const newBalance = currentBalance + delta;

  // Check if balance would go negative
  if (newBalance < 0) {
    return { ok: false, error: "Insufficient credits" };
  }

  // Insert ledger entry
  const ledgerId = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO credit_ledger (id, user_id, credit_type_id, delta, reason, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(ledgerId, user_id, credit_type_id, delta, reason, created_by_user_id)
    .run();

  // Upsert balance
  await env.DB.prepare(
    `INSERT INTO client_credit_balances (user_id, credit_type_id, balance)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id, credit_type_id) DO UPDATE SET balance = balance + ?`
  )
    .bind(user_id, credit_type_id, delta, delta)
    .run();

  return { ok: true, balance: newBalance };
}

// Helper: check if user has signed active waiver
async function hasSignedActiveWaiver(env: Env, user_id: number): Promise<boolean> {
  const activeWaiver = await env.DB.prepare(
    "SELECT id FROM waivers WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1"
  ).first();

  if (!activeWaiver) return false;

  const signature = await env.DB.prepare(
    "SELECT id FROM waiver_signatures WHERE user_id = ? AND waiver_id = ? LIMIT 1"
  )
    .bind(user_id, activeWaiver.id)
    .first();

  return !!signature;
}

// Helper: parse YouTube URL and extract video ID
function parseYouTubeUrl(input: string | null): { videoId: string | null; embedUrl: string | null } {
  if (!input || typeof input !== "string") {
    return { videoId: null, embedUrl: null };
  }

  const trimmed = input.trim();

  // Treat empty string as null
  if (trimmed.length === 0) {
    return { videoId: null, embedUrl: null };
  }

  // Try to extract video ID from various formats
  let videoId: string | null = null;

  // Format: https://www.youtube.com/watch?v=VIDEOID
  const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }

  // Format: https://youtu.be/VIDEOID
  if (!videoId) {
    const shortMatch = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (shortMatch) {
      videoId = shortMatch[1];
    }
  }

  // Format: https://www.youtube.com/embed/VIDEOID
  if (!videoId) {
    const embedMatch = trimmed.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (embedMatch) {
      videoId = embedMatch[1];
    }
  }

  // Format: raw VIDEOID (11 characters, alphanumeric + _ -)
  if (!videoId && /^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    videoId = trimmed;
  }

  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

  return { videoId, embedUrl };
}

// Helper: safely parse JSON array, return empty array on error
function safeJsonArrayParse(jsonString: string | null | undefined): any[] {
  if (!jsonString || typeof jsonString !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Helper: find sessions needing reminders in the specified time window
async function findReminderTargets(
  env: Env,
  hoursAhead: number = 24
): Promise<{
  windowStart: string;
  windowEnd: string;
  targets: Array<{
    booking_id: string;
    session_id: string;
    session_starts_at: string;
    user_id: number;
    user_email: string;
    user_first_name: string | null;
    user_last_name: string | null;
  }>;
}> {
  const now = Date.now();
  const windowStartMs = now + (hoursAhead - 1) * 60 * 60 * 1000; // hoursAhead - 1 hour
  const windowEndMs = now + (hoursAhead + 1) * 60 * 60 * 1000; // hoursAhead + 1 hour

  const windowStart = new Date(windowStartMs).toISOString();
  const windowEnd = new Date(windowEndMs).toISOString();

  // Query sessions with active bookings in the time window
  // Use datetime() to normalize both sides for consistent comparison
  const result = await env.DB.prepare(
    `SELECT
       b.id as booking_id,
       s.id as session_id,
       s.starts_at as session_starts_at,
       u.id as user_id,
       u.email as user_email,
       cp.first_name as user_first_name,
       cp.last_name as user_last_name
     FROM sessions s
     JOIN bookings b ON s.id = b.session_id
     JOIN users u ON b.user_id = u.id
     LEFT JOIN client_profiles cp ON u.id = cp.user_id
     WHERE b.status = 'booked'
       AND datetime(s.starts_at) >= datetime(?)
       AND datetime(s.starts_at) < datetime(?)
     ORDER BY s.starts_at, u.email`
  )
    .bind(windowStart, windowEnd)
    .all();

  return {
    windowStart,
    windowEnd,
    targets: result.results as any[] || [],
  };
}

/**
 * Helper: send email via MailChannels Email API
 *
 * Required environment variables:
 * - EMAIL_FROM: Sender email address (must be from verified domain)
 * - EMAIL_FROM_NAME: Sender display name
 *
 * Required secrets (set via wrangler secret put):
 * - MAILCHANNELS_API_KEY: MailChannels API authentication key
 *
 * Domain requirements:
 * - EMAIL_FROM domain must be verified with MailChannels
 * - SPF DNS record: v=spf1 include:relay.mailchannels.net ~all
 * - Domain authorized for sending via MailChannels
 */
async function sendEmail(
  env: Env,
  params: {
    to: string;
    subject: string;
    textBody: string;
    htmlBody?: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  const { to, subject, textBody, htmlBody } = params;

  // Check for API key before attempting to send
  if (!env.MAILCHANNELS_API_KEY) {
    return { ok: false, error: "MAILCHANNELS_API_KEY not set" };
  }

  const fromEmail = env.EMAIL_FROM || "noreply@example.com";
  const fromName = env.EMAIL_FROM_NAME || "Elite Training and Wellness";

  const payload = {
    personalizations: [
      {
        to: [{ email: to }],
      },
    ],
    from: {
      email: fromEmail,
      name: fromName,
    },
    subject,
    content: [
      {
        type: "text/plain",
        value: textBody,
      },
      ...(htmlBody
        ? [
            {
              type: "text/html",
              value: htmlBody,
            },
          ]
        : []),
    ],
  };

  try {
    const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": env.MAILCHANNELS_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { ok: false, error: `MailChannels API error: ${response.status} ${errorText}` };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: `Email send failed: ${err}` };
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    // ----- CORS preflight -----
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const withCors = (res: Response) => {
      const headers = corsHeaders(origin);
      Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    };

    // ---------------- SIGNUP ----------------
    if (url.pathname === "/auth/signup" && request.method === "POST") {
      const { email, password } = await request.json();
      if (!email || !password) {
        return withCors(json({ error: "Missing email or password" }, 400));
      }

      const password_hash = await hashPasswordBcrypt(password);

      try {
        await env.DB.prepare("INSERT INTO users (email, password_hash, password_algo) VALUES (?, ?, ?)")
          .bind(email, password_hash, "bcrypt")
          .run();
      } catch {
        return withCors(json({ error: "User already exists" }, 409));
      }

      return withCors(json({ ok: true }));
    }

    // ---------------- LOGIN ----------------
    if (url.pathname === "/auth/login" && request.method === "POST") {
      const { email, password } = await request.json();

      // Fetch user with password_hash and password_algo
      const user = await env.DB.prepare(
        "SELECT id, password_hash, password_algo FROM users WHERE email = ?"
      )
        .bind(email)
        .first();

      if (!user) {
        return withCors(json({ error: "Invalid credentials" }, 401));
      }

      let passwordValid = false;
      let needsUpgrade = false;

      // Verify password based on algorithm
      if (user.password_algo === "bcrypt") {
        // Modern bcrypt verification
        passwordValid = await verifyPasswordBcrypt(password, user.password_hash as string);
      } else if (user.password_algo === "sha256") {
        // Legacy SHA-256 verification
        const legacyHash = hashPasswordLegacy(password);
        passwordValid = legacyHash === user.password_hash;
        needsUpgrade = passwordValid; // Upgrade if password is correct
      } else {
        // Unknown algorithm
        return withCors(json({ error: "Invalid credentials" }, 401));
      }

      if (!passwordValid) {
        return withCors(json({ error: "Invalid credentials" }, 401));
      }

      // Upgrade legacy SHA-256 hash to bcrypt if needed
      if (needsUpgrade) {
        const newHash = await hashPasswordBcrypt(password);
        await env.DB.prepare(
          "UPDATE users SET password_hash = ?, password_algo = ? WHERE id = ?"
        )
          .bind(newHash, "bcrypt", user.id)
          .run();
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

      const user = await env.DB.prepare(
        `SELECT u.id, u.email, u.role, cp.first_name
         FROM users u
         LEFT JOIN client_profiles cp ON u.id = cp.user_id
         WHERE u.id = ?`
      )
        .bind(auth.uid)
        .first();

      if (!user) return withCors(json({ error: "User not found" }, 404));

      return withCors(
        json({
          id: user.id,
          email: user.email,
          role: user.role || "client",
          first_name: user.first_name || null,
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

    // ============ ADMIN: CLASS TYPES ============
    // List all class types
    if (url.pathname === "/api/admin/class-types" && request.method === "GET") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const classTypes = await env.DB.prepare(
        "SELECT id, name, description, duration_minutes, default_capacity, is_active, created_at FROM class_types ORDER BY name"
      ).all();

      return withCors(json({ classTypes: classTypes.results || [] }));
    }

    // Create class type
    if (url.pathname === "/api/admin/class-types" && request.method === "POST") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const { name, description = null, duration_minutes = 60, default_capacity = 10, is_active = 1 } = await request.json();

      if (!name || String(name).trim().length === 0) {
        return withCors(json({ error: "name is required" }, 400));
      }

      const id = crypto.randomUUID();

      await env.DB.prepare(
        "INSERT INTO class_types (id, name, description, duration_minutes, default_capacity, is_active) VALUES (?, ?, ?, ?, ?, ?)"
      )
        .bind(id, String(name).trim(), description, duration_minutes, default_capacity, is_active)
        .run();

      return withCors(json({ ok: true, id }));
    }

    // Update class type
    if (url.pathname === "/api/admin/class-types" && request.method === "PUT") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const { id, name, description, duration_minutes, default_capacity, is_active } = await request.json();

      if (!id) {
        return withCors(json({ error: "id is required" }, 400));
      }

      const existing = await env.DB.prepare("SELECT id FROM class_types WHERE id = ?").bind(id).first();
      if (!existing) {
        return withCors(json({ error: "Class type not found" }, 404));
      }

      const updates: string[] = [];
      const bindings: unknown[] = [];

      if (name !== undefined) {
        updates.push("name = ?");
        bindings.push(String(name).trim());
      }
      if (description !== undefined) {
        updates.push("description = ?");
        bindings.push(description);
      }
      if (duration_minutes !== undefined) {
        updates.push("duration_minutes = ?");
        bindings.push(duration_minutes);
      }
      if (default_capacity !== undefined) {
        updates.push("default_capacity = ?");
        bindings.push(default_capacity);
      }
      if (is_active !== undefined) {
        updates.push("is_active = ?");
        bindings.push(is_active);
      }

      if (updates.length === 0) {
        return withCors(json({ error: "No fields to update" }, 400));
      }

      bindings.push(id);
      await env.DB.prepare(`UPDATE class_types SET ${updates.join(", ")} WHERE id = ?`)
        .bind(...bindings)
        .run();

      return withCors(json({ ok: true }));
    }

    // Delete class type
    if (url.pathname === "/api/admin/class-types" && request.method === "DELETE") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const id = url.searchParams.get("id");
      if (!id) {
        return withCors(json({ error: "id parameter is required" }, 400));
      }

      try {
        await env.DB.prepare("DELETE FROM class_types WHERE id = ?").bind(id).run();
        return withCors(json({ ok: true }));
      } catch (err) {
        return withCors(json({ error: "Cannot delete class type: sessions exist for this type" }, 409));
      }
    }

    // ============ ADMIN: SESSIONS ============
    // List upcoming sessions
    if (url.pathname === "/api/admin/sessions" && request.method === "GET") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const sessions = await env.DB.prepare(
        `SELECT s.id, s.class_type_id, s.starts_at, s.ends_at, s.capacity, s.is_visible, s.notes, s.created_at, s.updated_at,
                ct.name as class_type_name
         FROM sessions s
         JOIN class_types ct ON s.class_type_id = ct.id
         WHERE s.starts_at >= datetime('now')
         ORDER BY s.starts_at`
      ).all();

      return withCors(json({ sessions: sessions.results || [] }));
    }

    // Create session
    if (url.pathname === "/api/admin/sessions" && request.method === "POST") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const { class_type_id, starts_at, ends_at, capacity, is_visible = 1, notes = null } = await request.json();

      if (!class_type_id || !starts_at || !ends_at) {
        return withCors(json({ error: "class_type_id, starts_at, and ends_at are required" }, 400));
      }

      if (new Date(ends_at) <= new Date(starts_at)) {
        return withCors(json({ error: "ends_at must be after starts_at" }, 400));
      }

      const classType = await env.DB.prepare("SELECT default_capacity FROM class_types WHERE id = ?")
        .bind(class_type_id)
        .first();

      if (!classType) {
        return withCors(json({ error: "class_type_id does not exist" }, 400));
      }

      const finalCapacity = capacity !== undefined ? capacity : classType.default_capacity;

      if (finalCapacity <= 0) {
        return withCors(json({ error: "capacity must be greater than 0" }, 400));
      }

      const id = crypto.randomUUID();

      await env.DB.prepare(
        "INSERT INTO sessions (id, class_type_id, starts_at, ends_at, capacity, is_visible, notes) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
        .bind(id, class_type_id, starts_at, ends_at, finalCapacity, is_visible, notes)
        .run();

      return withCors(json({ ok: true, id }));
    }

    // Update session
    if (url.pathname === "/api/admin/sessions" && request.method === "PUT") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const { id, class_type_id, starts_at, ends_at, capacity, is_visible, notes } = await request.json();

      if (!id) {
        return withCors(json({ error: "id is required" }, 400));
      }

      const existing = await env.DB.prepare("SELECT id FROM sessions WHERE id = ?").bind(id).first();
      if (!existing) {
        return withCors(json({ error: "Session not found" }, 404));
      }

      if (starts_at !== undefined && ends_at !== undefined && new Date(ends_at) <= new Date(starts_at)) {
        return withCors(json({ error: "ends_at must be after starts_at" }, 400));
      }

      if (capacity !== undefined && capacity <= 0) {
        return withCors(json({ error: "capacity must be greater than 0" }, 400));
      }

      const updates: string[] = [];
      const bindings: unknown[] = [];

      if (class_type_id !== undefined) {
        const classType = await env.DB.prepare("SELECT id FROM class_types WHERE id = ?")
          .bind(class_type_id)
          .first();
        if (!classType) {
          return withCors(json({ error: "class_type_id does not exist" }, 400));
        }
        updates.push("class_type_id = ?");
        bindings.push(class_type_id);
      }
      if (starts_at !== undefined) {
        updates.push("starts_at = ?");
        bindings.push(starts_at);
      }
      if (ends_at !== undefined) {
        updates.push("ends_at = ?");
        bindings.push(ends_at);
      }
      if (capacity !== undefined) {
        updates.push("capacity = ?");
        bindings.push(capacity);
      }
      if (is_visible !== undefined) {
        updates.push("is_visible = ?");
        bindings.push(is_visible);
      }
      if (notes !== undefined) {
        updates.push("notes = ?");
        bindings.push(notes);
      }

      if (updates.length === 0) {
        return withCors(json({ error: "No fields to update" }, 400));
      }

      bindings.push(id);
      await env.DB.prepare(`UPDATE sessions SET ${updates.join(", ")} WHERE id = ?`)
        .bind(...bindings)
        .run();

      return withCors(json({ ok: true }));
    }

    // Delete session
    if (url.pathname === "/api/admin/sessions" && request.method === "DELETE") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const id = url.searchParams.get("id");
      if (!id) {
        return withCors(json({ error: "id parameter is required" }, 400));
      }

      await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(id).run();

      return withCors(json({ ok: true }));
    }

    // ============ CLIENT: SESSIONS ============
    // List upcoming visible sessions
    if (url.pathname === "/api/sessions" && request.method === "GET") {
      const auth = await requireAuth(request, env);
      if (!auth.ok) return withCors(auth.res);

      const sessions = await env.DB.prepare(
        `SELECT s.id, s.starts_at, s.ends_at, s.capacity,
                ct.id as class_type_id, ct.name as class_type_name, ct.duration_minutes as class_type_duration_minutes
         FROM sessions s
         JOIN class_types ct ON s.class_type_id = ct.id
         WHERE s.is_visible = 1 AND s.starts_at >= datetime('now')
         ORDER BY s.starts_at`
      ).all();

      const formatted = (sessions.results || []).map((s: any) => ({
        id: s.id,
        starts_at: s.starts_at,
        ends_at: s.ends_at,
        capacity: s.capacity,
        class_type: {
          id: s.class_type_id,
          name: s.class_type_name,
          duration_minutes: s.class_type_duration_minutes,
        },
      }));

      return withCors(json({ sessions: formatted }));
    }

    // ============ ADMIN: CREDIT TYPES ============
    // List all credit types
    if (url.pathname === "/api/admin/credit-types" && request.method === "GET") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const creditTypes = await env.DB.prepare(
        "SELECT id, name, description, is_active, created_at FROM credit_types ORDER BY name"
      ).all();

      return withCors(json({ creditTypes: creditTypes.results || [] }));
    }

    // Create credit type
    if (url.pathname === "/api/admin/credit-types" && request.method === "POST") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const { name, description = null, is_active = 1 } = await request.json();

      if (!name || String(name).trim().length === 0) {
        return withCors(json({ error: "name is required" }, 400));
      }

      const id = crypto.randomUUID();

      await env.DB.prepare(
        "INSERT INTO credit_types (id, name, description, is_active) VALUES (?, ?, ?, ?)"
      )
        .bind(id, String(name).trim(), description, is_active)
        .run();

      return withCors(json({ ok: true, id }));
    }

    // ============ ADMIN: CREDITS ============
    // Adjust credits for a user
    if (url.pathname === "/api/admin/credits/adjust" && request.method === "POST") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const { user_id, credit_type_id, delta, reason = null } = await request.json();

      if (!user_id || !credit_type_id || delta === undefined) {
        return withCors(json({ error: "user_id, credit_type_id, and delta are required" }, 400));
      }

      if (typeof delta !== "number" || delta === 0) {
        return withCors(json({ error: "delta must be a non-zero number" }, 400));
      }

      // Verify user exists
      const user = await env.DB.prepare("SELECT id FROM users WHERE id = ?").bind(user_id).first();
      if (!user) {
        return withCors(json({ error: "User not found" }, 404));
      }

      // Verify credit type exists
      const creditType = await env.DB.prepare("SELECT id FROM credit_types WHERE id = ?")
        .bind(credit_type_id)
        .first();
      if (!creditType) {
        return withCors(json({ error: "Credit type not found" }, 404));
      }

      // Apply the delta
      const result = await applyCreditDelta(env, {
        user_id,
        credit_type_id,
        delta,
        reason,
        created_by_user_id: admin.uid,
      });

      if (!result.ok) {
        return withCors(json({ error: result.error }, 400));
      }

      return withCors(json({ ok: true, balance: result.balance }));
    }

    // Get credit ledger for a user
    if (url.pathname === "/api/admin/credits/ledger" && request.method === "GET") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const user_id = url.searchParams.get("user_id");
      if (!user_id) {
        return withCors(json({ error: "user_id parameter is required" }, 400));
      }

      const ledger = await env.DB.prepare(
        `SELECT l.id, l.user_id, l.credit_type_id, l.delta, l.reason, l.created_by_user_id, l.created_at,
                ct.name as credit_type_name,
                u.email as created_by_email
         FROM credit_ledger l
         JOIN credit_types ct ON l.credit_type_id = ct.id
         LEFT JOIN users u ON l.created_by_user_id = u.id
         WHERE l.user_id = ?
         ORDER BY l.created_at DESC
         LIMIT 50`
      )
        .bind(user_id)
        .all();

      return withCors(json({ ledger: ledger.results || [] }));
    }

    // ============ CLIENT: CREDITS ============
    // Get credit balances for authenticated user
    if (url.pathname === "/api/credits/balances" && request.method === "GET") {
      const auth = await requireAuth(request, env);
      if (!auth.ok) return withCors(auth.res);

      const balances = await env.DB.prepare(
        `SELECT b.user_id, b.credit_type_id, b.balance, b.updated_at,
                ct.name as credit_type_name, ct.description as credit_type_description
         FROM client_credit_balances b
         JOIN credit_types ct ON b.credit_type_id = ct.id
         WHERE b.user_id = ? AND ct.is_active = 1
         ORDER BY ct.name`
      )
        .bind(auth.uid)
        .all();

      return withCors(json({ balances: balances.results || [] }));
    }

    // ============ CLIENT: MEMBERSHIP ============
    // Get membership status for authenticated user
    if (url.pathname === "/api/membership/status" && request.method === "GET") {
      const auth = await requireAuth(request, env);
      if (!auth.ok) return withCors(auth.res);

      const membership = await env.DB.prepare(
        `SELECT id, user_id, plan, is_active, unlimited, starts_at, ends_at, created_at, updated_at
         FROM memberships
         WHERE user_id = ? AND plan = 'circuit' AND is_active = 1
         ORDER BY created_at DESC
         LIMIT 1`
      )
        .bind(auth.uid)
        .first();

      if (!membership) {
        return withCors(json({ hasUnlimited: false, membership: null }));
      }

      // Check if membership is truly active (unlimited=1 and not expired)
      let hasUnlimited = false;
      if (membership.unlimited === 1) {
        // If ends_at exists, check if it's in the future
        if (membership.ends_at) {
          hasUnlimited = new Date(membership.ends_at as string) > new Date();
        } else {
          // No end date means active
          hasUnlimited = true;
        }
      }

      return withCors(json({ hasUnlimited, membership }));
    }

    // ============ CLIENT: BOOKINGS ============
    // Create a booking
    if (url.pathname === "/api/bookings" && request.method === "POST") {
      const auth = await requireAuth(request, env);
      if (!auth.ok) return withCors(auth.res);

      const { session_id, credit_type_id = null } = await request.json();

      if (!session_id) {
        return withCors(json({ error: "session_id is required" }, 400));
      }

      // 1. Check if user has signed active waiver
      const hasSigned = await hasSignedActiveWaiver(env, auth.uid);
      if (!hasSigned) {
        return withCors(json({ error: "Active waiver signature required" }, 403));
      }

      // 2. Get session details
      const session = await env.DB.prepare(
        "SELECT id, starts_at, ends_at, capacity FROM sessions WHERE id = ?"
      )
        .bind(session_id)
        .first();

      if (!session) {
        return withCors(json({ error: "Session not found" }, 404));
      }

      // 3. Check 8-hour booking window
      const sessionStart = new Date(session.starts_at as string);
      const now = new Date();
      const eightHoursBeforeStart = new Date(sessionStart.getTime() - 8 * 60 * 60 * 1000);

      if (now > eightHoursBeforeStart) {
        return withCors(json({ error: "Booking window closed (must book at least 8 hours before session)" }, 400));
      }

      // 4. Check if user already has an active booking for this session
      const existingBooking = await env.DB.prepare(
        "SELECT id FROM bookings WHERE session_id = ? AND user_id = ? AND status = 'booked'"
      )
        .bind(session_id, auth.uid)
        .first();

      if (existingBooking) {
        return withCors(json({ error: "You already have a booking for this session" }, 400));
      }

      // 5. Check session capacity
      const bookedCount = await env.DB.prepare(
        "SELECT COUNT(*) as count FROM bookings WHERE session_id = ? AND status = 'booked'"
      )
        .bind(session_id)
        .first();

      if (bookedCount && (bookedCount.count as number) >= (session.capacity as number)) {
        return withCors(json({ error: "Session is full" }, 400));
      }

      // 6. Check eligibility (unlimited membership OR credits)
      const membership = await env.DB.prepare(
        `SELECT id, unlimited, ends_at FROM memberships
         WHERE user_id = ? AND plan = 'circuit' AND is_active = 1
         ORDER BY created_at DESC LIMIT 1`
      )
        .bind(auth.uid)
        .first();

      let hasUnlimited = false;
      if (membership && membership.unlimited === 1) {
        if (membership.ends_at) {
          hasUnlimited = new Date(membership.ends_at as string) > now;
        } else {
          hasUnlimited = true;
        }
      }

      let usedCreditTypeId = null;

      if (!hasUnlimited) {
        // Need to use credits
        // Strategy: Use the first active credit type the user has balance for, or the one specified
        let creditTypeToUse = credit_type_id;

        if (!creditTypeToUse) {
          // Find first active credit type user has balance for
          const userBalance = await env.DB.prepare(
            `SELECT b.credit_type_id, b.balance
             FROM client_credit_balances b
             JOIN credit_types ct ON b.credit_type_id = ct.id
             WHERE b.user_id = ? AND ct.is_active = 1 AND b.balance > 0
             ORDER BY ct.name
             LIMIT 1`
          )
            .bind(auth.uid)
            .first();

          if (!userBalance) {
            return withCors(json({ error: "No credits available and no unlimited membership" }, 400));
          }

          creditTypeToUse = userBalance.credit_type_id as string;
        }

        // Verify user has at least 1 credit of this type
        const balance = await getCreditBalance(env, auth.uid, creditTypeToUse);
        if (balance < 1) {
          return withCors(json({ error: "Insufficient credits" }, 400));
        }

        // Deduct 1 credit
        const creditResult = await applyCreditDelta(env, {
          user_id: auth.uid,
          credit_type_id: creditTypeToUse,
          delta: -1,
          reason: `Booking for session ${session_id}`,
          created_by_user_id: auth.uid,
        });

        if (!creditResult.ok) {
          return withCors(json({ error: creditResult.error }, 400));
        }

        usedCreditTypeId = creditTypeToUse;
      }

      // 7. Create booking
      const bookingId = crypto.randomUUID();
      await env.DB.prepare(
        "INSERT INTO bookings (id, session_id, user_id, status, credit_type_id) VALUES (?, ?, ?, 'booked', ?)"
      )
        .bind(bookingId, session_id, auth.uid, usedCreditTypeId)
        .run();

      return withCors(json({ ok: true, booking_id: bookingId, used_credit: !hasUnlimited }));
    }

    // Cancel a booking
    if (url.pathname === "/api/bookings/cancel" && request.method === "POST") {
      const auth = await requireAuth(request, env);
      if (!auth.ok) return withCors(auth.res);

      const { booking_id } = await request.json();

      if (!booking_id) {
        return withCors(json({ error: "booking_id is required" }, 400));
      }

      // Get booking details
      const booking = await env.DB.prepare(
        `SELECT b.id, b.session_id, b.user_id, b.status, b.credit_type_id, s.starts_at
         FROM bookings b
         JOIN sessions s ON b.session_id = s.id
         WHERE b.id = ?`
      )
        .bind(booking_id)
        .first();

      if (!booking) {
        return withCors(json({ error: "Booking not found" }, 404));
      }

      // Check ownership
      if (booking.user_id !== auth.uid) {
        return withCors(json({ error: "You can only cancel your own bookings" }, 403));
      }

      // Check if already cancelled (early check for better error messages)
      if (booking.status === "cancelled") {
        return withCors(json({ error: "Booking already cancelled" }, 409));
      }

      // Check if session has already started
      const sessionStart = new Date(booking.starts_at as string);
      if (new Date() >= sessionStart) {
        return withCors(json({ error: "Cannot cancel booking after session has started" }, 400));
      }

      // Cancel booking with conditional update (only if status='booked')
      // This ensures idempotency - only first cancel succeeds
      const cancelResult = await env.DB.prepare(
        "UPDATE bookings SET status = 'cancelled', cancelled_at = ? WHERE id = ? AND user_id = ? AND status = 'booked'"
      )
        .bind(new Date().toISOString(), booking_id, auth.uid)
        .run();

      // Check if the update actually happened (row was in 'booked' state)
      if (!cancelResult.meta.changes || cancelResult.meta.changes === 0) {
        // No rows updated means it was already cancelled (race condition)
        return withCors(json({ error: "Booking already cancelled" }, 409));
      }

      // Refund credit if one was used (only executes if cancellation succeeded)
      if (booking.credit_type_id) {
        await applyCreditDelta(env, {
          user_id: auth.uid,
          credit_type_id: booking.credit_type_id as string,
          delta: 1,
          reason: `Refund for cancelled booking ${booking_id}`,
          created_by_user_id: auth.uid,
        });
      }

      return withCors(json({ ok: true, refunded: !!booking.credit_type_id }));
    }

    // ============ ADMIN: BOOKINGS ============
    // List bookings for a session
    if (url.pathname === "/api/admin/bookings" && request.method === "GET") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const session_id = url.searchParams.get("session_id");

      let query = `
        SELECT b.id, b.session_id, b.user_id, b.status, b.booked_at, b.cancelled_at,
               u.email as user_email,
               s.starts_at as session_starts_at,
               s.ends_at as session_ends_at,
               ct.name as class_type_name
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN sessions s ON b.session_id = s.id
        JOIN class_types ct ON s.class_type_id = ct.id
      `;

      const bindings: unknown[] = [];

      if (session_id) {
        query += " WHERE b.session_id = ?";
        bindings.push(session_id);
      }

      query += " ORDER BY b.booked_at DESC LIMIT 100";

      const bookings = await env.DB.prepare(query)
        .bind(...bindings)
        .all();

      return withCors(json({ bookings: bookings.results || [] }));
    }

    // Check in a booking (admin only)
    if (url.pathname === "/api/admin/bookings/checkin" && request.method === "POST") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const { booking_id } = await request.json();

      if (!booking_id) {
        return withCors(json({ error: "booking_id is required" }, 400));
      }

      // Get booking details
      const booking = await env.DB.prepare(
        "SELECT id, user_id, status FROM bookings WHERE id = ?"
      )
        .bind(booking_id)
        .first();

      if (!booking) {
        return withCors(json({ error: "Booking not found" }, 404));
      }

      // Validate booking status
      if (booking.status !== "booked") {
        return withCors(json({ error: "Can only check in booked sessions (not cancelled)" }, 400));
      }

      // Check if already checked in
      const existingCheckin = await env.DB.prepare(
        "SELECT id FROM booking_checkins WHERE booking_id = ?"
      )
        .bind(booking_id)
        .first();

      if (existingCheckin) {
        return withCors(json({ error: "Already checked in" }, 409));
      }

      // Create check-in and rewards in a batch (transactional)
      const checkinId = crypto.randomUUID();
      const rewardsId = crypto.randomUUID();
      const checkedInAt = new Date().toISOString();
      const rewardsDelta = 1; // 1 point per attended booking

      try {
        await env.DB.batch([
          env.DB.prepare(
            "INSERT INTO booking_checkins (id, booking_id, checked_in_by, checked_in_at) VALUES (?, ?, ?, ?)"
          ).bind(checkinId, booking_id, admin.uid, checkedInAt),
          env.DB.prepare(
            "INSERT INTO rewards_ledger (id, user_id, booking_id, delta_points, reason) VALUES (?, ?, ?, ?, ?)"
          ).bind(
            rewardsId,
            booking.user_id,
            booking_id,
            rewardsDelta,
            `Attended session (booking ${booking_id})`
          ),
        ]);
      } catch (err) {
        // If UNIQUE constraint violation or other error, return 409
        return withCors(json({ error: "Already checked in" }, 409));
      }

      return withCors(
        json({
          ok: true,
          booking_id,
          checked_in_at: checkedInAt,
          rewards_delta: rewardsDelta,
        })
      );
    }

    // Cancel a booking (admin - can cancel any booking)
    if (url.pathname === "/api/admin/bookings/cancel" && request.method === "POST") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const { booking_id } = await request.json();

      if (!booking_id) {
        return withCors(json({ error: "booking_id is required" }, 400));
      }

      // Get booking details
      const booking = await env.DB.prepare(
        `SELECT b.id, b.session_id, b.user_id, b.status, b.credit_type_id
         FROM bookings b
         WHERE b.id = ?`
      )
        .bind(booking_id)
        .first();

      if (!booking) {
        return withCors(json({ error: "Booking not found" }, 404));
      }

      // Check if already cancelled
      if (booking.status === "cancelled") {
        return withCors(json({ error: "Booking already cancelled" }, 409));
      }

      // Cancel booking (admin can cancel even after session start)
      const cancelResult = await env.DB.prepare(
        "UPDATE bookings SET status = 'cancelled', cancelled_at = ? WHERE id = ? AND status = 'booked'"
      )
        .bind(new Date().toISOString(), booking_id)
        .run();

      // Check if the update actually happened
      if (!cancelResult.meta.changes || cancelResult.meta.changes === 0) {
        return withCors(json({ error: "Booking already cancelled" }, 409));
      }

      // Refund credit if one was used
      if (booking.credit_type_id) {
        await applyCreditDelta(env, {
          user_id: booking.user_id as number,
          credit_type_id: booking.credit_type_id as string,
          delta: 1,
          reason: `Admin refund for cancelled booking ${booking_id}`,
          created_by_user_id: admin.uid,
        });
      }

      return withCors(json({ ok: true, refunded: !!booking.credit_type_id }));
    }

    // ============ CLIENT: REWARDS ============
    // Get rewards balance and recent history
    if (url.pathname === "/api/rewards" && request.method === "GET") {
      const auth = await requireAuth(request, env);
      if (!auth.ok) return withCors(auth.res);

      // Calculate total points
      const balanceResult = await env.DB.prepare(
        "SELECT COALESCE(SUM(delta_points), 0) as balance FROM rewards_ledger WHERE user_id = ?"
      )
        .bind(auth.uid)
        .first();

      const pointsBalance = (balanceResult?.balance as number) || 0;

      // Get recent ledger entries
      const recentEntries = await env.DB.prepare(
        "SELECT id, booking_id, delta_points, reason, created_at FROM rewards_ledger WHERE user_id = ? ORDER BY created_at DESC LIMIT 20"
      )
        .bind(auth.uid)
        .all();

      return withCors(
        json({
          points_balance: pointsBalance,
          recent: recentEntries.results || [],
        })
      );
    }

    // ============ CLIENT: INTAKE FORMS ============
    // Submit intake form
    if (url.pathname === "/api/intake/submit" && request.method === "POST") {
      const auth = await requireAuth(request, env);
      if (!auth.ok) return withCors(auth.res);

      const { form_type, data } = await request.json();

      // Validate form_type
      if (!form_type || !["basic", "pt"].includes(form_type)) {
        return withCors(json({ error: "form_type must be 'basic' or 'pt'" }, 400));
      }

      // Validate data exists and can be JSON-stringified
      if (data === null || data === undefined) {
        return withCors(json({ error: "data must be valid JSON" }, 400));
      }

      // Convert data to JSON string (validate it's serializable)
      let dataJson: string;
      try {
        dataJson = JSON.stringify(data);
        if (dataJson === undefined) {
          return withCors(json({ error: "data must be valid JSON" }, 400));
        }
      } catch (err) {
        return withCors(json({ error: "data must be valid JSON" }, 400));
      }
      const submissionId = crypto.randomUUID();
      const submittedAt = new Date().toISOString();

      // Upsert submission (replace existing if user already submitted this form_type)
      await env.DB.prepare(
        `INSERT INTO intake_submissions (id, user_id, form_type, submitted_at, data_json)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(user_id, form_type) DO UPDATE SET
           submitted_at = excluded.submitted_at,
           data_json = excluded.data_json`
      )
        .bind(submissionId, auth.uid, form_type, submittedAt, dataJson)
        .run();

      return withCors(json({ ok: true, form_type, submitted_at: submittedAt }));
    }

    // Get intake status
    if (url.pathname === "/api/intake/status" && request.method === "GET") {
      const auth = await requireAuth(request, env);
      if (!auth.ok) return withCors(auth.res);

      // Check if user has submitted basic and PT intakes
      const submissions = await env.DB.prepare(
        "SELECT form_type FROM intake_submissions WHERE user_id = ?"
      )
        .bind(auth.uid)
        .all();

      const submittedFormTypes = new Set(
        (submissions.results || []).map((s: any) => s.form_type)
      );

      const basicSubmitted = submittedFormTypes.has("basic");
      const ptSubmitted = submittedFormTypes.has("pt");

      // Get PT required setting
      const ptRequiredSetting = await env.DB.prepare(
        "SELECT value_text FROM admin_settings WHERE key = 'pt_intake_required'"
      ).first();

      const ptRequired = ptRequiredSetting?.value_text === "true";

      return withCors(
        json({
          basic_submitted: basicSubmitted,
          pt_submitted: ptSubmitted,
          pt_required: ptRequired,
        })
      );
    }

    // ============ ADMIN: INTAKE SETTINGS ============
    // Toggle PT intake requirement
    if (url.pathname === "/api/admin/settings/pt-intake-required" && request.method === "POST") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const { required } = await request.json();

      if (typeof required !== "boolean") {
        return withCors(json({ error: "required must be a boolean" }, 400));
      }

      const valueText = required ? "true" : "false";

      await env.DB.prepare(
        `INSERT INTO admin_settings (key, value_text)
         VALUES ('pt_intake_required', ?)
         ON CONFLICT(key) DO UPDATE SET value_text = excluded.value_text`
      )
        .bind(valueText)
        .run();

      return withCors(json({ ok: true, pt_required: required }));
    }

    // View user's intake submissions
    if (url.pathname === "/api/admin/intake" && request.method === "GET") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const userId = url.searchParams.get("user_id");

      if (!userId) {
        return withCors(json({ error: "user_id parameter is required" }, 400));
      }

      const submissions = await env.DB.prepare(
        `SELECT id, form_type, submitted_at, data_json
         FROM intake_submissions
         WHERE user_id = ?
         ORDER BY form_type`
      )
        .bind(userId)
        .all();

      // Parse JSON for easier inspection (handle parse errors gracefully)
      const formatted = (submissions.results || []).map((s: any) => {
        let parsedData = null;
        let parseError = false;

        try {
          parsedData = JSON.parse(s.data_json);
        } catch (err) {
          parseError = true;
        }

        return {
          id: s.id,
          form_type: s.form_type,
          submitted_at: s.submitted_at,
          data: parsedData,
          parse_error: parseError,
        };
      });

      return withCors(json({ user_id: parseInt(userId), submissions: formatted }));
    }

    // ============ ADMIN: EXERCISES ============
    // List all exercises (with optional search)
    if (url.pathname === "/api/admin/exercises" && request.method === "GET") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const q = url.searchParams.get("q");

      let query = "SELECT * FROM exercises";
      const bindings: unknown[] = [];

      if (q && q.trim().length > 0) {
        query += " WHERE name LIKE ?";
        bindings.push(`%${q.trim()}%`);
      }

      query += " ORDER BY name";

      const exercises = await env.DB.prepare(query)
        .bind(...bindings)
        .all();

      // Parse JSON arrays and add embed_url
      const formatted = (exercises.results || []).map((ex: any) => ({
        ...ex,
        primary_muscles: safeJsonArrayParse(ex.primary_muscles),
        secondary_muscles: safeJsonArrayParse(ex.secondary_muscles),
        equipment: safeJsonArrayParse(ex.equipment),
        cues: safeJsonArrayParse(ex.cues),
        tags: safeJsonArrayParse(ex.tags),
        embed_url: ex.youtube_video_id
          ? `https://www.youtube.com/embed/${ex.youtube_video_id}`
          : null,
      }));

      return withCors(json({ exercises: formatted }));
    }

    // Create exercise
    if (url.pathname === "/api/admin/exercises" && request.method === "POST") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const {
        name,
        description = "",
        youtube_url = null,
        primary_muscles = [],
        secondary_muscles = [],
        equipment = [],
        difficulty = null,
        cues = [],
        tags = [],
      } = await request.json();

      if (!name || String(name).trim().length === 0) {
        return withCors(json({ error: "name is required" }, 400));
      }

      // Validate difficulty if provided
      if (difficulty && !["beginner", "intermediate", "advanced"].includes(difficulty)) {
        return withCors(json({ error: "difficulty must be beginner, intermediate, or advanced" }, 400));
      }

      // Normalize youtube_url: empty/whitespace strings become null
      let normalizedYoutubeUrl = youtube_url;
      if (typeof youtube_url === "string" && youtube_url.trim().length === 0) {
        normalizedYoutubeUrl = null;
      }

      // Parse YouTube URL
      const { videoId, embedUrl } = parseYouTubeUrl(normalizedYoutubeUrl);

      // Convert arrays to JSON strings
      const primaryMusclesJson = JSON.stringify(primary_muscles);
      const secondaryMusclesJson = JSON.stringify(secondary_muscles);
      const equipmentJson = JSON.stringify(equipment);
      const cuesJson = JSON.stringify(cues);
      const tagsJson = JSON.stringify(tags);

      const id = crypto.randomUUID();

      await env.DB.prepare(
        `INSERT INTO exercises (id, name, description, youtube_url, youtube_video_id, primary_muscles, secondary_muscles, equipment, difficulty, cues, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          id,
          String(name).trim(),
          description,
          normalizedYoutubeUrl,
          videoId,
          primaryMusclesJson,
          secondaryMusclesJson,
          equipmentJson,
          difficulty,
          cuesJson,
          tagsJson
        )
        .run();

      return withCors(json({ ok: true, id, embed_url: embedUrl }));
    }

    // Get single exercise by ID
    if (url.pathname.startsWith("/api/admin/exercises/") && request.method === "GET") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const id = url.pathname.substring("/api/admin/exercises/".length);

      if (!id) {
        return withCors(json({ error: "Exercise ID is required" }, 400));
      }

      const exercise = await env.DB.prepare("SELECT * FROM exercises WHERE id = ?")
        .bind(id)
        .first();

      if (!exercise) {
        return withCors(json({ error: "Exercise not found" }, 404));
      }

      // Parse JSON arrays and add embed_url
      const formatted = {
        ...exercise,
        primary_muscles: safeJsonArrayParse(exercise.primary_muscles as string),
        secondary_muscles: safeJsonArrayParse(exercise.secondary_muscles as string),
        equipment: safeJsonArrayParse(exercise.equipment as string),
        cues: safeJsonArrayParse(exercise.cues as string),
        tags: safeJsonArrayParse(exercise.tags as string),
        embed_url: exercise.youtube_video_id
          ? `https://www.youtube.com/embed/${exercise.youtube_video_id}`
          : null,
      };

      return withCors(json({ exercise: formatted }));
    }

    // Update exercise
    if (url.pathname.startsWith("/api/admin/exercises/") && request.method === "PUT") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const id = url.pathname.substring("/api/admin/exercises/".length);

      if (!id) {
        return withCors(json({ error: "Exercise ID is required" }, 400));
      }

      // Check if exists
      const existing = await env.DB.prepare("SELECT id FROM exercises WHERE id = ?")
        .bind(id)
        .first();

      if (!existing) {
        return withCors(json({ error: "Exercise not found" }, 404));
      }

      const {
        name,
        description,
        youtube_url,
        primary_muscles,
        secondary_muscles,
        equipment,
        difficulty,
        cues,
        tags,
      } = await request.json();

      // Validate difficulty if provided
      if (difficulty !== undefined && difficulty !== null && !["beginner", "intermediate", "advanced"].includes(difficulty)) {
        return withCors(json({ error: "difficulty must be beginner, intermediate, or advanced" }, 400));
      }

      const updates: string[] = [];
      const bindings: unknown[] = [];

      if (name !== undefined) {
        updates.push("name = ?");
        bindings.push(String(name).trim());
      }
      if (description !== undefined) {
        updates.push("description = ?");
        bindings.push(description);
      }
      if (youtube_url !== undefined) {
        // Normalize youtube_url: empty/whitespace strings become null
        let normalizedYoutubeUrl = youtube_url;
        if (typeof youtube_url === "string" && youtube_url.trim().length === 0) {
          normalizedYoutubeUrl = null;
        }
        const { videoId } = parseYouTubeUrl(normalizedYoutubeUrl);
        updates.push("youtube_url = ?");
        updates.push("youtube_video_id = ?");
        bindings.push(normalizedYoutubeUrl);
        bindings.push(videoId);
      }
      if (primary_muscles !== undefined) {
        updates.push("primary_muscles = ?");
        bindings.push(JSON.stringify(primary_muscles));
      }
      if (secondary_muscles !== undefined) {
        updates.push("secondary_muscles = ?");
        bindings.push(JSON.stringify(secondary_muscles));
      }
      if (equipment !== undefined) {
        updates.push("equipment = ?");
        bindings.push(JSON.stringify(equipment));
      }
      if (difficulty !== undefined) {
        updates.push("difficulty = ?");
        bindings.push(difficulty);
      }
      if (cues !== undefined) {
        updates.push("cues = ?");
        bindings.push(JSON.stringify(cues));
      }
      if (tags !== undefined) {
        updates.push("tags = ?");
        bindings.push(JSON.stringify(tags));
      }

      if (updates.length === 0) {
        return withCors(json({ error: "No fields to update" }, 400));
      }

      bindings.push(id);
      await env.DB.prepare(`UPDATE exercises SET ${updates.join(", ")} WHERE id = ?`)
        .bind(...bindings)
        .run();

      return withCors(json({ ok: true }));
    }

    // Delete exercise
    if (url.pathname.startsWith("/api/admin/exercises/") && request.method === "DELETE") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const id = url.pathname.substring("/api/admin/exercises/".length);

      if (!id) {
        return withCors(json({ error: "Exercise ID is required" }, 400));
      }

      await env.DB.prepare("DELETE FROM exercises WHERE id = ?").bind(id).run();

      return withCors(json({ ok: true }));
    }

    // ============ ADMIN: WORKOUTS ============
    // Create workout
    if (url.pathname === "/api/admin/workouts" && request.method === "POST") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const { name, description = null } = await request.json();

      if (!name || String(name).trim().length === 0) {
        return withCors(json({ error: "name is required" }, 400));
      }

      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      await env.DB.prepare(
        "INSERT INTO workouts (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
      )
        .bind(id, String(name).trim(), description, now, now)
        .run();

      return withCors(json({ ok: true, id }));
    }

    // List workouts (with optional search)
    if (url.pathname === "/api/admin/workouts" && request.method === "GET") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const q = url.searchParams.get("q");

      let query = "SELECT * FROM workouts";
      const bindings: unknown[] = [];

      if (q && q.trim().length > 0) {
        query += " WHERE name LIKE ?";
        bindings.push(`%${q.trim()}%`);
      }

      query += " ORDER BY name";

      const workouts = await env.DB.prepare(query)
        .bind(...bindings)
        .all();

      return withCors(json({ workouts: workouts.results || [] }));
    }

    // Get single workout with exercises
    if (url.pathname.match(/^\/api\/admin\/workouts\/[^/]+$/) && request.method === "GET") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const id = url.pathname.split("/")[4];

      if (!id) {
        return withCors(json({ error: "Workout ID is required" }, 400));
      }

      const workout = await env.DB.prepare("SELECT * FROM workouts WHERE id = ?")
        .bind(id)
        .first();

      if (!workout) {
        return withCors(json({ error: "Workout not found" }, 404));
      }

      // Get exercises for this workout
      const exercisesResult = await env.DB.prepare(
        `SELECT we.sort_order, e.*
         FROM workout_exercises we
         JOIN exercises e ON we.exercise_id = e.id
         WHERE we.workout_id = ?
         ORDER BY we.sort_order`
      )
        .bind(id)
        .all();

      // Format exercises with embed_url
      const exercises = (exercisesResult.results || []).map((ex: any) => ({
        ...ex,
        primary_muscles: safeJsonArrayParse(ex.primary_muscles),
        secondary_muscles: safeJsonArrayParse(ex.secondary_muscles),
        equipment: safeJsonArrayParse(ex.equipment),
        cues: safeJsonArrayParse(ex.cues),
        tags: safeJsonArrayParse(ex.tags),
        embed_url: ex.youtube_video_id
          ? `https://www.youtube.com/embed/${ex.youtube_video_id}`
          : null,
      }));

      return withCors(json({ workout, exercises }));
    }

    // Add exercise to workout
    if (url.pathname.match(/^\/api\/admin\/workouts\/[^/]+\/exercises$/) && request.method === "POST") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const workoutId = url.pathname.split("/")[4];
      const { exercise_id, sort_order = null } = await request.json();

      if (!exercise_id) {
        return withCors(json({ error: "exercise_id is required" }, 400));
      }

      // Verify workout exists
      const workout = await env.DB.prepare("SELECT id FROM workouts WHERE id = ?")
        .bind(workoutId)
        .first();

      if (!workout) {
        return withCors(json({ error: "Workout not found" }, 404));
      }

      // Verify exercise exists
      const exercise = await env.DB.prepare("SELECT id FROM exercises WHERE id = ?")
        .bind(exercise_id)
        .first();

      if (!exercise) {
        return withCors(json({ error: "Exercise not found" }, 404));
      }

      // Determine sort_order: use provided, or append to end
      let finalSortOrder = sort_order;
      if (finalSortOrder === null || finalSortOrder === undefined) {
        const maxOrder = await env.DB.prepare(
          "SELECT MAX(sort_order) as max_order FROM workout_exercises WHERE workout_id = ?"
        )
          .bind(workoutId)
          .first();

        finalSortOrder = maxOrder && maxOrder.max_order !== null ? (maxOrder.max_order as number) + 1 : 0;
      }

      const id = crypto.randomUUID();

      try {
        await env.DB.prepare(
          "INSERT INTO workout_exercises (id, workout_id, exercise_id, sort_order) VALUES (?, ?, ?, ?)"
        )
          .bind(id, workoutId, exercise_id, finalSortOrder)
          .run();

        return withCors(json({ ok: true, id, sort_order: finalSortOrder }));
      } catch (err) {
        // UNIQUE constraint violation
        return withCors(json({ error: "Exercise already added to this workout" }, 409));
      }
    }

    // Reorder exercises in workout
    if (url.pathname.match(/^\/api\/admin\/workouts\/[^/]+\/exercises\/reorder$/) && request.method === "PUT") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const workoutId = url.pathname.split("/")[4];
      const { items } = await request.json();

      if (!Array.isArray(items)) {
        return withCors(json({ error: "items must be an array" }, 400));
      }

      // Verify workout exists
      const workout = await env.DB.prepare("SELECT id FROM workouts WHERE id = ?")
        .bind(workoutId)
        .first();

      if (!workout) {
        return withCors(json({ error: "Workout not found" }, 404));
      }

      // Update each item in batch
      const updates = items.map((item: any) =>
        env.DB.prepare(
          "UPDATE workout_exercises SET sort_order = ? WHERE workout_id = ? AND exercise_id = ?"
        ).bind(item.sort_order, workoutId, item.exercise_id)
      );

      await env.DB.batch(updates);

      return withCors(json({ ok: true }));
    }

    // Remove exercise from workout
    if (url.pathname.match(/^\/api\/admin\/workouts\/[^/]+\/exercises\/[^/]+$/) && request.method === "DELETE") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const pathParts = url.pathname.split("/");
      const workoutId = pathParts[4];
      const exerciseId = pathParts[6];

      if (!workoutId || !exerciseId) {
        return withCors(json({ error: "Workout ID and Exercise ID are required" }, 400));
      }

      await env.DB.prepare(
        "DELETE FROM workout_exercises WHERE workout_id = ? AND exercise_id = ?"
      )
        .bind(workoutId, exerciseId)
        .run();

      return withCors(json({ ok: true }));
    }

    // Assign workout to user
    if (url.pathname.match(/^\/api\/admin\/workouts\/[^/]+\/assign$/) && request.method === "POST") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const workoutId = url.pathname.split("/")[4];
      const { user_id } = await request.json();

      if (!user_id) {
        return withCors(json({ error: "user_id is required" }, 400));
      }

      // Verify workout exists
      const workout = await env.DB.prepare("SELECT id FROM workouts WHERE id = ?")
        .bind(workoutId)
        .first();

      if (!workout) {
        return withCors(json({ error: "Workout not found" }, 404));
      }

      // Verify user exists
      const user = await env.DB.prepare("SELECT id FROM users WHERE id = ?")
        .bind(user_id)
        .first();

      if (!user) {
        return withCors(json({ error: "User not found" }, 404));
      }

      const id = crypto.randomUUID();
      const assignedAt = new Date().toISOString();

      try {
        await env.DB.prepare(
          "INSERT INTO client_workouts (id, user_id, workout_id, assigned_at) VALUES (?, ?, ?, ?)"
        )
          .bind(id, user_id, workoutId, assignedAt)
          .run();

        return withCors(json({ ok: true, id }));
      } catch (err) {
        // UNIQUE constraint violation
        return withCors(json({ error: "Workout already assigned to this user" }, 409));
      }
    }

    // Unassign workout from user
    if (url.pathname.match(/^\/api\/admin\/workouts\/[^/]+\/assign\/[^/]+$/) && request.method === "DELETE") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const pathParts = url.pathname.split("/");
      const workoutId = pathParts[4];
      const userId = pathParts[6];

      if (!workoutId || !userId) {
        return withCors(json({ error: "Workout ID and User ID are required" }, 400));
      }

      await env.DB.prepare(
        "DELETE FROM client_workouts WHERE workout_id = ? AND user_id = ?"
      )
        .bind(workoutId, parseInt(userId))
        .run();

      return withCors(json({ ok: true }));
    }

    // ============ CLIENT: WORKOUTS ============
    // Get assigned workouts with exercises
    if (url.pathname === "/api/workouts" && request.method === "GET") {
      const auth = await requireAuth(request, env);
      if (!auth.ok) return withCors(auth.res);

      // Get all workouts assigned to this user
      const assignedWorkouts = await env.DB.prepare(
        `SELECT w.*
         FROM workouts w
         JOIN client_workouts cw ON w.id = cw.workout_id
         WHERE cw.user_id = ?
         ORDER BY w.name`
      )
        .bind(auth.uid)
        .all();

      // For each workout, get its exercises
      const workoutsWithExercises = [];

      for (const workout of assignedWorkouts.results || []) {
        const exercisesResult = await env.DB.prepare(
          `SELECT we.sort_order, e.*
           FROM workout_exercises we
           JOIN exercises e ON we.exercise_id = e.id
           WHERE we.workout_id = ?
           ORDER BY we.sort_order`
        )
          .bind(workout.id)
          .all();

        // Format exercises with embed_url
        const exercises = (exercisesResult.results || []).map((ex: any) => ({
          ...ex,
          primary_muscles: safeJsonArrayParse(ex.primary_muscles),
          secondary_muscles: safeJsonArrayParse(ex.secondary_muscles),
          equipment: safeJsonArrayParse(ex.equipment),
          cues: safeJsonArrayParse(ex.cues),
          tags: safeJsonArrayParse(ex.tags),
          embed_url: ex.youtube_video_id
            ? `https://www.youtube.com/embed/${ex.youtube_video_id}`
            : null,
        }));

        workoutsWithExercises.push({
          ...workout,
          exercises,
        });
      }

      return withCors(json({ workouts: workoutsWithExercises }));
    }

    // ============ DEV: REMINDERS PREVIEW ============
    // DEV-ONLY: Preview reminder targets, optionally send test emails
    if (url.pathname === "/dev/reminders/preview" && request.method === "POST") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const body = await request.json().catch(() => ({}));
      const overrideHours = body.overrideHours || 24;
      const dryRun = body.dryRun !== false; // default true

      const { windowStart, windowEnd, targets } = await findReminderTargets(env, overrideHours);
      const reminderType = "24h";

      // If dry-run, return targets with already_sent status
      if (dryRun) {
        const cappedTargets = targets.slice(0, 50);

        // Check already_sent status for each target
        const targetsWithStatus = await Promise.all(
          cappedTargets.map(async (target) => {
            const existingCheck = await env.DB.prepare(
              `SELECT id FROM reminder_sends WHERE booking_id = ? AND reminder_type = ?`
            )
              .bind(target.booking_id, reminderType)
              .first();

            return {
              ...target,
              already_sent: !!existingCheck,
            };
          })
        );

        return withCors(
          json({
            windowStart,
            windowEnd,
            count: targets.length,
            targets: targetsWithStatus,
          })
        );
      }

      // If not dry-run, send to up to 10 targets and return results
      const sendTargets = targets.slice(0, 10);
      const results = [];

      for (const target of sendTargets) {
        // Atomically claim with INSERT first
        const recordId = crypto.randomUUID();
        let insertResult;

        try {
          insertResult = await env.DB.prepare(
            `INSERT INTO reminder_sends (id, booking_id, session_id, user_id, reminder_type, created_at, ok, error)
             VALUES (?, ?, ?, ?, ?, ?, 0, NULL)`
          )
            .bind(
              recordId,
              target.booking_id,
              target.session_id,
              target.user_id,
              reminderType,
              new Date().toISOString()
            )
            .run();
        } catch (err: any) {
          // UNIQUE constraint violation means already sent
          if (err.message && err.message.includes("UNIQUE")) {
            results.push({
              booking_id: target.booking_id,
              session_id: target.session_id,
              to: target.user_email,
              skipped: true,
              already_sent: true,
            });
            continue;
          }
          throw err;
        }

        // Claim successful, now send email
        const subject = "Reminder: Your class starts tomorrow";
        const textBody = `You're booked for your session at ${target.session_starts_at}. If you can't make it, please cancel in advance.`;

        const result = await sendEmail(env, {
          to: target.user_email,
          subject,
          textBody,
        });

        // Update the record with actual result
        await env.DB.prepare(
          `UPDATE reminder_sends SET ok = ?, error = ? WHERE id = ?`
        )
          .bind(result.ok ? 1 : 0, result.ok ? null : result.error, recordId)
          .run();

        results.push({
          booking_id: target.booking_id,
          session_id: target.session_id,
          to: target.user_email,
          ok: result.ok,
          error: result.ok ? undefined : result.error,
          already_sent: false,
        });
      }

      return withCors(
        json({
          windowStart,
          windowEnd,
          count: targets.length,
          results,
        })
      );
    }

    // ============ DEV: TEST EMAIL ============
    // DEV-ONLY: Test email sending endpoint (remove in production)
    if (url.pathname === "/dev/test-email" && request.method === "POST") {
      const admin = await requireAdmin(request, env);
      if (!admin.ok) return withCors(admin.res);

      const { to } = await request.json();

      if (!to) {
        return withCors(json({ error: "to email is required" }, 400));
      }

      const result = await sendEmail(env, {
        to,
        subject: "Test Email from ETAW Backend",
        textBody: "This is a test email sent from the Elite Training and Wellness backend.\n\nIf you received this, email sending is working correctly!",
        htmlBody: "<h1>Test Email</h1><p>This is a test email sent from the <strong>Elite Training and Wellness</strong> backend.</p><p>If you received this, email sending is working correctly!</p>",
      });

      if (!result.ok) {
        return withCors(json({ error: result.error }, 500));
      }

      return withCors(json({ ok: true, message: "Test email sent successfully" }));
    }

    // ---------------- FALLBACK ----------------
    return withCors(new Response("Not Found", { status: 404 }));
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const scheduledTime = new Date(event.scheduledTime).toISOString();
    console.log(`REMINDER_CRON fired at ${scheduledTime}`);

    // Find sessions ~24h out that need reminders
    const { windowStart, windowEnd, targets } = await findReminderTargets(env, 24);

    console.log(`Reminder window: ${windowStart} to ${windowEnd}`);
    console.log(`Found ${targets.length} reminder target(s)`);

    // Log up to 3 sample targets for sanity check
    const samples = targets.slice(0, 3);
    if (samples.length > 0) {
      console.log("Sample targets:");
      samples.forEach((t) => {
        console.log(`  - Session ${t.session_id} at ${t.session_starts_at} → ${t.user_email}`);
      });
    }

    // Send reminder emails (or dry-run)
    const isDryRun = env.REMINDERS_DRY_RUN !== "false";
    const reminderType = "24h";

    for (const target of targets) {
      if (isDryRun) {
        // Dry-run: check if already sent (read-only), then log without DB writes
        const existingCheck = await env.DB.prepare(
          `SELECT id FROM reminder_sends WHERE booking_id = ? AND reminder_type = ?`
        )
          .bind(target.booking_id, reminderType)
          .first();

        if (existingCheck) {
          console.log(`REMINDER_SKIP_ALREADY_SENT booking=${target.booking_id} session=${target.session_id} to=${target.user_email}`);
        } else {
          console.log(`REMINDER_DRY_RUN session=${target.session_id} to=${target.user_email} starts_at=${target.session_starts_at}`);
        }
      } else {
        // Real send: atomically claim with INSERT first
        const recordId = crypto.randomUUID();
        let insertResult;

        try {
          insertResult = await env.DB.prepare(
            `INSERT INTO reminder_sends (id, booking_id, session_id, user_id, reminder_type, created_at, ok, error)
             VALUES (?, ?, ?, ?, ?, ?, 0, NULL)`
          )
            .bind(
              recordId,
              target.booking_id,
              target.session_id,
              target.user_id,
              reminderType,
              new Date().toISOString()
            )
            .run();
        } catch (err: any) {
          // UNIQUE constraint violation means already sent
          if (err.message && err.message.includes("UNIQUE")) {
            console.log(`REMINDER_SKIP_ALREADY_SENT booking=${target.booking_id} session=${target.session_id} to=${target.user_email}`);
            continue;
          }
          throw err;
        }

        // Claim successful, now send email
        const subject = "Reminder: Your class starts tomorrow";
        const textBody = `You're booked for your session at ${target.session_starts_at}. If you can't make it, please cancel in advance.`;

        const result = await sendEmail(env, {
          to: target.user_email,
          subject,
          textBody,
        });

        if (result.ok) {
          console.log(`REMINDER_SEND_OK session=${target.session_id} to=${target.user_email}`);
        } else {
          console.log(`REMINDER_SEND_FAIL session=${target.session_id} to=${target.user_email} err=${result.error}`);
        }

        // Update the record with actual result
        await env.DB.prepare(
          `UPDATE reminder_sends SET ok = ?, error = ? WHERE id = ?`
        )
          .bind(result.ok ? 1 : 0, result.ok ? null : result.error, recordId)
          .run();
      }
    }
  },
};