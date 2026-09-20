import React, { useState, useEffect } from "react";
import { ShieldAlert, HeartHandshake, CheckCircle2, Phone, AlertTriangle, Bell, Volume2, VolumeX, LifeBuoy, X } from "lucide-react";
import { api } from "../services/api";

interface SosConfirmationProps {
  onToast: (message: string, type?: "info" | "success" | "error") => void;
  prominent?: boolean;
  onClose?: () => void;
}

export const SosConfirmation: React.FC<SosConfirmationProps> = ({ onToast, prominent, onClose }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [contact, setContact] = useState("Emergency Family Contact");
  const [customMessage, setCustomMessage] = useState(
    "I am currently experiencing sensory overload/shutdown and need quiet reassurance."
  );
  const [loading, setLoading] = useState(false);
  const [soundAlert, setSoundAlert] = useState(false);
  const [sentAlert, setSentAlert] = useState<{ status: string; timestamp: string; message: string; contact: string } | null>(null);

  // Soft tone oscillator for emergency beacon
  useEffect(() => {
    if (!soundAlert) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      const interval = setInterval(() => {
        osc.frequency.setValueAtTime(osc.frequency.value === 440 ? 580 : 440, ctx.currentTime);
      }, 500);

      return () => {
        clearInterval(interval);
        try {
          osc.stop();
          ctx.close();
        } catch {}
      };
    } catch {
      // AudioContext unavailable
    }
  }, [soundAlert]);

  const handleSendSos = async () => {
    if (!confirmed) {
      onToast("Please check the confirmation box before sending SOS.", "info");
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendSos(customMessage, contact, true);
      setSentAlert(res);
      onToast("Safe SOS alert dispatched to your contact.", "success");
    } catch (err: any) {
      onToast(err.message || "Failed to dispatch SOS beacon.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1.5px solid #fca5a5",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        boxShadow: "0 8px 30px rgba(220, 38, 38, 0.08)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#dc2626"
            }}
          >
            <ShieldAlert size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#991b1b" }}>
              Emergency SOS Beacon & Reassurance
            </h2>
            <span style={{ fontSize: "0.82rem", color: "var(--ink-secondary)" }}>
              One-touch gentle alert dispatch to your trusted emergency circle
            </span>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close SOS"
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: "var(--radius-pill)",
              padding: "6px 12px",
              cursor: "pointer",
              color: "#4b5563",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: "0.82rem",
              fontWeight: 600
            }}
          >
            <X size={15} /> Close
          </button>
        )}
      </div>

      {/* Safety Reassurance Callout */}
      <div
        style={{
          background: "#fef2f2",
          border: "1px solid #fee2e2",
          borderRadius: "var(--radius-md)",
          padding: "14px 16px",
          marginBottom: 18,
          fontSize: "0.92rem",
          color: "#7f1d1d",
          lineHeight: 1.55,
          display: "flex",
          gap: 12,
          alignItems: "flex-start"
        }}
      >
        <HeartHandshake size={20} style={{ flexShrink: 0, marginTop: 2, color: "#dc2626" }} />
        <div>
          <strong>Take a gentle breath:</strong> You are safe. There is no rush and you are not in trouble. Reaching out for support or notifying your circle that you need space is safe and okay.
        </div>
      </div>

      {/* Medical & Sensory Emergency Identity Card */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "var(--radius-md)",
          padding: "14px 16px",
          marginBottom: 18
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280" }}>
            Sensory & Medical Accommodations Card
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "var(--radius-pill)",
              background: "#fee2e2",
              color: "#991b1b"
            }}
          >
            Always Active
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, fontSize: "0.86rem" }}>
          <div>
            <span style={{ color: "#6b7280", display: "block", fontSize: "0.76rem" }}>Sensory Need:</span>
            <strong>Do not touch, speak quietly, dim bright lights</strong>
          </div>
          <div>
            <span style={{ color: "#6b7280", display: "block", fontSize: "0.76rem" }}>Communication:</span>
            <strong>May become non-verbal during overload</strong>
          </div>
          <div>
            <span style={{ color: "#6b7280", display: "block", fontSize: "0.76rem" }}>Emergency Hotlines:</span>
            <strong>Crisis Text Line: Text HOME to 741741</strong>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
        <div>
          <label htmlFor="sos-contact-select" style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, marginBottom: 6, color: "var(--ink)" }}>
            Notify Emergency Contact:
          </label>
          <select
            id="sos-contact-select"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              color: "var(--ink)",
              fontSize: "0.9rem"
            }}
          >
            <option value="Emergency Family Contact">Emergency Family Contact (Primary)</option>
            <option value="Dr. Sarah (Support Specialist)">Dr. Sarah (Support Specialist)</option>
            <option value="Trusted Friend / Roommate">Trusted Friend / Roommate</option>
            <option value="Crisis Text Line (741741)">Crisis Text Line (741741)</option>
          </select>
        </div>

        <div>
          <label htmlFor="sos-message-input" style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, marginBottom: 6, color: "var(--ink)" }}>
            Dispatched Safety Message:
          </label>
          <input
            id="sos-message-input"
            type="text"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              color: "var(--ink)",
              fontSize: "0.9rem"
            }}
          />
        </div>
      </div>

      {/* Audio Beacon Tone Toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: soundAlert ? "#fee2e2" : "var(--paper)",
          border: soundAlert ? "1px solid #fca5a5" : "1px solid var(--line)",
          borderRadius: "var(--radius-md)",
          marginBottom: 16
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {soundAlert ? <Volume2 size={18} color="#dc2626" /> : <VolumeX size={18} color="#6b7280" />}
          <div>
            <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)", display: "block" }}>
              Audible Location Beacon
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--ink-secondary)" }}>
              Emits a soft pulsating tone to help trusted helpers locate you nearby
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSoundAlert((prev) => !prev)}
          style={{
            background: soundAlert ? "#dc2626" : "#ffffff",
            color: soundAlert ? "#ffffff" : "#4b5563",
            border: "1px solid #d1d5db",
            padding: "5px 12px",
            borderRadius: "var(--radius-pill)",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          {soundAlert ? "Mute Beacon" : "Enable Sound"}
        </button>
      </div>

      {/* Accidental click protection toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
          padding: "12px 14px",
          background: confirmed ? "#f0fdf4" : "var(--paper)",
          borderRadius: "var(--radius-md)",
          border: confirmed ? "1px solid #86efac" : "1px solid var(--line)",
          transition: "all 0.15s ease"
        }}
      >
        <input
          id="sos-confirm-checkbox"
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          style={{ width: 18, height: 18, accentColor: "#dc2626", cursor: "pointer" }}
        />
        <label
          htmlFor="sos-confirm-checkbox"
          style={{
            fontSize: "0.88rem",
            fontWeight: 600,
            color: "var(--ink)",
            cursor: "pointer",
            margin: 0
          }}
        >
          Confirm: I intend to dispatch this emergency alert now
        </label>
      </div>

      <button
        type="button"
        onClick={handleSendSos}
        disabled={loading || !confirmed}
        style={{
          width: "100%",
          padding: "14px 20px",
          borderRadius: "var(--radius-md)",
          background: confirmed ? "#dc2626" : "#cbd5e1",
          color: "#ffffff",
          border: "none",
          fontWeight: 700,
          fontSize: "1rem",
          cursor: confirmed ? "pointer" : "not-allowed",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          boxShadow: confirmed ? "0 4px 14px rgba(220, 38, 38, 0.25)" : "none",
          transition: "all 0.15s ease"
        }}
      >
        <AlertTriangle size={18} />
        {loading ? "Sending SOS Alert…" : "Dispatch Emergency Support Alert"}
      </button>

      {sentAlert && (
        <div
          role="status"
          style={{
            marginTop: 18,
            padding: "14px 18px",
            background: "#f0fdf4",
            border: "1px solid #86efac",
            borderRadius: "var(--radius-md)",
            fontSize: "0.9rem",
            color: "#166534",
            display: "flex",
            alignItems: "flex-start",
            gap: 10
          }}
        >
          <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Dispatched at {new Date(sentAlert.timestamp).toLocaleTimeString()}:</strong>{" "}
            Alert received by {sentAlert.contact}. Take all the time you need, support is on notice.
          </div>
        </div>
      )}
    </div>
  );
};

