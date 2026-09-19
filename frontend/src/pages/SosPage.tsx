import { useState } from "react";
import { api } from "../services/api";

export function SosPage() {
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState("I need help.");
  const [contact, setContact] = useState("Sam (Partner)");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");

  async function send() {
    if (!confirmed) return;
    setSending(true);
    try {
      const data = await api.sos(message, contact);
      setResult(`SOS request sent. Status: ${data.status}. Timestamp: ${data.timestamp}.`);
    } catch (err) {
      setResult(err instanceof Error ? err.message : "The SOS request could not be sent.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page-content">
      <div className="page-heading">
        <span className="eyebrow">Urgent Support</span>
        <h1>SOS</h1>
        <p className="lead">This action sends the existing NeuroSafe urgent-support request to the backend.</p>
      </div>

      <section className="sos-panel">
        <div className="sos-icon">!</div>
        <h2>Urgent support</h2>
        <p>Review the details below before sending. The confirmation step helps prevent accidental activation.</p>

        <label className="field-label">Message<textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} /></label>
        <label className="field-label">Contact<input value={contact} onChange={(e) => setContact(e.target.value)} /></label>

        <label className="confirm-row">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
          I understand that this will send an urgent support request.
        </label>

        <button className="sos-button" disabled={!confirmed || sending} onClick={() => void send()}>
          {sending ? "Sending…" : "Confirm SOS"}
        </button>

        {result && <div className="result-text sos-result" role="status">{result}</div>}
      </section>
    </div>
  );
}
