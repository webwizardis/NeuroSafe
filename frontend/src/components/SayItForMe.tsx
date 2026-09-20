import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { speak, stopSpeaking, isSpeechActive } from "../utils/speech";
import { playRewardChime } from "../utils/audioChime";

interface SayItForMeProps {
  onToast: (message: string, type?: "info" | "success" | "error") => void;
  readAloudDefault?: boolean;
}

const PRESET_SITUATIONS = [
  "Decline social invite due to fatigue",
  "Ask manager for instructions in writing",
  "Request a quiet seating area",
  "Need 10 minutes outside for fresh air",
  "Clarify sensory overwhelm kindly"
];

const QUICK_SPEAK_PHRASES = [
  {
    label: "Sensory Pause",
    phrase: "I am experiencing sensory overload right now. I need 10 minutes in a quiet space."
  },
  {
    label: "Written Instructions",
    phrase: "Could you please send that to me in writing? It helps me process and follow through much better."
  },
  {
    label: "Fatigue Boundary",
    phrase: "Thank you for the invitation, but I am out of social battery today and need to rest."
  },
  {
    label: "Non-Verbal Support",
    phrase: "I am having difficulty speaking right now. Please communicate with me via text or give me a moment."
  }
];

export const SayItForMe: React.FC<SayItForMeProps> = ({ onToast, readAloudDefault }) => {
  const [intent, setIntent] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("gentle_polite");
  const [loading, setLoading] = useState(false);
  const [draftResult, setDraftResult] = useState<string | null>(null);
  const [rewardEarned, setRewardEarned] = useState(false);
  const [peaceTokens, setPeaceTokens] = useState<number>(() => {
    const saved = localStorage.getItem("neurosafe_peace_tokens");
    return saved ? parseInt(saved, 10) : 1;
  });

  const handleDraft = async () => {
    if (!intent.trim()) {
      onToast("Please describe what you want to say.", "info");
      return;
    }

    setLoading(true);
    setRewardEarned(false);
    try {
      const data = await api.sayMessage(intent.trim(), context.trim() || null, tone);
      setDraftResult(data.text);
      onToast("Polite message drafted!", "success");
      if (readAloudDefault && data.text) {
        speak(data.text);
      }
    } catch (err: any) {
      onToast(err.message || "Failed to draft message.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!draftResult) return;
    navigator.clipboard.writeText(draftResult);
    onToast("Message copied to clipboard! 📋", "success");
  };

  const handleQuickSpeak = (phrase: string) => {
    speak(phrase);
    onToast(`🔊 Speaking phrase…`, "info");
  };

  const handleCompleteTask = () => {
    const newCount = peaceTokens + 1;
    setPeaceTokens(newCount);
    localStorage.setItem("neurosafe_peace_tokens", String(newCount));
    setRewardEarned(true);
    playRewardChime();
    onToast("🌟 Reward unlocked! Peace token awarded!", "success");
  };

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid #c7d2fe",
        borderTop: "4px solid #6366f1",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        boxShadow: "var(--shadow-sm)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.4rem" }}>💬</span>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#4338ca" }}>
            Say It For Me
          </h2>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#eef2ff",
            padding: "4px 12px",
            borderRadius: "var(--radius-pill)",
            border: "1px solid #c7d2fe",
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "#3730a3"
          }}
        >
          <span>🏅</span>
          <span>{peaceTokens} Peace Tokens</span>
        </div>
      </div>

      <p style={{ margin: "0 0 16px 0", fontSize: "0.88rem", color: "var(--ink-secondary)" }}>
        Draft kind, boundary-affirming messages without social burnout, or tap to speak instantly.
      </p>

      {/* Instant Quick Speak Buttons */}
      <div
        style={{
          background: "var(--peach-50)",
          border: "1px solid var(--peach-200)",
          borderRadius: "var(--radius-md)",
          padding: "14px 16px",
          marginBottom: 20
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8
          }}
        >
          <strong style={{ fontSize: "0.84rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--peach-900)" }}>
            Instant Voice Emergency Phrases (1-Tap):
          </strong>
          <button
            type="button"
            onClick={stopSpeaking}
            style={{
              padding: "3px 8px",
              borderRadius: "var(--radius-pill)",
              background: "transparent",
              border: "1px solid var(--peach-300)",
              color: "var(--danger)",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            ⏹ Stop Audio
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
          {QUICK_SPEAK_PHRASES.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleQuickSpeak(item.phrase)}
              style={{
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                background: "var(--card)",
                border: "1px solid var(--peach-300)",
                color: "var(--ink)",
                fontSize: "0.84rem",
                fontWeight: 600,
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span>🔊</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preset situation chips */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
          flexWrap: "wrap"
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "var(--ink-secondary)", fontWeight: 600 }}>
          Suggestions:
        </span>
        {PRESET_SITUATIONS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setIntent(preset)}
            style={{
              padding: "4px 10px",
              borderRadius: "var(--radius-pill)",
              background: "var(--paper)",
              border: "1px solid var(--line)",
              color: "var(--ink)",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            {preset}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
        <div>
          <label htmlFor="say-intent-input" style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: 4, color: "var(--ink)" }}>
            What would you like to express?
          </label>
          <input
            id="say-intent-input"
            type="text"
            placeholder="e.g. Say no politely to dinner because I'm overstimulated and need sleep"
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              color: "var(--ink)",
              fontSize: "0.95rem"
            }}
          />
        </div>

        <div>
          <label htmlFor="say-context-input" style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: 4, color: "var(--ink)" }}>
            Optional context or recipient:
          </label>
          <input
            id="say-context-input"
            type="text"
            placeholder="e.g. Close friend, work manager, family member"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              color: "var(--ink)",
              fontSize: "0.95rem"
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label htmlFor="say-tone-select" style={{ fontSize: "0.86rem", color: "var(--ink-secondary)", margin: 0 }}>
            Tone:
          </label>
          <select
            id="say-tone-select"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            style={{
              padding: "7px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--line)",
              background: "var(--card)",
              color: "var(--ink)",
              fontSize: "0.86rem",
              fontWeight: 500
            }}
          >
            <option value="gentle_polite">Gentle & Polite</option>
            <option value="firm_clear">Firm & Clear Boundary</option>
            <option value="work_professional">Workplace Professional</option>
            <option value="casual">Casual & Friendly</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleDraft}
          disabled={loading}
          style={{
            padding: "10px 18px",
            borderRadius: "var(--radius-md)",
            background: "#6366f1",
            color: "#ffffff",
            border: "none",
            fontWeight: 600,
            fontSize: "0.92rem",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            opacity: loading ? 0.7 : 1,
            boxShadow: "0 2px 6px rgba(99, 102, 241, 0.25)"
          }}
        >
          <span>✨</span>
          <span>{loading ? "Drafting…" : "Draft Polite Message"}</span>
        </button>
      </div>

      {draftResult && (
        <div
          style={{
            marginTop: 18,
            padding: "16px",
            background: "#eef2ff",
            border: "1px solid #c7d2fe",
            borderRadius: "var(--radius-md)"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10
            }}
          >
            <strong style={{ fontSize: "0.9rem", color: "var(--spring-green-900)" }}>
              Ready to Send:
            </strong>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={() => speak(draftResult)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--peach-200)",
                  color: "var(--peach-900)",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  cursor: "pointer"
                }}
              >
                🔊 Speak Aloud
              </button>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  padding: "5px 10px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--card)",
                  color: "var(--ink)",
                  border: "1px solid var(--line)",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  cursor: "pointer"
                }}
              >
                📋 Copy
              </button>
              <button
                type="button"
                id="say-complete-task-btn"
                onClick={handleCompleteTask}
                style={{
                  padding: "5px 12px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--spring-green-700)",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <span>🎉</span>
                <span>Sent / Done!</span>
              </button>
            </div>
          </div>
          <div
            style={{
              whiteSpace: "pre-wrap",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              color: "var(--ink)",
              marginBottom: rewardEarned ? 14 : 0
            }}
          >
            {draftResult}
          </div>

          {rewardEarned && (
            <div
              style={{
                marginTop: 14,
                padding: "16px 18px",
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, var(--spring-mint-100) 0%, var(--card) 100%)",
                border: "2px solid var(--spring-green-700)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8
              }}
            >
              <div style={{ fontSize: "2rem", lineHeight: 1 }}>✨ 🕊️ 🌟 🏅 🌸</div>
              <strong style={{ fontSize: "1.05rem", color: "var(--spring-green-900)" }}>
                Communication Victory! +1 Peace Token Awarded
              </strong>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--ink)", maxWidth: 500, lineHeight: 1.5 }}>
                You advocated for yourself with kindness and protected your personal energy. Stating what you need takes real courage, and you did it wonderfully!
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap", justifyContent: "center" }}>
                <span
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "var(--spring-green-800)",
                    background: "var(--spring-mint-200)",
                    padding: "4px 12px",
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--spring-mint-300)"
                  }}
                >
                  🏅 Total Peace Tokens: {peaceTokens}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRewardEarned(false);
                    setDraftResult(null);
                    setIntent("");
                  }}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "var(--radius-pill)",
                    background: "var(--spring-green-700)",
                    color: "#ffffff",
                    border: "none",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Draft Another Message ✨
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
