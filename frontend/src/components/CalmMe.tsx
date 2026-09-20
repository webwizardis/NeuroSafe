import React, { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { speak } from "../utils/speech";

interface CalmMeProps {
  onToast: (message: string, type?: "info" | "success" | "error") => void;
  lowStimulation?: boolean;
}

export const CalmMe: React.FC<CalmMeProps> = ({ onToast, lowStimulation }) => {
  const [steps, setSteps] = useState<string[]>([
    "Pause and notice one soothing thing you can see right now.",
    "Take one slow, unhurried breath in through your nose and softly out.",
    "Unclench your jaw, soften your eyelids, and let your shoulders drop.",
    "Choose just one small, gentle next step. You have plenty of time."
  ]);
  const [disclaimer, setDisclaimer] = useState<string>("This is a grounding sensory tool, not medical advice.");
  const [loading, setLoading] = useState(false);

  // Box Breathing Exercise State
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Rest">("Inhale");
  const [phaseSeconds, setPhaseSeconds] = useState(4);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!breathActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      setPhaseSeconds(4);
      return;
    }

    timerRef.current = setInterval(() => {
      setPhaseSeconds((prev) => {
        if (prev > 1) return prev - 1;

        // Transition phases
        setBreathPhase((curr) => {
          if (curr === "Inhale") return "Hold";
          if (curr === "Hold") return "Exhale";
          if (curr === "Exhale") return "Rest";
          return "Inhale";
        });
        return 4;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [breathActive]);

  const handleRefreshCalm = async () => {
    setLoading(true);
    try {
      const data = await api.getCalm();
      if (data && data.steps) {
        setSteps(data.steps);
        if (data.disclaimer) setDisclaimer(data.disclaimer);
        onToast("Grounding sequence refreshed", "info");
      }
    } catch (err: any) {
      onToast(err.message || "Failed to load calm steps.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakSteps = () => {
    const text = `Grounding sequence: ${steps.join(". ")}`;
    speak(text, 0.85);
    onToast("🔊 Guiding calm breath aloud…", "info");
  };

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        boxShadow: "var(--shadow-sm)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.4rem" }}>🌿</span>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--ink)" }}>
            Calm Me & Grounding Pause
          </h2>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={handleSpeakSteps}
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-pill)",
              background: "var(--peach-200)",
              color: "var(--peach-900)",
              border: "none",
              fontWeight: 600,
              fontSize: "0.82rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <span>🔊</span>
            <span>Listen</span>
          </button>
          <button
            type="button"
            onClick={handleRefreshCalm}
            disabled={loading}
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-pill)",
              background: "var(--paper)",
              color: "var(--ink)",
              border: "1px solid var(--line)",
              fontWeight: 600,
              fontSize: "0.82rem",
              cursor: "pointer"
            }}
          >
            {loading ? "Refreshing…" : "🔄 Refresh Steps"}
          </button>
        </div>
      </div>

      {/* Interactive Box Breathing Circle */}
      <div
        style={{
          background: "var(--spring-mint-100)",
          border: "1px solid var(--spring-mint-200)",
          borderRadius: "var(--radius-md)",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          marginBottom: 20
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "var(--card)",
            border: "3px solid var(--spring-green-700)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: lowStimulation ? "none" : "0 4px 18px rgba(37,102,82,0.12)",
            transform: !lowStimulation && breathActive && breathPhase === "Inhale"
              ? "scale(1.12)"
              : !lowStimulation && breathActive && breathPhase === "Exhale"
              ? "scale(0.92)"
              : "scale(1)",
            transition: lowStimulation ? "none" : "transform 3.8s ease-in-out"
          }}
        >
          <span
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--spring-green-800)"
            }}
          >
            {breathActive ? breathPhase : "Box Breath"}
          </span>
          <span
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--spring-green-900)",
              lineHeight: 1.1
            }}
          >
            {breathActive ? phaseSeconds : "4-4-4"}
          </span>
          <span style={{ fontSize: "0.74rem", color: "var(--ink-secondary)" }}>
            {breathActive ? "seconds" : "Ready"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setBreathActive(!breathActive)}
          style={{
            padding: "8px 20px",
            borderRadius: "var(--radius-pill)",
            background: breathActive ? "var(--peach-200)" : "var(--spring-green-700)",
            color: breathActive ? "var(--peach-900)" : "#ffffff",
            border: "none",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: "pointer"
          }}
        >
          {breathActive ? "⏸ Pause Breath Guide" : "▶️ Start 4-4-4 Box Breathing"}
        </button>
      </div>

      {/* Grounding steps list */}
      <ol
        style={{
          margin: 0,
          paddingLeft: 24,
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}
      >
        {steps.map((step, idx) => (
          <li
            key={idx}
            style={{
              fontSize: "0.96rem",
              lineHeight: 1.55,
              color: "var(--ink)"
            }}
          >
            {step}
          </li>
        ))}
      </ol>

      <div
        style={{
          marginTop: 18,
          paddingTop: 12,
          borderTop: "1px solid var(--line)",
          fontSize: "0.8rem",
          color: "var(--ink-secondary)"
        }}
      >
        💡 {disclaimer}
      </div>
    </div>
  );
};
