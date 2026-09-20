import React, { useState } from "react";
import {
  BookOpen,
  PenLine,
  Monitor,
  Sparkles,
  Loader2,
  CheckCircle2,
  Volume2,
  Copy
} from "lucide-react";
import { api } from "../services/api";
import { speak, stopSpeaking } from "../utils/speech";
import { ScreenComfortTool } from "./ScreenComfortTool";

interface ReadForMeProps {
  onToast: (message: string, type?: "info" | "success" | "error") => void;
  readAloudDefault?: boolean;
}

const PRESET_EXAMPLES = [
  {
    label: "Work Email (Idioms & Sarcasm)",
    text: "Hey team, just circling back on the deliverables. It’s not rocket science, but if we don't hit the ground running, we'll be behind the eight ball. Don't sweat it though, just touch base ASAP with your slide deck."
  },
  {
    label: "Vague Request (Unclear Deadline)",
    text: "Could you take a crack at reviewing the budget spreadsheet whenever you get a chance? No rush at all, but the sooner the better would be fantastic. Let me know if you run into any road blocks."
  },
  {
    label: "Dense Policy / Medical Notice",
    text: "Please be advised that your upcoming scheduled consultation requires completion of the intake questionnaires prior to arrival. Failure to produce required documentation will necessitate rescheduling at subsequent clinic availability."
  },
  {
    label: "Metaphorical Feedback",
    text: "Your presentation today was a double-edged sword. You hit a home run on the metrics, but you missed the forest for the trees on the big picture. Let's touch base next week to align our synergy."
  }
];

export const ReadForMe: React.FC<ReadForMeProps> = ({ onToast, readAloudDefault }) => {
  const [activeTab, setActiveTab] = useState<"rewriter" | "screen_comfort">("rewriter");
  const [inputText, setInputText] = useState("");
  const [rewrittenText, setRewrittenText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<"normal" | "large" | "xlarge">("normal");

  // Handle Autistic-Friendly Rewrite
  const handleRewrite = async (textToProcess?: string) => {
    const text = (textToProcess || inputText).trim();
    if (!text) {
      onToast("Please enter or paste text to rewrite.", "info");
      return;
    }

    setLoading(true);
    stopSpeaking();
    try {
      const data = await api.rewriteAutisticFriendly(text);
      const cleanResult = data.text?.trim() || "";
      setRewrittenText(cleanResult);
      onToast("Rewritten for easy reading!", "success");

      if (readAloudDefault && cleanResult) {
        speak(cleanResult);
      }
    } catch (err: any) {
      onToast(err.message || "Could not rewrite text. Please check connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!rewrittenText) return;
    navigator.clipboard.writeText(rewrittenText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onToast("Rewritten text copied to clipboard!", "success");
  };

  const handleSpeak = () => {
    if (!rewrittenText) return;
    speak(rewrittenText);
    onToast("Reading rewritten text aloud…", "info");
  };

  const handleClear = () => {
    setInputText("");
    setRewrittenText(null);
    stopSpeaking();
    onToast("Cleared input.", "info");
  };

  const handleSelectPreset = (exampleText: string) => {
    setInputText(exampleText);
    handleRewrite(exampleText);
  };

  // Split rewritten text into lines/headings/bullets
  const parsedLines = rewrittenText
    ? rewrittenText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
    : [];

  const fontSizeClass =
    fontSizeLevel === "xlarge" ? "1.18rem" : fontSizeLevel === "large" ? "1.06rem" : "0.95rem";
  const lineHeightVal = fontSizeLevel === "xlarge" ? 1.85 : fontSizeLevel === "large" ? 1.75 : 1.65;

  return (
    <div
      id="read-for-me-container"
      style={{
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: 18
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          borderBottom: "1px solid var(--line)",
          paddingBottom: 16
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "var(--radius-md)",
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <BookOpen size={20} color="var(--spring-green-800)" />
            </div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "var(--ink)" }}>
              Read for Me
            </h2>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "3px 10px",
                borderRadius: "var(--radius-pill)",
                background: "#ecfdf5",
                color: "#065f46",
                border: "1px solid #a7f3d0"
              }}
            >
              Reading Clarity
            </span>
          </div>
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: "0.86rem",
              color: "var(--ink-secondary)",
              maxWidth: "680px",
              lineHeight: 1.45
            }}
          >
            Rewrites confusing or overloaded text for easy autistic-friendly reading. Uses short literal sentences, simple words, clear headings, bullet points, and explicit instructions with zero idioms, sarcasm, ambiguity, or visual clutter.
          </p>
        </div>

        <div style={{ display: "flex", gap: 6, background: "var(--paper)", padding: 4, borderRadius: "var(--radius-md)", border: "1px solid var(--line)" }}>
          <button
            type="button"
            onClick={() => setActiveTab("rewriter")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              fontSize: "0.84rem",
              fontWeight: 700,
              cursor: "pointer",
              background: activeTab === "rewriter" ? "var(--card)" : "transparent",
              color: activeTab === "rewriter" ? "var(--spring-green-900)" : "var(--ink-secondary)",
              boxShadow: activeTab === "rewriter" ? "0 2px 4px rgba(0,0,0,0.06)" : "none"
            }}
          >
            <PenLine size={14} />
            <span>Text Rewriter</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("screen_comfort")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              fontSize: "0.84rem",
              fontWeight: 700,
              cursor: "pointer",
              background: activeTab === "screen_comfort" ? "var(--card)" : "transparent",
              color: activeTab === "screen_comfort" ? "var(--spring-green-900)" : "var(--ink-secondary)",
              boxShadow: activeTab === "screen_comfort" ? "0 2px 4px rgba(0,0,0,0.06)" : "none"
            }}
          >
            <Monitor size={14} />
            <span>Screen Comfort</span>
          </button>
        </div>
      </div>

      {activeTab === "rewriter" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Preset Example Buttons */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: "0.8rem", color: "var(--ink-secondary)", fontWeight: 600 }}>
                Try an example with idioms, ambiguity, or clutter:
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PRESET_EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => handleSelectPreset(ex.text)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "var(--radius-pill)",
                    background: "var(--paper)",
                    border: "1px solid var(--line)",
                    color: "var(--ink)",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--spring-green-700)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea Input Card */}
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
              <label
                htmlFor="autistic-input-text"
                style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--ink)" }}
              >
                Paste original text to rewrite:
              </label>
              {inputText.length > 0 && (
                <span style={{ fontSize: "0.78rem", color: "var(--ink-secondary)" }}>
                  {inputText.length} characters ({inputText.split(/\s+/).filter(Boolean).length} words)
                </span>
              )}
            </div>

            <textarea
              id="autistic-input-text"
              rows={4}
              placeholder="Paste email, message, instructions, or article here…"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--line)",
                background: "var(--card)",
                color: "var(--ink)",
                fontSize: "0.94rem",
                lineHeight: 1.55,
                resize: "vertical",
                minHeight: 100,
                outline: "none",
                fontFamily: "inherit"
              }}
            />

            {/* Action Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 4
              }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                {inputText.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "var(--radius-sm)",
                      background: "transparent",
                      border: "1px solid var(--line)",
                      color: "var(--ink-secondary)",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Clear Input
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRewrite()}
                disabled={loading || !inputText.trim()}
                style={{
                  padding: "10px 20px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--spring-green-700)",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.92rem",
                  cursor: loading || !inputText.trim() ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  opacity: loading || !inputText.trim() ? 0.6 : 1,
                  boxShadow: "0 2px 8px rgba(33, 107, 84, 0.25)"
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>{loading ? "Rewriting text…" : "Rewrite for Easy Reading"}</span>
              </button>
            </div>
          </div>

          {/* Rewritten Output Section */}
          {rewrittenText && (
            <div
              id="autistic-rewritten-output"
              style={{
                background: "var(--paper)",
                border: "2px solid var(--spring-green-700)",
                borderRadius: "var(--radius-lg)",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                boxShadow: "0 4px 14px rgba(0,0,0,0.04)"
              }}
            >
              {/* Output Top Utility Bar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                  borderBottom: "1px solid var(--line)",
                  paddingBottom: 12
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 size={18} color="var(--spring-green-800)" />
                  <strong style={{ fontSize: "0.98rem", color: "var(--ink)" }}>
                    Rewritten Text (Literal & Structured)
                  </strong>
                </div>

                {/* Font and Controls */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {/* Font Size Selector */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--card)", padding: "3px 6px", borderRadius: "var(--radius-sm)", border: "1px solid var(--line)" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--ink-secondary)", fontWeight: 600 }}>Size:</span>
                    <button
                      type="button"
                      onClick={() => setFontSizeLevel("normal")}
                      style={{
                        padding: "2px 6px",
                        border: "none",
                        borderRadius: "3px",
                        fontSize: "0.78rem",
                        fontWeight: fontSizeLevel === "normal" ? 700 : 400,
                        background: fontSizeLevel === "normal" ? "var(--spring-mint-200)" : "transparent",
                        color: fontSizeLevel === "normal" ? "var(--spring-green-900)" : "var(--ink)",
                        cursor: "pointer"
                      }}
                    >
                      A
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSizeLevel("large")}
                      style={{
                        padding: "2px 6px",
                        border: "none",
                        borderRadius: "3px",
                        fontSize: "0.85rem",
                        fontWeight: fontSizeLevel === "large" ? 700 : 400,
                        background: fontSizeLevel === "large" ? "var(--spring-mint-200)" : "transparent",
                        color: fontSizeLevel === "large" ? "var(--spring-green-900)" : "var(--ink)",
                        cursor: "pointer"
                      }}
                    >
                      A+
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSizeLevel("xlarge")}
                      style={{
                        padding: "2px 6px",
                        border: "none",
                        borderRadius: "3px",
                        fontSize: "0.92rem",
                        fontWeight: fontSizeLevel === "xlarge" ? 700 : 400,
                        background: fontSizeLevel === "xlarge" ? "var(--spring-mint-200)" : "transparent",
                        color: fontSizeLevel === "xlarge" ? "var(--spring-green-900)" : "var(--ink)",
                        cursor: "pointer"
                      }}
                    >
                      A++
                    </button>
                  </div>

                  {/* Toggle Original Text Comparison */}
                  <button
                    type="button"
                    onClick={() => setShowOriginal(!showOriginal)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--line)",
                      background: showOriginal ? "var(--paper-peach)" : "var(--card)",
                      color: showOriginal ? "var(--peach-900)" : "var(--ink-secondary)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    {showOriginal ? "Hide Original" : "Show Original"}
                  </button>
                </div>
              </div>

              {/* Side-by-Side Original (if toggled) */}
              {showOriginal && (
                <div
                  style={{
                    padding: "12px 14px",
                    background: "var(--paper-peach)",
                    border: "1px solid var(--peach-200)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.88rem",
                    color: "var(--peach-900)",
                    lineHeight: 1.55
                  }}
                >
                  <strong style={{ display: "block", marginBottom: 4, fontSize: "0.8rem" }}>
                    Original Text (Raw Input):
                  </strong>
                  {inputText}
                </div>
              )}

              {/* Content Body: Rendered with Clear Headings and Bullet Points */}
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-md)",
                  padding: "18px 20px",
                  fontSize: fontSizeClass,
                  lineHeight: lineHeightVal,
                  color: "var(--ink)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10
                }}
              >
                {parsedLines.map((line, idx) => {
                  const isHeading =
                    line.startsWith("#") ||
                    line.endsWith(":") ||
                    line.toLowerCase().startsWith("what this means") ||
                    line.toLowerCase().startsWith("what you need to do") ||
                    line.toLowerCase().startsWith("instructions") ||
                    line.toLowerCase().startsWith("summary");

                  const isBullet =
                    line.startsWith("•") ||
                    line.startsWith("-") ||
                    line.startsWith("*") ||
                    /^\d+[\.\)]/.test(line);

                  const cleanText = line.replace(/^[#\*\-•]+\s*/, "").replace(/^\d+[\.\)]\s*/, "");

                  if (isHeading) {
                    return (
                      <div
                        key={idx}
                        style={{
                          fontSize: fontSizeLevel === "xlarge" ? "1.24rem" : "1.1rem",
                          fontWeight: 700,
                          color: "var(--spring-green-900)",
                          marginTop: idx > 0 ? 12 : 0,
                          marginBottom: 4,
                          paddingBottom: 4,
                          borderBottom: "1px solid var(--line)"
                        }}
                      >
                        {cleanText}
                      </div>
                    );
                  }

                  if (isBullet) {
                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          padding: "4px 8px"
                        }}
                      >
                        <span
                          style={{
                            color: "var(--spring-green-700)",
                            fontWeight: 700,
                            userSelect: "none"
                          }}
                        >
                          •
                        </span>
                        <span style={{ flex: 1 }}>{cleanText}</span>
                      </div>
                    );
                  }

                  return (
                    <p
                      key={idx}
                      style={{
                        margin: 0,
                        padding: "4px 8px"
                      }}
                    >
                      {line}
                    </p>
                  );
                })}
              </div>

              {/* Action Buttons Row */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid var(--line)",
                  paddingTop: 14
                }}
              >
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={handleSpeak}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "var(--radius-pill)",
                      background: "var(--spring-green-700)",
                      color: "#ffffff",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.88rem",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <Volume2 size={15} />
                    <span>Read Aloud</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => stopSpeaking()}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "var(--radius-pill)",
                      background: "var(--card)",
                      border: "1px solid var(--line)",
                      color: "var(--ink-secondary)",
                      fontWeight: 600,
                      fontSize: "0.84rem",
                      cursor: "pointer"
                    }}
                  >
                    Stop Audio
                  </button>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={handleCopy}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "var(--radius-pill)",
                      background: "var(--card)",
                      border: "1px solid var(--line)",
                      color: "var(--ink)",
                      fontWeight: 600,
                      fontSize: "0.86rem",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <Copy size={15} />
                    <span>{copied ? "Copied!" : "Copy Rewritten Text"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Screen Comfort Tool */}
      {activeTab === "screen_comfort" && <ScreenComfortTool onToast={onToast} />}
    </div>
  );
};

export default ReadForMe;
