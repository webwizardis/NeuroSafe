import React from "react";
import { AccessibilitySettings } from "../types";

interface AccessibilitySettingsBarProps {
  settings: AccessibilitySettings;
  onUpdate: (newSettings: AccessibilitySettings, summaryNote?: string) => void;
}

export const AccessibilitySettingsBar: React.FC<AccessibilitySettingsBarProps> = ({
  settings,
  onUpdate
}) => {
  const toggle = (key: keyof AccessibilitySettings, label: string) => {
    const nextVal = !settings[key];
    const updated: AccessibilitySettings = {
      ...settings,
      [key]: nextVal
    };
    onUpdate(updated, `Toggled ${label} ${nextVal ? "ON" : "OFF"}`);
  };

  return (
    <div
      role="region"
      aria-label="Accessibility quick controls"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center"
      }}
    >
      <button
        type="button"
        id="toggle-low-stim"
        aria-pressed={Boolean(settings.low_stimulation_interface)}
        onClick={() => toggle("low_stimulation_interface", "Low-Stimulation Mode")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 14px",
          borderRadius: "var(--radius-pill)",
          fontSize: "0.86rem",
          fontWeight: 600,
          cursor: "pointer",
          border: settings.low_stimulation_interface
            ? "1px solid var(--spring-green-700)"
            : "1px solid var(--line)",
          background: settings.low_stimulation_interface
            ? "var(--spring-mint-200)"
            : "var(--card)",
          color: settings.low_stimulation_interface
            ? "var(--spring-green-900)"
            : "var(--ink-secondary)",
          transition: "all 0.15s ease"
        }}
      >
        <span>🌿</span>
        <span>Low-Stimulation</span>
        {settings.low_stimulation_interface && <span aria-hidden="true">✓</span>}
      </button>

      <button
        type="button"
        id="toggle-simplify"
        aria-pressed={Boolean(settings.plain_language_mode)}
        onClick={() => toggle("plain_language_mode", "High Legibility Text")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 14px",
          borderRadius: "var(--radius-pill)",
          fontSize: "0.86rem",
          fontWeight: 600,
          cursor: "pointer",
          border: settings.plain_language_mode
            ? "1px solid var(--peach-500)"
            : "1px solid var(--line)",
          background: settings.plain_language_mode
            ? "var(--peach-200)"
            : "var(--card)",
          color: settings.plain_language_mode
            ? "var(--peach-900)"
            : "var(--ink-secondary)",
          transition: "all 0.15s ease"
        }}
      >
        <span>📖</span>
        <span>High Legibility</span>
        {settings.plain_language_mode && <span aria-hidden="true">✓</span>}
      </button>

      <button
        type="button"
        id="toggle-step-by-step"
        aria-pressed={Boolean(settings.step_by_step_tasks)}
        onClick={() => toggle("step_by_step_tasks", "Step-by-Step Pacing")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 14px",
          borderRadius: "var(--radius-pill)",
          fontSize: "0.86rem",
          fontWeight: 600,
          cursor: "pointer",
          border: settings.step_by_step_tasks
            ? "1px solid var(--spring-green-700)"
            : "1px solid var(--line)",
          background: settings.step_by_step_tasks
            ? "var(--spring-mint-200)"
            : "var(--card)",
          color: settings.step_by_step_tasks
            ? "var(--spring-green-900)"
            : "var(--ink-secondary)",
          transition: "all 0.15s ease"
        }}
      >
        <span>🎯</span>
        <span>Step-by-Step Pacing</span>
        {settings.step_by_step_tasks && <span aria-hidden="true">✓</span>}
      </button>

      <button
        type="button"
        id="toggle-read-aloud"
        aria-pressed={Boolean(settings.read_aloud_enabled)}
        onClick={() => toggle("read_aloud_enabled", "Read-Aloud Support")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 14px",
          borderRadius: "var(--radius-pill)",
          fontSize: "0.86rem",
          fontWeight: 600,
          cursor: "pointer",
          border: settings.read_aloud_enabled
            ? "1px solid var(--peach-500)"
            : "1px solid var(--line)",
          background: settings.read_aloud_enabled
            ? "var(--peach-200)"
            : "var(--card)",
          color: settings.read_aloud_enabled
            ? "var(--peach-900)"
            : "var(--ink-secondary)",
          transition: "all 0.15s ease"
        }}
      >
        <span>🔊</span>
        <span>Audio Read-Aloud</span>
        {settings.read_aloud_enabled && <span aria-hidden="true">✓</span>}
      </button>
    </div>
  );
};
