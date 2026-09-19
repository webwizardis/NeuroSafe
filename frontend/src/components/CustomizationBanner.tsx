import React from "react";

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
        background: "linear-gradient(135deg, var(--peach-100) 0%, var(--spring-mint-100) 100%)",
        border: "1px solid var(--peach-300)",
        borderRadius: "var(--radius-lg)",
        padding: "16px 20px",
        marginBottom: "24px",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: 8
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: "1rem"
            }}
          >
            ✨
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: "0.88rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--spring-green-900)"
            }}
          >
            Active Tailored Profile
          </span>
          <span
            style={{
              background: "var(--card)",
              border: "1px solid var(--peach-300)",
              color: "var(--peach-900)",
              padding: "3px 10px",
              borderRadius: "var(--radius-pill)",
              fontSize: "0.8rem",
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
            background: "transparent",
            border: "none",
            color: "var(--spring-green-800)",
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: "pointer",
            textDecoration: "underline",
            padding: 0
          }}
        >
          Adjust Needs & Preferences
        </button>
      </div>

      <p
        style={{
          margin: 0,
          color: "var(--ink)",
          fontSize: "0.94rem",
          lineHeight: 1.55
        }}
      >
        {summary || "NeuroSafe is configured for a low-stimulation, cognitively clear experience."}
      </p>
    </div>
  );
};
