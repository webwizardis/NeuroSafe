import React, { useState } from "react";
import { speak, stopSpeaking } from "../utils/speech";
import { playTogglePop } from "../utils/audioChime";

interface ReadingRulerToolProps {
  onToast: (message: string, type?: "info" | "success" | "error") => void;
}

const PRESET_TEXTS: { [key: string]: { label: string; text: string } } = {
  memo: {
    label: "Dense Work Memo",
    text: "Please be advised that pursuant to the upcoming quarterly transition beginning next Monday, all project documentation across all department sub-folders must be synchronized and cross-referenced with the internal database before 5:00 PM Thursday, and any discrepancies involving client onboarding credentials must be flagged through the automated ticketing channel with an accompanying audit trail so that our external security evaluation team can finalize the compliance verification review without delaying deployment schedule."
  },
  policy: {
    label: "Complex Policy Notice",
    text: "In accordance with updated institutional regulatory guidelines, individuals seeking sensory accommodation or modified scheduling arrangements are requested to submit form 42-B alongside supporting self-attestation or clinical documentation at least fourteen business days prior to the commencement of the scheduled operational cycle, whereupon the accessibility review committee will schedule a preliminary digital or asynchronous consultation to evaluate assistive technologies, lighting adjustments, and communication protocols."
  },
  assignment: {
    label: "Unstructured Task Instructions",
    text: "Before beginning your analysis, carefully review chapters four through seven of the manual, extract all relevant diagnostic indicators regarding sensory thresholds, draft a preliminary three-page summary outlining five distinct accommodations for neurodivergent individuals in high-sensory environments, compile supporting bibliography citations using standardized format, and email the completed package to the coordinator by tomorrow afternoon."
  }
};

export const ReadingRulerTool: React.FC<ReadingRulerToolProps> = ({ onToast }) => {
  const [inputText, setInputText] = useState<string>(PRESET_TEXTS.memo.text);
  const [activePreset, setActivePreset] = useState<string>("memo");
  const [activeLineIndex, setActiveLineIndex] = useState<number>(0);
  const [bionicBolding, setBionicBolding] = useState<boolean>(true);
  const [showDeconstruction, setShowDeconstruction] = useState<boolean>(false);
  const [readingSpeed, setReadingSpeed] = useState<"normal" | "slow">("normal");

  // Break text into sentences/clauses for line-by-line focus
  const sentences = inputText
    .replace(/([.?!])\s*(?=[A-Z0-9])/g, "$1|")
    .split("|")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const activeSentence = sentences[activeLineIndex] || sentences[0] || "";

  // Helper for ADHD Bionic anchor bolding
  const renderBionicText = (text: string) => {
    if (!bionicBolding) return text;
    const words = text.split(" ");
    return words.map((word, wIdx) => {
      if (word.length <= 1) return <span key={wIdx}>{word} </span>;
      const mid = Math.ceil(word.length * 0.45);
      const boldPart = word.slice(0, mid);
      const restPart = word.slice(mid);
      return (
        <span key={wIdx}>
          <strong style={{ fontWeight: 800, color: "var(--ink)" }}>{boldPart}</strong>
          <span style={{ color: "var(--ink-secondary)" }}>{restPart}</span>{" "}
        </span>
      );
    });
  };

  // Generate 3 concise digestible bullets from sentences
  const generateDeconstructedBullets = () => {
    if (sentences.length === 0) return [];
    if (sentences.length === 1) {
      return [
        { label: "Core Action", text: sentences[0] },
        { label: "Takeaway", text: "Take one step at a time without rushing." },
        { label: "Pacing", text: "Pause and check if you need clarification." }
      ];
    }
    const part1 = sentences[0];
    const part2 = sentences[Math.floor(sentences.length / 2)];
    const part3 = sentences[sentences.length - 1];
    return [
      { label: "1. Main Purpose", text: part1 },
      { label: "2. Key Requirement", text: part2 },
      { label: "3. Final Deadline / Output", text: part3 }
    ];
  };

  const bullets = generateDeconstructedBullets();

  const handleSelectPreset = (key: string) => {
    setActivePreset(key);
    setInputText(PRESET_TEXTS[key].text);
    setActiveLineIndex(0);
    playTogglePop(true);
  };

  const handlePrevLine = () => {
    setActiveLineIndex((prev) => (prev > 0 ? prev - 1 : sentences.length - 1));
    playTogglePop(false);
  };

  const handleNextLine = () => {
    setActiveLineIndex((prev) => (prev < sentences.length - 1 ? prev + 1 : 0));
    playTogglePop(true);
  };

  const handleReadActiveLine = () => {
    if (!activeSentence) return;
    speak(activeSentence);
    onToast("🔊 Reading isolated line aloud…", "info");
  };

  const handleReadSummary = () => {
    const summaryText = bullets.map((b) => `${b.label}: ${b.text}`).join(". ");
    speak(summaryText);
    onToast("🔊 Reading 3-bullet deconstruction aloud…", "info");
  };

  const handleCopySummary = () => {
    const textToCopy = bullets.map((b) => `• ${b.label}: ${b.text}`).join("\n");
    navigator.clipboard.writeText(textToCopy);
    onToast("Deconstructed summary copied to clipboard! 📋", "success");
  };

  return (
    <div
      id="reading-ruler-deconstructor"
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
      {/* Header & Concept */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1.3rem" }}>📖</span>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--ink)" }}>
              Interactive Reading Ruler & Wall of Text Deconstructor
            </h3>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "var(--ink-secondary)", maxWidth: "620px" }}>
            Overcome reading freeze, eye-skipping, and working memory fatigue. Dim out surrounding paragraphs, anchor gaze on initial letters, and unpack dense text into 3 clean points.
          </p>
        </div>

        {/* Action Toggles */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => {
              setBionicBolding(!bionicBolding);
              playTogglePop(!bionicBolding);
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-pill)",
              background: bionicBolding ? "var(--mint-light)" : "var(--paper)",
              border: bionicBolding ? "1px solid var(--green)" : "1px solid var(--line)",
              color: bionicBolding ? "var(--green)" : "var(--ink-secondary)",
              fontWeight: 600,
              fontSize: "0.8rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5
            }}
          >
            <span>🔤</span>
            <span>{bionicBolding ? "Bionic Bolding: ON" : "Bionic Bolding: OFF"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowDeconstruction(!showDeconstruction);
              playTogglePop(!showDeconstruction);
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-pill)",
              background: showDeconstruction ? "var(--mint-light)" : "var(--paper)",
              border: showDeconstruction ? "1px solid var(--green)" : "1px solid var(--line)",
              color: showDeconstruction ? "var(--green)" : "var(--ink-secondary)",
              fontWeight: 600,
              fontSize: "0.8rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5
            }}
          >
            <span>📋</span>
            <span>{showDeconstruction ? "Show Full Text" : "Deconstruct to 3 Bullets"}</span>
          </button>
        </div>
      </div>

      {/* Preset Selector & Custom Input Bar */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          background: "var(--paper)",
          padding: "8px 12px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--line)"
        }}
      >
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink-secondary)" }}>
          Try Sample Wall of Text:
        </span>
        {Object.entries(PRESET_TEXTS).map(([key, item]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleSelectPreset(key)}
            style={{
              padding: "4px 10px",
              borderRadius: "var(--radius-pill)",
              border: "none",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              background: activePreset === key ? "var(--green)" : "var(--card)",
              color: activePreset === key ? "#ffffff" : "var(--ink)",
              transition: "all 0.15s ease"
            }}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setActivePreset("custom");
            setInputText("");
            setActiveLineIndex(0);
          }}
          style={{
            padding: "4px 10px",
            borderRadius: "var(--radius-pill)",
            border: "1px dashed var(--line)",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: "pointer",
            background: activePreset === "custom" ? "var(--mint-light)" : "transparent",
            color: "var(--ink-secondary)"
          }}
        >
          ✏️ Paste My Own Text
        </button>
      </div>

      {/* Editable input if custom */}
      {activePreset === "custom" && (
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
            Paste any dense paragraph or article snippet below:
          </label>
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setActiveLineIndex(0);
            }}
            placeholder="Paste your dense wall of text here to activate the Reading Ruler and 3-bullet breakdown…"
            rows={4}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              color: "var(--ink)",
              fontSize: "0.88rem",
              fontFamily: "inherit",
              resize: "vertical"
            }}
          />
        </div>
      )}

      {/* Deconstructed 3-Bullet View OR Reading Ruler Focus View */}
      {showDeconstruction ? (
        <div
          style={{
            background: "var(--mint-light)",
            border: "1.5px solid var(--mint)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--green)", textTransform: "uppercase" }}>
              ✨ 3-Bullet Executive Digest (Zero Cognitive Overload)
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={handleReadSummary}
                style={{
                  padding: "4px 10px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--green)",
                  color: "#fff",
                  border: "none",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                🔊 Read Bullets
              </button>
              <button
                type="button"
                onClick={handleCopySummary}
                style={{
                  padding: "4px 10px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  color: "var(--ink)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                📋 Copy
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {bullets.map((b, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--card)",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--line)"
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.76rem",
                    fontWeight: 800,
                    color: "var(--green)",
                    marginBottom: 4
                  }}
                >
                  {b.label}
                </span>
                <p style={{ margin: 0, fontSize: "0.92rem", lineHeight: 1.55 }}>
                  {renderBionicText(b.text)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Reading Ruler Active Container */
        <div
          style={{
            background: "var(--paper)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}
        >
          {/* Ruler Navigation Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
              borderBottom: "1px solid var(--line)",
              paddingBottom: 10
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  background: "var(--mint)",
                  color: "var(--green)",
                  padding: "3px 8px",
                  borderRadius: "var(--radius-pill)"
                }}
              >
                Line {activeLineIndex + 1} of {Math.max(sentences.length, 1)}
              </span>
              <span style={{ fontSize: "0.76rem", color: "var(--muted)" }}>
                Click any line below or use buttons
              </span>
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={handlePrevLine}
                disabled={sentences.length <= 1}
                style={{
                  padding: "5px 12px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  color: "var(--ink)",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  cursor: "pointer"
                }}
              >
                ▲ Previous Line
              </button>
              <button
                type="button"
                onClick={handleNextLine}
                disabled={sentences.length <= 1}
                style={{
                  padding: "5px 12px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--green)",
                  color: "#fff",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  cursor: "pointer"
                }}
              >
                Next Line ▼
              </button>
              <button
                type="button"
                onClick={handleReadActiveLine}
                style={{
                  padding: "5px 10px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--mint-light)",
                  color: "var(--green)",
                  border: "1px solid var(--mint)",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  cursor: "pointer"
                }}
              >
                🔊 Speak Line
              </button>
              <button
                type="button"
                onClick={() => stopSpeaking()}
                style={{
                  padding: "5px 8px",
                  borderRadius: "var(--radius-pill)",
                  background: "transparent",
                  border: "1px solid var(--line)",
                  color: "var(--ink-secondary)",
                  fontSize: "0.78rem",
                  cursor: "pointer"
                }}
              >
                Stop
              </button>
            </div>
          </div>

          {/* Interactive Line-by-Line Presentation */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sentences.map((sent, idx) => {
              const isFocused = idx === activeLineIndex;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveLineIndex(idx);
                    playTogglePop(true);
                  }}
                  style={{
                    padding: isFocused ? "10px 14px" : "6px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: isFocused ? "var(--card)" : "transparent",
                    border: isFocused ? "2px solid var(--green)" : "1px solid transparent",
                    boxShadow: isFocused ? "0 4px 12px rgba(47, 122, 98, 0.12)" : "none",
                    opacity: isFocused ? 1 : 0.42,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    transform: isFocused ? "scale(1.01)" : "none"
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: isFocused ? "var(--green)" : "var(--muted)",
                      marginRight: 8
                    }}
                  >
                    {idx + 1}.
                  </span>
                  <span
                    style={{
                      fontSize: isFocused ? "1.02rem" : "0.9rem",
                      lineHeight: 1.6,
                      color: isFocused ? "var(--ink)" : "var(--muted)"
                    }}
                  >
                    {renderBionicText(sent)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
