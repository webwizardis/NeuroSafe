import type { View } from "../types";

type Props = {
  icon: string;
  title: string;
  description: string;
  view: View;
  onNavigate: (view: View) => void;
};

export function QuickActionCard({ icon, title, description, view, onNavigate }: Props) {
  return (
    <button className="quick-card" onClick={() => onNavigate(view)}>
      <span className="quick-icon">{icon}</span>
      <span className="quick-card-title">{title}</span>
      <span className="quick-card-description">{description}</span>
      <span className="quick-arrow" aria-hidden="true">→</span>
    </button>
  );
}
