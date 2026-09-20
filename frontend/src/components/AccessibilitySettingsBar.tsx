import React, { useState } from "react";
import { Eye, FileText, ListOrdered, Volume2, Sliders, Check, ChevronUp, ChevronDown, Sun, Moon, Sparkles, Type, Palette } from "lucide-react";
import { AccessibilitySettings } from "../types";
import { speak } from "../utils/speech";
import { playTogglePop } from "../utils/audioChime";

interface AccessibilitySettingsBarProps {
  settings: AccessibilitySettings;
  onUpdate: (newSettings: AccessibilitySettings, summaryNote?: string) => void;
}

export const AccessibilitySettingsBar: React.FC<AccessibilitySettingsBarProps> = ({
  settings,
  onUpdate
}) => {
  const [showEhvTray, setShowEhvTray] = useState(false);

  // Compute active visual brightness/contrast values
  const currentBrightness = typeof settings.brightness === "number"
    ? settings.brightness
    : (settings.low_stimulation_interface ? 85 : 100);

  const currentContrast = typeof settings.contrast === "number"
    ? settings.contrast
    : (settings.low_stimulation_interface ? 92 : 100);

  const currentWarmth = settings.warmth || "natural";
  const currentFontScale = settings.font_scale || "standard";
  const reducedMotion = Boolean(settings.reduced_motion);
  const audioChimes = settings.audio_chimes !== false;

  const updateSetting = (key: keyof AccessibilitySettings, val: any, label?: string) => {
    playTogglePop(Boolean(val));
    const nextSettings: AccessibilitySettings = {
      ...settings,
      [key]: val
    };

    // If changing brightness directly, apply to CSS variable immediately
    if (key === "brightness") {
      document.documentElement.style.setProperty("--app-brightness", `${val}%`);
    }
    if (key === "contrast") {
      document.documentElement.style.setProperty("--app-contrast", `${val}%`);
    }

    onUpdate(nextSettings, label ? `${label}: ${val}` : undefined);
  };

  const toggleLowStimulation = () => {
    const nextVal = !settings.low_stimulation_interface;
    playTogglePop(nextVal);
    const targetBrightness = nextVal ? 85 : 100;
    const targetContrast = nextVal ? 92 : 100;

    // Apply immediate CSS properties
    document.documentElement.style.setProperty("--app-brightness", `${targetBrightness}%`);
    document.documentElement.style.setProperty("--app-contrast", `${targetContrast}%`);

    const updated: AccessibilitySettings = {
      ...settings,
      low_stimulation_interface: nextVal,
      brightness: targetBrightness,
      contrast: targetContrast
    };

    if (settings.read_aloud_enabled) {
      speak("Low Stimulation");
    }

    onUpdate(
      updated,
      nextVal
        ? "Low-Stimulation enabled: Brightness dimmed to 85%, glare removed."
        : "Standard visual mode restored."
    );
  };

  const toggleHighLegibility = () => {
    const nextVal = !settings.plain_language_mode;
    playTogglePop(nextVal);
    const updated: AccessibilitySettings = {
      ...settings,
      plain_language_mode: nextVal,
      simplify_text: nextVal,
      font_scale: nextVal ? "large" : "standard"
    };

    if (settings.read_aloud_enabled) {
      speak("High Legibility");
    }

    onUpdate(
      updated,
      nextVal ? "High-legibility plain language mode enabled." : "Standard text restored."
    );
  };

  const toggleStepByStep = () => {
    const nextVal = !settings.step_by_step_tasks;
    playTogglePop(nextVal);
    const updated: AccessibilitySettings = {
      ...settings,
      step_by_step_tasks: nextVal,
      step_by_step: nextVal
    };

    if (settings.read_aloud_enabled) {
      speak("Step-by-Step Pacing");
    }

    onUpdate(
      updated,
      nextVal ? "Step-by-Step single task pacing enabled." : "All steps view enabled."
    );
  };

  const toggleReadAloud = () => {
    const nextVal = !settings.read_aloud_enabled;
    playTogglePop(nextVal);
    const updated: AccessibilitySettings = {
      ...settings,
      read_aloud_enabled: nextVal,
      read_aloud: nextVal
    };
    if (nextVal) {
      speak("Audio Read Aloud. Press any button to hear it spoken aloud.");
    } else {
      speak("Audio Read Aloud disabled.");
    }
    onUpdate(
      updated,
      nextVal ? "Audio read-aloud enabled." : "Audio read-aloud muted."
    );
  };

  const setBrightnessDirect = (newVal: number) => {
    document.documentElement.style.setProperty("--app-brightness", `${newVal}%`);
    updateSetting("brightness", newVal, `Brightness set to ${newVal}%`);
  };

  const setContrastDirect = (newVal: number) => {
    document.documentElement.style.setProperty("--app-contrast", `${newVal}%`);
    updateSetting("contrast", newVal, `Contrast set to ${newVal}%`);
  };

  const resetToDefaults = () => {
    document.documentElement.style.setProperty("--app-brightness", "100%");
    document.documentElement.style.setProperty("--app-contrast", "100%");
    const resetSettings: AccessibilitySettings = {
      ...settings,
      low_stimulation_interface: false,
      brightness: 100,
      contrast: 100,
      warmth: "natural",
      font_scale: "standard",
      reduced_motion: false
    };
    onUpdate(resetSettings, "Reset visual accommodations to standard.");
  };

  return (
    <div
      role="region"
      aria-label="EHV Accessibility and Customization Controls"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginBottom: 16
      }}
    >
      {/* Top Quick Buttons Row */}
      <div
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
          data-speech="Low Stimulation"
          aria-pressed={Boolean(settings.low_stimulation_interface)}
          onClick={toggleLowStimulation}
          title="Toggle low stimulation and comfortable screen dimming"
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
          <Eye size={16} />
          <span>Low-Stimulation</span>
          <span style={{ fontSize: "0.78rem", opacity: 0.85 }}>({currentBrightness}%)</span>
          {settings.low_stimulation_interface && <Check size={14} aria-hidden="true" />}
        </button>

        <button
          type="button"
          id="toggle-simplify"
          data-speech="High Legibility"
          aria-pressed={Boolean(settings.plain_language_mode)}
          onClick={toggleHighLegibility}
          title="Toggle high legibility enlarged clear typography"
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
          <FileText size={16} />
          <span>High Legibility</span>
          {settings.plain_language_mode && <Check size={14} aria-hidden="true" />}
        </button>

        <button
          type="button"
          id="toggle-step-by-step"
          data-speech="Step-by-Step Pacing"
          aria-pressed={Boolean(settings.step_by_step_tasks)}
          onClick={toggleStepByStep}
          title="Toggle single step focus for task breakdowns"
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
          <ListOrdered size={16} />
          <span>Step-by-Step Pacing</span>
          {settings.step_by_step_tasks && <Check size={14} aria-hidden="true" />}
        </button>

        <button
          type="button"
          id="toggle-read-aloud"
          data-speech="Audio Read Aloud"
          aria-pressed={Boolean(settings.read_aloud_enabled)}
          onClick={toggleReadAloud}
          title="Toggle automatic audio read-aloud speech synthesis"
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
          <Volume2 size={16} />
          <span>Audio Read-Aloud</span>
          {settings.read_aloud_enabled && <Check size={14} aria-hidden="true" />}
        </button>

        {/* EHV Customization Drawer Toggle Button */}
        <button
          type="button"
          id="toggle-ehv-customization"
          data-speech="EHV Customization"
          aria-expanded={showEhvTray}
          onClick={() => setShowEhvTray((prev) => !prev)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: "var(--radius-pill)",
            fontSize: "0.86rem",
            fontWeight: 700,
            cursor: "pointer",
            border: showEhvTray ? "1px solid var(--spring-green-700)" : "1px dashed var(--line)",
            background: showEhvTray ? "var(--spring-mint-100)" : "var(--card)",
            color: showEhvTray ? "var(--spring-green-900)" : "var(--ink)",
            marginLeft: "auto"
          }}
        >
          <Sliders size={16} />
          <span>Sensory & Visual Controls</span>
          {showEhvTray ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded EHV (Environmental, Hyper-reactivity, Visual) Customization Tray */}
      {showEhvTray && (
        <div
          id="ehv-customization-panel"
          style={{
            background: "var(--card)",
            border: "1px solid var(--spring-green-700)",
            borderRadius: "var(--radius-md)",
            padding: "16px 20px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: 16
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sliders size={18} color="var(--spring-green-700)" />
              <strong style={{ fontSize: "0.98rem", color: "var(--ink)" }}>
                Sensory & Environmental Controls
              </strong>
            </div>
            <button
              type="button"
              onClick={resetToDefaults}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "0.8rem",
                color: "var(--ink-secondary)",
                textDecoration: "underline",
                cursor: "pointer"
              }}
            >
              Reset to Defaults
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20
            }}
          >
            {/* 1. Screen Brightness Slider */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label
                  htmlFor="ehv-brightness-slider"
                  style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)" }}
                >
                  Screen Brightness: <span style={{ color: "var(--spring-green-800)" }}>{currentBrightness}%</span>
                </label>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => setBrightnessDirect(70)}
                    style={{
                      padding: "2px 8px",
                      borderRadius: "var(--radius-pill)",
                      border: "1px solid var(--line)",
                      background: currentBrightness === 70 ? "var(--spring-mint-200)" : "var(--paper)",
                      fontSize: "0.75rem",
                      cursor: "pointer"
                    }}
                  >
                    Dim 70%
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrightnessDirect(85)}
                    style={{
                      padding: "2px 8px",
                      borderRadius: "var(--radius-pill)",
                      border: "1px solid var(--line)",
                      background: currentBrightness === 85 ? "var(--spring-mint-200)" : "var(--paper)",
                      fontSize: "0.75rem",
                      cursor: "pointer"
                    }}
                  >
                    Calm 85%
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrightnessDirect(100)}
                    style={{
                      padding: "2px 8px",
                      borderRadius: "var(--radius-pill)",
                      border: "1px solid var(--line)",
                      background: currentBrightness === 100 ? "var(--spring-mint-200)" : "var(--paper)",
                      fontSize: "0.75rem",
                      cursor: "pointer"
                    }}
                  >
                    Full 100%
                  </button>
                </div>
              </div>

              <input
                id="ehv-brightness-slider"
                type="range"
                min="50"
                max="110"
                step="1"
                value={currentBrightness}
                onChange={(e) => setBrightnessDirect(parseInt(e.target.value, 10))}
                onInput={(e: any) => {
                  const val = parseInt(e.target.value, 10);
                  document.documentElement.style.setProperty("--app-brightness", `${val}%`);
                }}
                style={{
                  width: "100%",
                  accentColor: "var(--spring-green-700)",
                  cursor: "pointer"
                }}
              />
              <span style={{ fontSize: "0.76rem", color: "var(--ink-secondary)" }}>
                Lowers harsh white glare without distorting colors or losing readability.
              </span>
            </div>

            {/* 2. Visual Contrast Slider */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label
                  htmlFor="ehv-contrast-slider"
                  style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)" }}
                >
                  Contrast Level: <span style={{ color: "var(--spring-green-800)" }}>{currentContrast}%</span>
                </label>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => setContrastDirect(88)}
                    style={{
                      padding: "2px 8px",
                      borderRadius: "var(--radius-pill)",
                      border: "1px solid var(--line)",
                      background: currentContrast === 88 ? "var(--spring-mint-200)" : "var(--paper)",
                      fontSize: "0.75rem",
                      cursor: "pointer"
                    }}
                  >
                    Soft (88%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setContrastDirect(100)}
                    style={{
                      padding: "2px 8px",
                      borderRadius: "var(--radius-pill)",
                      border: "1px solid var(--line)",
                      background: currentContrast === 100 ? "var(--spring-mint-200)" : "var(--paper)",
                      fontSize: "0.75rem",
                      cursor: "pointer"
                    }}
                  >
                    Standard
                  </button>
                </div>
              </div>

              <input
                id="ehv-contrast-slider"
                type="range"
                min="70"
                max="125"
                step="1"
                value={currentContrast}
                onChange={(e) => setContrastDirect(parseInt(e.target.value, 10))}
                onInput={(e: any) => {
                  const val = parseInt(e.target.value, 10);
                  document.documentElement.style.setProperty("--app-contrast", `${val}%`);
                }}
                style={{
                  width: "100%",
                  accentColor: "var(--spring-green-700)",
                  cursor: "pointer"
                }}
              />
              <span style={{ fontSize: "0.76rem", color: "var(--ink-secondary)" }}>
                Softens harsh black-on-white edges to reduce sensory eye strain.
              </span>
            </div>

            {/* 3. Blue Light Warmth / Tint */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)" }}>
                Warmth & Blue-Light Filter:
              </span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => updateSetting("warmth", "natural", "Natural color temperature")}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "var(--radius-pill)",
                    border: currentWarmth === "natural" ? "1px solid var(--spring-green-700)" : "1px solid var(--line)",
                    background: currentWarmth === "natural" ? "var(--spring-mint-200)" : "var(--paper)",
                    color: currentWarmth === "natural" ? "var(--spring-green-900)" : "var(--ink)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Natural
                </button>
                <button
                  type="button"
                  onClick={() => updateSetting("warmth", "amber", "Amber warm blue-light filter")}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "var(--radius-pill)",
                    border: currentWarmth === "amber" ? "1px solid var(--peach-500)" : "1px solid var(--line)",
                    background: currentWarmth === "amber" ? "var(--peach-200)" : "var(--paper)",
                    color: currentWarmth === "amber" ? "var(--peach-900)" : "var(--ink)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Warm Amber
                </button>
                <button
                  type="button"
                  onClick={() => updateSetting("warmth", "mint", "Soft sage mint filter")}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "var(--radius-pill)",
                    border: currentWarmth === "mint" ? "1px solid var(--spring-green-700)" : "1px solid var(--line)",
                    background: currentWarmth === "mint" ? "var(--spring-mint-200)" : "var(--paper)",
                    color: currentWarmth === "mint" ? "var(--spring-green-900)" : "var(--ink)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Soft Sage Mint
                </button>
              </div>
            </div>

            {/* 4. Text & Font Scaling */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)" }}>
                Typography & Font Scale:
              </span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => updateSetting("font_scale", "standard", "Standard text scale")}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "var(--radius-pill)",
                    border: currentFontScale === "standard" ? "1px solid var(--spring-green-700)" : "1px solid var(--line)",
                    background: currentFontScale === "standard" ? "var(--spring-mint-200)" : "var(--paper)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Standard (16px)
                </button>
                <button
                  type="button"
                  onClick={() => updateSetting("font_scale", "large", "Large text scale")}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "var(--radius-pill)",
                    border: currentFontScale === "large" ? "1px solid var(--spring-green-700)" : "1px solid var(--line)",
                    background: currentFontScale === "large" ? "var(--spring-mint-200)" : "var(--paper)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Large (18px)
                </button>
                <button
                  type="button"
                  onClick={() => updateSetting("font_scale", "xlarge", "Extra Large text scale")}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "var(--radius-pill)",
                    border: currentFontScale === "xlarge" ? "1px solid var(--spring-green-700)" : "1px solid var(--line)",
                    background: currentFontScale === "xlarge" ? "var(--spring-mint-200)" : "var(--paper)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Extra Large (20px)
                </button>
              </div>
            </div>

            {/* 5. Motion and Auditory feedback */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)" }}>
                Sensory Dynamics:
              </span>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => updateSetting("reduced_motion", e.target.checked, "Reduced motion")}
                    style={{ accentColor: "var(--spring-green-700)" }}
                  />
                  <span>Suppress Animations (Reduced Motion)</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={audioChimes}
                    onChange={(e) => updateSetting("audio_chimes", e.target.checked, "Auditory reward chimes")}
                    style={{ accentColor: "var(--spring-green-700)" }}
                  />
                  <span>Tactile & Auditory Chimes</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
