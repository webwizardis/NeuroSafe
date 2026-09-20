import React, { useState } from "react";
import {
  LayoutGrid,
  Sparkles,
  MessageSquare,
  CheckSquare,
  Navigation,
  HeartPulse,
  BookOpen,
  Brain,
  ArrowDown,
  ShieldAlert
} from "lucide-react";
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

interface SectionHeaderProps {
  id: string;
  icon: React.ElementType;
  badgeBg: string;
  badgeBorder: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  badgeText: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  id,
  icon: Icon,
  badgeBg,
  badgeBorder,
  badgeColor,
  title,
  subtitle,
  badgeText
}) => (
  <div
    id={id}
    style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 14,
      scrollMarginTop: 90
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "var(--radius-sm)",
          background: badgeBg,
          border: `1px solid ${badgeBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: badgeColor,
          flexShrink: 0
        }}
      >
        <Icon size={18} />
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <h2
            style={{
              fontSize: "1.15rem",
              fontWeight: 700,
              margin: 0,
              color: "var(--ink)"
            }}
          >
            {title}
          </h2>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              padding: "2px 8px",
              borderRadius: "var(--radius-pill)",
              background: badgeBg,
              border: `1px solid ${badgeBorder}`,
              color: badgeColor
            }}
          >
            {badgeText}
          </span>
        </div>
        <p
          style={{
            margin: "2px 0 0 0",
            fontSize: "0.85rem",
            color: "var(--ink-secondary)"
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  </div>
);

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
  const [sosExpanded, setSosExpanded] = useState(true);

  const isLowStim = Boolean(settings.low_stimulation_interface);
  const isReadAloud = Boolean(settings.read_aloud_enabled);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="container" style={{ padding: "28px 20px 80px 20px" }}>
      {/* Top AI Customization Banner */}
      <CustomizationBanner
        summary={customizationSummary}
        problems={problems}
        onReCustomize={onOpenAssessment}
      />

      {/* ------------------------------------------------------------- */}
      {/* PLACED EMERGENCY SOS & LIVE LOCATION BEACON STATION           */}
      {/* ------------------------------------------------------------- */}
      <div
        id="emergency-sos-station"
        style={{
          marginBottom: 28,
          scrollMarginTop: 85
        }}
      >
        {sosExpanded ? (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 8
              }}
            >
              <button
                type="button"
                id="toggle-sos-collapse"
                onClick={() => setSosExpanded(false)}
                style={{
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-pill)",
                  padding: "4px 12px",
                  fontSize: "0.78rem",
                  color: "var(--ink-secondary)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <span>Minimize Emergency Beacon</span>
              </button>
            </div>
            <SosConfirmation
              onToast={onToast}
              prominent
              onClose={() => setSosExpanded(false)}
            />
          </div>
        ) : (
          <div
            id="collapsed-sos-bar"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              padding: "14px 20px",
              background: "#fef2f2",
              border: "1.5px solid #fca5a5",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 2px 10px rgba(220, 38, 38, 0.06)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "var(--radius-md)",
                  background: "#fee2e2",
                  border: "1px solid #fca5a5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#dc2626",
                  flexShrink: 0
                }}
              >
                <ShieldAlert size={20} />
              </div>
              <div>
                <strong style={{ fontSize: "0.95rem", color: "#991b1b", display: "block" }}>
                  Emergency SOS & Live GPS Beacon
                </strong>
                <span style={{ fontSize: "0.82rem", color: "#7f1d1d" }}>
                  One-touch reassurance dispatch armed with browser geolocation coordinates
                </span>
              </div>
            </div>

            <button
              type="button"
              id="expand-sos-button"
              onClick={() => setSosExpanded(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                borderRadius: "var(--radius-pill)",
                background: "#dc2626",
                color: "#ffffff",
                border: "none",
                fontWeight: 700,
                fontSize: "0.86rem",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(220, 38, 38, 0.2)"
              }}
            >
              <ShieldAlert size={15} />
              <span>Open Emergency SOS</span>
            </button>
          </div>
        )}
      </div>

      {/* Category Filter Pills & Jump Bar */}
      <div style={{ marginBottom: 28 }}>
        <div
          role="tablist"
          aria-label="Tool categories"
          style={{
            display: "flex",
            gap: 10,
            marginBottom: activeCategory === "all" ? 14 : 0,
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
              label: "All Tools (Curated Overview)",
              icon: LayoutGrid,
              activeBg: "#ecfdf5",
              activeBorder: "#059669",
              activeColor: "#065f46"
            },
            {
              id: "sensory",
              label: "Sensory & Reading",
              icon: Sparkles,
              activeBg: "#f0fdfa",
              activeBorder: "#0d9488",
              activeColor: "#115e59"
            },
            {
              id: "communication",
              label: "Communication",
              icon: MessageSquare,
              activeBg: "#eef2ff",
              activeBorder: "#4f46e5",
              activeColor: "#3730a3"
            },
            {
              id: "executive",
              label: "Executive & Habits",
              icon: CheckSquare,
              activeBg: "#fffbeb",
              activeBorder: "#d97706",
              activeColor: "#92400e"
            },
            {
              id: "safety",
              label: "Travel & Safety",
              icon: Navigation,
              activeBg: "#f0f9ff",
              activeBorder: "#0284c7",
              activeColor: "#075985"
            }
          ].map((cat) => {
            const isSelected = activeCategory === cat.id;
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.id}
                id={`filter-tab-${cat.id}`}
                type="button"
                role="tab"
                data-speech={cat.label}
                aria-selected={isSelected}
                onClick={() => setActiveCategory(cat.id as any)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 16px",
                  borderRadius: "var(--radius-pill)",
                  border: isSelected ? `1.5px solid ${cat.activeBorder}` : "1px solid var(--line)",
                  background: isSelected ? cat.activeBg : "var(--card)",
                  color: isSelected ? cat.activeColor : "var(--ink-secondary)",
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: "0.86rem",
                  cursor: "pointer",
                  transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                  boxShadow: isSelected ? "0 1px 4px rgba(0, 0, 0, 0.05)" : "none"
                }}
              >
                <IconComponent size={15} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Jump Bar when All Tools is selected */}
        {activeCategory === "all" && (
          <div
            id="quick-jump-bar"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              padding: "7px 14px",
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-pill)",
              width: "fit-content"
            }}
          >
            <span
              style={{
                fontSize: "0.76rem",
                fontWeight: 700,
                color: "var(--ink-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginRight: 4
              }}
            >
              Jump To:
            </span>
            {[
              { id: "emergency-sos-station", label: "🚨 Emergency SOS", isAlert: true },
              { id: "section-daily-anchors", label: "Anchors & Grounding", isAlert: false },
              { id: "section-reading-studio", label: "Reading & Comprehension", isAlert: false },
              { id: "section-executive-action", label: "Tasks & Scripts", isAlert: false },
              { id: "section-travel-safety", label: "Travel & Routes", isAlert: false },
              { id: "section-ai-adaptation", label: "AI Personalization", isAlert: false }
            ].map((anchor) => (
              <button
                key={anchor.id}
                type="button"
                onClick={() => scrollToSection(anchor.id)}
                style={{
                  background: anchor.isAlert ? "#fee2e2" : "var(--card)",
                  border: anchor.isAlert ? "1.5px solid #fca5a5" : "1px solid var(--line)",
                  color: anchor.isAlert ? "#991b1b" : "var(--ink)",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-pill)",
                  fontSize: "0.78rem",
                  fontWeight: anchor.isAlert ? 700 : 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <span>{anchor.label}</span>
                <ArrowDown size={11} style={{ opacity: 0.6 }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. ALL TOOLS: CURATED BALANCED SECTIONS                       */}
      {/* ------------------------------------------------------------- */}
      {activeCategory === "all" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          {/* SECTION 1: DAILY ANCHORS & GROUNDING */}
          <section id="section-daily-anchors" aria-label="Daily Anchors and Somatic Grounding">
            <SectionHeader
              id="anchor-daily-anchors"
              icon={HeartPulse}
              badgeBg="#ecfdf5"
              badgeBorder="#a7f3d0"
              badgeColor="#059669"
              title="Daily Anchors & Somatic Grounding"
              subtitle="Gentle daily routine tracking paired with box breathing and immediate somatic decompression."
              badgeText="Daily Priority"
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
                gap: "24px",
                alignItems: "stretch"
              }}
            >
              <DailyHabits onToast={onToast} problems={problems} />
              <CalmMe onToast={onToast} lowStimulation={isLowStim} />
            </div>
          </section>

          {/* SECTION 2: READING & COMPREHENSION STUDIO */}
          <section id="section-reading-studio" aria-label="Reading and Cognitive Comprehension Studio">
            <SectionHeader
              id="anchor-reading-studio"
              icon={BookOpen}
              badgeBg="#f0fdfa"
              badgeBorder="#99f6e4"
              badgeColor="#0d9488"
              title="Reading & Cognitive Comprehension Studio"
              subtitle="Auditory speech synthesis with reading ruler, screen comfort tints, and plain-language simplification."
              badgeText="Sensory & Clarity"
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
                gap: "24px",
                alignItems: "stretch"
              }}
            >
              <ReadForMe onToast={onToast} readAloudDefault={isReadAloud} />
              <ExplainSimply onToast={onToast} readAloudDefault={isReadAloud} />
            </div>
          </section>

          {/* SECTION 3: EXECUTIVE ACTION & COMMUNICATION */}
          <section id="section-executive-action" aria-label="Executive Action and Communication">
            <SectionHeader
              id="anchor-executive-action"
              icon={CheckSquare}
              badgeBg="#fffbeb"
              badgeBorder="#fde68a"
              badgeColor="#d97706"
              title="Executive Action & Communication"
              subtitle="Break overwhelming tasks into energy-tailored steps and compose boundary-affirming scripts."
              badgeText="Action & Social"
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
                gap: "24px",
                alignItems: "stretch"
              }}
            >
              <TaskBreakdown
                onToast={onToast}
                readAloudDefault={isReadAloud}
                stepByStepMode={settings.step_by_step_tasks}
              />
              <SayItForMe onToast={onToast} readAloudDefault={isReadAloud} />
            </div>
          </section>

          {/* SECTION 4: SENSORY TRAVEL & SAFETY DISPATCH */}
          <section id="section-travel-safety" aria-label="Sensory Travel and Emergency Safety">
            <SectionHeader
              id="anchor-travel-safety"
              icon={Navigation}
              badgeBg="#f0f9ff"
              badgeBorder="#bae6fd"
              badgeColor="#0284c7"
              title="Sensory Travel & Emergency Beacon"
              subtitle="Plan quiet, low-crowd walking and transit routes alongside rapid emergency reassurance dispatch."
              badgeText="Safe Transit"
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
                gap: "24px",
                alignItems: "stretch"
              }}
            >
              <SafeJourney onToast={onToast} readAloudDefault={isReadAloud} />
              <SosConfirmation onToast={onToast} />
            </div>
          </section>

          {/* SECTION 5: ADAPTIVE INTELLIGENCE (FULL-WIDTH FOUNDATION) */}
          <section id="section-ai-adaptation" aria-label="Adaptive Intelligence & Profile Personalization">
            <SectionHeader
              id="anchor-ai-adaptation"
              icon={Brain}
              badgeBg="#f5f3ff"
              badgeBorder="#ddd6fe"
              badgeColor="#7c3aed"
              title="Adaptive Intelligence & Dynamic Customization"
              subtitle="Speak or type how you feel right now to dynamically calibrate sensory, reading, and pacing settings."
              badgeText="AI Tuning"
            />
            <ProfileRecommender
              currentSettings={settings}
              onApplySettings={onApplySettings}
              onToast={onToast}
            />
          </section>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. SENSORY & READING CATEGORY                                 */}
      {/* ------------------------------------------------------------- */}
      {activeCategory === "sensory" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <SectionHeader
            id="category-sensory-header"
            icon={Sparkles}
            badgeBg="#f0fdfa"
            badgeBorder="#99f6e4"
            badgeColor="#0d9488"
            title="Sensory Regulation & Reading Accommodations"
            subtitle="Grounding breathing exercises, dyslexia-friendly reader with ruler and screen comfort, plus text simplifier."
            badgeText="Sensory Suite"
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
              gap: "24px",
              alignItems: "stretch"
            }}
          >
            <CalmMe onToast={onToast} lowStimulation={isLowStim} />
            <ReadForMe onToast={onToast} readAloudDefault={isReadAloud} />
            <div style={{ gridColumn: "1 / -1" }}>
              <ExplainSimply onToast={onToast} readAloudDefault={isReadAloud} />
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. COMMUNICATION CATEGORY                                     */}
      {/* ------------------------------------------------------------- */}
      {activeCategory === "communication" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <SectionHeader
            id="category-communication-header"
            icon={MessageSquare}
            badgeBg="#eef2ff"
            badgeBorder="#c7d2fe"
            badgeColor="#4f46e5"
            title="Communication & Social Energy Support"
            subtitle="Gentle scripts for workplace boundaries, asking for help, medical visits, and neurodivergent advocacy."
            badgeText="Scripts"
          />
          <div style={{ maxWidth: 860, margin: "0 auto", width: "100%" }}>
            <SayItForMe onToast={onToast} readAloudDefault={isReadAloud} />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. EXECUTIVE & HABITS CATEGORY                                */}
      {/* ------------------------------------------------------------- */}
      {activeCategory === "executive" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <SectionHeader
            id="category-executive-header"
            icon={CheckSquare}
            badgeBg="#fffbeb"
            badgeBorder="#fde68a"
            badgeColor="#d97706"
            title="Executive Function & Habit Pacing"
            subtitle="Structure your daily routines, track dopamine-friendly streaks, and decompose daunting tasks."
            badgeText="Executive Suite"
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
              gap: "24px",
              alignItems: "stretch"
            }}
          >
            <DailyHabits onToast={onToast} problems={problems} />
            <TaskBreakdown
              onToast={onToast}
              readAloudDefault={isReadAloud}
              stepByStepMode={settings.step_by_step_tasks}
            />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. TRAVEL & SAFETY CATEGORY                                   */}
      {/* ------------------------------------------------------------- */}
      {activeCategory === "safety" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <SectionHeader
            id="category-safety-header"
            icon={Navigation}
            badgeBg="#f0f9ff"
            badgeBorder="#bae6fd"
            badgeColor="#0284c7"
            title="Sensory Travel & Emergency Safety"
            subtitle="Quiet low-stimulation route finding and immediate distress broadcast beacon with reassurance protocols."
            badgeText="Safety Suite"
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
              gap: "24px",
              alignItems: "stretch"
            }}
          >
            <SafeJourney onToast={onToast} readAloudDefault={isReadAloud} />
            <SosConfirmation onToast={onToast} />
          </div>
        </div>
      )}
    </main>
  );
};
