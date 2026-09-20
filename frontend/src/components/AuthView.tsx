import React, { useState } from "react";
import { ShieldCheck, Zap, Lock } from "lucide-react";
import { api, setSessionToken } from "../services/api";
import { User } from "../types";

interface AuthViewProps {
  onSuccess: (user: User, isDemo?: boolean) => void;
  onToast: (message: string, type?: "info" | "success" | "error") => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess, onToast }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === "register") {
        if (!name.trim()) {
          throw new Error("Please enter your name or preferred nickname.");
        }
        const res = await api.register(name.trim(), email.trim(), password);
        setSessionToken(res.token, remember);
        onToast(`Welcome to NeuroSafe, ${res.user.name || "Friend"}!`, "success");
        onSuccess(res.user);
      } else {
        const res = await api.login(email.trim(), password);
        setSessionToken(res.token, remember);
        onToast(`Signed in as ${res.user.name || res.user.email}`, "success");
        onSuccess(res.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Sign in failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await api.demoAuth();
      setSessionToken(res.token, true);
      onToast("Instant Demo Mode activated! Welcome, Alex.", "success");
      onSuccess(res.user, true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to start demo session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        background: "radial-gradient(ellipse at top, var(--paper-peach) 0%, var(--paper) 100%)"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: "var(--radius-pill)",
              background: "var(--peach-100)",
              color: "var(--peach-900)",
              fontSize: "0.84rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 14
            }}
          >
            <ShieldCheck size={16} />
            <span>NeuroSafe Accessibility</span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2.3rem",
              fontWeight: 600,
              color: "var(--spring-green-900)",
              lineHeight: 1.2,
              margin: "0 0 10px 0"
            }}
          >
            Support that follows your lead.
          </h1>
          <p
            style={{
              color: "var(--ink-secondary)",
              fontSize: "1rem",
              lineHeight: 1.55,
              margin: 0
            }}
          >
            A calm, neurodiversity-affirming companion tailored specifically to your sensory,
            cognitive, and daily executive needs.
          </p>
        </div>

        {/* Auth Card */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-lg)",
            padding: "32px 28px",
            boxShadow: "var(--shadow-md)"
          }}
        >
          {/* Tab Switcher */}
          <div
            role="tablist"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              background: "var(--paper)",
              padding: 4,
              borderRadius: "var(--radius-md)",
              marginBottom: 24
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              onClick={() => {
                setMode("login");
                setErrorMsg(null);
              }}
              style={{
                padding: "9px 12px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                fontWeight: 600,
                fontSize: "0.92rem",
                cursor: "pointer",
                background: mode === "login" ? "var(--card)" : "transparent",
                color: mode === "login" ? "var(--spring-green-900)" : "var(--ink-secondary)",
                boxShadow: mode === "login" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              onClick={() => {
                setMode("register");
                setErrorMsg(null);
              }}
              style={{
                padding: "9px 12px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                fontWeight: 600,
                fontSize: "0.92rem",
                cursor: "pointer",
                background: mode === "register" ? "var(--card)" : "transparent",
                color: mode === "register" ? "var(--spring-green-900)" : "var(--ink-secondary)",
                boxShadow: mode === "register" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "register" && (
              <div>
                <label
                  htmlFor="auth-name"
                  style={{
                    display: "block",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    marginBottom: 6,
                    color: "var(--ink)"
                  }}
                >
                  Preferred Name or Nickname
                </label>
                <input
                  id="auth-name"
                  type="text"
                  placeholder="e.g. Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--line)",
                    background: "var(--card)",
                    color: "var(--ink)",
                    fontSize: "1rem"
                  }}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                style={{
                  display: "block",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  marginBottom: 6,
                  color: "var(--ink)"
                }}
              >
                Email or Username
              </label>
              <input
                id="auth-email"
                type="text"
                placeholder="e.g. alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--line)",
                  background: "var(--card)",
                  color: "var(--ink)",
                  fontSize: "1rem"
                }}
              />
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6
                }}
              >
                <label
                  htmlFor="auth-password"
                  style={{
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "var(--ink)",
                    margin: 0
                  }}
                >
                  Password / PIN
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--spring-green-700)",
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: "2px 6px"
                  }}
                  aria-label="Toggle password display"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password or simple PIN"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--line)",
                  background: "var(--card)",
                  color: "var(--ink)",
                  fontSize: "1rem"
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                id="auth-remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{
                  width: 18,
                  height: 18,
                  accentColor: "var(--spring-green-700)",
                  cursor: "pointer"
                }}
              />
              <label
                htmlFor="auth-remember"
                style={{
                  fontSize: "0.88rem",
                  color: "var(--ink-secondary)",
                  cursor: "pointer",
                  margin: 0
                }}
              >
                Remember me on this browser
              </label>
            </div>

            {errorMsg && (
              <div
                role="alert"
                style={{
                  background: "var(--danger-bg)",
                  color: "var(--danger)",
                  border: "1px solid #f7c3c0)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                  fontSize: "0.9rem",
                  fontWeight: 600
                }}
              >
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                padding: "13px 20px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: "var(--spring-green-700)",
                color: "#ffffff",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "var(--shadow-sm)",
                transition: "background 0.15s ease",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading
                ? "Checking…"
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "20px 0",
              gap: 12
            }}
          >
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <span style={{ fontSize: "0.84rem", color: "var(--ink-secondary)", fontWeight: 500 }}>
              or start immediately
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>

          <button
            type="button"
            onClick={handleDemo}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 20px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--peach-300)",
              background: "var(--peach-100)",
              color: "var(--peach-900)",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 0.15s ease"
            }}
          >
            <Zap size={16} />
            <span>Instant Safe Demo (1-Click)</span>
          </button>

          <div
            style={{
              marginTop: 24,
              paddingTop: 18,
              borderTop: "1px solid var(--line)",
              fontSize: "0.82rem",
              color: "var(--ink-secondary)",
              lineHeight: 1.5,
              display: "flex",
              alignItems: "flex-start",
              gap: 8
            }}
          >
            <Lock size={14} style={{ flexShrink: 0, marginTop: 2, color: "var(--spring-green-800)" }} />
            <span>
              Sensory-safe, privacy-respecting, and free of aggressive trackers or sudden alarms.
              You remain in control of your settings at all times.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
