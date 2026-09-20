import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  X,
  MapPin,
  Locate,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { api } from "../services/api";
import { SosLocationData } from "../types";

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
  const [sentAlert, setSentAlert] = useState<{
    status: string;
    timestamp: string;
    message: string;
    contact: string;
    location?: SosLocationData | null;
  } | null>(null);

  // Geolocation states
  const [includeLocation, setIncludeLocation] = useState(true);
  const [location, setLocation] = useState<SosLocationData | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Geolocation detection function
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        setLocation({
          latitude: lat,
          longitude: lng,
          accuracy,
          timestamp: pos.timestamp,
          mapsUrl
        });
        setLocating(false);
      },
      (err) => {
        let msg = "Unable to retrieve your current location.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Location access was denied. You can enable location in browser permissions to share GPS coordinates.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "GPS signal is currently unavailable.";
        } else if (err.code === err.TIMEOUT) {
          msg = "GPS request timed out. Please try again.";
        }
        setLocationError(msg);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  // Try detecting location on mount automatically
  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

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
      // AudioContext unavailable in iframe without gesture
    }
  }, [soundAlert]);

  const handleSendSos = async () => {
    if (!confirmed) {
      onToast("Please check the confirmation box before sending SOS.", "info");
      return;
    }

    setLoading(true);
    try {
      let finalMessage = customMessage.trim();
      if (includeLocation && location) {
        finalMessage = `${finalMessage}\n\n📍 My Live GPS Location:\nGoogle Maps: ${location.mapsUrl}\nCoordinates: ${location.latitude.toFixed(5)}°, ${location.longitude.toFixed(5)}° (Accuracy: ±${location.accuracy}m)`;
      }

      const res = await api.sendSos(
        finalMessage,
        contact,
        true,
        includeLocation && location ? location : undefined
      );

      setSentAlert(res);
      onToast(
        includeLocation && location
          ? "Safe SOS alert dispatched with your GPS coordinates."
          : "Safe SOS alert dispatched to your contact.",
        "success"
      );
    } catch (err: any) {
      onToast(err.message || "Failed to dispatch SOS beacon.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="box-sos-confirmation"
      style={{
        background: "var(--card)",
        border: "2px solid #fca5a5",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        boxShadow: "0 8px 30px rgba(220, 38, 38, 0.08)",
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}
    >
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "var(--radius-md)",
              background: "#fee2e2",
              border: "1.5px solid #fca5a5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#dc2626",
              flexShrink: 0
            }}
          >
            <ShieldAlert size={24} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#991b1b" }}>
                Emergency SOS & Support Beacon
              </h2>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-pill)",
                  background: "#fee2e2",
                  color: "#991b1b",
                  border: "1px solid #fca5a5"
                }}
              >
                Immediate Access
              </span>
            </div>
            <span style={{ fontSize: "0.84rem", color: "var(--ink-secondary)" }}>
              One-touch gentle alert dispatch to your trusted emergency circle with live GPS location
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
          padding: "12px 16px",
          marginBottom: 16,
          fontSize: "0.9rem",
          color: "#7f1d1d",
          lineHeight: 1.5,
          display: "flex",
          gap: 12,
          alignItems: "flex-start"
        }}
      >
        <HeartHandshake size={20} style={{ flexShrink: 0, marginTop: 2, color: "#dc2626" }} />
        <div>
          <strong>Take a gentle breath:</strong> You are safe. There is no rush and you are not in trouble. Reaching out for support or notifying your circle that you need quiet or assistance is safe and okay.
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LIVE GPS LOCATION MODULE                                     */}
      {/* ------------------------------------------------------------- */}
      <div
        id="sos-location-card"
        style={{
          background: location ? "#f0fdf4" : locationError ? "#fefce8" : "#f9fafb",
          border: location
            ? "1.5px solid #86efac"
            : locationError
            ? "1.5px solid #fde047"
            : "1.5px solid #e5e7eb",
          borderRadius: "var(--radius-md)",
          padding: "14px 16px",
          marginBottom: 16,
          transition: "all 0.2s ease"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MapPin size={18} color={location ? "#16a34a" : "#dc2626"} />
            <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--ink)" }}>
              Emergency GPS Location
            </span>
            {locating ? (
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "var(--radius-pill)",
                  background: "#e0f2fe",
                  color: "#0369a1",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <Locate size={12} className="animate-spin" /> Detecting…
              </span>
            ) : location ? (
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "var(--radius-pill)",
                  background: "#dcfce7",
                  color: "#15803d"
                }}
              >
                GPS Acquired (±{location.accuracy}m)
              </span>
            ) : locationError ? (
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "var(--radius-pill)",
                  background: "#fef3c7",
                  color: "#b45309"
                }}
              >
                GPS Disabled
              </span>
            ) : null}
          </div>

          <button
            type="button"
            id="sos-refresh-location-button"
            onClick={detectLocation}
            disabled={locating}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              borderRadius: "var(--radius-pill)",
              background: "var(--card)",
              border: "1px solid var(--line)",
              color: "var(--ink)",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: locating ? "wait" : "pointer"
            }}
            title="Refresh GPS Coordinates"
          >
            <RefreshCw size={12} />
            <span>{locating ? "Updating GPS…" : "Update GPS"}</span>
          </button>
        </div>

        {/* Location Content */}
        {location ? (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
                fontSize: "0.86rem",
                color: "var(--ink)",
                marginBottom: 8
              }}
            >
              <div>
                <span style={{ color: "var(--ink-secondary)", fontSize: "0.78rem", display: "block" }}>
                  Current Coordinates:
                </span>
                <strong style={{ fontFamily: "monospace", fontSize: "0.92rem" }}>
                  {location.latitude.toFixed(5)}° N, {location.longitude.toFixed(5)}° W
                </strong>
              </div>

              <a
                href={location.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  borderRadius: "var(--radius-pill)",
                  background: "#ffffff",
                  border: "1px solid #86efac",
                  color: "#166534",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textDecoration: "none"
                }}
              >
                <ExternalLink size={13} />
                <span>View on Google Maps</span>
              </a>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <input
                id="sos-include-location-toggle"
                type="checkbox"
                checked={includeLocation}
                onChange={(e) => setIncludeLocation(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "#16a34a", cursor: "pointer" }}
              />
              <label
                htmlFor="sos-include-location-toggle"
                style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--ink)", cursor: "pointer" }}
              >
                Attach live GPS map link & coordinates to this SOS alert
              </label>
            </div>
          </div>
        ) : locationError ? (
          <div style={{ fontSize: "0.82rem", color: "#92400e", lineHeight: 1.45 }}>
            <p style={{ margin: "0 0 6px 0" }}>{locationError}</p>
            <button
              type="button"
              onClick={detectLocation}
              style={{
                background: "#fef3c7",
                border: "1px solid #fde68a",
                color: "#92400e",
                padding: "3px 10px",
                borderRadius: "var(--radius-pill)",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Grant Location Permission & Try Again
            </button>
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ink-secondary)" }}>
            Locating your position via GPS for rapid emergency response…
          </p>
        )}
      </div>

      {/* Medical & Sensory Emergency Identity Card */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "var(--radius-md)",
          padding: "12px 16px",
          marginBottom: 16
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280" }}>
            Sensory & Medical Accommodations Card
          </span>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "var(--radius-pill)",
              background: "#fee2e2",
              color: "#991b1b"
            }}
          >
            Included in Alert
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, fontSize: "0.84rem" }}>
          <div>
            <span style={{ color: "#6b7280", display: "block", fontSize: "0.74rem" }}>Sensory Need:</span>
            <strong>Do not touch, speak softly, dim bright lights</strong>
          </div>
          <div>
            <span style={{ color: "#6b7280", display: "block", fontSize: "0.74rem" }}>Communication:</span>
            <strong>May experience temporary speech shutdown / AAC need</strong>
          </div>
          <div>
            <span style={{ color: "#6b7280", display: "block", fontSize: "0.74rem" }}>Direct Crisis Line:</span>
            <strong>Text HOME to 741741 (Free 24/7)</strong>
          </div>
        </div>
      </div>

      {/* Input controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        <div>
          <label htmlFor="sos-contact-select" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 5, color: "var(--ink)" }}>
            Notify Emergency Contact:
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
              fontSize: "0.88rem"
            }}
          >
            <option value="Emergency Family Contact">Emergency Family Contact (Primary)</option>
            <option value="Dr. Sarah (Support Specialist)">Dr. Sarah (Support Specialist)</option>
            <option value="Trusted Friend / Roommate">Trusted Friend / Roommate</option>
            <option value="Crisis Text Line (741741)">Crisis Text Line (741741)</option>
          </select>
        </div>

        <div>
          <label htmlFor="sos-message-input" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 5, color: "var(--ink)" }}>
            Dispatched Safety Message:
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
              fontSize: "0.88rem"
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
            <span style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--ink)", display: "block" }}>
              Audible Location Beacon
            </span>
            <span style={{ fontSize: "0.76rem", color: "var(--ink-secondary)" }}>
              Emits a soft pulsating tone to help trusted helpers locate you nearby
            </span>
          </div>
        </div>
        <button
          type="button"
          id="sos-audio-beacon-toggle"
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
          marginBottom: 16,
          padding: "12px 14px",
          background: confirmed ? "#f0fdf4" : "var(--paper)",
          borderRadius: "var(--radius-md)",
          border: confirmed ? "1.5px solid #86efac" : "1px solid var(--line)",
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
          Confirm: I intend to dispatch this emergency alert {includeLocation && location ? "with my GPS location" : ""} now
        </label>
      </div>

      <button
        type="button"
        id="sos-dispatch-button"
        onClick={handleSendSos}
        disabled={loading || !confirmed}
        style={{
          width: "100%",
          padding: "13px 20px",
          borderRadius: "var(--radius-md)",
          background: confirmed ? "#dc2626" : "#cbd5e1",
          color: "#ffffff",
          border: "none",
          fontWeight: 700,
          fontSize: "0.96rem",
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
          id="sos-sent-status"
          role="status"
          style={{
            marginTop: 16,
            padding: "14px 18px",
            background: "#f0fdf4",
            border: "1.5px solid #86efac",
            borderRadius: "var(--radius-md)",
            fontSize: "0.88rem",
            color: "#166534",
            display: "flex",
            flexDirection: "column",
            gap: 8
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0 }} />
            <div>
              <strong>Dispatched at {new Date(sentAlert.timestamp).toLocaleTimeString()}:</strong>{" "}
              Alert successfully sent to {sentAlert.contact}.
            </div>
          </div>

          {sentAlert.location && (
            <div
              style={{
                marginLeft: 30,
                fontSize: "0.82rem",
                background: "#ffffff",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid #bbf7d0"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                <span>
                  📍 <strong>GPS Transmitted:</strong> {sentAlert.location.latitude.toFixed(5)}°, {sentAlert.location.longitude.toFixed(5)}° (±{sentAlert.location.accuracy}m)
                </span>
                <a
                  href={sentAlert.location.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#15803d",
                    fontWeight: 700,
                    textDecoration: "underline",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3
                  }}
                >
                  <ExternalLink size={12} /> Open Map
                </a>
              </div>
            </div>
          )}

          <div style={{ marginLeft: 30, fontSize: "0.82rem", color: "#15803d" }}>
            Take all the time you need, your support team has been notified.
          </div>
        </div>
      )}
    </div>
  );
};
