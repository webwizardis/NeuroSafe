import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Habit, HabitStats, HabitSuggestion } from "../types";
import { speak } from "../utils/speech";

interface DailyHabitsProps {
  onToast: (message: string, type?: "info" | "success" | "error") => void;
  problems?: string[];
}

const PRESET_HABITS = [
  { title: "Morning hydration (1 glass of water)", time: "morning", icon: "💧" },
  { title: "5-minute quiet sensory pause", time: "afternoon", icon: "🌿" },
  { title: "Take daily vitamins or meds", time: "morning", icon: "💊" },
  { title: "Gentle evening wind-down stretch", time: "evening", icon: "🌙" }
];

export const DailyHabits: React.FC<DailyHabitsProps> = ({ onToast, problems = [] }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<HabitStats>({
    total: 0,
    completed: 0,
    percent: 0,
    all_completed: false
  });
  const [filter, setFilter] = useState<"all" | "morning" | "afternoon" | "evening">("all");
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState<"morning" | "afternoon" | "evening" | "anytime">("anytime");
  const [newIcon, setNewIcon] = useState("✨");
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<HabitSuggestion[]>([]);

  const loadHabits = async () => {
    setLoading(true);
    try {
      const data = await api.getHabits();
      if (data && data.habits) {
        setHabits(data.habits);
        if (data.stats) setStats(data.stats);
      }
    } catch (err: any) {
      console.warn("Failed to load habits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  const handleToggle = async (id: string) => {
    // Optimistic
    const target = habits.find((h) => h.id === id);
    if (!target) return;

    const prevDone = target.completed_today;
    const nextDone = !prevDone;

    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              completed_today: nextDone,
              streak: nextDone ? h.streak + 1 : Math.max(0, h.streak - 1)
            }
          : h
      )
    );

    try {
      const res = await api.toggleHabit(id);
      if (res.stats) setStats(res.stats);
      if (nextDone) {
        onToast(`Goal completed: ${target.title} ✨`, "success");
      }
    } catch (err: any) {
      // Revert
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, completed_today: prevDone } : h))
      );
      onToast(err.message || "Failed to toggle habit.", "error");
    }
  };

  const handleAdd = async (title: string, time: any = "anytime", icon: string = "✨") => {
    if (!title.trim()) {
      onToast("Please enter a habit title.", "info");
      return;
    }

    try {
      const res = await api.addHabit(title.trim(), time, icon);
      if (res && res.habit) {
        setHabits((prev) => [...prev, res.habit]);
        if (res.stats) setStats(res.stats);
        setNewTitle("");
        onToast(`Added habit: ${res.habit.title}`, "success");
      }
    } catch (err: any) {
      onToast(err.message || "Failed to add habit.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await api.deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
      if (res.stats) setStats(res.stats);
      onToast("Habit removed.", "info");
    } catch (err: any) {
      onToast(err.message || "Failed to remove habit.", "error");
    }
  };

  const handleReset = async () => {
    try {
      const res = await api.resetHabits();
      setHabits((prev) => prev.map((h) => ({ ...h, completed_today: false })));
      if (res.stats) setStats(res.stats);
      onToast("Today's routine checks reset.", "info");
    } catch (err: any) {
      onToast(err.message || "Failed to reset routine.", "error");
    }
  };

  const handleSuggest = async () => {
    setSuggesting(true);
    try {
      const focus = problems.length > 0 ? problems.join(", ") : "sensory comfort, gentle daily anchors";
      const res = await api.suggestHabits(focus, problems);
      if (res && res.suggestions) {
        setSuggestions(res.suggestions);
        onToast("AI generated gentle routine ideas!", "success");
      }
    } catch (err: any) {
      onToast(err.message || "Failed to suggest habits.", "error");
    } finally {
      setSuggesting(false);
    }
  };

  const handleReadStatus = () => {
    const completed = habits.filter((h) => h.completed_today);
    const pending = habits.filter((h) => !h.completed_today);
    let msg = `Daily Routine: ${completed.length} of ${habits.length} goals completed today.`;
    if (pending.length > 0) {
      msg += ` Remaining: ${pending.map((p) => p.title).join(", ")}.`;
    } else if (habits.length > 0) {
      msg += ` All goals completed! Excellent gentle care today.`;
    }
    speak(msg);
    onToast("🔊 Reading habit progress aloud…", "info");
  };

  const filteredHabits =
    filter === "all"
      ? habits
      : habits.filter((h) => h.time_of_day === filter || h.time_of_day === "anytime");

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid #ddd6fe",
        borderTop: "4px solid #8b5cf6",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        boxShadow: "var(--shadow-sm)"
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.4rem" }}>✨</span>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#6d28d9" }}>
            Daily Habits & Calm Anchors
          </h2>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={handleReadStatus}
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-pill)",
              background: "var(--peach-200)",
              color: "var(--peach-900)",
              border: "none",
              fontWeight: 600,
              fontSize: "0.82rem",
              cursor: "pointer"
            }}
          >
            🔊 Status
          </button>
          <button
            type="button"
            onClick={handleSuggest}
            disabled={suggesting}
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-pill)",
              background: "var(--spring-mint-200)",
              color: "var(--spring-green-900)",
              border: "none",
              fontWeight: 600,
              fontSize: "0.82rem",
              cursor: "pointer"
            }}
          >
            {suggesting ? "Thinking…" : "✨ AI Suggestions"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-pill)",
              background: "var(--paper)",
              color: "var(--ink-secondary)",
              border: "1px solid var(--line)",
              fontSize: "0.82rem",
              cursor: "pointer"
            }}
            title="Reset checks for a fresh day"
          >
            Reset Checks
          </button>
        </div>
      </div>

      {/* Routine Progress Bar */}
      <div
        style={{
          background: "var(--paper-peach)",
          border: "1px solid var(--peach-200)",
          borderRadius: "var(--radius-md)",
          padding: "14px 18px",
          marginBottom: 20
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8
          }}
        >
          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--ink)" }}>
            Today's Progress: <strong>{stats.completed} of {stats.total} completed</strong>
          </span>
          <span
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "var(--peach-900)",
              background: "var(--peach-100)",
              padding: "2px 8px",
              borderRadius: "var(--radius-pill)"
            }}
          >
            {stats.percent}%
          </span>
        </div>

        <div
          style={{
            height: 8,
            background: "var(--card)",
            borderRadius: 4,
            overflow: "hidden"
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${stats.percent}%`,
              background: "linear-gradient(90deg, var(--peach-500) 0%, var(--spring-green-700) 100%)",
              transition: "width 0.25s ease"
            }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 16,
          flexWrap: "wrap"
        }}
      >
        {(["all", "morning", "afternoon", "evening"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 12px",
              borderRadius: "var(--radius-pill)",
              border: filter === f ? "1px solid var(--spring-green-700)" : "1px solid var(--line)",
              background: filter === f ? "var(--spring-mint-200)" : "var(--card)",
              color: filter === f ? "var(--spring-green-900)" : "var(--ink-secondary)",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize"
            }}
          >
            {f === "all" ? "All Habits" : f === "morning" ? "🌅 Morning" : f === "afternoon" ? "☀️ Afternoon" : "🌙 Evening"}
          </button>
        ))}
      </div>

      {/* Habits List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {filteredHabits.length === 0 ? (
          <p style={{ color: "var(--ink-secondary)", fontSize: "0.9rem", textAlign: "center", padding: "16px 0" }}>
            No goals in this section yet. Add a simple anchor below!
          </p>
        ) : (
          filteredHabits.map((habit) => (
            <div
              key={habit.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                background: habit.completed_today ? "var(--spring-mint-100)" : "var(--paper)",
                border: habit.completed_today ? "1px solid var(--spring-mint-300)" : "1px solid var(--line)",
                transition: "all 0.15s ease"
              }}
            >
              <div
                onClick={() => handleToggle(habit.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flex: 1,
                  cursor: "pointer"
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: habit.completed_today ? "none" : "2px solid var(--line)",
                    background: habit.completed_today ? "var(--spring-green-700)" : "#ffffff",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    fontWeight: 700
                  }}
                >
                  {habit.completed_today ? "✓" : ""}
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{habit.icon || "✨"}</span>
                    <strong
                      style={{
                        fontSize: "0.95rem",
                        color: "var(--ink)",
                        textDecoration: habit.completed_today ? "line-through" : "none",
                        opacity: habit.completed_today ? 0.75 : 1
                      }}
                    >
                      {habit.title}
                    </strong>
                  </div>
                  {habit.notes && (
                    <span style={{ fontSize: "0.82rem", color: "var(--ink-secondary)" }}>
                      {habit.notes}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {habit.streak > 0 && (
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      background: "var(--peach-100)",
                      color: "var(--peach-900)",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-pill)"
                    }}
                  >
                    🔥 {habit.streak}d
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(habit.id)}
                  aria-label="Remove habit"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--ink-secondary)",
                    cursor: "pointer",
                    padding: "4px 8px",
                    fontSize: "0.9rem"
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Suggestion Cards Drawer */}
      {suggestions.length > 0 && (
        <div
          style={{
            marginBottom: 20,
            padding: "16px",
            background: "var(--spring-mint-100)",
            border: "1px solid var(--spring-mint-300)",
            borderRadius: "var(--radius-md)"
          }}
        >
          <strong style={{ display: "block", fontSize: "0.9rem", color: "var(--spring-green-900)", marginBottom: 10 }}>
            ✨ Recommended Low-Pressure Anchors:
          </strong>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
            {suggestions.map((s, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--card)",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--line)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6
                }}
              >
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span>{s.icon || "✨"}</span>
                  <strong style={{ fontSize: "0.86rem", color: "var(--ink)" }}>{s.title}</strong>
                </div>
                {s.notes && <span style={{ fontSize: "0.78rem", color: "var(--ink-secondary)" }}>{s.notes}</span>}
                <button
                  type="button"
                  onClick={() => {
                    handleAdd(s.title, s.time_of_day, s.icon);
                    setSuggestions((prev) => prev.filter((_, i) => i !== idx));
                  }}
                  style={{
                    alignSelf: "flex-start",
                    padding: "4px 10px",
                    borderRadius: "var(--radius-pill)",
                    background: "var(--peach-200)",
                    color: "var(--peach-900)",
                    border: "none",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  + Add to Routine
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add Preset Pills */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.8rem", color: "var(--ink-secondary)", fontWeight: 600 }}>
          Quick add:
        </span>
        {PRESET_HABITS.map((preset) => (
          <button
            key={preset.title}
            type="button"
            onClick={() => handleAdd(preset.title, preset.time, preset.icon)}
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
            + {preset.icon} {preset.title}
          </button>
        ))}
      </div>

      {/* Add Custom Habit Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd(newTitle, newTime, newIcon);
        }}
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center"
        }}
      >
        <input
          type="text"
          placeholder="New gentle daily goal…"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={{
            flex: 2,
            minWidth: "180px",
            padding: "9px 12px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--line)",
            background: "var(--paper)",
            color: "var(--ink)",
            fontSize: "0.9rem"
          }}
        />

        <select
          value={newTime}
          onChange={(e) => setNewTime(e.target.value as any)}
          style={{
            padding: "9px 12px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--line)",
            background: "var(--card)",
            color: "var(--ink)",
            fontSize: "0.86rem"
          }}
        >
          <option value="anytime">Anytime</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </select>

        <button
          type="submit"
          style={{
            padding: "9px 16px",
            borderRadius: "var(--radius-md)",
            background: "var(--spring-green-700)",
            color: "#ffffff",
            border: "none",
            fontWeight: 600,
            fontSize: "0.88rem",
            cursor: "pointer"
          }}
        >
          + Add Anchor
        </button>
      </form>
    </div>
  );
};
