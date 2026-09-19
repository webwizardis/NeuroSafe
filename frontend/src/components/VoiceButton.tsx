import { useSpeech } from "../hooks/useSpeech";

export function VoiceButton({ text, label = "Read aloud" }: { text: string; label?: string }) {
  const { speaking, speak, stop } = useSpeech();
  if (!text.trim()) return null;

  return (
    <button
      className="secondary-button voice-button"
      onClick={() => (speaking ? stop() : speak(text))}
      aria-label={speaking ? "Stop reading" : label}
    >
      {speaking ? "■ Stop" : "🔊 Read aloud"}
    </button>
  );
}
