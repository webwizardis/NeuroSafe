import { FormEvent, useState } from "react";
import { api, setToken } from "../services/api";
import type { User } from "../types";

export function AuthPage({ onAuth }: { onAuth: (user: User) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter your email or username and password.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    try {
      setLoading(true);
      const data =
        mode === "login"
          ? await api.auth.login(email.trim(), password)
          : await api.auth.register(name.trim(), email.trim(), password);
      setToken(data.token, remember);
      onAuth(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function demo() {
    setError("");
    try {
      setLoading(true);
      const data = await api.auth.demo();
      setToken(data.token, remember);
      onAuth(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-decoration decoration-one" />
      <div className="auth-decoration decoration-two" />

      <section className="auth-hero">
        <div className="brand-lockup">
          <div className="logo-orb large">N</div>
          <span>NeuroSafe</span>
        </div>
        <span className="eyebrow">A calmer way to get things done</span>
        <h1>Support that follows your lead.</h1>
        <p>
          A warm, accessibility-first companion for understanding information,
          communicating, focusing, travelling, and getting through everyday tasks.
        </p>
        <div className="hero-points">
          <span>🌿 Low stimulation</span>
          <span>✦ AI-personalized</span>
          <span>♡ You stay in control</span>
        </div>
      </section>

      <section className="auth-card panel">
        <div className="auth-tabs" role="tablist">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Sign in</button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Create account</button>
        </div>

        <div className="auth-heading">
          <h2>{mode === "login" ? "Welcome back" : "Create your safe space"}</h2>
          <p className="muted">
            {mode === "login" ? "Pick up where you left off." : "You can change your preferences whenever you want."}
          </p>
        </div>

        <form onSubmit={submit} className="stack-form">
          {mode === "register" && (
            <label>
              Your name
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex" autoComplete="name" />
            </label>
          )}
          <label>
            Email or username
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="username" />
          </label>
          <label>
            Password / PIN
            <span className="input-with-action">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <button type="button" className="input-action" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </span>
          </label>

          <label className="check-row">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me on this browser
          </label>

          {error && <div className="error-box" role="alert">{error}</div>}

          <button className="primary-button" disabled={loading}>
            {loading ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}
          </button>

          <div className="or-divider"><span>or</span></div>

          <button type="button" className="demo-button" onClick={demo} disabled={loading}>
            ⚡ Instant Safe Demo
          </button>
        </form>

        <p className="tiny-note">🔒 NeuroSafe is designed to keep you in control of your experience.</p>
      </section>
    </main>
  );
}
