export interface User {
  id: string;
  email: string;
  name: string;
  profile?: any;
  accessibility_profile?: AccessibilitySettings;
  problem_history?: string[];
  created_at?: string;
}

export interface AccessibilitySettings {
  low_stimulation_interface?: boolean;
  plain_language_mode?: boolean;
  step_by_step_tasks?: boolean;
  read_aloud_enabled?: boolean;
  simplify_text?: boolean;
  step_by_step?: boolean;
  read_aloud?: boolean;
  hide_complex_tools?: boolean;
  emergency_sos_prominent?: boolean;
  [key: string]: any;
}

export interface Habit {
  id: string;
  title: string;
  time_of_day: "morning" | "afternoon" | "evening" | "anytime";
  icon: string;
  notes?: string;
  completed_today: boolean;
  streak: number;
}

export interface HabitStats {
  total: number;
  completed: number;
  percent: number;
  all_completed: boolean;
}

export interface HabitSuggestion {
  title: string;
  time_of_day: "morning" | "afternoon" | "evening" | "anytime";
  icon: string;
  notes?: string;
}

export interface RouteStep {
  html_instructions?: string;
  instructions?: string;
  distance?: { text: string; value?: number };
  duration?: { text: string; value?: number };
}

export interface RouteLeg {
  start_address?: string;
  end_address?: string;
  distance?: { text: string; value?: number };
  duration?: { text: string; value?: number };
  steps?: RouteStep[];
}

export interface RouteItem {
  summary?: string;
  legs?: RouteLeg[];
  overview_polyline?: { points: string };
  sensory_notes?: string[];
}

export interface RouteResponse {
  source?: string;
  routes: RouteItem[];
  status?: string;
}

export interface CalmResponse {
  steps: string[];
  disclaimer: string;
}

export interface SosResponse {
  status: string;
  timestamp: string;
  message: string;
  contact: string;
  [key: string]: any;
}

export interface OcrResponse {
  text?: string;
  plain_summary?: string;
  description?: string;
  confidence?: number;
  [key: string]: any;
}

export interface ProfileSuggestion {
  message?: string;
  status?: string;
  [key: string]: any;
}
