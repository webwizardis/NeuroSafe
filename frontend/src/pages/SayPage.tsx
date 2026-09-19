import { useState } from "react";
import { api } from "../services/api";
import { LoadingState } from "../components/LoadingState";
import { VoiceButton } from "../components/VoiceButton";

const quick = [
  "I need some time.",
  "Please explain that again.",
  "I need a quieter place.",
  "I don't understand.",
  "I need help.",
];

export function SayPage() {
  const [intent, setIntent] = useState("I need some time");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("calm and polite");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const data = await api.say(intent, context, tone);
      setResult(data.text);
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Could not draft the message.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-content">
      <div className="page-heading">
        <span className="eyebrow">Communicate</span>
        <h1>Say It For Me</h1>
        <p className="lead">Choose a starting point, add context if you want, and let NeuroSafe help find the words.</p>
      </div>

      <section className="panel">
        <div className="quick-message-grid">
          {quick.map((message) => (
            <button key={message} className={`message-chip ${intent === message ? "selected" : ""}`} onClick={() => setIntent(message)}>
              {message}
            </button>
          ))}
        </div>
        <div className="two-column">
          <div>
            <label className="field-label">What do you want to say?
              <input value={intent} onChange={(e) => setIntent(e.target.value)} />
            </label>
            <label className="field-label">Context <span className="optional">optional</span>
              <textarea value={context} onChange={(e) => setContext(e.target.value)} rows={5} placeholder="Add anything that would help." />
            </label>
            <label className="field-label">Tone
              <select value={tone} onChange={(e) => setTone(e.target.value)}>
                <option>calm and polite</option>
                <option>friendly and casual</option>
                <option>clear and direct</option>
                <option>gentle and reassuring</option>
              </select>
            </label>
            <button className="primary-button" onClick={() => void generate()} disabled={loading || !intent.trim()}>
              {loading ? "Finding the words…" : "💬 Create message"}
            </button>
          </div>
          <div>
            <div className="panel-heading-row"><div><span className="section-eyebrow">Your message</span><h2>Ready to use</h2></div>{result && <VoiceButton text={result} />}</div>
            {loading && <LoadingState text="Drafting a supportive message…" />}
            {!loading && !result && <div className="empty-state">Your message will appear here.</div>}
            {result && (
              <div className="message-result">
                <p>{result}</p>
                <button className="secondary-button" onClick={() => navigator.clipboard.writeText(result)}>Copy message</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
