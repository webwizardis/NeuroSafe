import React, { useState } from "react";
import { api } from "../services/api";

interface SosConfirmationProps {
  onToast: (message: string, type?: "info" | "success" | "error") => void;
  prominent?: boolean;
}

export const SosConfirmation: React.FC<SosConfirmationProps> = ({ onToast, prominent }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [contact, setContact] = useState("Dr. Sarah (Support Specialist)");
  const [customMessage, setCustomMessage] = useState(
    "I am currently overwhelmed and need a quiet check-in or safe reassurance."
  );
  const [loading, setLoading] = useState(false);
  const [sentAlert, setSentAlert] = useState<{ status: string; timestamp: string; message: string; contact: string } | null>(null);

  const handleSendSos = async () => {
    if (!confirmed) {
      onToast("Please check the confirmation box before sending SOS.", "info");
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendSos(customMessage, contact, true);
      setSentAlert(res);
      onToast("🚨 Safe SOS alert dispatched to your contact.", "success");
    } catch (err: any) {
      onToast(err.message || "Failed to dispatch SOS beacon.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: prominent ? "var(--danger-bg)" : "var(--card)",
        border: prominent ? "2px solid #e2857e" : "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        boxShadow: prominent ? "var(--shadow-md)" : "var(--shadow-sm)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: "1.4rem" }}>🆘</span>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--danger)" }}>
          Emergency SOS Beacon & Reassurance
        </h2>
      </div>

      <p style={{ margin: "0 0 16px 0", fontSize: "0.88rem", color: "var(--ink-secondary)" }}>
        Quick, unhurried reassurance and alert dispatch to your trusted circle when experiencing
        meltdowns, shutdowns, or acute panic.
      </p>

      {/* Safety Reassurance Callout */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-md)",
          padding: "12px 16px",
          marginBottom: 16,
          fontSize: "0.92rem",
          color: "var(--ink)",
          lineHeight: 1.5
        }}
      >
        🕊️ <strong>Take a moment:</strong> You are not in trouble. There is no rush. Reaching out
        for gentle support or letting someone know you need quiet is safe and okay.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        <div>
          <label htmlFor="sos-contact-select" style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, marginBottom: 4, color: "var(--ink)" }}>
            Notify Contact:
          </label>
          <select
            id="sos-contact-select"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              color: "var(--ink)",
              fontSize: "0.9rem"
            }}
          >
            <option value="Dr. Sarah (Support Specialist)">Dr. Sarah (Support Specialist)</option>
            <option value="Emergency Family Contact">Emergency Family Contact</option>
            <option value="Trusted Friend / Roommate">Trusted Friend / Roommate</option>
            <option value="Crisis Text Line (741741)">Crisis Text Line (741741)</option>
          </select>
        </div>

        <div>
          <label htmlFor="sos-message-input" style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, marginBottom: 4, color: "var(--ink)" }}>
            Dispatched Message:
          </label>
          <input
            id="sos-message-input"
            type="text"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              color: "var(--ink)",
              fontSize: "0.9rem"
            }}
          />
        </div>
      </div>

      {/* Accidental click protection toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
          padding: "10px 12px",
          background: "var(--paper)",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--line)"
        }}
      >
        <input
          id="sos-confirm-checkbox"
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          style={{ width: 18, height: 18, accentColor: "var(--danger)", cursor: "pointer" }}
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
          Confirm: I would like to send this alert now
        </label>
      </div>

      <button
        type="button"
        onClick={handleSendSos}
        disabled={loading || !confirmed}
        style={{
          width: "100%",
          padding: "12px 18px",
          borderRadius: "var(--radius-md)",
          background: confirmed ? "var(--danger)" : "#b5b5b5",
          color: "#ffffff",
          border: "none",
          fontWeight: 700,
          fontSize: "0.98rem",
          cursor: confirmed ? "pointer" : "not-allowed",
          boxShadow: confirmed ? "0 4px 14px rgba(179, 57, 47, 0.25)" : "none",
          transition: "all 0.15s ease"
        }}
      >
        {loading ? "Sending SOS Alert…" : "🚨 Dispatch Safe Support Alert"}
      </button>

      {sentAlert && (
        <div
          role="status"
          style={{
            marginTop: 16,
            padding: "12px 16px",
            background: "var(--card)",
            border: "1px solid var(--spring-green-700)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.88rem",
            color: "var(--spring-green-900)"
          }}
        >
          ✅ <strong>Dispatched at {new Date(sentAlert.timestamp).toLocaleTimeString()}:</strong>{" "}
          Alert sent to {sentAlert.contact}. Take all the time you need.
        </div>
      )}
    </div>
  );
};
