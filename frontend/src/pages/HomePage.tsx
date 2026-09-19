import type { AccessibilitySettings, User, View } from "../types";
import { QuickActionCard } from "../components/QuickActionCard";
import { SectionCard } from "../components/SectionCard";

export function HomePage({
  user,
  settings,
  summary,
  problems,
  onNavigate,
}: {
  user: User | null;
  settings: AccessibilitySettings;
  summary: string;
  problems: string[];
  onNavigate: (view: View) => void;
}) {
  const priorities: { id: View; title: string; text: string; icon: string }[] = [];
  if (problems.includes("reading_processing")) priorities.push({ id: "read", title: "Read something", text: "Turn a photographed page into readable text.", icon: "📖" });
  if (problems.includes("executive_function")) priorities.push({ id: "tasks", title: "Break something down", text: "Turn a large task into manageable steps.", icon: "🪜" });
  if (problems.includes("social_burnout")) priorities.push({ id: "say", title: "Find the words", text: "Create a supportive message quickly.", icon: "💬" });
  if (problems.includes("wayfinding_anxiety")) priorities.push({ id: "journey", title: "Plan a journey", text: "Explore a route with your preferences in mind.", icon: "🗺️" });

  return (
    <div className="page-content">
      <div className="welcome-row">
        <div>
          <span className="eyebrow">Your NeuroSafe space</span>
          <h1>How can NeuroSafe help today?</h1>
          <p className="lead">Hi {user?.name || "there"} — choose one small thing to start with.</p>
        </div>
        <div className="settings-summary">
          <span>Personalized</span>
          <strong>{settings.low_stimulation_interface ? "Low stimulation" : "Standard"} · {settings.plain_language_mode ? "Plain language" : "Full language"}</strong>
        </div>
      </div>

      <SectionCard eyebrow="Quick Help" title="Start with one action" description="These are designed to get you where you need to go without extra steps.">
        <div className="quick-grid">
          <QuickActionCard icon="📷" title="Read Something" description="Photograph or upload text and make it easier to understand." view="read" onNavigate={onNavigate} />
          <QuickActionCard icon="🧠" title="Explain This" description="Turn complicated text into a clear, shorter explanation." view="explain" onNavigate={onNavigate} />
          <QuickActionCard icon="💬" title="Say It For Me" description="Find simple words when communicating feels hard." view="say" onNavigate={onNavigate} />
          <QuickActionCard icon="🌿" title="Help Me Calm Down" description="Move through a gentle grounding sequence." view="calm" onNavigate={onNavigate} />
        </div>
      </SectionCard>

      <div className="two-column">
        <SectionCard eyebrow="Your focus" title="A little guidance" description={summary}>
          {priorities.length ? (
            <div className="recommendation-list">
              {priorities.slice(0, 3).map((item) => (
                <button className="recommendation" key={item.id} onClick={() => onNavigate(item.id)}>
                  <span>{item.icon}</span>
                  <span><strong>{item.title}</strong><small>{item.text}</small></span>
                  <b>→</b>
                </button>
              ))}
            </div>
          ) : (
            <div className="soft-note">Your workspace is ready. Explore any tool from the sidebar whenever you need it.</div>
          )}
        </SectionCard>

        <SectionCard eyebrow="Your settings" title="Comfort controls">
          <div className="mini-setting-list">
            <span><i className={settings.low_stimulation_interface ? "on" : ""} /> Low stimulation</span>
            <span><i className={settings.plain_language_mode ? "on" : ""} /> Plain language</span>
            <span><i className={settings.step_by_step_tasks ? "on" : ""} /> Step-by-step</span>
            <span><i className={settings.read_aloud_enabled ? "on" : ""} /> Read aloud</span>
          </div>
          <button className="secondary-button full-width" onClick={() => onNavigate("settings")}>Adjust accessibility settings</button>
        </SectionCard>
      </div>
    </div>
  );
}
