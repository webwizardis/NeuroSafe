import { useEffect, useState } from "react";
import { api, getToken, normalizeSettings, setToken } from "./services/api";
import type { AccessibilitySettings, User, View } from "./types";
import { AuthPage } from "./pages/AuthPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { HomePage } from "./pages/HomePage";
import { ReadPage } from "./pages/ReadPage";
import { CameraPage } from "./pages/CameraPage";
import { ExplainPage } from "./pages/ExplainPage";
import { SayPage } from "./pages/SayPage";
import { CalmPage } from "./pages/CalmPage";
import { TasksPage } from "./pages/TasksPage";
import { HabitsPage } from "./pages/HabitsPage";
import { JourneyPage } from "./pages/JourneyPage";
import { SosPage } from "./pages/SosPage";
import { SettingsPage } from "./pages/SettingsPage";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Toast } from "./components/Toast";

const defaultSettings: AccessibilitySettings = {
  low_stimulation_interface: true,
  plain_language_mode: true,
  step_by_step_tasks: true,
  read_aloud_enabled: true,
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [settings, setSettingsState] = useState(defaultSettings);
  const [problems, setProblems] = useState<string[]>([]);
  const [summary, setSummary] = useState("Your calm accessibility workspace is ready.");
  const [view, setView] = useState<View>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [booting, setBooting] = useState(true);
  const [toast, setToast] = useState("");

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  useEffect(() => {
    void (async () => {
      try {
        await api.health();
        setBackendOnline(true);
      } catch {
        setBackendOnline(false);
      }

      if (getToken()) {
        try {
          const data = await api.auth.me();
          setUser(data.user);
          const profile = data.user.accessibility_profile;
          if (profile && Object.keys(profile).length) {
            setSettingsState(normalizeSettings(profile as Record<string, any>, defaultSettings));
            setProblems(data.user.problem_history || []);
          } else {
            setNeedsOnboarding(true);
          }
        } catch {
          setToken(null);
        }
      }
      setBooting(false);
    })();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.lowStimulation = String(settings.low_stimulation_interface);
    document.documentElement.dataset.plainLanguage = String(settings.plain_language_mode);
    document.documentElement.dataset.stepByStep = String(settings.step_by_step_tasks);
  }, [settings]);

  function handleAuth(nextUser: User) {
    setUser(nextUser);
    const profile = nextUser.accessibility_profile;
    if (profile && Object.keys(profile).length) {
      setSettingsState(normalizeSettings(profile as Record<string, any>, defaultSettings));
      setProblems(nextUser.problem_history || []);
      setNeedsOnboarding(false);
      setView("home");
      notify(`Welcome, ${nextUser.name || "friend"}!`);
    } else {
      setNeedsOnboarding(true);
    }
  }

  function completeOnboarding(next: AccessibilitySettings, nextProblems: string[], nextSummary: string) {
    setSettingsState(next);
    setProblems(nextProblems);
    setSummary(nextSummary);
    setNeedsOnboarding(false);
    setView("home");
    notify("Your NeuroSafe space is ready.");
  }

  async function logout() {
    try {
      await api.auth.logout();
    } catch {
      // A local logout is still performed if the backend is unavailable.
    } finally {
      setToken(null);
      setUser(null);
      setNeedsOnboarding(false);
      setView("home");
      notify("You have been logged out.");
    }
  }

  function setSettings(next: AccessibilitySettings) {
    setSettingsState(next);
    notify("Accessibility settings updated.");
  }

  if (booting) {
    return <div className="boot-screen"><div className="logo-orb large">N</div><p>Opening your NeuroSafe space…</p></div>;
  }

  if (!user) return <AuthPage onAuth={handleAuth} />;
  if (needsOnboarding) return <OnboardingPage user={user} onComplete={completeOnboarding} />;

  const page = (() => {
    switch (view) {
      case "read": return <ReadPage />;
      case "camera": return <CameraPage />;
      case "explain": return <ExplainPage />;
      case "say": return <SayPage />;
      case "calm": return <CalmPage />;
      case "tasks": return <TasksPage />;
      case "habits": return <HabitsPage problems={problems} />;
      case "journey": return <JourneyPage />;
      case "sos": return <SosPage />;
      case "settings": return <SettingsPage settings={settings} setSettings={setSettings} />;
      default: return <HomePage user={user} settings={settings} summary={summary} problems={problems} onNavigate={setView} />;
    }
  })();

  return (
    <div className="app-shell">
      <button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">☰</button>
      <Sidebar view={view} onNavigate={setView} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      <div className="main-shell">
        <TopBar user={user} backendOnline={backendOnline} onSettings={() => setView("settings")} onLogout={() => void logout()} />
        <div className="content-wrap">{page}</div>
      </div>
      <Toast message={toast} />
    </div>
  );
}
