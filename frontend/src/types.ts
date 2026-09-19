export type User = {
  id?: string;
  name?: string;
  email?: string;
  username?: string;
  accessibility_profile?: Record<string, unknown>;
  problem_history?: string[];
};

export type AccessibilitySettings = {
  low_stimulation_interface: boolean;
  plain_language_mode: boolean;
  step_by_step_tasks: boolean;
  read_aloud_enabled: boolean;
};

export type Habit = {
  id: string;
  title: string;
  time_of_day?: string;
  icon?: string;
  notes?: string;
  completed_today?: boolean;
  streak?: number;
};

export type HabitStats = {
  total: number;
  completed: number;
  percent: number;
  all_completed?: boolean;
};

export type RouteData = {
  routes?: Array<{
    summary?: string;
    legs?: Array<{
      start_address?: string;
      end_address?: string;
      distance?: { text?: string };
      duration?: { text?: string };
      steps?: Array<{
        html_instructions?: string;
        instructions?: string;
        distance?: { text?: string };
      }>;
    }>;
  }>;
  source?: string;
};

export type View =
  | "home"
  | "read"
  | "camera"
  | "explain"
  | "say"
  | "calm"
  | "tasks"
  | "habits"
  | "journey"
  | "sos"
  | "settings";
