import type {
  AccessibilitySettings,
  Habit,
  RouteData,
  User,
} from "../types";

const API = "";
let token: string | null =
  localStorage.getItem("neurosafe_token") ||
  sessionStorage.getItem("neurosafe_token");

export function getToken() {
  return token;
}

export function setToken(value: string | null, remember = true) {
  token = value;
  if (value) {
    if (remember) {
      localStorage.setItem("neurosafe_token", value);
      sessionStorage.removeItem("neurosafe_token");
    } else {
      sessionStorage.setItem("neurosafe_token", value);
      localStorage.removeItem("neurosafe_token");
    }
  } else {
    localStorage.removeItem("neurosafe_token");
    sessionStorage.removeItem("neurosafe_token");
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

export function postJson<T>(path: string, body: unknown) {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function postForm<T>(path: string, form: FormData) {
  return request<T>(path, { method: "POST", body: form });
}

export const api = {
  health: () => request("/health"),

  auth: {
    login: (email: string, password: string) =>
      postJson<{ token: string; user: User }>("/api/auth/login", {
        email,
        password,
      }),
    register: (name: string, email: string, password: string) =>
      postJson<{ token: string; user: User }>("/api/auth/register", {
        name,
        email,
        password,
      }),
    demo: () => postJson<{ token: string; user: User }>("/api/auth/demo", {}),
    logout: () => postJson("/api/auth/logout", {}),
    me: () => request<{ user: User }>("/api/auth/me"),
  },

  profile: {
    customize: (problems: string[], description: string) =>
      postJson<{
        settings: Record<string, unknown>;
        customization_summary?: string;
      }>("/api/profile/customize", { problems, description }),

    suggest: (user_input: string) =>
      postJson<{ suggestion: Record<string, any> }>("/api/profile/suggest", {
        user_input,
      }),

    approve: (approved_settings: Record<string, unknown>) =>
      postJson<{
        profile_id: string;
        settings: Record<string, unknown>;
      }>("/api/profile/approve", { approved_settings }),
  },

  read: (image: File | Blob) => {
    const form = new FormData();
    form.append("image", image, image instanceof File ? image.name : "image.jpg");
    return postForm<any>("/api/read", form);
  },

  camera: {
    capture: (image: Blob | File) => {
      const form = new FormData();
      form.append("image", image, image instanceof File ? image.name : "camera_capture.jpg");
      return postForm<any>("/api/camera/capture", form);
    },
    describe: (image: Blob | File) => {
      const form = new FormData();
      form.append("image", image, image instanceof File ? image.name : "scene_frame.jpg");
      return postForm<any>("/api/camera/describe", form);
    },
    analyze: (image: Blob | File) => {
      const form = new FormData();
      form.append("image", image, image instanceof File ? image.name : "analysis_frame.jpg");
      return postForm<any>("/api/camera/analyze", form);
    },
  },

  explain: (text: string) =>
    postJson<{ text: string }>("/api/explain", { text }),

  say: (intent: string, context?: string, tone?: string) =>
    postJson<{ text: string }>("/api/say", {
      intent,
      context: context || null,
      tone: tone || undefined,
    }),

  calm: () => request<{ steps: string[] }>("/api/calm"),

  tasks: {
    breakdown: (task: string) =>
      postJson<{ text: string }>("/api/tasks/breakdown", { task }),
  },

  habits: {
    list: () =>
      request<{ habits: Habit[]; stats: HabitStats }>("/api/habits"),
    add: (title: string, time_of_day: string, icon: string, notes = "") =>
      postJson<{ habit: Habit; stats: HabitStats }>("/api/habits", {
        title,
        time_of_day,
        icon,
        notes,
      }),
    toggle: (id: string) =>
      postJson<{ habit?: Habit; stats?: HabitStats }>(
        `/api/habits/${encodeURIComponent(id)}/toggle`,
        {},
      ),
    remove: (id: string) =>
      request<{ stats?: HabitStats }>(
        `/api/habits/${encodeURIComponent(id)}`,
        { method: "DELETE" },
      ),
    reset: () => postJson("/api/habits/reset", {}),
    suggest: (focus: string, problems: string[]) =>
      postJson<{ suggestions: Habit[] }>("/api/habits/suggest", {
        focus,
        problems,
      }),
  },

  route: {
    find: (origin: string, destination: string, mode: string) =>
      postJson<RouteData>("/api/route", { origin, destination, mode }),
    alternative: (
      origin: string,
      destination: string,
      mode: string,
      avoid: string,
    ) =>
      postJson<RouteData>("/api/route/alternative", {
        origin,
        destination,
        mode,
        avoid,
      }),
  },

  sos: (message: string, contact: string) =>
    postJson<{
      timestamp: string;
      status: string;
      message: string;
      contact?: string;
    }>("/api/sos", {
      message,
      contact,
      confirmed: true,
    }),
};

export function normalizeSettings(
  settings: Record<string, any> | undefined,
  current: AccessibilitySettings,
): AccessibilitySettings {
  if (!settings) return current;
  return {
    low_stimulation_interface:
      settings.low_stimulation_interface ??
      current.low_stimulation_interface,
    plain_language_mode:
      settings.plain_language_mode ??
      settings.simplify_text ??
      current.plain_language_mode,
    step_by_step_tasks:
      settings.step_by_step_tasks ??
      settings.step_by_step ??
      current.step_by_step_tasks,
    read_aloud_enabled:
      settings.read_aloud_enabled ??
      settings.read_aloud ??
      current.read_aloud_enabled,
  };
}

export function formatOcr(data: any): string {
  if (!data) return "";
  if (typeof data === "string") return data;
  return (
    data.text ||
    data.extracted_text ||
    data.ocr_text ||
    data.transcription ||
    JSON.stringify(data, null, 2)
  );
}
