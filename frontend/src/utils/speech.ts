let isSpeaking = false;
let onStateChangeCallback: ((speaking: boolean) => void) | null = null;

export function registerSpeechListener(callback: (speaking: boolean) => void) {
  onStateChangeCallback = callback;
}

export function isSpeechActive(): boolean {
  return isSpeaking;
}

export function speak(text: string, rate: number = 0.92, pitch: number = 1.0): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis is not supported on this browser.");
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    if (!text || !text.trim()) {
      isSpeaking = false;
      if (onStateChangeCallback) onStateChangeCallback(false);
      resolve();
      return;
    }

    // Clean markdown, HTML and special characters
    const cleanText = text
      .replace(/<[^>]*>/g, " ")
      .replace(/[*#_`~[\]()]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Pick a natural, pleasant voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => (v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Serena")))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
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

    utterance.onerror = () => {
      isSpeaking = false;
      if (onStateChangeCallback) onStateChangeCallback(false);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  isSpeaking = false;
  if (onStateChangeCallback) onStateChangeCallback(false);
}
