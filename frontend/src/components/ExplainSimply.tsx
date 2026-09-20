import React, { useState } from "react";
import { api } from "../services/api";
import { speak } from "../utils/speech";

interface ExplainSimplyProps {
  onToast: (message: string, type?: "info" | "success" | "error") => void;
  readAloudDefault?: boolean;
}

const PRESET_EXAMPLES = [
  {
    label: "Medical Notice",
    text: "The patient demonstrates symptoms consistent with cervical spondylosis manifesting in paraspinal tenderness, necessitating therapeutic physical rehabilitation and anti-inflammatory regimens."
  },
  {
    label: "Legal / Policy",
    text: "Pursuant to section 4(b) of the indemnification agreement, the licensee shall hold harmless and defend the licensor against any and all liabilities arising out of willful misconduct or negligence."
  },
  {
    label: "Work Email",
    text: "Per our sync regarding project synergy, we need to reprioritize downstream deliverables and recalibrate resource allocation to ensure optimal ROI by Q3."
  }
];

export const ExplainSimply: React.FC<ExplainSimplyProps> = ({ onToast, readAloudDefault }) => {
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState("plain_language");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleExplain = async () => {
    if (!inputText.trim()) {
      onToast("Please enter or paste text to explain.", "info");
      return;
    }

    setLoading(true);
    try {
      const data = await api.explainText(inputText.trim(), mode);
      setResult(data.text);
      onToast("Text translated into clear language!", "success");
      if (readAloudDefault && data.text) {
        speak(data.text);
      }
    } catch (err: any) {
      onToast(err.message || "Failed to explain text.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    onToast("Copied to clipboard! 📋", "success");
  };

  const handleSpeak = () => {
    if (!result) return;
    speak(result);
    onToast("🔊 Reading explanation aloud…", "info");
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
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: "1.4rem" }}>💡</span>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--ink)" }}>
          Explain Simply
        </h2>
      </div>

      <p style={{ margin: "0 0 16px 0", fontSize: "0.88rem", color: "var(--ink-secondary)" }}>
        Strip away jargon, confusing legal phrases, or dense corporate emails into plain, calm
        meaning.
      </p>

      {/* Preset Chips */}
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
          Try example:
        </span>
        {PRESET_EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => setInputText(ex.text)}
            style={{
              padding: "4px 10px",
              borderRadius: "var(--radius-pill)",
              background: "var(--paper-peach)",
              border: "1px solid var(--peach-200)",
              color: "var(--peach-900)",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            {ex.label}
          </button>
        ))}
      </div>

      <textarea
        rows={3}
        placeholder="Paste confusing letter, email, doctor note, or contract clause here…"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--line)",
          background: "var(--paper)",
          color: "var(--ink)",
          fontSize: "0.95rem",
          lineHeight: 1.5,
          resize: "vertical",
          minHeight: 90,
          marginBottom: 14
        }}
      />

      {/* Mode Selector and Submit */}
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
          <label htmlFor="explain-mode-select" style={{ fontSize: "0.86rem", color: "var(--ink-secondary)", margin: 0 }}>
            Style:
          </label>
          <select
            id="explain-mode-select"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
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
            <option value="plain_language">Plain Language</option>
            <option value="bullet_summary">3-Bullet Summary</option>
            <option value="action_items">What do I need to do?</option>
            <option value="eli5">Ultra-Simple (No Jargon)</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleExplain}
          disabled={loading}
          style={{
            padding: "10px 18px",
            borderRadius: "var(--radius-md)",
            background: "var(--spring-green-700)",
            color: "#ffffff",
            border: "none",
            fontWeight: 600,
            fontSize: "0.92rem",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            opacity: loading ? 0.7 : 1
          }}
        >
          <span>✨</span>
          <span>{loading ? "Translating…" : "Explain Simply"}</span>
        </button>
      </div>

      {/* Result Card */}
      {result && (
        <div
          style={{
            marginTop: 18,
            padding: "16px",
            background: "var(--spring-mint-100)",
            border: "1px solid var(--spring-mint-300)",
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
              Clear Meaning:
            </strong>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={handleSpeak}
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
                🔊 Speak
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
            </div>
          </div>
          <div
            style={{
              whiteSpace: "pre-wrap",
              fontSize: "0.94rem",
              lineHeight: 1.6,
              color: "var(--ink)"
            }}
          >
            {result}
          </div>
        </div>
      )}
    </div>
  );
};
