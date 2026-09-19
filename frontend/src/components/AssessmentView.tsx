import React, { useState } from "react";
import { api } from "../services/api";
import { User, AccessibilitySettings } from "../types";

interface AssessmentViewProps {
  user: User | null;
  onCompleted: (settings: AccessibilitySettings, summary: string, problems: string[]) => void;
  onToast: (message: string, type?: "info" | "success" | "error") => void;
}

interface ProblemItem {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

const PROBLEMS: ProblemItem[] = [
  {
    id: "sensory_overload",
    icon: "🌿",
    title: "Sensory Overload & Sensitivity",
    desc: "Sensitive to bright screens, rapid motion, clutter, or loud noises. Need low-stimulation colors and no sudden distractions."
  },
  {
    id: "executive_function",
    icon: "🎯",
    title: "Executive Function & Starting Tasks",
    desc: "ADHD, task initiation friction, or paralysis. Need large projects broken down into tiny, bite-sized micro-steps."
  },
  {
    id: "reading_processing",
    icon: "📖",
    title: "Reading & Text Processing Fatigue",
    desc: "Dyslexia, dense text exhaustion, or jargon confusion. Need plain-language summaries and audio read-aloud playback."
  },
  {
    id: "social_burnout",
    icon: "💬",
    title: "Social Overwhelm & Communication",
    desc: "Autistic burnout or anxiety drafting difficult emails, saying 'no', requesting accommodations, or finding kind words."
  },
  {
    id: "wayfinding_anxiety",
    icon: "🗺️",
    title: "Wayfinding & Travel Anxiety",
    desc: "Overwhelmed in noisy transit, crowded corridors, or unfamiliar streets. Need calm routes avoiding sensory hotspots."
  }
];

const PRESETS = [
  "Bright screens hurt my eyes",
  "Break projects into tiny chunks",
  "Read text aloud to me",
  "Help drafting kind boundaries",
  "Complex menus confuse me"
];

export const AssessmentView: React.FC<AssessmentViewProps> = ({
  user,
  onCompleted,
  onToast
}) => {
  const [selectedProblems, setSelectedProblems] = useState<string[]>(
    user?.problem_history || ["sensory_overload", "executive_function"]
  );
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleProblem = (id: string) => {
    setSelectedProblems((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleChipClick = (chip: string) => {
    setDescription((prev) => {
      if (prev.includes(chip)) return prev;
      return prev ? `${prev}. ${chip}` : chip;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.customizeProfile(selectedProblems, description);
      onToast("✨ AI tailored your NeuroSafe experience!", "success");
      onCompleted(res.settings, res.customization_summary, selectedProblems);
    } catch (err: any) {
      onToast(err.message || "Failed to customize profile.", "error");
      // Fallback
      handleSkip();
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onCompleted(
      {
        low_stimulation_interface: true,
        plain_language_mode: true,
        step_by_step_tasks: true,
        read_aloud_enabled: true
      },
      "Using standard sensory-safe and cognitive accessibility profile.",
      selectedProblems
    );
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "Friend";

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 16px",
        background: "var(--paper)"
      }}
    >
      <div className="container" style={{ maxWidth: 840 }}>
        {/* Step Badge & Header */}
        <div style={{ marginBottom: 28 }}>
          <span
            style={{
              display: "inline-block",
              background: "var(--peach-100)",
              color: "var(--peach-900)",
              borderRadius: "var(--radius-pill)",
              padding: "5px 14px",
              fontSize: "0.8rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 10
            }}
          >
            Personalization Assessment
          </span>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2.4rem",
              color: "var(--spring-green-900)",
              margin: "0 0 10px 0"
            }}
          >
            Welcome, {displayName}! Tell us what you are experiencing
          </h1>
          <p
            style={{
              color: "var(--ink-secondary)",
              fontSize: "1.05rem",
              lineHeight: 1.6,
              margin: 0
            }}
          >
            Select the difficulties or neurodivergent traits you are navigating today. NeuroSafe's
            AI will analyze your answers and dynamically tailor visual pacing, tools, and support
            features.
          </p>
        </div>

        {/* Assessment Card */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-lg)",
            padding: "32px",
            boxShadow: "var(--shadow-sm)"
          }}
        >
          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              margin: "0 0 6px 0",
              color: "var(--ink)"
            }}
          >
            What challenges can we help you with?
          </h2>
          <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", margin: "0 0 24px 0" }}>
            Choose as many as apply to you. You can change these anytime in settings.
          </p>

          {/* Problem selection grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 14,
              marginBottom: 28
            }}
          >
            {PROBLEMS.map((prob) => {
              const isSelected = selectedProblems.includes(prob.id);
              return (
                <div
                  key={prob.id}
                  onClick={() => toggleProblem(prob.id)}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      toggleProblem(prob.id);
                    }
                  }}
                  style={{
                    cursor: "pointer",
                    padding: "16px 18px",
                    borderRadius: "var(--radius-md)",
                    border: isSelected
                      ? "2px solid var(--spring-green-700)"
                      : "1px solid var(--line)",
                    background: isSelected ? "var(--spring-mint-100)" : "var(--card)",
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    transition: "all 0.15s ease",
                    boxShadow: isSelected ? "var(--shadow-sm)" : "none"
                  }}
                >
                  <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>{prob.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 4
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "0.96rem",
                          color: isSelected ? "var(--spring-green-900)" : "var(--ink)"
                        }}
                      >
                        {prob.title}
                      </strong>
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          border: isSelected
                            ? "none"
                            : "1.5px solid var(--line)",
                          background: isSelected ? "var(--spring-green-700)" : "#fff",
                          color: "#fff",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.8rem",
                          fontWeight: 700
                        }}
                      >
                        {isSelected ? "✓" : ""}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--ink-secondary)",
                        lineHeight: 1.45,
                        margin: 0
                      }}
                    >
                      {prob.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Description Box */}
          <div style={{ marginBottom: 28 }}>
            <label
              htmlFor="assessment-desc"
              style={{
                display: "block",
                fontWeight: 600,
                fontSize: "0.92rem",
                color: "var(--ink)",
                marginBottom: 6
              }}
            >
              Or describe your specific needs in your own words:
            </label>
            <textarea
              id="assessment-desc"
              rows={3}
              placeholder="e.g. I get eye strain from bright white canvases, and long emails overwhelm me. Please keep things calm and break things into step-by-step checklists."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--line)",
                background: "var(--card)",
                color: "var(--ink)",
                fontSize: "0.95rem",
                lineHeight: 1.5,
                resize: "vertical",
                minHeight: 80
              }}
            />

            {/* Suggestion Chips */}
            <div
              style={{
                marginTop: 10,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap"
              }}
            >
              <span style={{ fontSize: "0.82rem", color: "var(--ink-secondary)", fontWeight: 600 }}>
                Quick suggestions:
              </span>
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleChipClick(preset)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "var(--radius-pill)",
                    background: "var(--paper-peach)",
                    border: "1px solid var(--peach-200)",
                    color: "var(--peach-900)",
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    cursor: "pointer"
                  }}
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
              paddingTop: 18,
              borderTop: "1px solid var(--line)"
            }}
          >
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: "13px 24px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: "var(--spring-green-700)",
                color: "#ffffff",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "var(--shadow-sm)",
                opacity: loading ? 0.7 : 1
              }}
            >
              <span>✨</span>
              <span>{loading ? "AI is Personalizing App…" : "Have AI Customize My App"}</span>
            </button>

            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              style={{
                padding: "12px 18px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--line)",
                background: "transparent",
                color: "var(--ink-secondary)",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Use Standard Sensory-Safe Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
