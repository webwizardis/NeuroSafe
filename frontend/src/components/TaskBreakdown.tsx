import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Trophy,
  Sprout,
  Sun,
  Zap,
  Target,
  Volume2,
  List,
  Sparkles,
  Check
} from "lucide-react";
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
      onToast("Executive Victory! Task completed and reward unlocked!", "success");
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
      onToast("Executive Victory claimed!", "success");
    }
  };

  const handleSpeak = () => {
    if (!rawText) return;
    speak(rawText);
    onToast("Reading task steps aloud…", "info");
  };

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        boxShadow: "var(--shadow-sm)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-md)",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <CheckSquare size={20} color="#b45309" />
          </div>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "var(--ink)" }}>
              Executive Task Breakdown
            </h2>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              padding: "3px 10px",
              borderRadius: "var(--radius-pill)",
              background: "#fffbeb",
              color: "#92400e",
              border: "1px solid #fde68a"
            }}
          >
            Executive Focus
          </span>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#fffbeb",
              padding: "3px 10px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid #fde68a",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#b45309"
            }}
          >
            <Trophy size={14} />
            <span>{trophies} Trophies</span>
          </div>
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
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
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
                {lvl === "low" ? (
                  <>
                    <Sprout size={13} />
                    <span>Low Spoon</span>
                  </>
                ) : lvl === "medium" ? (
                  <>
                    <Sun size={13} />
                    <span>Medium</span>
                  </>
                ) : (
                  <>
                    <Zap size={13} />
                    <span>High</span>
                  </>
                )}
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
            <Target size={16} />
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
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
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
                {isStepFocus ? (
                  <>
                    <Target size={12} />
                    <span>1-Step Focus ON</span>
                  </>
                ) : (
                  <>
                    <List size={12} />
                    <span>All Steps View</span>
                  </>
                )}
              </button>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={handleSpeak}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
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
                <Volume2 size={13} />
                <span>Read Steps</span>
              </button>
              <button
                type="button"
                onClick={handleClaimVictory}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
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
                <Trophy size={13} />
                <span>Mark Task Done</span>
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
                  Focus On Just This Step ({activeStepIndex + 1} of {steps.length})
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
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
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
                  {steps[activeStepIndex].done && <Check size={14} />}
                  <span>{steps[activeStepIndex].done ? "Done (Next)" : "Mark Done & Advance"}</span>
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
              <div style={{ display: "flex", gap: 8, justifyContent: "center", color: "#b45309" }}>
                <Trophy size={28} />
                <Sparkles size={28} />
              </div>
              <strong style={{ fontSize: "1.1rem", color: "var(--spring-green-900)" }}>
                Executive Victory! Task Conquered
              </strong>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--ink)", maxWidth: 500, lineHeight: 1.5 }}>
                You tackled task paralysis and broke down the friction step by step. Every small action creates momentum!
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap", justifyContent: "center" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "var(--spring-green-800)",
                    background: "var(--spring-mint-200)",
                    padding: "4px 12px",
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--spring-mint-300)"
                  }}
                >
                  <Trophy size={13} />
                  <span>Total Executive Trophies: {trophies}</span>
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
                  Break Down Another Task
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
