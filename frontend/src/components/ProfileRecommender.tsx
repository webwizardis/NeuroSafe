import React, { useState } from "react";
import { Sparkles, Sliders, Check } from "lucide-react";
import { api } from "../services/api";
import { AccessibilitySettings } from "../types";

interface ProfileRecommenderProps {
  currentSettings: AccessibilitySettings;
  onApplySettings: (settings: AccessibilitySettings, note?: string) => void;
  onToast: (message: string, type?: "info" | "success" | "error") => void;
}

export const ProfileRecommender: React.FC<ProfileRecommenderProps> = ({
  currentSettings,
  onApplySettings,
  onToast
}) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestedSettings, setSuggestedSettings] = useState<AccessibilitySettings | null>(null);
  const [suggestionMessage, setSuggestionMessage] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  const handleGetSuggestions = async () => {
    if (!input.trim()) {
      onToast("Please describe how you'd like your experience customized.", "info");
      return;
    }

    setLoading(true);
    try {
      const res = await api.suggestProfile(input.trim());
      if (res && res.suggestion) {
        setSuggestedSettings(res.suggestion.settings || res.suggestion);
        setSuggestionMessage(
          res.suggestion.reason || res.suggestion.message || "AI analyzed your request and prepared these settings adjustments."
        );
        onToast("AI profile recommendations ready!", "success");
      }
    } catch (err: any) {
      onToast(err.message || "Failed to generate suggestions.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!suggestedSettings) return;

    setApproving(true);
    try {
      const merged: AccessibilitySettings = {
        ...currentSettings,
        ...suggestedSettings
      };
      const res = await api.approveProfile(merged);
      onApplySettings(res.settings || merged, "Approved AI accessibility profile recommendations");
      onToast("Approved and applied new accessibility settings!", "success");
      setSuggestedSettings(null);
      setSuggestionMessage(null);
      setInput("");
    } catch (err: any) {
      onToast(err.message || "Failed to approve profile.", "error");
    } finally {
      setApproving(false);
    }
  };

  return (
    <div
      id="box-profile-recommender"
      style={{
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-md)",
            background: "var(--spring-mint-200)",
            color: "var(--spring-green-900)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Sliders size={18} />
        </div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--ink)" }}>
          Natural Language Preference Coach
        </h2>
      </div>

      <p style={{ margin: "0 0 16px 0", fontSize: "0.88rem", color: "var(--ink-secondary)" }}>
        Ask in conversational English for any comfort adjustments, and let our accessibility assistant
        configure your workspace safely.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <input
          type="text"
          placeholder="e.g. Turn on low stimulation and make reading aloud automatic"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            minWidth: "240px",
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--line)",
            background: "var(--paper)",
            color: "var(--ink)",
            fontSize: "0.92rem"
          }}
        />

        <button
          type="button"
          onClick={handleGetSuggestions}
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 18px",
            borderRadius: "var(--radius-md)",
            background: "var(--spring-green-700)",
            color: "#ffffff",
            border: "none",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: "pointer"
          }}
        >
          <Sparkles size={16} />
          {loading ? "Analyzing…" : "Suggest Profile"}
        </button>
      </div>

      {suggestedSettings && (
        <div
          style={{
            marginTop: 16,
            padding: "16px",
            borderRadius: "var(--radius-md)",
            background: "var(--spring-mint-100)",
            border: "1px solid var(--spring-mint-300)"
          }}
        >
          <strong style={{ display: "block", fontSize: "0.92rem", color: "var(--spring-green-900)", marginBottom: 8 }}>
            Proposed Adjustments:
          </strong>
          {suggestionMessage && (
            <p style={{ margin: "0 0 12px 0", fontSize: "0.88rem", color: "var(--ink)", lineHeight: 1.5 }}>
              {suggestionMessage}
            </p>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {Object.entries(suggestedSettings).map(([k, v]) => (
              <span
                key={k}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-pill)",
                  fontSize: "0.8rem",
                  color: "var(--ink)",
                  fontWeight: 600
                }}
              >
                {k.replace(/_/g, " ")}: <strong>{String(v)}</strong>
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={handleApprove}
            disabled={approving}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 18px",
              borderRadius: "var(--radius-md)",
              background: "var(--spring-green-800)",
              color: "#ffffff",
              border: "none",
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: "pointer"
            }}
          >
            <Check size={16} />
            {approving ? "Applying…" : "Approve & Apply to My App"}
          </button>
        </div>
      )}
    </div>
  );
};
