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
          gap: 10,
          marginBottom: 24,
          flexWrap: "wrap",
          alignItems: "center"
        }}
      >
        <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--ink-secondary)", marginRight: 4 }}>
          Filter Tools:
        </span>
        {[
          {
            id: "all",
            label: "✨ All Tools",
            activeBg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
            activeBorder: "#10b981",
            activeColor: "#065f46"
          },
          {
            id: "sensory",
            label: "🌿 Sensory & Reading",
            activeBg: "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)",
            activeBorder: "#14b8a6",
            activeColor: "#115e59"
          },
          {
            id: "communication",
            label: "💬 Communication",
            activeBg: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
            activeBorder: "#6366f1",
            activeColor: "#3730a3"
          },
          {
            id: "executive",
            label: "🎯 Executive & Habits",
            activeBg: "linear-gradient(135deg, #fefce8 0%, #fef08a 100%)",
            activeBorder: "#f59e0b",
            activeColor: "#92400e"
          },
          {
            id: "safety",
            label: "🗺️ Travel & Safety",
            activeBg: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
            activeBorder: "#0ea5e9",
            activeColor: "#075985"
          }
        ].map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              data-speech={cat.label.replace(/^[^\w\s]+/, "").trim()}
              aria-selected={isSelected}
              onClick={() => setActiveCategory(cat.id as any)}
              style={{
                padding: "8px 18px",
                borderRadius: "var(--radius-pill)",
                border: isSelected ? `2px solid ${cat.activeBorder}` : "1px solid var(--line)",
                background: isSelected ? cat.activeBg : "var(--card)",
                color: isSelected ? cat.activeColor : "var(--ink-secondary)",
                fontWeight: isSelected ? 700 : 600,
                fontSize: "0.88rem",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: isSelected ? "0 2px 8px rgba(0, 0, 0, 0.06)" : "none"
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Primary Grid with Gentle Tab Transition */}
      <div
        key={activeCategory}
        className="gentle-tab-transition"
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
