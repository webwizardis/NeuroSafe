import type { User } from "../types";

type Props = {
  user: User | null;
  backendOnline: boolean;
  onSettings: () => void;
  onLogout: () => void;
};

export function TopBar({ user, backendOnline, onSettings, onLogout }: Props) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <header className="topbar">
      <div>
        <div className="brand-mark">Neuro<span>Safe</span></div>
        <p className="topbar-greeting">{greeting}, {user?.name || "friend"}.</p>
      </div>
      <div className="topbar-actions">
        <span className={`status-pill ${backendOnline ? "online" : "offline"}`}>
          <span className="status-dot" />
          {backendOnline ? "Connected" : "Offline"}
        </span>
        <button className="avatar-button" onClick={onSettings} aria-label="Open accessibility settings">
          {(user?.name || "N").charAt(0).toUpperCase()}
        </button>
        <button className="ghost-button" onClick={onLogout}>Log out</button>
      </div>
    </header>
  );
}
