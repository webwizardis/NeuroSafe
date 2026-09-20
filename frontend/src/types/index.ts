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
  brightness?: number; // 50 to 110 (%)
  contrast?: number; // 70 to 130 (%)
  warmth?: "natural" | "amber" | "mint";
  font_scale?: "standard" | "large" | "xlarge";
  reduced_motion?: boolean;
  audio_chimes?: boolean;
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

export interface SosLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp?: number;
  mapsUrl: string;
}

export interface SosResponse {
  status: string;
  timestamp: string;
  message: string;
  contact: string;
  location?: SosLocationData | null;
  [key: string]: any;
}

export interface BuiltInImage {
  id: string;
  title: string;
  category: "text_overwhelm" | "screen_fatigue" | "executive_adhd" | "grounding" | "aac_card" | "routine" | "regulation";
  badge: string;
  icon: string;
  description: string;
  plain_summary: string;
  sensory_prompt: string;
  spoken_text: string;
  palette: {
    bg: string;
    fg: string;
    accent: string;
  };
  svg: string;
  tags: string[];
}

export interface BuiltInImagesResponse {
  total: number;
  categories: string[];
  images: BuiltInImage[];
}

export interface ProfileSuggestion {
  message?: string;
  status?: string;
  [key: string]: any;
}
