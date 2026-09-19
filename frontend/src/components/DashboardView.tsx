import React, { useState } from "react";
import { User, AccessibilitySettings } from "../types";
import { CustomizationBanner } from "./CustomizationBanner";
import { ReadForMe } from "./ReadForMe";
import { ExplainSimply } from "./ExplainSimply";
import { SayItForMe } from "./SayItForMe";
import { CalmMe } from "./CalmMe";
import { TaskBreakdown } from "./TaskBreakdown";
import { DailyHabits } from "./DailyHabits";
import { SafeJourney } from "./SafeJourney";
import { SosConfirmation } from "./SosConfirmation";
import { ProfileRecommender } from "./ProfileRecommender";

interface DashboardViewProps {
  user: User;
  settings: AccessibilitySettings;
  customizationSummary: string;
  problems: string[];
  onOpenAssessment: () => void;
  onApplySettings: (settings: AccessibilitySettings, note?: string) => void;
  onToast: (message: string, type?: "info" | "success" | "error") => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  settings,
  customizationSummary,
  problems,
  onOpenAssessment,
  onApplySettings,
  onToast
}) => {
  const [activeCategory, setActiveCategory] = useState<"all" | "sensory" | "communication" | "executive" | "safety">("all");

  const isLowStim = Boolean(settings.low_stimulation_interface);
  const isReadAloud = Boolean(settings.read_aloud_enabled);
  const isSosProminent = Boolean(settings.emergency_sos_prominent);

  return (
    <main className="container" style={{ padding: "28px 20px 60px 20px" }}>
      {/* Top AI Customization Banner */}
      <CustomizationBanner
        summary={customizationSummary}
        problems={problems}
        onReCustomize={onOpenAssessment}
      />

      {/* Emergency SOS Banner if prominent */}
      {isSosProminent && (
        <div style={{ marginBottom: 24 }}>
          <SosConfirmation onToast={onToast} prominent />
        </div>
      )}

      {/* Category Filter Pills */}
      <div
        role="tablist"
        aria-label="Tool categories"
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          flexWrap: "wrap",
          alignItems: "center"
        }}
      >
        <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--ink-secondary)", marginRight: 4 }}>
          Filter Tools:
        </span>
        {[
          { id: "all", label: "✨ All Tools" },
          { id: "sensory", label: "🌿 Sensory & Reading" },
          { id: "communication", label: "💬 Communication" },
          { id: "executive", label: "🎯 Executive & Habits" },
          { id: "safety", label: "🗺️ Travel & Safety" }
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            data-speech={cat.label.replace(/^[^\w\s]+/, "").trim()}
            aria-selected={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            style={{
              padding: "7px 16px",
              borderRadius: "var(--radius-pill)",
              border: activeCategory === cat.id ? "1px solid var(--spring-green-700)" : "1px solid var(--line)",
              background: activeCategory === cat.id ? "var(--spring-mint-200)" : "var(--card)",
              color: activeCategory === cat.id ? "var(--spring-green-900)" : "var(--ink-secondary)",
              fontWeight: 600,
              fontSize: "0.86rem",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Primary Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "24px",
          alignItems: "start"
        }}
      >
        {/* Sensory & Reading Group */}
        {(activeCategory === "all" || activeCategory === "sensory") && (
          <>
            <ReadForMe onToast={onToast} readAloudDefault={isReadAloud} />
            <ExplainSimply onToast={onToast} readAloudDefault={isReadAloud} />
            <CalmMe onToast={onToast} lowStimulation={isLowStim} />
          </>
        )}

        {/* Executive Function & Habits Group */}
        {(activeCategory === "all" || activeCategory === "executive") && (
          <>
            <TaskBreakdown
              onToast={onToast}
              readAloudDefault={isReadAloud}
              stepByStepMode={settings.step_by_step_tasks}
            />
            <DailyHabits onToast={onToast} problems={problems} />
          </>
        )}

        {/* Communication Group */}
        {(activeCategory === "all" || activeCategory === "communication") && (
          <SayItForMe onToast={onToast} readAloudDefault={isReadAloud} />
        )}

        {/* Safety & Travel Group */}
        {(activeCategory === "all" || activeCategory === "safety") && (
          <>
            <SafeJourney onToast={onToast} readAloudDefault={isReadAloud} />
            {!isSosProminent && <SosConfirmation onToast={onToast} />}
          </>
        )}

        {/* Natural Language Profile Recommender */}
        {activeCategory === "all" && (
          <div style={{ gridColumn: "1 / -1" }}>
            <ProfileRecommender
              currentSettings={settings}
              onApplySettings={onApplySettings}
              onToast={onToast}
            />
          </div>
        )}
      </div>
    </main>
  );
};
