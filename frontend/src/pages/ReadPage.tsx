import { useRef, useState } from "react";
import { api, formatOcr } from "../services/api";
import { LoadingState } from "../components/LoadingState";
import { VoiceButton } from "../components/VoiceButton";

export function ReadPage() {
  const input = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function process(file?: File) {
    if (!file) return;
    setError("");
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      const data = await api.read(file);
      setText(formatOcr(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read the image.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-content">
      <div className="page-heading">
        <span className="eyebrow">Read & Understand</span>
        <h1>Read for me</h1>
        <p className="lead">Turn a photo or uploaded image into clear, readable text.</p>
      </div>

      <div className="feature-layout">
        <section className="panel">
          <div className="upload-zone" onClick={() => input.current?.click()}>
            <div className="upload-icon">⌁</div>
            <strong>Upload an image</strong>
            <span>Click here or choose a photo from your device.</span>
            <input ref={input} hidden type="file" accept="image/*" onChange={(e) => process(e.target.files?.[0])} />
          </div>
          <div className="button-row">
            <button className="primary-button" onClick={() => input.current?.click()}>Choose image</button>
            <label className="secondary-button">
              Take photo
              <input hidden type="file" accept="image/*" capture="environment" onChange={(e) => process(e.target.files?.[0])} />
            </label>
          </div>
          {preview && <img className="image-preview" src={preview} alt="Selected document preview" />}
        </section>

        <section className="panel">
          <div className="panel-heading-row">
            <div>
              <span className="section-eyebrow">Gemini OCR</span>
              <h2>Extracted text</h2>
            </div>
            {text && <VoiceButton text={text} />}
          </div>
          {loading && <LoadingState text="Understanding your image…" />}
          {!loading && error && <div className="error-box">{error}<button className="retry-link" onClick={() => input.current?.click()}>Try another image</button></div>}
          {!loading && !error && !text && <div className="empty-state">Your extracted text will appear here.</div>}
          {!loading && text && <div className="result-text">{text}</div>}
          {text && (
            <button className="secondary-button" onClick={() => navigator.clipboard.writeText(text)}>
              Copy text
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
