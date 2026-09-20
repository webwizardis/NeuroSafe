import React from "react";
import { User, AccessibilitySettings } from "../types";
import { AccessibilitySettingsBar } from "./AccessibilitySettingsBar";

interface NavbarProps {
  user: User | null;
  backendOnline: boolean;
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: AccessibilitySettings, note?: string) => void;
  onOpenAssessment: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  backendOnline,
  settings,
  onUpdateSettings,
  onOpenAssessment,
  onLogout
}) => {
  const displayName = user?.name || user?.email?.split("@")[0] || "Friend";

  return (
    <header
      style={{
        background: "var(--card)",
        borderBottom: "1px solid var(--line)",
        padding: "16px 0",
        boxShadow: "var(--shadow-sm)"
      }}
    >
      <div className="container" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: "1.4rem",
                  lineHeight: 1
                }}
              >
                🌿
              </span>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "1.35rem",
                  letterSpacing: "-0.02em",
                  color: "var(--spring-green-900)"
                }}
              >
                NeuroSafe
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  background: "var(--peach-100)",
                  color: "var(--peach-900)",
                  padding: "3px 8px",
                  borderRadius: "var(--radius-pill)"
                }}
              >
                Affirming Support
              </span>
            </div>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "0.88rem",
                color: "var(--ink-secondary)"
              }}
            >
              Support that follows your lead — calming sensory & cognitive assistance.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: "var(--radius-pill)",
                background: "var(--paper)",
                border: "1px solid var(--line)",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--ink)"
              }}
            >
              <span>👤</span>
              <span>{displayName}</span>
            </span>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: "var(--radius-pill)",
                background: backendOnline ? "var(--spring-mint-100)" : "var(--danger-bg)",
                color: backendOnline ? "var(--spring-green-800)" : "var(--danger)",
                fontSize: "0.82rem",
                fontWeight: 600
              }}
              title="Backend service connectivity"
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: backendOnline ? "var(--spring-green-700)" : "var(--danger)"
                }}
              />
              <span>{backendOnline ? "Online" : "Connecting…"}</span>
            </span>

            <button
              type="button"
              data-speech="Personalize"
              onClick={onOpenAssessment}
              style={{
                padding: "7px 14px",
                borderRadius: "var(--radius-md)",
                background: "var(--peach-100)",
                border: "1px solid var(--peach-300)",
                color: "var(--peach-900)",
                fontSize: "0.86rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6
              }}
              title="Change your accessibility needs and re-tailor"
            >
              <span>⚙️</span>
              <span>Personalize</span>
            </button>

            <button
              type="button"
              data-speech="Log Out"
              onClick={onLogout}
              style={{
                padding: "7px 14px",
                borderRadius: "var(--radius-md)",
                background: "transparent",
                border: "1px solid var(--line)",
                color: "var(--danger)",
                fontSize: "0.86rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
              title="Log out of current session"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Quick Accessibility & EHV Toggles Bar */}
        <div
          style={{
            paddingTop: 8,
            borderTop: "1px solid var(--line)",
            display: "flex",
            flexDirection: "column",
            gap: 6
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8
            }}
          >
            <span
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--ink-secondary)"
              }}
            >
              EHV & Sensory Accessibility Controls:
            </span>
          </div>
          <AccessibilitySettingsBar settings={settings} onUpdate={onUpdateSettings} />
        </div>
      </div>
    </header>
  );
};
