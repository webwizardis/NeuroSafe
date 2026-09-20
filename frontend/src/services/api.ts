import {
  User,
  AccessibilitySettings,
  Habit,
  HabitStats,
  HabitSuggestion,
  RouteResponse,
  CalmResponse,
  SosResponse,
  BuiltInImage,
  BuiltInImagesResponse
} from "../types";

let sessionToken: string | null =
  localStorage.getItem("neurosafe_token") || sessionStorage.getItem("neurosafe_token");

export function setSessionToken(token: string | null, remember: boolean = true) {
  sessionToken = token;
  if (token) {
    if (remember) {
      localStorage.setItem("neurosafe_token", token);
    } else {
      sessionStorage.setItem("neurosafe_token", token);
    }
  } else {
    localStorage.removeItem("neurosafe_token");
    sessionStorage.removeItem("neurosafe_token");
  }
}

export function getSessionToken(): string | null {
  return sessionToken;
}

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (sessionToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${sessionToken}`);
  }

  const response = await fetch(path, {
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json().catch(() => ({})) : await response.text();

  if (!response.ok) {
    const errorMsg = typeof data === "object" && data !== null && "detail" in data
      ? (data as any).detail
      : typeof data === "string" && data.length > 0
      ? data
      : `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

async function json<T = any>(path: string, body: any): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

export const api = {
  // Health check
  async getHealth(): Promise<{ status: string; timestamp: string }> {
    return request<{ status: string; timestamp: string }>("/health");
  },

  // Auth
  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    return json("/api/auth/register", { name, email, password });
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return json("/api/auth/login", { email, password });
  },

  async demoAuth(): Promise<{ token: string; user: User; message: string }> {
    return json("/api/auth/demo", {});
  },

  async logout(): Promise<{ message: string }> {
    return json("/api/auth/logout", {});
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>("/api/auth/me");
  },

  // Personalization / Assessment
  async customizeProfile(problems: string[], description: string): Promise<{
    settings: AccessibilitySettings;
    customization_summary: string;
    profile_id?: string;
  }> {
    return json("/api/profile/customize", { problems, description });
  },

  async suggestProfile(userInput: string): Promise<{
    suggestion: any;
    profile_id?: string;
  }> {
    return json("/api/profile/suggest", { user_input: userInput });
  },

  async approveProfile(approvedSettings: AccessibilitySettings): Promise<{
    status: string;
    profile_id: string;
    settings: AccessibilitySettings;
  }> {
    return json("/api/profile/approve", { approved_settings: approvedSettings });
  },

  // Built-in Images & Sensory Guides (replaces camera & OCR)
  async getBuiltInImages(category?: string): Promise<BuiltInImagesResponse> {
    const query = category && category !== "all" ? `?category=${encodeURIComponent(category)}` : "";
    return request<BuiltInImagesResponse>(`/api/images${query}`);
  },

  async getBuiltInImage(id: string): Promise<BuiltInImage> {
    return request<BuiltInImage>(`/api/images/${encodeURIComponent(id)}`);
  },

  // Read For Me - Autistic-Friendly Rewriter (replaces images)
  async rewriteAutisticFriendly(text: string): Promise<{ text: string; [key: string]: any }> {
    return json("/api/read-for-me", { text });
  },

  // Explain Simply
  async explainText(text: string, mode: string = "plain_language"): Promise<{ text: string; [key: string]: any }> {
    return json("/api/explain", { text, mode });
  },

  // Say It For Me
  async sayMessage(intent: string, context?: string | null, tone: string = "gentle_polite"): Promise<{ text: string; [key: string]: any }> {
    return json("/api/say", { intent, context: context || null, tone });
  },

  // Calm Me Grounding Sequence
  async getCalm(): Promise<CalmResponse> {
    return request<CalmResponse>("/api/calm");
  },

  // Daily Habits & Routine
  async getHabits(): Promise<{ habits: Habit[]; stats?: HabitStats }> {
    return request<{ habits: Habit[]; stats?: HabitStats }>("/api/habits");
  },

  async addHabit(title: string, timeOfDay: string = "anytime", icon: string = "sparkles", notes: string = ""): Promise<{ habit: Habit; stats?: HabitStats }> {
    return json("/api/habits", {
      title,
      time_of_day: timeOfDay,
      icon,
      notes
    });
  },

  async toggleHabit(id: string): Promise<{ habit: Habit; stats?: HabitStats }> {
    return json(`/api/habits/${encodeURIComponent(id)}/toggle`, {});
  },

  async deleteHabit(id: string): Promise<{ success: boolean; stats?: HabitStats }> {
    return request<{ success: boolean; stats?: HabitStats }>(`/api/habits/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
  },

  async resetHabits(): Promise<{ message: string; habits?: Habit[]; stats?: HabitStats }> {
    return json("/api/habits/reset", {});
  },

  async suggestHabits(focus: string, problems: string[] = []): Promise<{ suggestions: HabitSuggestion[] }> {
    return json("/api/habits/suggest", { focus, problems });
  },

  // Task Breakdown
  async breakdownTask(task: string, currentEnergy: string = "medium"): Promise<{ text: string; steps?: string[]; [key: string]: any }> {
    return json("/api/tasks/breakdown", { task, energyLevel: currentEnergy, current_energy: currentEnergy });
  },

  // Safe Journey Routing
  async findRoute(origin: string, destination: string, mode: string = "walking", avoid?: string): Promise<RouteResponse> {
    const body: any = { origin, destination, mode };
    if (avoid) body.avoid = avoid;
    return json<RouteResponse>("/api/route", body);
  },

  async findAlternativeRoute(origin: string, destination: string, mode: string = "walking", avoid?: string): Promise<RouteResponse> {
    const body: any = { origin, destination, mode };
    if (avoid) body.avoid = avoid;
    return json<RouteResponse>("/api/route/alternative", body);
  },

  // SOS Confirmation
  async sendSos(message: string, contact: string, confirmed: boolean = true): Promise<SosResponse> {
    return json<SosResponse>("/api/sos", {
      message,
      contact,
      confirmed
    });
  }
};
