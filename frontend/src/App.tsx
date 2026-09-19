import React, { useState, useEffect } from "react";
import { User, AccessibilitySettings } from "./types";
import { api, getSessionToken, setSessionToken } from "./services/api";
import { Navbar } from "./components/Navbar";
import { AuthView } from "./components/AuthView";
import { AssessmentView } from "./components/AssessmentView";
import { DashboardView } from "./components/DashboardView";
import { Toast } from "./components/Toast";
import { registerSpeechListener, stopSpeaking } from "./utils/speech";

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewState, setViewState] = useState<"auth" | "assessment" | "dashboard">("auth");
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    low_stimulation_interface: true,
    plain_language_mode: false,
    step_by_step_tasks: true,
    read_aloud_enabled: false
  });
  const [customizationSummary, setCustomizationSummary] = useState<string>(
    "NeuroSafe is active with gentle sensory-first visual defaults."
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

  // Synchronize CSS class modifiers on document.body for low-stimulation & high legibility
  useEffect(() => {
    if (settings.low_stimulation_interface) {
      document.body.classList.add("low-stimulation");
    } else {
      document.body.classList.remove("low-stimulation");
    }

    if (settings.plain_language_mode) {
      document.body.classList.add("simplified-text");
    } else {
      document.body.classList.remove("simplified-text");
    }
  }, [settings]);

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
        <AuthView onSuccess={handleAuthSuccess} onToast={showToast} />
      ) : (
        <>
          <Navbar
            user={currentUser}
            backendOnline={backendOnline}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onOpenAssessment={() => setViewState("assessment")}
            onLogout={handleLogout}
          />

          {viewState === "assessment" ? (
            <AssessmentView
              user={currentUser}
              onCompleted={handleAssessmentCompleted}
              onToast={showToast}
            />
          ) : (
            <DashboardView
              user={currentUser!}
              settings={settings}
              customizationSummary={customizationSummary}
              problems={problems}
              onOpenAssessment={() => setViewState("assessment")}
              onApplySettings={handleUpdateSettings}
              onToast={showToast}
            />
          )}
        </>
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
