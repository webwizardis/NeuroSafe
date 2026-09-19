import type { AccessibilitySettings } from "../types";

export function SettingsPage({
  settings,
  setSettings,
}: {
  settings: AccessibilitySettings;
  setSettings: (settings: AccessibilitySettings) => void;
}) {
  const controls: Array<[keyof AccessibilitySettings, string, string]> = [
    ["low_stimulation_interface", "Low stimulation", "Reduce visual movement and density."],
    ["plain_language_mode", "Plain language", "Prefer shorter, clearer labels and explanations."],
    ["step_by_step_tasks", "Step-by-step", "Reveal tasks progressively and make one action clear at a time."],
    ["read_aloud_enabled", "Read aloud", "Keep speech controls prominent across the app."],
  ];

  return (
    <div className="page-content">
      <div className="page-heading">
        <span className="eyebrow">Settings</span>
        <h1>Accessibility & comfort</h1>
        <p className="lead">Make NeuroSafe feel more like your space. These controls update the interface immediately.</p>
      </div>

      <section className="panel settings-list">
        {controls.map(([key, title, description]) => (
          <label className="setting-row" key={key}>
            <span>
              <strong>{title}</strong>
              <small>{description}</small>
            </span>
            <input
              className="switch-input"
              type="checkbox"
              checked={settings[key]}
              onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
            />
          </label>
        ))}
      </section>

      <section className="panel">
        <span className="section-eyebrow">Interface behavior</span>
        <h2>What changes?</h2>
        <div className="behavior-grid">
          <div><strong>Low stimulation</strong><span>Fewer animations, softer visual density.</span></div>
          <div><strong>Plain language</strong><span>Shorter labels and easier scanning.</span></div>
          <div><strong>Step-by-step</strong><span>Progressive disclosure for complex tasks.</span></div>
          <div><strong>Read aloud</strong><span>Voice actions stay easy to find.</span></div>
        </div>
      </section>
    </div>
  );
}
