import type { View } from "../types";

type Props = {
  view: View;
  onNavigate: (view: View) => void;
  open: boolean;
  onClose: () => void;
};

const groups = [
  {
    title: "Home",
    items: [{ id: "home" as View, label: "Home", icon: "⌂" }],
  },
  {
    title: "Read & Understand",
    items: [
      { id: "read" as View, label: "Read for Me", icon: "◉" },
      { id: "camera" as View, label: "Camera", icon: "▣" },
      { id: "explain" as View, label: "Explain Simply", icon: "✦" },
    ],
  },
  {
    title: "Communicate",
    items: [{ id: "say" as View, label: "Say It For Me", icon: "◌" }],
  },
  {
    title: "Calm & Focus",
    items: [
      { id: "calm" as View, label: "Calm Me", icon: "☘" },
      { id: "tasks" as View, label: "Task Breakdown", icon: "✓" },
    ],
  },
  {
    title: "Routine",
    items: [{ id: "habits" as View, label: "Daily Habits", icon: "♡" }],
  },
  {
    title: "Journey",
    items: [{ id: "journey" as View, label: "Safe Journey", icon: "↗" }],
  },
  {
    title: "Urgent Support",
    items: [{ id: "sos" as View, label: "SOS", icon: "!" }],
  },
];

export function Sidebar({ view, onNavigate, open, onClose }: Props) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-brand">
        <div className="logo-orb">N</div>
        <div>
          <strong>NeuroSafe</strong>
          <span>Support, your way.</span>
        </div>
      </div>

      <nav aria-label="Main navigation">
        {groups.map((group) => (
          <div className="nav-group" key={group.title}>
            <span className="nav-group-title">{group.title}</span>
            {group.items.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${view === item.id ? "active" : ""}`}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}
        <div className="nav-group nav-bottom">
          <button className={`nav-item ${view === "settings" ? "active" : ""}`} onClick={() => { onNavigate("settings"); onClose(); }}>
            <span>⚙</span> Settings
          </button>
        </div>
      </nav>
    </aside>
  );
}
