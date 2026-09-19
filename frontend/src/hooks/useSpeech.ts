import { useCallback, useEffect, useState } from "react";

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);

  const stop = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, rate = 0.95) => {
      if (!("speechSynthesis" in window)) return false;
      if (!text.trim()) return false;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        text.replace(/<[^>]*>/g, " ").replace(/[*#_`]/g, ""),
      );
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      return true;
    },
    [],
  );

  useEffect(() => () => stop(), [stop]);

  return { speaking, speak, stop };
}
