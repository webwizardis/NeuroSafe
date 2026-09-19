import { useEffect, useRef, useState } from "react";
import { api, formatOcr } from "../services/api";
import { LoadingState } from "../components/LoadingState";
import { VoiceButton } from "../components/VoiceButton";

export function CameraPage() {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState("");
  const [mode, setMode] = useState<"ocr" | "describe" | "analyze">("ocr");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function start(nextFacing = facing) {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Live camera is not available in this browser. You can use Read for Me to upload or take a photo.");
      return;
    }
    if (stream) stream.getTracks().forEach((track) => track.stop());

    try {
      const next = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: nextFacing }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(next);
      setPaused(false);
      if (video.current) {
        video.current.srcObject = next;
        await video.current.play();
      }
      setError("");
    } catch (err) {
      setError(err instanceof Error ? `Camera note: ${err.message}` : "Camera permission was not available.");
    }
  }

  useEffect(() => {
    void start();
    return () => stream?.getTracks().forEach((track) => track.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function togglePause() {
    if (!stream) return;
    if (paused) {
      stream.getTracks().forEach((track) => (track.enabled = true));
      setPaused(false);
    } else {
      stream.getTracks().forEach((track) => (track.enabled = false));
      setPaused(true);
    }
  }

  async function capture() {
    if (!video.current || !canvas.current) return;
    if (!video.current.videoWidth) {
      setError("The camera is not ready yet.");
      return;
    }
    canvas.current.width = video.current.videoWidth;
    canvas.current.height = video.current.videoHeight;
    canvas.current.getContext("2d")?.drawImage(video.current, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.current!.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) return;

    setLoading(true);
    setError("");
    try {
      const data =
        mode === "ocr"
          ? await api.camera.capture(blob)
          : mode === "describe"
            ? await api.camera.describe(blob)
            : await api.camera.analyze(blob);
      setResult(formatOcr(data) || data.description || JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Camera analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  async function flip() {
    const next = facing === "environment" ? "user" : "environment";
    setFacing(next);
    await start(next);
  }

  return (
    <div className="page-content">
      <div className="page-heading">
        <span className="eyebrow">Read & Understand</span>
        <h1>Camera</h1>
        <p className="lead">Point the camera at text or a scene. NeuroSafe will use the existing vision backend to understand it.</p>
      </div>

      <div className="camera-layout">
        <section className="panel camera-panel">
          <div className="camera-frame">
            <video ref={video} autoPlay muted playsInline aria-label="NeuroSafe live camera" />
            <div className="reticle" aria-hidden="true" />
            <span className="camera-status">{paused ? "Camera paused" : "Align what you need inside the frame"}</span>
          </div>
          <canvas ref={canvas} hidden />
          <div className="camera-mode-tabs">
            {[
              ["ocr", "Read text"],
              ["describe", "Describe scene"],
              ["analyze", "Analyze"],
            ].map(([id, label]) => (
              <button key={id} className={mode === id ? "active" : ""} onClick={() => setMode(id as typeof mode)}>{label}</button>
            ))}
          </div>
          <div className="camera-controls">
            <button className="secondary-button" onClick={() => void flip()}>↻ Flip</button>
            <button className="capture-button" onClick={() => void capture()} aria-label="Capture and analyze image">●</button>
            <button className="secondary-button" onClick={togglePause}>{paused ? "▶ Resume" : "Ⅱ Pause"}</button>
          </div>
          {error && <div className="error-box">{error}</div>}
        </section>

        <section className="panel">
          <div className="panel-heading-row">
            <div>
              <span className="section-eyebrow">Results</span>
              <h2>What NeuroSafe sees</h2>
            </div>
            {result && <VoiceButton text={result} />}
          </div>
          {loading && <LoadingState text="Understanding the camera frame…" />}
          {!loading && !result && <div className="empty-state">Capture a frame to see results here.</div>}
          {!loading && result && <div className="result-text">{result}</div>}
        </section>
      </div>
    </div>
  );
}
