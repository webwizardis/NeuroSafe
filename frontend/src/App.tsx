import React, { useState, useEffect } from "react";
import { User, AccessibilitySettings } from "./types";
import { api, getSessionToken, setSessionToken } from "./services/api";
import { Navbar } from "./components/Navbar";
import { AuthView } from "./components/AuthView";
import { AssessmentView } from "./components/AssessmentView";
import { DashboardView } from "./components/DashboardView";
import { Toast } from "./components/Toast";
import { registerSpeechListener, stopSpeaking, speak } from "./utils/speech";

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewState, setViewState] = useState<"auth" | "assessment" | "dashboard">("auth");
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    low_stimulation_interface: false,
    plain_language_mode: false,
    step_by_step_tasks: true,
    read_aloud_enabled: false
  });
  const [customizationSummary, setCustomizationSummary] = useState<string>(
    "NeuroSafe is active with an affirming, colorful visual theme."
  );
  const [problems, setProblems] = useState<string[]>(["sensory_overload", "executive_function"]);
  const [toast, setToast] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);
  const [speaking, setSpeaking] = useState(false);

  // Initialize Speech synthesis feedback
  useEffect(() => {
    registerSpeechListener((isActive) => {
      setSpeaking(isActive);
    });
  }, []);

  // Synchronize CSS class modifiers, brightness, contrast, and warmth on document
  useEffect(() => {
    // Low stimulation class
    if (settings.low_stimulation_interface) {
      document.body.classList.add("low-stimulation");
    } else {
      document.body.classList.remove("low-stimulation");
    }

    // Simplified / Plain language text
    if (settings.plain_language_mode || settings.simplify_text) {
      document.body.classList.add("simplified-text");
    } else {
      document.body.classList.remove("simplified-text");
    }

    // Dynamic Screen Brightness:
    // If explicitly specified in settings, use it; otherwise default: 85% for low stim, 100% normal
    const currentBrightness = typeof settings.brightness === "number"
      ? settings.brightness
      : (settings.low_stimulation_interface ? 85 : 100);
    document.documentElement.style.setProperty("--app-brightness", `${currentBrightness}%`);

    // Dynamic Contrast
    const currentContrast = typeof settings.contrast === "number"
      ? settings.contrast
      : (settings.low_stimulation_interface ? 92 : 100);
    document.documentElement.style.setProperty("--app-contrast", `${currentContrast}%`);

    // Color warmth tint
    document.body.classList.remove("warmth-amber", "warmth-mint");
    document.documentElement.classList.remove("warmth-amber", "warmth-mint");
    if (settings.warmth === "amber") {
      document.body.classList.add("warmth-amber");
      document.documentElement.classList.add("warmth-amber");
    } else if (settings.warmth === "mint") {
      document.body.classList.add("warmth-mint");
      document.documentElement.classList.add("warmth-mint");
    }

    // Font scaling
    document.body.classList.remove("font-scale-large", "font-scale-xlarge");
    if (settings.font_scale === "large") {
      document.body.classList.add("font-scale-large");
    } else if (settings.font_scale === "xlarge") {
      document.body.classList.add("font-scale-xlarge");
    }

    // Reduced motion
    if (settings.reduced_motion) {
      document.body.classList.add("reduced-motion");
    } else {
      document.body.classList.remove("reduced-motion");
    }
  }, [settings]);

  // Global Audio Read-Aloud button speaker:
  // When Audio Read Aloud is active, pressing any button immediately speaks its name aloud!
  useEffect(() => {
    if (!settings.read_aloud_enabled) return;

    const handleGlobalButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        "button, [role='button'], a[role='button'], input[type='button'], input[type='submit'], summary, [role='tab'], [role='checkbox'], [role='switch']"
      ) as HTMLElement | null;

      if (!interactive) return;

      // Extract spoken label
      let textToSpeak = interactive.getAttribute("data-speech");
      if (!textToSpeak) {
        const ariaLabel = interactive.getAttribute("aria-label");
        if (ariaLabel) {
          textToSpeak = ariaLabel;
        } else {
          // Extract text content cleanly
          const clone = interactive.cloneNode(true) as HTMLElement;
          clone.querySelectorAll("[aria-hidden='true'], svg, img").forEach((n) => n.remove());
          let txt = clone.textContent || "";
          txt = txt
            .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F100}-\u{1F1FF}]/gu, "")
            .replace(/[✓✔▲▼✕✖★☆•·\(\)]/g, "")
            .replace(/\s+/g, " ")
            .trim();
          textToSpeak = txt;
        }
      }

      if (textToSpeak && textToSpeak.trim().length > 0) {
        speak(textToSpeak.trim());
      }
    };

    document.addEventListener("click", handleGlobalButtonClick, true);
    return () => {
      document.removeEventListener("click", handleGlobalButtonClick, true);
    };
  }, [settings.read_aloud_enabled]);

  // Initial Auth & Health Check
  useEffect(() => {
    const initApp = async () => {
      // 1. Health check
      try {
        const health = await api.getHealth();
        if (health && health.status === "ok") {
          setBackendOnline(true);
        }
      } catch (err) {
        console.warn("Backend health check failed:", err);
        setBackendOnline(false);
      }

      // 2. Auth check with existing token
      const token = getSessionToken();
      if (token) {
        try {
          const { user } = await api.getMe();
          if (user) {
            setCurrentUser(user);
            if (user.accessibility_profile) {
              setSettings((prev) => ({ ...prev, ...user.accessibility_profile }));
            }
            if (user.problem_history && user.problem_history.length > 0) {
              setProblems(user.problem_history);
              setViewState("dashboard");
            } else {
              setViewState("dashboard");
            }
          }
        } catch (err) {
          console.warn("Session token expired or invalid:", err);
          setSessionToken(null);
          setViewState("auth");
        }
      } else {
        setViewState("auth");
      }
    };

    initApp();
  }, []);

  const showToast = (message: string, type: "info" | "success" | "error" = "info") => {
    setToast({ message, type });
  };

  const handleAuthSuccess = (user: User, isDemo: boolean = false) => {
    setCurrentUser(user);
    if (user.accessibility_profile) {
      setSettings((prev) => ({ ...prev, ...user.accessibility_profile }));
    }
    if (user.problem_history && user.problem_history.length > 0) {
      setProblems(user.problem_history);
      setViewState("dashboard");
    } else if (isDemo) {
      setProblems(["sensory_overload", "executive_function"]);
      setViewState("dashboard");
    } else {
      setViewState("assessment");
    }
  };

  const handleAssessmentCompleted = (
    newSettings: AccessibilitySettings,
    summary: string,
    selectedProblems: string[]
  ) => {
    setSettings(newSettings);
    setCustomizationSummary(summary);
    setProblems(selectedProblems);
    setViewState("dashboard");
  };

  const handleUpdateSettings = (newSettings: AccessibilitySettings, note?: string) => {
    setSettings(newSettings);
    if (note) showToast(note, "info");
  };

  const handleLogout = async () => {
    stopSpeaking();
    try {
      await api.logout();
    } catch {
      // ignore
    }
    setSessionToken(null);
    setCurrentUser(null);
    setViewState("auth");
    showToast("You have been signed out safely.", "info");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Speaking Active Floating Badge */}
      {speaking && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: 14,
            right: 14,
            zIndex: 9999,
            background: "var(--peach-500)",
            color: "#ffffff",
            borderRadius: "var(--radius-pill)",
            padding: "6px 14px",
            fontSize: "0.84rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}
        >
          <span>🔊 Speaking…</span>
          <button
            type="button"
            onClick={stopSpeaking}
            style={{
              background: "#ffffff",
              color: "var(--peach-900)",
              border: "none",
              borderRadius: "var(--radius-pill)",
              padding: "2px 8px",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Stop
          </button>
        </div>
      )}

      {/* Main App Layout */}
      {viewState === "auth" ? (
        <div key="auth" className="gentle-view-transition" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <AuthView onSuccess={handleAuthSuccess} onToast={showToast} />
        </div>
      ) : (
        <div key="authed-flow" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Navbar
            user={currentUser}
            backendOnline={backendOnline}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onOpenAssessment={() => setViewState("assessment")}
            onLogout={handleLogout}
          />

          {viewState === "assessment" ? (
            <div key="assessment" className="gentle-view-transition">
              <AssessmentView
                user={currentUser}
                onCompleted={handleAssessmentCompleted}
                onToast={showToast}
              />
            </div>
          ) : (
            <div key="dashboard" className="gentle-view-transition">
              <DashboardView
                user={currentUser!}
                settings={settings}
                customizationSummary={customizationSummary}
                problems={problems}
                onOpenAssessment={() => setViewState("assessment")}
                onApplySettings={handleUpdateSettings}
                onToast={showToast}
              />
            </div>
          )}
        </div>
      )}

      {/* Accessible Toast Notification */}
      <Toast
        message={toast?.message || null}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
};

export default App;
