import { useState } from "react";
import { api, normalizeSettings } from "../services/api";
import type { AccessibilitySettings } from "../types";

const problems = [
  ["sensory_overload", "Sensory comfort", "Bright screens, motion, clutter, or sudden distractions feel difficult.", "🌿"],
  ["executive_function", "Starting tasks", "Large tasks are easier when they become small, clear steps.", "🎯"],
  ["reading_processing", "Reading & processing", "Dense text or jargon can be tiring or difficult to process.", "📖"],
  ["social_burnout", "Communication", "Finding the right words can take extra energy.", "💬"],
  ["wayfinding_anxiety", "Wayfinding & travel", "Unfamiliar or busy places can make navigation harder.", "🗺️"],
];

const defaults: AccessibilitySettings = {
  low_stimulation_interface: true,
  plain_language_mode: true,
  step_by_step_tasks: true,
  read_aloud_enabled: true,
};

export function OnboardingPage({
  user,
  onComplete,
}: {
  user: any;
  onComplete: (settings: AccessibilitySettings, problems: string[], summary: string) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }

  async function customize() {
    try {
      setLoading(true);
      setError("");
      const data = await api.profile.customize(selected, description.trim());
      onComplete(normalizeSettings(data.settings, defaults), selected, data.customization_summary || "Your NeuroSafe experience has been personalized.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Personalization failed.");
    } finally {
      setLoading(false);
    }
  }

  function skip() {
    onComplete(defaults, [], "Using calm, accessible NeuroSafe defaults.");
  }

  return (
    <main className="onboarding-page">
      <div className="onboarding-shell">
        <div className="progress-line"><span style={{ width: "70%" }} /></div>
        <span className="eyebrow">Personalization · Step 2 of 2</span>
        <h1>Tell NeuroSafe what would help.</h1>
        <p className="lead">
          Choose anything that sounds useful. There are no right answers, and you can change this later.
        </p>

        <div className="problem-grid">
          {problems.map(([id, title, desc, icon]) => (
            <button
              type="button"
              key={id}
              className={`problem-card ${selected.includes(id) ? "selected" : ""}`}
              onClick={() => toggle(id)}
              aria-pressed={selected.includes(id)}
            >
              <span className="problem-icon">{icon}</span>
              <strong>{title}</strong>
              <span>{desc}</span>
            </button>
          ))}
        </div>

        <label className="field-label">
          Anything else you want NeuroSafe to know?
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="For example: keep instructions short and give me one step at a time."
            rows={4}
          />
        </label>

        <div className="preset-row">
          {["Bright screens bother me", "Break projects into tiny steps", "Read text aloud", "Keep menus simple"].map((text) => (
            <button key={text} type="button" className="chip" onClick={() => setDescription((v) => v ? `${v}. ${text}` : text)}>
              + {text}
            </button>
          ))}
        </div>

        {error && <div className="error-box" role="alert">{error}</div>}

        <div className="onboarding-actions">
          <button className="secondary-button" onClick={skip} disabled={loading}>Use calm defaults</button>
          <button className="primary-button" onClick={customize} disabled={loading}>
            {loading ? "Personalizing…" : "✨ Personalize NeuroSafe"}
          </button>
        </div>
      </div>
    </main>
  );
}
