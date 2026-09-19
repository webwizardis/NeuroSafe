import { useState } from "react";
import { api } from "../services/api";
import { LoadingState } from "../components/LoadingState";
import { VoiceButton } from "../components/VoiceButton";

export function TasksPage() {
  const [task, setTask] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<boolean[]>([]);

  async function breakdown() {
    setLoading(true);
    try {
      const data = await api.tasks.breakdown(task);
      setResult(data.text);
      setDone(new Array(Math.max(1, data.text.split(/\n+/).filter(Boolean).length)).fill(false));
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Could not break down the task.");
    } finally {
      setLoading(false);
    }
  }

  const lines = result.split(/\n+/).map((x) => x.trim()).filter(Boolean);

  return (
    <div className="page-content">
      <div className="page-heading">
        <span className="eyebrow">Calm & Focus</span>
        <h1>Break This Down</h1>
        <p className="lead">Give NeuroSafe a task and let the existing AI turn it into smaller steps.</p>
      </div>
      <section className="panel">
        <label className="field-label">What do you need to do?
          <textarea value={task} onChange={(e) => setTask(e.target.value)} rows={5} placeholder="Example: Prepare my presentation for tomorrow." />
        </label>
        <button className="primary-button" disabled={loading || !task.trim()} onClick={() => void breakdown()}>
          {loading ? "Breaking it down…" : "🪜 Break it down"}
        </button>
      </section>

      <section className="panel">
        <div className="panel-heading-row">
          <div><span className="section-eyebrow">Your steps</span><h2>One thing at a time</h2></div>
          {result && <VoiceButton text={result} />}
        </div>
        {loading && <LoadingState text="Turning the task into manageable steps…" />}
        {!loading && !result && <div className="empty-state">Your steps will appear here.</div>}
        {!loading && result && (
          <div className="task-list">
            {lines.map((line, i) => (
              <label className={`task-row ${done[i] ? "done" : ""}`} key={`${line}-${i}`}>
                <input type="checkbox" checked={Boolean(done[i])} onChange={() => setDone((d) => d.map((v, j) => j === i ? !v : v))} />
                <span>{line}</span>
              </label>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
