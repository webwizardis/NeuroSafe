import { useState } from "react";
import { api } from "../services/api";
import { LoadingState } from "../components/LoadingState";
import { VoiceButton } from "../components/VoiceButton";

export function ExplainPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function explain() {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.explain(input.trim());
      setResult(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not explain the text.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-content">
      <div className="page-heading">
        <span className="eyebrow">Read & Understand</span>
        <h1>Explain Simply</h1>
        <p className="lead">Paste something confusing and get a shorter, clearer explanation.</p>
      </div>
      <div className="two-column">
        <section className="panel">
          <label className="field-label">What would you like explained?
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={12} placeholder="Paste text here…" />
          </label>
          <button className="primary-button" onClick={() => void explain()} disabled={loading || !input.trim()}>
            {loading ? "Simplifying…" : "✦ Explain simply"}
          </button>
        </section>
        <section className="panel">
          <div className="panel-heading-row">
            <div><span className="section-eyebrow">NeuroSafe</span><h2>Simple explanation</h2></div>
            {result && <VoiceButton text={result} />}
          </div>
          {loading && <LoadingState text="Making this easier to understand…" />}
          {error && <div className="error-box">{error}</div>}
          {!loading && !error && !result && <div className="empty-state">Your explanation will appear here.</div>}
          {result && <div className="result-text">{result}</div>}
        </section>
      </div>
    </div>
  );
}
