import { useState } from "react";
import { api } from "../services/api";
import { LoadingState } from "../components/LoadingState";
import { VoiceButton } from "../components/VoiceButton";

export function CalmPage() {
  const [steps, setSteps] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api.calm();
      setSteps(data.steps || []);
      setIndex(0);
    } finally {
      setLoading(false);
    }
  }

  const current = steps[index] || "";

  return (
    <div className="page-content quiet-page">
      <div className="page-heading">
        <span className="eyebrow">Calm & Focus</span>
        <h1>Calm Me</h1>
        <p className="lead">A small guided pause. Move at your own pace.</p>
      </div>

      <section className="calm-card">
        {loading && <LoadingState text="Preparing a gentle sequence…" />}
        {!loading && !steps.length && (
          <>
            <div className="calm-symbol">☘</div>
            <h2>Let's take one small step.</h2>
            <p>NeuroSafe can guide you through its existing grounding sequence.</p>
            <button className="primary-button" onClick={() => void load()}>Begin gently</button>
          </>
        )}
        {!loading && steps.length > 0 && (
          <>
            <div className="step-counter">Step {index + 1} of {steps.length}</div>
            <div className="calm-progress"><span style={{ width: `${((index + 1) / steps.length) * 100}%` }} /></div>
            <div className="calm-step">{current}</div>
            <div className="calm-actions">
              <button className="secondary-button" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>← Previous</button>
              {index < steps.length - 1 ? (
                <button className="primary-button" onClick={() => setIndex((i) => i + 1)}>Next →</button>
              ) : (
                <button className="primary-button" onClick={() => setIndex(0)}>Start again</button>
              )}
            </div>
            <VoiceButton text={current} label="Read current step aloud" />
          </>
        )}
      </section>
    </div>
  );
}
