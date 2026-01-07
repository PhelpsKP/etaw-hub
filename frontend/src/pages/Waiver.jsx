import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../lib/api";
import waiverText from "../assets/waiver.txt?raw";

export function Waiver() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [isMinor, setIsMinor] = useState(false);

  // Adult waiver fields (always required)
  const [participantName, setParticipantName] = useState("");
  const [participantDob, setParticipantDob] = useState("");
  const [participantSignature, setParticipantSignature] = useState("");
  const [participantPrintedName, setParticipantPrintedName] = useState("");
  const [participantSignedDate, setParticipantSignedDate] = useState("");

  // Minor addendum fields (required when isMinor is true)
  const [minorName, setMinorName] = useState("");
  const [minorDob, setMinorDob] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("");
  const [guardianSignature, setGuardianSignature] = useState("");
  const [guardianPrintedName, setGuardianPrintedName] = useState("");
  const [guardianSignedDate, setGuardianSignedDate] = useState("");

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    // Auto-populate today's date when form loads
    const today = new Date().toISOString().split('T')[0];
    if (!isMinor && !participantSignedDate) {
      setParticipantSignedDate(today);
    }
    if (isMinor && !guardianSignedDate) {
      setGuardianSignedDate(today);
    }
  }, [isMinor]);

  async function load() {
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const res = await fetch(`${API_BASE_URL}/api/waiver/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      setError("Failed to load waiver status.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setSigned(data.signed);
    setLoading(false);

    if (data.signed) {
      navigate("/app/intake", { replace: true });
    }
  }

  async function handleSign(e) {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token) return navigate("/login", { replace: true });

    // Build payload based on isMinor flag
    let payload;

    if (isMinor) {
      // For minor: participant fields refer to the minor (person doing activities)
      // Guardian signs on their behalf
      payload = {
        participant_name: minorName.trim(),
        participant_dob: minorDob.trim(),
        participant_signature: guardianSignature.trim(), // Guardian signs for minor on main waiver
        participant_printed_name: guardianPrintedName.trim(), // Guardian's printed name
        participant_signed_date: guardianSignedDate.trim(),
        is_minor: true,
        minor_name: minorName.trim(),
        minor_dob: minorDob.trim(),
        guardian_name: guardianName.trim(),
        guardian_relationship: guardianRelationship.trim(),
        guardian_signature: guardianSignature.trim(),
        guardian_printed_name: guardianPrintedName.trim(),
        guardian_signed_date: guardianSignedDate.trim(),
      };
    } else {
      // For adult: participant is the person themselves
      payload = {
        participant_name: participantName.trim(),
        participant_dob: participantDob.trim(),
        participant_signature: participantSignature.trim(),
        participant_printed_name: participantPrintedName.trim(),
        participant_signed_date: participantSignedDate.trim(),
        is_minor: false,
      };
    }

    const res = await fetch(`${API_BASE_URL}/api/waiver/sign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const msg = await res.json().catch(() => ({}));
      setError(msg.error || "Failed to sign waiver.");
      return;
    }

    navigate("/app/intake", { replace: true });
  }

  if (loading) return <div style={{ padding: 24 }}>Loading waiver...</div>;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 24 }}>
      <h1>Release of Liability, Waiver of Claims, Assumption of Risk, and Indemnification Agreement</h1>

      {/* Minor participant note */}
      {isMinor && (
        <div style={{ marginTop: 16, padding: 12, backgroundColor: "#e7f3ff", border: "1px solid #b3d9ff", borderRadius: 4, fontSize: 14 }}>
          <strong>Minor Participant:</strong> Please review the complete waiver below, including the Minor Participant Addendum section, and complete all required fields.
        </div>
      )}

      {/* Waiver text display - always shows full text */}
      <div style={{
        whiteSpace: "pre-wrap",
        marginTop: 16,
        padding: 16,
        border: "1px solid #ddd",
        borderRadius: 8,
        backgroundColor: "#f8f9fa",
        maxHeight: "400px",
        overflowY: "auto",
        fontFamily: "monospace",
        fontSize: "13px"
      }}>
        {waiverText}
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Complete and Sign</h3>
        {error && <div style={{ color: "crimson", marginBottom: 12, padding: 12, backgroundColor: "#f8d7da", borderRadius: 4 }}>{error}</div>}

        <form onSubmit={handleSign}>
          {/* Minor toggle */}
          <div style={{ marginBottom: 20, padding: 12, backgroundColor: "#e7f3ff", borderRadius: 4 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={isMinor}
                onChange={(e) => setIsMinor(e.target.checked)}
              />
              <strong>Participant is under 18</strong>
            </label>
          </div>

          {/* Adult flow: Standard participant fields */}
          {!isMinor && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 12 }}>Participant Information</h4>

              <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                Participant Name *
              </label>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                style={{ width: "100%", padding: 10, fontSize: 16, marginBottom: 16, border: "1px solid #ccc", borderRadius: 4 }}
                placeholder="Enter your full legal name"
                required
              />

              <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                Date of Birth *
              </label>
              <input
                type="date"
                value={participantDob}
                onChange={(e) => setParticipantDob(e.target.value)}
                style={{ width: "100%", padding: 10, fontSize: 16, marginBottom: 16, border: "1px solid #ccc", borderRadius: 4 }}
                required
              />

              <h4 style={{ marginTop: 24, marginBottom: 12 }}>Signature Section</h4>

              <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                Participant Signature (type your full name) *
              </label>
              <input
                type="text"
                value={participantSignature}
                onChange={(e) => setParticipantSignature(e.target.value)}
                style={{ width: "100%", padding: 10, fontSize: 16, marginBottom: 16, fontFamily: "cursive", border: "1px solid #ccc", borderRadius: 4 }}
                placeholder="Type your full legal name as signature"
                required
              />

              <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                Printed Name *
              </label>
              <input
                type="text"
                value={participantPrintedName}
                onChange={(e) => setParticipantPrintedName(e.target.value)}
                style={{ width: "100%", padding: 10, fontSize: 16, marginBottom: 16, border: "1px solid #ccc", borderRadius: 4 }}
                placeholder="Print your full legal name"
                required
              />

              <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                Date *
              </label>
              <input
                type="date"
                value={participantSignedDate}
                onChange={(e) => setParticipantSignedDate(e.target.value)}
                style={{ width: "100%", padding: 10, fontSize: 16, border: "1px solid #ccc", borderRadius: 4 }}
                required
              />
            </div>
          )}

          {/* Minor flow: Minor info + Guardian info */}
          {isMinor && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ marginBottom: 12 }}>Minor Participant Information</h4>

                <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                  Minor's Name *
                </label>
                <input
                  type="text"
                  value={minorName}
                  onChange={(e) => setMinorName(e.target.value)}
                  style={{ width: "100%", padding: 10, fontSize: 16, marginBottom: 16, border: "1px solid #ccc", borderRadius: 4 }}
                  placeholder="Enter minor's full legal name"
                  required
                />

                <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                  Minor's Date of Birth *
                </label>
                <input
                  type="date"
                  value={minorDob}
                  onChange={(e) => setMinorDob(e.target.value)}
                  style={{ width: "100%", padding: 10, fontSize: 16, border: "1px solid #ccc", borderRadius: 4 }}
                  required
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <h4 style={{ marginBottom: 12 }}>Parent / Legal Guardian Information</h4>

                <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                  Parent/Guardian Name *
                </label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  style={{ width: "100%", padding: 10, fontSize: 16, marginBottom: 16, border: "1px solid #ccc", borderRadius: 4 }}
                  placeholder="Enter parent/guardian full legal name"
                  required
                />

                <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                  Relationship to Minor *
                </label>
                <input
                  type="text"
                  value={guardianRelationship}
                  onChange={(e) => setGuardianRelationship(e.target.value)}
                  style={{ width: "100%", padding: 10, fontSize: 16, marginBottom: 16, border: "1px solid #ccc", borderRadius: 4 }}
                  placeholder="e.g., Parent, Legal Guardian"
                  required
                />

                <h4 style={{ marginTop: 24, marginBottom: 12 }}>Guardian Signature Section</h4>

                <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                  Signature (type your full name) *
                </label>
                <input
                  type="text"
                  value={guardianSignature}
                  onChange={(e) => setGuardianSignature(e.target.value)}
                  style={{ width: "100%", padding: 10, fontSize: 16, marginBottom: 16, fontFamily: "cursive", border: "1px solid #ccc", borderRadius: 4 }}
                  placeholder="Type your full legal name as signature"
                  required
                />

                <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                  Printed Name *
                </label>
                <input
                  type="text"
                  value={guardianPrintedName}
                  onChange={(e) => setGuardianPrintedName(e.target.value)}
                  style={{ width: "100%", padding: 10, fontSize: 16, marginBottom: 16, border: "1px solid #ccc", borderRadius: 4 }}
                  placeholder="Print your full legal name"
                  required
                />

                <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                  Date *
                </label>
                <input
                  type="date"
                  value={guardianSignedDate}
                  onChange={(e) => setGuardianSignedDate(e.target.value)}
                  style={{ width: "100%", padding: 10, fontSize: 16, border: "1px solid #ccc", borderRadius: 4 }}
                  required
                />
              </div>
            </>
          )}

          <div style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: 4,
            marginBottom: 16
          }}>
            <p style={{ margin: 0, fontSize: 14 }}>
              <strong>By submitting this form, you acknowledge that you have read, understood, and agree to all terms and conditions stated in this waiver.</strong>
            </p>
          </div>

          <button
            style={{
              marginTop: 12,
              padding: "12px 24px",
              fontSize: 16,
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: "bold"
            }}
            type="submit"
          >
            I Agree and Sign
          </button>
        </form>
      </div>
    </div>
  );
}
