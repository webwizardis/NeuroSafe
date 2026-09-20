import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { speak } from "../utils/speech";
import { playRewardChime } from "../utils/audioChime";

interface TaskBreakdownProps {
  onToast: (message: string, type?: "info" | "success" | "error") => void;
  readAloudDefault?: boolean;
  stepByStepMode?: boolean;
}

const PRESET_TASKS = [
  "Clean kitchen counter",
  "Clean and organize my desk",
  "Reply to an overwhelming email",
  "Study for upcoming exam",
  "Pack luggage for trip",
  "Schedule doctor appointment"
];

interface MicroStep {
  text: string;
  done: boolean;
}

export const TaskBreakdown: React.FC<TaskBreakdownProps> = ({
  onToast,
  readAloudDefault,
  stepByStepMode = false
}) => {
  const [taskInput, setTaskInput] = useState("");
  const [energyLevel, setEnergyLevel] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [rawText, setRawText] = useState<string | null>(null);
  const [steps, setSteps] = useState<MicroStep[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [focusModeOverride, setFocusModeOverride] = useState<boolean | null>(null);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [trophies, setTrophies] = useState<number>(() => {
    const saved = localStorage.getItem("neurosafe_executive_trophies");
    return saved ? parseInt(saved, 10) : 2;
  });

  const isStepFocus = focusModeOverride !== null ? focusModeOverride : stepByStepMode;

  const handleBreakdown = async () => {
    if (!taskInput.trim()) {
      onToast("Please describe the task you want to break down.", "info");
      return;
    }

    setLoading(true);
    setRewardClaimed(false);
    setActiveStepIndex(0);
    try {
      const data = await api.breakdownTask(taskInput.trim(), energyLevel);
      setRawText(data.text);

      // Parse bullet points or numbered lines into interactive checklist
      const lines = data.text
        .split("\n")
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0 && /^[0-9]+[.)]|^-|^•|^\*/.test(l));

      if (lines.length > 0) {
        setSteps(
          lines.map((line: string) => ({
            text: line.replace(/^[0-9]+[.)]\s*|^[-•*]\s*/, ""),
            done: false
          }))
        );
      } else {
        setSteps([
          { text: data.text, done: false }
        ]);
      }

      onToast("Task customized into bite-sized micro steps!", "success");
      if (readAloudDefault && data.text) {
        speak(data.text);
      }
    } catch (err: any) {
      onToast(err.message || "Failed to break down task.", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (index: number) => {
    setSteps((prev) => {
      const next = [...prev];
      next[index].done = !next[index].done;
      return next;
    });
  };

  const completedCount = steps.filter((s) => s.done).length;
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  // Trigger reward when all steps completed
  useEffect(() => {
    if (steps.length > 0 && completedCount === steps.length && !rewardClaimed) {
      setRewardClaimed(true);
      const newTrophies = trophies + 1;
      setTrophies(newTrophies);
      localStorage.setItem("neurosafe_executive_trophies", String(newTrophies));
      playRewardChime();
      onToast("🏆 Executive Victory! Task completed and reward unlocked!", "success");
    }
  }, [completedCount, steps.length, rewardClaimed]);

  const handleClaimVictory = () => {
    setSteps((prev) => prev.map((s) => ({ ...s, done: true })));
    if (!rewardClaimed) {
      setRewardClaimed(true);
      const newTrophies = trophies + 1;
      setTrophies(newTrophies);
      localStorage.setItem("neurosafe_executive_trophies", String(newTrophies));
      playRewardChime();
      onToast("🏆 Executive Victory claimed!", "success");
    }
  };

  const handleSpeak = () => {
    if (!rawText) return;
    speak(rawText);
    onToast("🔊 Reading task steps aloud…", "info");
  };

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid #fde68a",
        borderTop: "4px solid #f59e0b",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        boxShadow: "var(--shadow-sm)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.4rem" }}>🎯</span>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#b45309" }}>
            Executive Task Breakdown
          </h2>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#fef3c7",
            padding: "4px 12px",
            borderRadius: "var(--radius-pill)",
            border: "1px solid #fde68a",
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "#92400e"
          }}
        >
          <span>🏆</span>
          <span>{trophies} Executive Trophies</span>
        </div>
      </div>

      <p style={{ margin: "0 0 16px 0", fontSize: "0.88rem", color: "var(--ink-secondary)" }}>
        Overcome ADHD friction or task paralysis by turning heavy obligations into gentle, single-action steps.
      </p>

      {/* Preset Chips */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
          flexWrap: "wrap"
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "var(--ink-secondary)", fontWeight: 600 }}>
          Quick ideas:
        </span>
        {PRESET_TASKS.map((task) => (
          <button
            key={task}
            type="button"
            onClick={() => setTaskInput(task)}
            style={{
              padding: "4px 10px",
              borderRadius: "var(--radius-pill)",
              background: "var(--paper-peach)",
              border: "1px solid var(--peach-200)",
              color: "var(--peach-900)",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            {task}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
        <input
          type="text"
          placeholder="e.g. Schedule annual car inspection or submit my expense report"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          style={{
            width: "100%",
            padding: "11px 14px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--line)",
            background: "var(--paper)",
            color: "var(--ink)",
            fontSize: "0.95rem"
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.86rem", color: "var(--ink-secondary)" }}>Current Energy:</span>
            {(["low", "medium", "high"] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setEnergyLevel(lvl)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "var(--radius-pill)",
                  border: energyLevel === lvl ? "1px solid var(--spring-green-700)" : "1px solid var(--line)",
                  background: energyLevel === lvl ? "var(--spring-mint-200)" : "var(--card)",
                  color: energyLevel === lvl ? "var(--spring-green-900)" : "var(--ink-secondary)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "capitalize"
                }}
              >
                {lvl === "low" ? "🌱 Low Spoon" : lvl === "medium" ? "☀️ Medium" : "⚡ High"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleBreakdown}
            disabled={loading}
            style={{
              padding: "10px 18px",
              borderRadius: "var(--radius-md)",
              background: "#d97706",
              color: "#ffffff",
              border: "none",
              fontWeight: 600,
              fontSize: "0.92rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 2px 6px rgba(217, 119, 6, 0.25)"
            }}
          >
            <span>🎯</span>
            <span>{loading ? "Breaking down…" : "Break Down Task"}</span>
          </button>
        </div>
      </div>

      {/* Interactive Micro-Steps Checklist */}
      {steps.length > 0 && (
        <div
          style={{
            marginTop: 18,
            padding: "16px",
            background: "var(--paper)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-md)"
          }}
        >
          {/* Progress Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              flexWrap: "wrap",
              gap: 8
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <strong style={{ fontSize: "0.92rem", color: "var(--spring-green-900)" }}>
                Micro-Checklist ({completedCount}/{steps.length} done • {progressPercent}%)
              </strong>
              <button
                type="button"
                onClick={() => setFocusModeOverride(!isStepFocus)}
                style={{
                  padding: "3px 8px",
                  borderRadius: "var(--radius-pill)",
                  background: isStepFocus ? "var(--spring-mint-200)" : "var(--card)",
                  border: "1px solid var(--line)",
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  color: "var(--ink)",
                  cursor: "pointer"
                }}
              >
                {isStepFocus ? "🎯 1-Step Focus ON" : "📋 All Steps View"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={handleSpeak}
                style={{
                  padding: "4px 10px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--peach-200)",
                  color: "var(--peach-900)",
                  border: "none",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                🔊 Read Steps
              </button>
              <button
                type="button"
                onClick={handleClaimVictory}
                style={{
                  padding: "4px 12px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--spring-green-700)",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                🏆 Mark Task Done
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div
            style={{
              height: 8,
              background: "var(--line)",
              borderRadius: 4,
              overflow: "hidden",
              marginBottom: 14
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPercent}%`,
                background: "var(--spring-green-700)",
                transition: "width 0.25s ease"
              }}
            />
          </div>

          {/* Step-by-Step Single Focus View */}
          {isStepFocus && steps[activeStepIndex] && (
            <div
              style={{
                background: "var(--card)",
                border: "2px solid var(--spring-green-700)",
                borderRadius: "var(--radius-md)",
                padding: "16px 18px",
                marginBottom: 14
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--spring-green-800)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  🎯 Focus On Just This Step ({activeStepIndex + 1} of {steps.length})
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--ink-secondary)" }}>
                  Zero pressure
                </span>
              </div>
              <div
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  color: "var(--ink)",
                  lineHeight: 1.5,
                  marginBottom: 12
                }}
              >
                {steps[activeStepIndex].text}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  type="button"
                  disabled={activeStepIndex === 0}
                  onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "var(--radius-pill)",
                    background: "var(--paper)",
                    border: "1px solid var(--line)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--ink)",
                    cursor: activeStepIndex === 0 ? "not-allowed" : "pointer",
                    opacity: activeStepIndex === 0 ? 0.5 : 1
                  }}
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toggleStep(activeStepIndex);
                    if (activeStepIndex < steps.length - 1) {
                      setActiveStepIndex((prev) => prev + 1);
                    }
                  }}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "var(--radius-pill)",
                    background: steps[activeStepIndex].done ? "var(--spring-mint-200)" : "var(--spring-green-700)",
                    color: steps[activeStepIndex].done ? "var(--spring-green-900)" : "#ffffff",
                    border: "none",
                    fontSize: "0.84rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {steps[activeStepIndex].done ? "✓ Done (Next →)" : "Mark Done & Advance →"}
                </button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {steps.map((step, idx) => (
              <div
                key={idx}
                onClick={() => {
                  toggleStep(idx);
                  setActiveStepIndex(idx);
                }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: step.done ? "var(--spring-mint-100)" : (isStepFocus && idx === activeStepIndex ? "var(--mint-light)" : "var(--card)"),
                  border: step.done ? "1px solid var(--spring-mint-200)" : (isStepFocus && idx === activeStepIndex ? "2px solid var(--spring-green-700)" : "1px solid var(--line)"),
                  cursor: "pointer",
                  transition: "background 0.15s ease"
                }}
              >
                <input
                  type="checkbox"
                  checked={step.done}
                  readOnly
                  style={{
                    marginTop: 3,
                    accentColor: "var(--spring-green-700)",
                    cursor: "pointer"
                  }}
                />
                <span
                  style={{
                    fontSize: "0.92rem",
                    lineHeight: 1.45,
                    color: step.done ? "var(--ink-secondary)" : "var(--ink)",
                    textDecoration: step.done ? "line-through" : "none"
                  }}
                >
                  {step.text}
                </span>
              </div>
            ))}
          </div>

          {/* Celebratory Reward Card upon 100% completion */}
          {rewardClaimed && (
            <div
              style={{
                marginTop: 16,
                padding: "18px 20px",
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, var(--spring-mint-100) 0%, var(--card) 100%)",
                border: "2px solid var(--spring-green-700)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8
              }}
            >
              <div style={{ fontSize: "2.2rem", lineHeight: 1 }}>🏆 🎯 🌟 ✨ 🏅</div>
              <strong style={{ fontSize: "1.1rem", color: "var(--spring-green-900)" }}>
                Executive Victory! Task Conquered
              </strong>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--ink)", maxWidth: 500, lineHeight: 1.5 }}>
                You tackled task paralysis and broke down the friction step by step. Every small action creates momentum!
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap", justifyContent: "center" }}>
                <span
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "var(--spring-green-800)",
                    background: "var(--spring-mint-200)",
                    padding: "4px 12px",
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--spring-mint-300)"
                  }}
                >
                  🏆 Total Executive Trophies: {trophies}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRewardClaimed(false);
                    setSteps([]);
                    setRawText(null);
                    setTaskInput("");
                  }}
                  style={{
                    padding: "4px 14px",
                    borderRadius: "var(--radius-pill)",
                    background: "var(--spring-green-700)",
                    color: "#ffffff",
                    border: "none",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Break Down Another Task 🎯
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
