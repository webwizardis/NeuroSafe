// Web Speech API wrapper for NeuroSafe auditory accommodations

let isSpeaking = false;
let onStateChangeCallback: ((speaking: boolean) => void) | null = null;

// Eager voice loader for Chrome / Safari / Edge
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

export function registerSpeechListener(callback: (speaking: boolean) => void) {
  onStateChangeCallback = callback;
}

export function isSpeechActive(): boolean {
  return isSpeaking;
}

export function speak(text: string, rate: number = 0.95, pitch: number = 1.0): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.warn("Speech synthesis is not supported on this device/browser.");
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }

    if (!text || !text.trim()) {
      isSpeaking = false;
      if (onStateChangeCallback) onStateChangeCallback(false);
      resolve();
      return;
    }

    // Clean markdown, symbols, emojis, and special characters
    const cleanText = text
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F100}-\u{1F1FF}]/gu, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/[*#_`~[\]()✓✔▲▼✕✖★☆•·]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1.0;

    // Pick natural voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Samantha") ||
            v.name.includes("Karen") ||
            v.name.includes("Daniel") ||
            v.name.includes("Serena"))
      ) || voices.find((v) => v.lang.startsWith("en")) || voices[0];

      if (preferred) {
        utterance.voice = preferred;
      }
    }

    utterance.onstart = () => {
      isSpeaking = true;
      if (onStateChangeCallback) onStateChangeCallback(true);
    };

    utterance.onend = () => {
      isSpeaking = false;
      if (onStateChangeCallback) onStateChangeCallback(false);
      resolve();
    };

    utterance.onerror = (e) => {
      // Interrupted error is normal when cancelling previous speech
      isSpeaking = false;
      if (onStateChangeCallback) onStateChangeCallback(false);
      resolve();
    };

    // Ensure speech synthesis is active and unpaused in Chrome/Safari iframe
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);

    // Chrome iframe audio watch dog
    const checker = setInterval(() => {
      if (!isSpeaking) {
        clearInterval(checker);
      } else if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 800);
  });
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
  isSpeaking = false;
  if (onStateChangeCallback) onStateChangeCallback(false);
}
