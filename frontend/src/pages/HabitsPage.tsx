import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import type { Habit, HabitStats } from "../types";
import { LoadingState } from "../components/LoadingState";
import { VoiceButton } from "../components/VoiceButton";

const filters = ["all", "morning", "afternoon", "evening"];

export function HabitsPage({ problems }: { problems: string[] }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<HabitStats>({ total: 0, completed: 0, percent: 0 });
  const [filter, setFilter] = useState("all");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("anytime");
  const [icon, setIcon] = useState("🌱");
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<Habit[]>([]);

  async function load() {
    try {
      setLoading(true);
      const data = await api.habits.list();
      setHabits(data.habits || []);
      setStats(data.stats || { total: 0, completed: 0, percent: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const visible = useMemo(
    () => filter === "all" ? habits : habits.filter((h) => h.time_of_day === filter || h.time_of_day === "anytime"),
    [filter, habits],
  );

  async function add() {
    if (!title.trim()) return;
    const data = await api.habits.add(title, time, icon);
    setHabits((h) => [...h, data.habit]);
    setStats(data.stats);
    setTitle("");
  }

  async function toggle(id: string) {
    const current = habits.find((h) => h.id === id);
    if (!current) return;
    setHabits((items) => items.map((h) => h.id === id ? { ...h, completed_today: !h.completed_today } : h));
    try {
      const data = await api.habits.toggle(id);
      if (data.habit) setHabits((items) => items.map((h) => h.id === id ? data.habit! : h));
      if (data.stats) setStats(data.stats);
    } catch {
      setHabits((items) => items.map((h) => h.id === id ? current : h));
    }
  }

  async function remove(id: string) {
    await api.habits.remove(id);
    setHabits((items) => items.filter((h) => h.id !== id));
    const data = await api.habits.list();
    setStats(data.stats);
  }

  async function reset() {
    await api.habits.reset();
    await load();
  }

  async function suggest() {
    const data = await api.habits.suggest(
      problems.length ? problems.join(", ") : "sensory comfort and gentle executive function anchors",
      problems,
    );
    setSuggestions(data.suggestions || []);
  }

  const speech = `Daily routine. ${stats.completed} of ${stats.total} habits completed today.`;

  return (
    <div className="page-content">
      <div className="page-heading">
        <span className="eyebrow">Routine</span>
        <h1>Daily Habits</h1>
        <p className="lead">Small anchors, without pressure.</p>
      </div>

      <section className="panel routine-summary">
        <div>
          <span className="section-eyebrow">Today's progress</span>
          <h2>{stats.percent || 0}% complete</h2>
          <p className="muted">{stats.completed} of {stats.total} completed</p>
        </div>
        <div className="progress-bar"><span style={{ width: `${stats.percent || 0}%` }} /></div>
        <VoiceButton text={speech} />
      </section>

      <section className="panel">
        <div className="filter-row">
          {filters.map((f) => <button key={f} className={filter === f ? "chip active" : "chip"} onClick={() => setFilter(f)}>{f[0].toUpperCase() + f.slice(1)}</button>)}
          <span className="spacer" />
          <button className="secondary-button" onClick={() => void reset()}>Reset today</button>
          <button className="secondary-button" onClick={() => void suggest()}>✨ Suggest gentle habits</button>
        </div>

        {suggestions.length > 0 && (
          <div className="suggestion-grid">
            {suggestions.map((s, i) => (
              <div className="suggestion-card" key={`${s.title}-${i}`}>
                <span>{s.icon || "✨"}</span>
                <strong>{s.title}</strong>
                <small>{s.notes}</small>
                <button className="secondary-button" onClick={async () => { const d = await api.habits.add(s.title, s.time_of_day || "anytime", s.icon || "✨", s.notes || ""); setHabits((h) => [...h, d.habit]); setStats(d.stats); }}>+ Add</button>
              </div>
            ))}
          </div>
        )}

        {loading && <LoadingState text="Loading your routine…" />}
        {!loading && !visible.length && <div className="empty-state">No habits in this section yet. Add one small anchor below.</div>}
        <div className="habit-list">
          {visible.map((habit) => (
            <div className={`habit-row ${habit.completed_today ? "completed" : ""}`} key={habit.id}>
              <button className="habit-check" onClick={() => void toggle(habit.id)} aria-label={habit.completed_today ? `Mark ${habit.title} incomplete` : `Complete ${habit.title}`}>
                {habit.completed_today ? "✓" : ""}
              </button>
              <div className="habit-info"><strong>{habit.icon || "🌱"} {habit.title}</strong><small>{habit.notes || habit.time_of_day || "Anytime"} · {habit.streak || 0} day streak</small></div>
              <button className="icon-button" onClick={() => void remove(habit.id)} aria-label={`Remove ${habit.title}`}>×</button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <span className="section-eyebrow">Add a habit</span>
        <div className="inline-form">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Drink some water" />
          <select value={time} onChange={(e) => setTime(e.target.value)}>
            <option value="anytime">Anytime</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
          <select value={icon} onChange={(e) => setIcon(e.target.value)}>
            <option>🌱</option><option>💧</option><option>📚</option><option>🌿</option><option>🧘</option><option>🍎</option>
          </select>
          <button className="primary-button" onClick={() => void add()}>Add habit</button>
        </div>
      </section>
    </div>
  );
}
