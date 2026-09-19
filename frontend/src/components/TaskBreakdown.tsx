import React, { useState } from "react";
import { api } from "../services/api";
import { speak } from "../utils/speech";

interface TaskBreakdownProps {
  onToast: (message: string, type?: "info" | "success" | "error") => void;
  readAloudDefault?: boolean;
}

const PRESET_TASKS = [
  "Clean and organize my desk",
  "Schedule doctor appointment",
  "Reply to an overwhelming email",
  "Prepare for tomorrow morning"
];

interface MicroStep {
  text: string;
  done: boolean;
}

export const TaskBreakdown: React.FC<TaskBreakdownProps> = ({ onToast, readAloudDefault }) => {
  const [taskInput, setTaskInput] = useState("");
  const [energyLevel, setEnergyLevel] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [rawText, setRawText] = useState<string | null>(null);
  const [steps, setSteps] = useState<MicroStep[]>([]);

  const handleBreakdown = async () => {
    if (!taskInput.trim()) {
      onToast("Please describe the task you want to break down.", "info");
      return;
    }

    setLoading(true);
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

      onToast("Task divided into bite-sized micro steps!", "success");
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

  const handleSpeak = () => {
    if (!rawText) return;
    speak(rawText);
    onToast("🔊 Reading task steps aloud…", "info");
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
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: "1.4rem" }}>🎯</span>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--ink)" }}>
          Executive Task Breakdown
        </h2>
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
              background: "var(--spring-green-700)",
              color: "#ffffff",
              border: "none",
              fontWeight: 600,
              fontSize: "0.92rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              opacity: loading ? 0.7 : 1
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
              marginBottom: 10
            }}
          >
            <strong style={{ fontSize: "0.92rem", color: "var(--spring-green-900)" }}>
              Step-by-Step Micro Checklist ({completedCount}/{steps.length} done)
            </strong>
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
          </div>

          {/* Progress bar */}
          <div
            style={{
              height: 6,
              background: "var(--line)",
              borderRadius: 3,
              overflow: "hidden",
              marginBottom: 14
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPercent}%`,
                background: "var(--spring-green-700)",
                transition: "width 0.2s ease"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {steps.map((step, idx) => (
              <div
                key={idx}
                onClick={() => toggleStep(idx)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: step.done ? "var(--spring-mint-100)" : "var(--card)",
                  border: step.done ? "1px solid var(--spring-mint-200)" : "1px solid var(--line)",
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
        </div>
      )}
    </div>
  );
};
