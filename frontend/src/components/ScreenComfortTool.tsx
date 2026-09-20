import React, { useState, useEffect } from "react";
import { playRewardChime, playTogglePop } from "../utils/audioChime";
import { speak } from "../utils/speech";

interface ScreenComfortToolProps {
  onToast: (message: string, type?: "info" | "success" | "error") => void;
  onSelectImageId?: (id: string) => void;
}

export const ScreenComfortTool: React.FC<ScreenComfortToolProps> = ({ onToast, onSelectImageId }) => {
  const [amberTintActive, setAmberTintActive] = useState<boolean>(false);
  const [amberIntensity, setAmberIntensity] = useState<number>(25); // percentage
  const [is202020Running, setIs202020Running] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(20);
  const [doomscrollActive, setDoomscrollActive] = useState<boolean>(false);

  // Apply or remove amber tint overlay on document body
  useEffect(() => {
    let overlay = document.getElementById("neurosafe-amber-overlay");
    if (amberTintActive) {
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "neurosafe-amber-overlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.pointerEvents = "none";
        overlay.style.zIndex = "99998";
        overlay.style.transition = "background-color 0.25s ease";
        document.body.appendChild(overlay);
      }
      overlay.style.backgroundColor = `rgba(255, 174, 66, ${amberIntensity / 100 * 0.45})`;
    } else {
      if (overlay) {
        overlay.remove();
      }
    }
    return () => {
      const existing = document.getElementById("neurosafe-amber-overlay");
      if (existing && !amberTintActive) existing.remove();
    };
  }, [amberTintActive, amberIntensity]);

  // 20-20-20 Timer Loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (is202020Running && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (is202020Running && secondsRemaining === 0) {
      setIs202020Running(false);
      playRewardChime(0.25);
      onToast("✨ 20-second eye rest complete! Your optic nerves thank you.", "success");
      speak("20-second eye rest complete. Gently open your eyes and blink softly.");
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [is202020Running, secondsRemaining]);

  const handleStart202020 = () => {
    setSecondsRemaining(20);
    setIs202020Running(true);
    playTogglePop(true);
    onToast("🕒 Starting 20-second eye rest. Look at something 20 feet away or close your eyes.", "info");
    speak("Starting 20-second screen rest. Look away from the display or gently cup your warm palms over closed eyes.");
  };

  const handleStop202020 = () => {
    setIs202020Running(false);
    setSecondsRemaining(20);
    playTogglePop(false);
  };

  return (
    <div
      id="screen-comfort-sanctuary"
      style={{
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 16
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1.3rem" }}>🖥️</span>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--ink)" }}>
              Digital Screen & Eye Strain Sanctuary
            </h3>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "var(--ink-secondary)", maxWidth: "620px" }}>
            Autistic photophobia and ADHD screen fatigue support: soften harsh blue-light glare with an amber wash, execute guided 20-20-20 optic nerve resets, or snap out of doomscroll loops.
          </p>
        </div>

        {/* Amber Tint Indicator Badge */}
        <span
          style={{
            background: amberTintActive ? "#fffae8" : "var(--paper)",
            border: amberTintActive ? "1px solid #d49c24" : "1px solid var(--line)",
            color: amberTintActive ? "#a06c00" : "var(--ink-secondary)",
            padding: "4px 12px",
            borderRadius: "var(--radius-pill)",
            fontSize: "0.8rem",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <span>{amberTintActive ? "🌙 Amber Screen Rest Active" : "☀️ Standard Screen"}</span>
        </span>
      </div>

      {/* Grid of 3 Screen Interventions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14
        }}
      >
        {/* 1. Amber Glow Filter */}
        <div
          style={{
            background: "var(--paper)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-md)",
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            gap: 10
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontSize: "0.9rem", color: "var(--ink)" }}>
              🌙 Amber Rest Filter (2700K)
            </strong>
            <button
              type="button"
              onClick={() => {
                const next = !amberTintActive;
                setAmberTintActive(next);
                playTogglePop(next);
                onToast(next ? "🌙 Amber rest filter turned ON" : "☀️ Amber filter turned OFF", "info");
              }}
              style={{
                padding: "4px 12px",
                borderRadius: "var(--radius-pill)",
                background: amberTintActive ? "#f6a623" : "var(--card)",
                color: amberTintActive ? "#fff" : "var(--ink)",
                border: "1px solid var(--line)",
                fontWeight: 700,
                fontSize: "0.78rem",
                cursor: "pointer"
              }}
            >
              {amberTintActive ? "Enabled" : "Turn On"}
            </button>
          </div>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ink-secondary)", lineHeight: 1.45 }}>
            Adds a gentle, warm amber hue over the entire window to shield against high-contrast eye fatigue and fluorescent blue glare.
          </p>

          {amberTintActive && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", color: "var(--ink-secondary)" }}>
                <span>Warmth Depth</span>
                <span>{amberIntensity}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={55}
                value={amberIntensity}
                onChange={(e) => setAmberIntensity(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#d49c24", cursor: "pointer" }}
              />
            </div>
          )}
        </div>

        {/* 2. 20-20-20 Optic Nerve Reset */}
        <div
          style={{
            background: "var(--paper)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-md)",
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            gap: 10
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontSize: "0.9rem", color: "var(--ink)" }}>
              👁️ 20-20-20 Guided Eye Rest
            </strong>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: is202020Running ? "var(--green)" : "var(--muted)"
              }}
            >
              {is202020Running ? `${secondsRemaining}s left` : "Ready"}
            </span>
          </div>

          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ink-secondary)", lineHeight: 1.45 }}>
            Every 20 mins, look 20 feet away for 20 seconds or cup warm palms over closed eyes for pure restful darkness.
          </p>

          {is202020Running ? (
            <div
              style={{
                background: "var(--mint-light)",
                border: "1px solid var(--mint)",
                borderRadius: "var(--radius-sm)",
                padding: "8px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "1.1rem" }}>🧘</span>
                <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--green)" }}>
                  Eyes closed or looking away…
                </span>
              </div>
              <button
                type="button"
                onClick={handleStop202020}
                style={{
                  padding: "4px 8px",
                  borderRadius: "var(--radius-pill)",
                  background: "transparent",
                  border: "1px solid var(--line)",
                  fontSize: "0.74rem",
                  cursor: "pointer",
                  color: "var(--ink-secondary)"
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStart202020}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-pill)",
                background: "var(--green)",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6
              }}
            >
              <span>⏱️</span>
              <span>Start 20-Second Eye Rest</span>
            </button>
          )}
        </div>

        {/* 3. Doomscroll & Infinite Loop Interrupt */}
        <div
          style={{
            background: "var(--paper)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-md)",
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            gap: 10
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontSize: "0.9rem", color: "var(--ink)" }}>
              🛑 Doomscroll Pattern Interrupt
            </strong>
            <button
              type="button"
              onClick={() => {
                setDoomscrollActive(true);
                playTogglePop(true);
              }}
              style={{
                padding: "4px 12px",
                borderRadius: "var(--radius-pill)",
                background: "#d94168",
                color: "#fff",
                border: "none",
                fontWeight: 700,
                fontSize: "0.78rem",
                cursor: "pointer"
              }}
            >
              Snap Out
            </button>
          </div>

          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ink-secondary)", lineHeight: 1.45 }}>
            Trapped in an infinite scrolling loop or hyperfocus screen lock? Trigger an immediate somatic grounding pause.
          </p>

          {onSelectImageId && (
            <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
              <button
                type="button"
                onClick={() => onSelectImageId("guide-doomscroll-interrupt")}
                style={{
                  flex: 1,
                  padding: "5px 8px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  fontSize: "0.74rem",
                  color: "var(--ink)",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                View Loop Card
              </button>
              <button
                type="button"
                onClick={() => onSelectImageId("card-screen-break")}
                style={{
                  flex: 1,
                  padding: "5px 8px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  fontSize: "0.74rem",
                  color: "var(--ink)",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Screen Break AAC
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Doomscroll Interrupt Modal */}
      {doomscrollActive && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Doomscroll Pattern Interrupt"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(18, 12, 16, 0.88)",
            backdropFilter: "blur(8px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
          onClick={() => setDoomscrollActive(false)}
        >
          <div
            style={{
              background: "#24121a",
              color: "#ffeff4",
              borderRadius: "var(--radius-lg)",
              maxWidth: "520px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              border: "2px solid #d94168",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: 16
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: "3rem" }}>🛑</div>
            <div>
              <h2 style={{ margin: "0 0 6px 0", fontSize: "1.4rem", color: "#ffccd8" }}>
                Screen Loop Interrupt
              </h2>
              <p style={{ margin: 0, fontSize: "0.95rem", color: "#e8b8c4", lineHeight: 1.5 }}>
                You are safe. You did not miss anything important. Your dopamine receptors are stuck in a refresh loop.
              </p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: "var(--radius-md)",
                padding: "14px",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                fontSize: "0.88rem"
              }}
            >
              <div>🦶 <strong>1. Feel your feet:</strong> Push your heels firmly into the floor.</div>
              <div>📱 <strong>2. Set device down:</strong> Turn the glass face-down for 60 seconds.</div>
              <div>🫁 <strong>3. Unclench jaw:</strong> Drop your tongue from the roof of your mouth.</div>
              <div>💧 <strong>4. Hydrate:</strong> Take a sip of water or wash your face.</div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  speak("Pattern interrupt complete. You are grounded. Place your device face down and take a gentle sip of water.");
                  onToast("You did great. Step away from the screen.", "success");
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "var(--radius-md)",
                  background: "transparent",
                  color: "#ffccd8",
                  border: "1px solid #d94168",
                  fontWeight: 600,
                  fontSize: "0.86rem",
                  cursor: "pointer"
                }}
              >
                🔊 Read Aloud
              </button>
              <button
                type="button"
                onClick={() => setDoomscrollActive(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "var(--radius-md)",
                  background: "#d94168",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.86rem",
                  cursor: "pointer"
                }}
              >
                I'm Back in the Room ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
