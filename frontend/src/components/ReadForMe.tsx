import React, { useState } from "react";
import { api } from "../services/api";
import { speak } from "../utils/speech";

interface ReadForMeProps {
  onToast: (message: string, type?: "info" | "success" | "error") => void;
  readAloudDefault?: boolean;
}

const examples = [
  {
    title: "Read a notice",
    help: "Text, times, and instructions",
    src: "/assets/gallery/quiet-notice.svg",
    alt: "Example notice: Quiet room available after 3 PM",
    kind: "text"
  },
  {
    title: "Read a label",
    help: "Small print and safety warnings",
    src: "/assets/gallery/medication-label.svg",
    alt: "Example medication label with dosage and warning text",
    kind: "text"
  },
  {
    title: "Understand a room",
    help: "Pathways, lighting, and calm spaces",
    src: "/assets/gallery/quiet-room.svg",
    alt: "Example quiet room with a clear path and soft light",
    kind: "scene"
  },
  {
    title: "Check a workspace",
    help: "Clutter, focus points, and next steps",
    src: "/assets/gallery/busy-desk.svg",
    alt: "Example busy desk showing visual clutter and organization cues",
    kind: "scene"
  }
] as const;

async function imageToJpeg(src: string): Promise<Blob> {
  const response = await fetch(src);
  if (!response.ok) throw new Error("The selected example image could not be loaded.");
  const source = URL.createObjectURL(await response.blob());
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 780;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("The selected example image could not be prepared.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.94));
    if (!blob) throw new Error("The selected example image could not be encoded.");
    return blob;
  } finally {
    URL.revokeObjectURL(source);
  }
}

export const ReadForMe: React.FC<ReadForMeProps> = ({ onToast, readAloudDefault }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const selected = examples[selectedIndex];

  const analyze = async (scene: boolean) => {
    setLoadingAction(scene ? "Describing surroundings..." : "Reading the selected example...");
    try {
      const blob = await imageToJpeg(selected.src);
      const form = new FormData();
      form.append("image", blob, scene ? "gallery-surroundings.jpg" : "gallery-example.jpg");
      const response = scene ? await api.describeCamera(form) : await api.captureCamera(form);
      const text = scene
        ? response.description || response.text || "No surroundings description generated."
        : response.text || "No text detected in the selected example.";
      setResultText(text);
      onToast(scene ? "Surroundings described!" : "Text extracted successfully!", "success");
      if (readAloudDefault) speak(text);
    } catch (error: any) {
      onToast(error.message || "The example could not be analyzed.", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <section aria-labelledby="read-for-me-title" style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 id="read-for-me-title" style={{ margin: 0, color: "var(--ink)" }}>📖 Read for Me (Image Gallery)</h2>
        <p style={{ color: "var(--ink-secondary)" }}>Choose a calm example to practice reading text or understanding surroundings. No camera permission or upload is needed.</p>
      </div>

      <div role="list" aria-label="Example images for text and surroundings" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        {examples.map((example, index) => (
          <button
            key={example.src}
            type="button"
            role="listitem"
            aria-pressed={selectedIndex === index}
            onClick={() => setSelectedIndex(index)}
            style={{ textAlign: "left", padding: 8, borderRadius: 12, border: `2px solid ${selectedIndex === index ? "var(--spring-green-700)" : "var(--line)"}`, background: selectedIndex === index ? "var(--paper)" : "var(--card)", cursor: "pointer" }}
          >
            <img src={example.src} alt={example.alt} style={{ width: "100%", aspectRatio: "1.5", objectFit: "cover", borderRadius: 8 }} />
            <strong style={{ display: "block", marginTop: 6, color: "var(--ink)" }}>{example.title}</strong>
            <small style={{ color: "var(--ink-secondary)" }}>{example.help}</small>
          </button>
        ))}
      </div>

      <div aria-live="polite" style={{ display: "flex", gap: 14, alignItems: "center", margin: "14px 0", padding: 12, background: "var(--paper)", borderRadius: 12 }}>
        <img src={selected.src} alt={`Selected example: ${selected.alt}`} style={{ width: 112, height: 76, objectFit: "cover", borderRadius: 8 }} />
        <div>
          <strong style={{ color: "var(--ink)" }}>{selected.title}</strong>
          <p style={{ margin: "4px 0 0", color: "var(--ink-secondary)", fontSize: "0.85rem" }}>
            {selected.kind === "scene" ? "Focuses on pathways, lighting, clutter, and sensory comfort." : "Focuses on visible words, instructions, and plain-language meaning."}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button type="button" disabled={Boolean(loadingAction)} onClick={() => analyze(false)}>
          {loadingAction && !selected.kind.includes("scene") ? loadingAction : "📖 Read selected text"}
        </button>
        <button type="button" disabled={Boolean(loadingAction)} onClick={() => analyze(true)}>
          {loadingAction && selected.kind === "scene" ? loadingAction : "👁️ Describe surroundings"}
        </button>
      </div>

      {resultText && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button type="button" onClick={() => speak(resultText)}>🔊 Listen</button>
            <button type="button" onClick={() => navigator.clipboard.writeText(resultText).then(() => onToast("Result copied!", "success"))}>📋 Copy</button>
          </div>
          <pre style={{ whiteSpace: "pre-wrap", color: "var(--ink)", margin: 0 }}>{resultText}</pre>
        </div>
      )}
    </section>
  );
};
