import React from "react";
import { Sparkles } from "lucide-react";

interface CustomizationBannerProps {
  summary: string;
  problems: string[];
  onReCustomize: () => void;
}

const PROBLEM_LABELS: Record<string, string> = {
  sensory_overload: "Sensory Calm",
  executive_function: "Executive Focus",
  reading_processing: "Reading Clarity",
  social_burnout: "Social Shield",
  wayfinding_anxiety: "Calm Travel"
};

export const CustomizationBanner: React.FC<CustomizationBannerProps> = ({
  summary,
  problems,
  onReCustomize
}) => {
  const activeFocus =
    problems && problems.length > 0
      ? problems.map((p) => PROBLEM_LABELS[p] || p).join(" • ")
      : "General Affirming Accessibility";

  return (
    <div
      role="status"
      style={{
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
        padding: "16px 20px",
        marginBottom: "24px",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: 10
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "var(--radius-sm)",
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#059669"
            }}
          >
            <Sparkles size={16} />
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: "0.82rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#065f46"
            }}
          >
            Active Tailored Profile
          </span>
          <span
            style={{
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#047857",
              padding: "3px 10px",
              borderRadius: "var(--radius-pill)",
              fontSize: "0.78rem",
              fontWeight: 600
            }}
          >
            {activeFocus}
          </span>
        </div>

        <button
          type="button"
          onClick={onReCustomize}
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#15803d",
            fontWeight: 600,
            fontSize: "0.82rem",
            cursor: "pointer",
            padding: "5px 12px",
            borderRadius: "var(--radius-pill)",
            transition: "all 0.15s ease"
          }}
        >
          Adjust Needs & Preferences
        </button>
      </div>

      <p
        style={{
          margin: 0,
          color: "var(--ink)",
          fontSize: "0.92rem",
          lineHeight: 1.55
        }}
      >
        {summary || "NeuroSafe is configured for a low-stimulation, cognitively clear experience."}
      </p>
    </div>
  );
};
