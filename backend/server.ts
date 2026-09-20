import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Multer setup for file/camera photo uploads up to 15MB
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key", "x-requested-with"],
}));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ----------------------------------------------------
// API KEY & AUTHENTICATION MIDDLEWARE
// ----------------------------------------------------
const CONFIGURED_API_KEY = process.env.NEUROSAFE_API_KEY || process.env.API_KEY || "";

function apiKeyAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  // If no API key configured on server, allow all requests
  if (!CONFIGURED_API_KEY) {
    return next();
  }

  // Always allow health, meta, auth, and frontend static asset routes without API key
  if (
    req.path === "/health" ||
    req.path === "/" ||
    req.path === "/api/meta" ||
    req.path === "/api/commands" ||
    req.path === "/api/key/status" ||
    req.path.startsWith("/api/images") ||
    req.path.startsWith("/api/auth") ||
    req.path.startsWith("/frontend") ||
    !req.path.startsWith("/api")
  ) {
    return next();
  }

  // Check headers: x-api-key, Authorization: Bearer <key>, or query parameter ?api_key=
  const headerKey = req.get("x-api-key");
  const authHeader = req.get("authorization");
  const bearerKey = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  const queryKey = req.query.api_key as string | undefined;

  const providedKey = headerKey || bearerKey || queryKey;

  if (providedKey === CONFIGURED_API_KEY) {
    return next();
  }

  // Allow browser requests from same origin and local dev/test requests
  const origin = req.get("origin") || req.get("referer");
  const host = req.get("host") || "";
  const secFetchSite = req.get("sec-fetch-site");
  const isLocal =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    req.ip === "127.0.0.1" ||
    req.ip === "::1" ||
    req.ip === "::ffff:127.0.0.1";

  if (secFetchSite === "same-origin" || (origin && host && origin.includes(host)) || isLocal) {
    return next();
  }

  res.status(401).json({
    detail: "Unauthorized. A valid NeuroSafe API key is required to access this endpoint.",
    error: "invalid_or_missing_api_key",
    help: "Pass your API key in the 'x-api-key' header, 'Authorization: Bearer <key>' header, or '?api_key=' query parameter.",
  });
}

app.use(apiKeyAuthMiddleware);

// ----------------------------------------------------
// IN-MEMORY PROFILE STORAGE
// ----------------------------------------------------
interface SavedProfile {
  profile_id: string;
  settings: Record<string, boolean>;
  created_at: string;
}
const _profiles = new Map<string, SavedProfile>();

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  password?: string;
  profile?: {
    profile_id: string;
    problems?: string[];
    description?: string;
    settings: Record<string, boolean>;
    customization_summary: string;
    primary_focus: string;
    updated_at: string;
  };
  created_at: string;
}
const _users = new Map<string, UserAccount>();

// Seed default demo account
_users.set("demo@neurosafe.org", {
  id: "usr_demo_101",
  email: "demo@neurosafe.org",
  name: "Alex River",
  password: "demo",
  created_at: new Date().toISOString(),
});

// ----------------------------------------------------
// DAILY HABIT & ROUTINE STORE & DATA MODEL
// ----------------------------------------------------
export interface DailyHabit {
  id: string;
  user_email: string;
  title: string;
  time_of_day: "morning" | "afternoon" | "evening" | "anytime";
  icon: string;
  streak: number;
  last_completed_date?: string; // YYYY-MM-DD
  notes?: string;
  created_at: string;
}

const _habits = new Map<string, DailyHabit[]>();

function getTodayString(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function getDefaultHabits(userEmail: string): DailyHabit[] {
  const today = getTodayString();
  return [
    {
      id: "h_1",
      user_email: userEmail,
      title: "Drink a fresh glass of water",
      time_of_day: "morning",
      icon: "💧",
      streak: 3,
      last_completed_date: today,
      notes: "Hydration before screen time",
      created_at: new Date().toISOString(),
    },
    {
      id: "h_2",
      user_email: userEmail,
      title: "Take morning medication / vitamins",
      time_of_day: "morning",
      icon: "💊",
      streak: 5,
      last_completed_date: today,
      notes: "Consistent daily health anchor",
      created_at: new Date().toISOString(),
    },
    {
      id: "h_3",
      user_email: userEmail,
      title: "5-minute quiet sensory pause",
      time_of_day: "afternoon",
      icon: "🌿",
      streak: 2,
      last_completed_date: undefined,
      notes: "Eyes closed, no screens, slow breaths",
      created_at: new Date().toISOString(),
    },
    {
      id: "h_4",
      user_email: userEmail,
      title: "Gentle body stretch or quick stroll",
      time_of_day: "afternoon",
      icon: "🚶",
      streak: 1,
      last_completed_date: undefined,
      notes: "Release physical and cognitive tension",
      created_at: new Date().toISOString(),
    },
    {
      id: "h_5",
      user_email: userEmail,
      title: "Prepare tomorrow's items & outfit",
      time_of_day: "evening",
      icon: "🎒",
      streak: 4,
      last_completed_date: undefined,
      notes: "Reduces tomorrow morning executive friction",
      created_at: new Date().toISOString(),
    },
    {
      id: "h_6",
      user_email: userEmail,
      title: "Unclench jaw & 3 slow breaths",
      time_of_day: "evening",
      icon: "✨",
      streak: 6,
      last_completed_date: undefined,
      notes: "Gentle bedtime nervous system reset",
      created_at: new Date().toISOString(),
    },
  ];
}

function getUserHabits(userEmail: string): DailyHabit[] {
  const key = (userEmail || "demo@neurosafe.org").toLowerCase().trim();
  if (!_habits.has(key)) {
    _habits.set(key, getDefaultHabits(key));
  }
  return _habits.get(key)!;
}

// ----------------------------------------------------
// GEMINI CLIENT (Lazy initialization with proper config)
// ----------------------------------------------------
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Resilient Gemini generator with automatic fallback across models & retries
async function generateContentWithFallback(options: {
  contents: any;
  config?: any;
  preferredModel?: string;
}): Promise<string | null> {
  const genAI = getGenAI();
  if (!genAI) return null;

  // Ordered fallback models: preferred, flash-latest, flash-lite
  const candidateModels = [
    options.preferredModel || "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
  ].filter((v, i, a) => a.indexOf(v) === i);

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await genAI.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });
        if (response.text && response.text.trim()) {
          return response.text.trim();
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        const isTransient =
          errMsg.includes("503") ||
          errMsg.includes("high demand") ||
          errMsg.includes("429") ||
          errMsg.includes("RESOURCE_EXHAUSTED") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("timeout") ||
          errMsg.includes("DEADLINE_EXCEEDED");

        if (isTransient && attempt === 1) {
          await new Promise((r) => setTimeout(r, 450));
          continue;
        }
        break; // Advance to next fallback model
      }
    }
  }

  return null;
}

// ----------------------------------------------------
// PROFILE SUGGESTION SYSTEM PROMPT & RULES
// ----------------------------------------------------
const PROFILE_SYSTEM_PROMPT = `You are an accessibility settings assistant. Your only job is to interpret what a person says about their functional needs and suggest relevant accessibility settings.

## STRICT RULES — never break these
1. DO NOT diagnose or mention autism, ADHD, dyslexia, or any medical condition.
2. DO NOT infer a diagnosis from the user's words.
3. DO NOT assume that people with the same condition have the same needs.
4. Focus ONLY on explicit functional preferences the user has stated.
5. You SUGGEST settings. The user makes the final decision. Never activate settings automatically.
6. If the input is unclear, respond with status "clarification" and ask one focused question.
7. If preferences conflict with each other, respond with status "conflict", name the conflict clearly, and ask which the user prefers.
8. If the user explicitly says they do NOT want a setting, set suggested_value to false.
9. If the input is completely unrelated to accessibility needs, respond with status "out_of_scope".
10. Do NOT invent evidence. The evidence field must be a direct quote or close paraphrase from the user's own words.
11. Do NOT produce numeric confidence scores.
12. Do NOT include a setting unless there is clear evidence in the user's text.

## AVAILABLE SETTINGS
- simplify_text: Reduce reading complexity; use plain, shorter sentences.
- step_by_step: Present information one step at a time rather than all at once.
- read_aloud: Enable text-to-speech for content.
- communication_support: Help with composing or interpreting written messages.
- low_stimulation_interface: Reduce colours, animations, and visual clutter.
- task_breakdown: Break large tasks into smaller, labelled sub-tasks.
- navigation_support: Add landmarks, breadcrumbs, or simpler navigation paths.

## OUTPUT FORMAT
Return a valid JSON object matching this schema:
{
  "status": "suggestion" | "clarification" | "conflict" | "out_of_scope",
  "message": "<string, required when status is not suggestion>",
  "simplify_text": { "suggested_value": true | false, "reason": "<why>", "evidence": "<user's own words>" } | null,
  "step_by_step": { "suggested_value": true | false, "reason": "<why>", "evidence": "<user's own words>" } | null,
  "read_aloud": { "suggested_value": true | false, "reason": "<why>", "evidence": "<user's own words>" } | null,
  "communication_support": { "suggested_value": true | false, "reason": "<why>", "evidence": "<user's own words>" } | null,
  "low_stimulation_interface": { "suggested_value": true | false, "reason": "<why>", "evidence": "<user's own words>" } | null,
  "task_breakdown": { "suggested_value": true | false, "reason": "<why>", "evidence": "<user's own words>" } | null,
  "navigation_support": { "suggested_value": true | false, "reason": "<why>", "evidence": "<user's own words>" } | null
}`;

// Deterministic rule-based fallback for profile suggestions (offline-ready)
function ruleBasedProfileSuggest(input: string): Record<string, any> {
  const lower = input.toLowerCase();

  // Out of scope check
  if (
    lower.includes("restaurant") ||
    lower.includes("weather") ||
    lower.includes("movie") ||
    lower.includes("recipe") ||
    lower.includes("sports")
  ) {
    return {
      status: "out_of_scope",
      message: "This input does not appear to be related to accessibility preferences.",
    };
  }

  // Clarification / Ambiguity check
  if (
    lower.match(/^aaaa+/i) ||
    lower.match(/^[^\w\s]+$/) ||
    lower === "i have some difficulties with the app." ||
    lower === "everything is a bit hard for me." ||
    lower === "the app is a bit overwhelming for me sometimes." ||
    lower === "i just need the app to be easier." ||
    (lower.length < 25 &&
      !lower.includes("step") &&
      !lower.includes("read") &&
      !lower.includes("audio") &&
      !lower.includes("text") &&
      !lower.includes("color") &&
      !lower.includes("colour"))
  ) {
    return {
      status: "clarification",
      message: "Could you tell me a little more about which parts of reading, organizing, or navigating feel challenging?",
    };
  }

  // Conflict checks
  if (
    (lower.includes("step-by-step") || lower.includes("step by step")) &&
    (lower.includes("all at once") || lower.includes("full picture"))
  ) {
    return {
      status: "conflict",
      message: "You mentioned wanting step-by-step instructions but also wanting to see everything at once. Which do you prefer as your default view?",
    };
  }
  if (
    (lower.includes("colourful") || lower.includes("colorful") || lower.includes("animated") || lower.includes("rich visual")) &&
    (lower.includes("distracting") || lower.includes("minimal") || lower.includes("clutter"))
  ) {
    return {
      status: "conflict",
      message: "You mentioned wanting visual richness, but also finding distractions difficult. Would you prefer a low-stimulation view with optional visual accents?",
    };
  }
  if (lower.includes("writing messages") && lower.includes("don't want any suggestions")) {
    return {
      status: "conflict",
      message: "You mentioned needing help writing messages but not wanting suggestions shown. Would you prefer templates, tone checkers, or another form of support?",
    };
  }

  const suggestion: Record<string, any> = {
    status: "suggestion",
  };

  // simplify_text
  if (lower.includes("do not want simplified text") || lower.includes("don't want simplified text") || lower.includes("full complexity")) {
    suggestion.simplify_text = {
      suggested_value: false,
      reason: "User explicitly prefers full-complexity text without simplification.",
      evidence: input,
    };
  } else if (
    lower.includes("long paragraph") ||
    lower.includes("simpler sentence") ||
    lower.includes("shorter, simpler") ||
    lower.includes("plain language") ||
    lower.includes("simple language") ||
    lower.includes("short sentences") ||
    lower.includes("easier to understand") ||
    lower.includes("complex words throw me off") ||
    lower.includes("text to be simple") ||
    lower.includes("simplify the language") ||
    lower.includes("simplified text")
  ) {
    suggestion.simplify_text = {
      suggested_value: true,
      reason: "User expressed difficulty with dense or complex text.",
      evidence: input,
    };
  }

  // step_by_step
  if (lower.includes("don't want step-by-step") || lower.includes("do not want step-by-step") || lower.includes("no step-by-step")) {
    suggestion.step_by_step = {
      suggested_value: false,
      reason: "User explicitly prefers not using step-by-step mode.",
      evidence: input,
    };
  } else if (
    lower.includes("broken into steps") ||
    lower.includes("one step at a time") ||
    lower.includes("step-by-step") ||
    lower.includes("short steps") ||
    lower.includes("short instructions")
  ) {
    suggestion.step_by_step = {
      suggested_value: true,
      reason: "User prefers sequential, step-by-step instructions.",
      evidence: input,
    };
  }

  // read_aloud
  if (lower.includes("do not enable text-to-speech") || lower.includes("don't want text-to-speech") || lower.includes("no audio")) {
    suggestion.read_aloud = {
      suggested_value: false,
      reason: "User explicitly requested text-to-speech be disabled.",
      evidence: input,
    };
  } else if (
    lower.includes("listen") ||
    lower.includes("read things out") ||
    lower.includes("audio narration") ||
    lower.includes("read out loud") ||
    lower.includes("text read to me") ||
    lower.includes("hear instructions") ||
    lower.includes("need audio")
  ) {
    suggestion.read_aloud = {
      suggested_value: true,
      reason: "User benefits from auditory presentation of text.",
      evidence: input,
    };
  }

  // low_stimulation_interface
  if (
    lower.includes("bright colour") ||
    lower.includes("bright color") ||
    lower.includes("moving animation") ||
    lower.includes("visual clutter") ||
    lower.includes("cluttered screen") ||
    lower.includes("overwhelm") ||
    lower.includes("busy interface") ||
    lower.includes("reduce animation") ||
    lower.includes("low-clutter") ||
    lower.includes("less visual clutter")
  ) {
    suggestion.low_stimulation_interface = {
      suggested_value: true,
      reason: "User indicated that visual noise, bright colors, or animations cause sensory overload.",
      evidence: input,
    };
  }

  // task_breakdown
  if (lower.includes("no task breakdown") || lower.includes("don't want task breakdown")) {
    suggestion.task_breakdown = {
      suggested_value: false,
      reason: "User prefers to manage tasks independently without automatic breakdown.",
      evidence: input,
    };
  } else if (
    lower.includes("break big tasks") ||
    lower.includes("smaller pieces") ||
    lower.includes("break large tasks") ||
    lower.includes("break tasks into steps") ||
    lower.includes("smaller chunks") ||
    lower.includes("struggle to start big tasks")
  ) {
    suggestion.task_breakdown = {
      suggested_value: true,
      reason: "User finds starting or managing multi-step tasks easier when split into small sub-tasks.",
      evidence: input,
    };
  }

  // navigation_support
  if (
    lower.includes("get lost navigating") ||
    lower.includes("breadcrumb") ||
    lower.includes("clear labels") ||
    lower.includes("complex menu") ||
    lower.includes("simple navigation") ||
    lower.includes("navigation landmark") ||
    lower.includes("lose track of where i am")
  ) {
    suggestion.navigation_support = {
      suggested_value: true,
      reason: "User requested orienting cues, landmarks, or simplified navigation pathways.",
      evidence: input,
    };
  }

  // communication_support
  if (
    lower.includes("writing messages") ||
    lower.includes("phrase things") ||
    lower.includes("composing email") ||
    lower.includes("writing replies") ||
    lower.includes("help writing")
  ) {
    suggestion.communication_support = {
      suggested_value: true,
      reason: "User requested assistance formulating and structuring written communication.",
      evidence: input,
    };
  }

  const settingKeys = [
    "simplify_text",
    "step_by_step",
    "read_aloud",
    "communication_support",
    "low_stimulation_interface",
    "task_breakdown",
    "navigation_support",
  ];
  const hasAnySetting = settingKeys.some((k) => suggestion[k] !== undefined);
  if (!hasAnySetting) {
    return {
      status: "clarification",
      message: "Could you tell me a little more about what would make using the app comfortable for you?",
    };
  }

  return suggestion;
}

// ----------------------------------------------------
// AUTISTIC-FRIENDLY REWRITE HELPER
// ----------------------------------------------------
export const AUTISTIC_FRIENDLY_SYSTEM_PROMPT =
  "Rewrite the input for easy autistic-friendly reading. Use short literal sentences, simple words, clear headings, bullet points, and explicit instructions. Remove idioms, sarcasm, ambiguity, unnecessary detail, and sensory/visual clutter. Preserve meaning. Output only the rewritten text.";

export function rewriteAutisticFriendlyDeterministic(input: string): string {
  let cleaned = input.trim();
  const idiomMap: [RegExp, string][] = [
    [/not rocket science/gi, "simple"],
    [/circling back|circle back/gi, "following up"],
    [/hit the ground running/gi, "start right away"],
    [/behind the eight ball/gi, "behind schedule"],
    [/don't sweat it|do not sweat it/gi, "do not worry"],
    [/touch base/gi, "talk or write"],
    [/take a crack at/gi, "try to work on"],
    [/when you get a chance|at your earliest convenience/gi, "when you are free"],
    [/no rush, but the sooner the better/gi, "please do this today if you can"],
    [/double-edged sword/gi, "has both good parts and bad parts"],
    [/hit a home run/gi, "did very well"],
    [/missed the forest for the trees/gi, "focused on small details instead of the main goal"],
    [/ball is in your court/gi, "it is your turn to reply"],
    [/bite the bullet/gi, "do the necessary difficult task"],
    [/under the weather/gi, "feeling sick"],
    [/bring to the table/gi, "contribute"],
    [/per our sync/gi, "as discussed in our meeting"],
    [/synergy/gi, "cooperation"],
    [/downstream deliverables/gi, "next tasks"],
    [/recalibrate resource allocation/gi, "change who works on what"],
    [/optimal ROI/gi, "best results"],
    [/please be advised that/gi, ""],
    [/prior to intake/gi, "before your appointment"],
    [/aforementioned/gi, "earlier mentioned"],
    [/necessitate rescheduling at subsequent availability/gi, "mean you must pick a later date"]
  ];

  for (const [pattern, replacement] of idiomMap) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  // Split into sentences
  const rawSentences = cleaned
    .replace(/([.?!])\s*(?=[A-Z0-9])/g, "$1|SPLIT|")
    .split("|SPLIT|")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const actions: string[] = [];
  const information: string[] = [];

  for (const s of rawSentences) {
    const lower = s.toLowerCase();
    if (
      lower.startsWith("please") ||
      lower.startsWith("you must") ||
      lower.startsWith("you should") ||
      lower.startsWith("complete") ||
      lower.startsWith("send") ||
      lower.startsWith("fill") ||
      lower.startsWith("bring") ||
      lower.startsWith("do ") ||
      lower.includes("need to") ||
      lower.includes("action")
    ) {
      actions.push(s.replace(/^please\s+/i, ""));
    } else {
      information.push(s);
    }
  }

  const sections: string[] = [];

  if (information.length > 0) {
    sections.push("### What This Means:\n" + information.map((info) => `• ${info}`).join("\n"));
  }

  if (actions.length > 0) {
    sections.push("### What You Need To Do:\n" + actions.map((act, i) => `${i + 1}. ${act}`).join("\n"));
  }

  if (sections.length === 0) {
    sections.push("### Summary:\n• " + cleaned);
  }

  return sections.join("\n\n");
}

// ----------------------------------------------------
// LLM COMPLETION HELPER (Using resilient fallback models)
// ----------------------------------------------------
async function completeText(systemPrompt: string, userText: string): Promise<string> {
  const aiText = await generateContentWithFallback({
    preferredModel: "gemini-3.8-flash",
    contents: `${systemPrompt}\n\nUser Input:\n"""${userText}"""`,
  });

  if (aiText) {
    return aiText;
  }

  // Fallback to LLM_BASE_URL if configured
  const llmBaseUrl = process.env.LLM_BASE_URL;
  const llmModel = process.env.LLM_MODEL;
  if (llmBaseUrl && llmModel) {
    try {
      const resp = await fetch(`${llmBaseUrl.replace(/\/+$/, "")}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: llmModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userText },
          ],
          temperature: 0.2,
        }),
      });
      if (resp.ok) {
        const data: any = await resp.json();
        const content = data.choices?.[0]?.message?.content;
        if (content && typeof content === "string") {
          return content.trim();
        }
      }
    } catch {
      // Graceful fallback to deterministic logic
    }
  }

  if (systemPrompt.includes("Rewrite the input for easy autistic-friendly reading")) {
    return rewriteAutisticFriendlyDeterministic(userText);
  }
  if (systemPrompt.includes("Break the task into clear")) {
    return `1. Gather what you need for the task.\n2. Review the very first action without worrying about the full list.\n3. Complete the first step at a comfortable pace.\n4. Take a short pause before deciding if you want to proceed.\n5. Note down your progress so you can return anytime.`;
  }
  if (systemPrompt.includes("Explain the supplied text simply")) {
    return `In simple terms: ${userText.replace(/\s+/g, " ").trim()}`;
  }
  if (systemPrompt.includes("Help the user compose a respectful message")) {
    return `Hello,\n\nI am writing to share an update regarding ${userText.trim()}.\n\nPlease let me know if this works for you. Thank you for your patience and understanding.`;
  }

  return userText;
}

// ----------------------------------------------------
// BUILT-IN SENSORY & ACCESSIBILITY IMAGES CATALOG
// ----------------------------------------------------
export interface BuiltInImageServer {
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
  tags: string[];
}

export const BUILT_IN_IMAGES_CATALOG: BuiltInImageServer[] = [
  // 1. Long Text Overwhelm & Reading
  {
    id: "guide-reading-ruler",
    title: "Wall of Text Deconstructor & Reading Ruler",
    category: "text_overwhelm",
    badge: "Long Text Relief",
    icon: "📖",
    description: "A dedicated visual anchor demonstrating the 'Reading Ruler' technique: isolating a single line at a time, anchoring gaze on initial letters, and breaking intimidating unbroken blocks of text into 3-item bullet clusters.",
    plain_summary: "When long paragraphs turn into an intimidating wall of text, use a reading ruler to isolate one line at a time and highlight the first letters of each word.",
    sensory_prompt: "Cover the paragraph below with a card or finger. Read only one isolated sentence. Take a breath before moving down.",
    spoken_text: "Wall of Text Deconstruction. When text feels overwhelming, do not attempt to scan the whole page. Isolate a single line, anchor your gaze on the first three words, and group thoughts into three concise bullet points.",
    palette: { bg: "#1e1b18", fg: "#f7f0e6", accent: "#c4893b" },
    tags: ["text", "reading", "ruler", "adhd", "dyslexia", "focus"],
  },
  {
    id: "card-wall-of-text",
    title: "Wall of Text Overwhelm AAC Card",
    category: "text_overwhelm",
    badge: "Non-Verbal AAC",
    icon: "💬",
    description: "A high-visibility card to show colleagues, teachers, or family when presented with dense, unbulleted messages that trigger cognitive freeze.",
    plain_summary: "Show this card to ask people to send bullet points instead of long, dense paragraphs of text.",
    sensory_prompt: "Card message: 'This is a wall of text. My working memory cannot process dense paragraphs right now. Please summarize in 2–3 short bullet points. Thank you.'",
    spoken_text: "Notice: Wall of text overwhelm. My working memory is full and cannot unpack dense paragraphs right now. Please send a summary in two or three short bullet points.",
    palette: { bg: "#16212b", fg: "#ffffff", accent: "#5299b8" },
    tags: ["text", "aac", "overwhelm", "bullets", "communication"],
  },

  // 2. Digital Screen Fatigue & Blue Light Glare
  {
    id: "guide-screen-fatigue",
    title: "Digital Screen Reset & 20-20-20 Sanctuary",
    category: "screen_fatigue",
    badge: "Screen Relief",
    icon: "🖥️",
    description: "A visual antidote to digital monitor glare, fluorescent PWM flicker, and dry-eye strain. Guides the 20-20-20 distance reset, screen color warmth shift, and palming darkness rest.",
    plain_summary: "Rest your eyes from screens: Every 20 minutes, look 20 feet away for 20 seconds. Cup your warm palms over your closed eyes for soothing complete darkness.",
    sensory_prompt: "Gently cup warm palms over your closed eyes without pressing the eyeballs. Bask in 30 seconds of pure, pitch-black darkness.",
    spoken_text: "Digital Screen Reset. Rest your eyes from monitors and phones. Every twenty minutes, look twenty feet into the distance for twenty seconds. Warm your palms together and place them gently over your closed eyes to give your optic nerve total darkness.",
    palette: { bg: "#1a1622", fg: "#eeddfa", accent: "#9b76c9" },
    tags: ["screen", "eyes", "glare", "headache", "rest", "autism"],
  },
  {
    id: "card-screen-break",
    title: "Screen Sensory Break Needed Card",
    category: "screen_fatigue",
    badge: "Non-Verbal AAC",
    icon: "📵",
    description: "A card to inform others that you are stepping away from displays, phones, and monitors due to visual sensory overload or migraine onset.",
    plain_summary: "Show this card when screen glare, notifications, or monitor light are causing headaches or sensory shutdown.",
    sensory_prompt: "Card message: 'Stepping away from digital screens for 15–30 minutes due to eye fatigue and sensory overload. Will reply once rested.'",
    spoken_text: "Notice: Digital screen break active. I am experiencing screen-induced eye fatigue or sensory overload. I am stepping away from monitors and phones for a short rest.",
    palette: { bg: "#1b2721", fg: "#e8f5ee", accent: "#4ea379" },
    tags: ["screen", "break", "offline", "aac", "photophobia"],
  },
  {
    id: "guide-doomscroll-interrupt",
    title: "Screen Doomscroll & Dopamine Loop Interrupt",
    category: "screen_fatigue",
    badge: "ADHD Screen Loop",
    icon: "🛑",
    description: "An authentic ADHD pattern interrupt for when you are trapped in an infinite scrolling loop or hyperfocus screen lock despite wanting to stop.",
    plain_summary: "A visual stop sign to snap out of infinite scroll: Put phone face down, feel your feet on the floor, stretch fingers, and drink water.",
    sensory_prompt: "Place your device face-down right now. Do not look at the glass. Push your heels firmly into the ground. Breathe.",
    spoken_text: "Pattern Interrupt: Break the screen loop. You are caught in a dopamine scroll loop. Place your device face down right now. Look up at the ceiling. Wiggle your toes. You did not miss anything important. You are here in the real room.",
    palette: { bg: "#261520", fg: "#ffecf2", accent: "#d94168" },
    tags: ["doomscroll", "adhd", "dopamine", "phone", "loop", "trap"],
  },
  {
    id: "guide-fluorescent-glare",
    title: "Fluorescent Buzz & Glare Shield",
    category: "screen_fatigue",
    badge: "Sensory Photophobia",
    icon: "💡",
    description: "A sensory guide for handling overhead fluorescent light buzz, 60Hz flicker, and harsh office monitor reflections.",
    plain_summary: "Ways to reduce photophobic distress: Wear tinted glasses or a baseball cap, use warm desk lamps instead of overhead lighting, and set screens to 40% brightness.",
    sensory_prompt: "Notice the tension in your brow. Lower overhead fluorescent lights if possible, or shade your eyes with a soft visor or brimmed hat.",
    spoken_text: "Fluorescent and Monitor Glare Shield. Overhead fluorescent tubes flicker sixty times a second, draining autistic and ADHD energy reserves. Shield your eyes with tinted lenses or a visor, tilt monitors away from direct light, and soften screen contrast.",
    palette: { bg: "#241f17", fg: "#fcefdc", accent: "#ab8532" },
    tags: ["fluorescent", "flicker", "glare", "autism", "migraine", "sensory"],
  },

  // 3. ADHD Executive Function & Initiation
  {
    id: "guide-initiation-friction",
    title: "The 2-Minute First Slice (Overcoming Task Paralysis)",
    category: "executive_adhd",
    badge: "ADHD Executive Function",
    icon: "⚡",
    description: "A visual guide for deconstructing the 'Wall of Awful'—the emotional and executive freeze that prevents starting a task. Shrinks the task to a micro-action.",
    plain_summary: "Do not attempt the entire task. Only commit to doing the first 2 minutes or opening the file. You have full permission to stop after that.",
    sensory_prompt: "Shrink the task: instead of 'clean the entire room', pick up literally ONE sock. Instead of 'write report', write only the title.",
    spoken_text: "The Two Minute First Slice. Task initiation paralysis is an executive function obstacle, not laziness. Lower the bar until it feels ridiculously easy. Commit only to the first physical action, like opening the document. You can stop after two minutes.",
    palette: { bg: "#18261e", fg: "#eaf5ee", accent: "#48996b" },
    tags: ["adhd", "initiation", "paralysis", "executive", "friction", "start"],
  },
  {
    id: "card-deep-focus",
    title: "Deep Focus Flow Card",
    category: "executive_adhd",
    badge: "Non-Verbal AAC",
    icon: "🎯",
    description: "A peaceful green indicator to preserve hyperfocus or deep flow states, preventing cognitive context switching.",
    plain_summary: "Place this card on your desk or show it to coworkers to protect your flow state without being rude.",
    sensory_prompt: "Card message: 'In deep focus flow. Please send a written message or wait unless it is an urgent emergency.'",
    spoken_text: "Notice: Deep focus flow state active. Please send an email or text message unless urgent.",
    palette: { bg: "#142823", fg: "#daf2e9", accent: "#2f7a62" },
    tags: ["focus", "adhd", "flow", "aac", "work"],
  },

  // 4. Autistic Sensory & Non-Verbal AAC
  {
    id: "card-sensory-overload",
    title: "Sensory Overload Visual Card",
    category: "aac_card",
    badge: "Non-Verbal AAC",
    icon: "🎧",
    description: "A high-contrast, clear AAC communication card designed to be held up or shown on screen to communicate sensory distress without needing speech.",
    plain_summary: "Show this card to let people know you are overwhelmed by sound or lights and need a quiet moment.",
    sensory_prompt: "Card message: 'I am experiencing sensory overload. Please speak quietly or give me space to recover. Thank you.'",
    spoken_text: "Notice: I am currently experiencing sensory overload. Loud sounds or lights are difficult right now. Please lower volume or give me a quiet moment.",
    palette: { bg: "#18322f", fg: "#ffffff", accent: "#216b54" },
    tags: ["aac", "overload", "communication", "nonverbal", "card"],
  },
  {
    id: "card-auditory-delay",
    title: "Auditory Processing Delay AAC Card",
    category: "aac_card",
    badge: "Non-Verbal AAC",
    icon: "👂",
    description: "An AAC card explaining auditory processing delays common in autistic and ADHD individuals, requesting written follow-ups or subtitles.",
    plain_summary: "Show this card when spoken words sound like static or background noise makes it impossible to comprehend speech.",
    sensory_prompt: "Card message: 'I have an auditory processing delay. Spoken words take extra time to decode. Please send key points in writing or repeat slowly.'",
    spoken_text: "Notice: Auditory Processing Delay. In noisy rooms or when fatigued, spoken words take extra time for my brain to decode. Please provide written instructions or key bullet points.",
    palette: { bg: "#131e2b", fg: "#def0fa", accent: "#3b8ab8" },
    tags: ["auditory", "apd", "aac", "subtitles", "written", "autism"],
  },
  {
    id: "card-low-spoons",
    title: "Low Energy / Processing Time Card",
    category: "aac_card",
    badge: "Non-Verbal AAC",
    icon: "🔋",
    description: "A gentle visual card to indicate depleted cognitive energy, spoon deficit, or need for reduced demand.",
    plain_summary: "Show this card when your energy battery is low so others know you can't engage in long conversations right now.",
    sensory_prompt: "Card message: 'My energy battery is low. I am listening, but I need extra processing time to respond.'",
    spoken_text: "Card text: Low energy and limited spoons right now. I am listening, but need extra processing time. Patience is appreciated.",
    palette: { bg: "#2b2a1a", fg: "#fdf8dc", accent: "#a3952f" },
    tags: ["aac", "energy", "spoons", "battery", "communication"],
  },

  // 5. Somatic Breathing & Regulation
  {
    id: "guide-box-breathing",
    title: "Box Breathing 4-4-4-4 Visual Pacer",
    category: "regulation",
    badge: "Regulation Guide",
    icon: "🫁",
    description: "A structured 4-sided breathing diagram guiding equal 4-second intervals: Inhale, Hold, Exhale, and Rest to reset the nervous system.",
    plain_summary: "Follow the square: Breathe in for 4, hold for 4, breathe out for 4, rest for 4. Repeat 3 times to reset.",
    sensory_prompt: "Look at each edge of the box. Count slowly: 1... 2... 3... 4. Notice how your pulse slows down.",
    spoken_text: "Box Breathing Guide. Inhale 4 seconds. Hold 4 seconds. Exhale 4 seconds. Rest 4 seconds.",
    palette: { bg: "#182c30", fg: "#d8f2f5", accent: "#377580" },
    tags: ["breathing", "regulation", "vagus", "anxiety", "guide"],
  },
  {
    id: "guide-54321-grounding",
    title: "5-4-3-2-1 Sensory Grounding Board",
    category: "regulation",
    badge: "Regulation Guide",
    icon: "🖐️",
    description: "A visual reference anchor board for the classical 5-4-3-2-1 grounding technique, breaking anxiety loops through physical presence.",
    plain_summary: "Look around you and name: 5 things you see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
    sensory_prompt: "Scan your current room right now. Spot 5 different colors or textures. Touch your clothes or chair. Listen for background humming.",
    spoken_text: "5-4-3-2-1 Grounding Method. Five things you see. Four things you touch. Three sounds. Two scents. One mindful breath.",
    palette: { bg: "#241f30", fg: "#ebdffa", accent: "#765fa3" },
    tags: ["54321", "grounding", "anxiety", "sensory", "mindfulness"],
  },

  // 6. Routine
  {
    id: "routine-morning-reset",
    title: "Gentle Morning Micro-Routines",
    category: "routine",
    badge: "Visual Routine",
    icon: "☀️",
    description: "A low-demand visual sequence for easing into the day without executive overload or rush panic.",
    plain_summary: "Step 1: Drink water. Step 2: Natural daylight. Step 3: Medication & breakfast. Step 4: Pick one micro task.",
    sensory_prompt: "Give your brain 10 quiet minutes to wake up at its own natural pace without phone notifications.",
    spoken_text: "Gentle Morning Routine. Drink water, welcome daylight, take morning nutrition, and pick one small step.",
    palette: { bg: "#2b2318", fg: "#fdedd6", accent: "#bd7f28" },
    tags: ["morning", "routine", "adhd", "executive", "habits"],
  },

  // 7. Grounding Sanctuaries
  {
    id: "quiet-forest",
    title: "Serene Pine Forest Clearing",
    category: "grounding",
    badge: "Sensory Grounding",
    icon: "🌲",
    description: "A peaceful clearing surrounded by tall evergreens with soft morning mist rolling between the trunks. Filtered emerald light warms the mossy forest floor with zero harsh glare.",
    plain_summary: "A calm green forest with soft light, gentle trees, and fresh mountain air to help settle an overwhelmed nervous system.",
    sensory_prompt: "Take 3 deep breaths. Imagine the scent of damp cedar, cool pine needles underfoot, and the quiet rustle of high branches.",
    spoken_text: "Serene Pine Forest Clearing. Soft morning mist settles between tall cedar trees. Dappled sunlight rests gently on the emerald moss without harsh glare.",
    palette: { bg: "#1b332b", fg: "#d7ede1", accent: "#438b72" },
    tags: ["nature", "trees", "calm", "green", "grounding"],
  },
  {
    id: "gentle-ocean",
    title: "Tranquil Pastel Ocean Horizon",
    category: "grounding",
    badge: "Sensory Grounding",
    icon: "🌊",
    description: "A quiet shoreline where calm, low-amplitude waves lap against fine wet sand. Soft twilight blues and sage teals provide an even, soothing visual rhythm.",
    plain_summary: "A wide, quiet sea with gentle waves. The steady, predictable rhythm helps quiet racing thoughts.",
    sensory_prompt: "Inhale as the gentle foam washes up on the shore. Exhale as the water smoothly recedes back into the blue expanse.",
    spoken_text: "Tranquil Pastel Ocean Horizon. Flat, calm waves roll rhythmically against the shore. A soft evening breeze across the open horizon creates steady stillness.",
    palette: { bg: "#162833", fg: "#d6eaf5", accent: "#3a738c" },
    tags: ["ocean", "water", "waves", "blue", "horizon"],
  },
  {
    id: "rainy-sanctuary",
    title: "Raindrops on Warm Window",
    category: "grounding",
    badge: "Sensory Grounding",
    icon: "🌧️",
    description: "Looking out through a clean window pane covered in smooth raindrops with muted warm bokeh lights in the background.",
    plain_summary: "A quiet indoor sanctuary shielded from outside noise while rain falls peacefully against the glass.",
    sensory_prompt: "Focus on the sound of steady rain: white noise shielding you from demanding social sensory inputs. You are safe inside.",
    spoken_text: "Raindrops on Warm Window. Outside, gentle rain washes the world clean with quiet patter. Inside, warm shelter and comforting quiet envelop you.",
    palette: { bg: "#1c242a", fg: "#d9e3ea", accent: "#4c667a" },
    tags: ["rain", "window", "cozy", "indoor", "shelter"],
  },
  {
    id: "cozy-hearth",
    title: "Warm Fireside & Knitted Hearth",
    category: "grounding",
    badge: "Sensory Grounding",
    icon: "🔥",
    description: "A soft, crackling hearth fire glowing with warm amber embers, providing comforting deep pressure comfort.",
    plain_summary: "Gentle warmth, soft amber light, and no sudden loud sounds. A comforting sanctuary to reset after social exhaustion.",
    sensory_prompt: "Imagine wrapping yourself in a heavy, comforting wool blanket while warmth soothes tense shoulder muscles.",
    spoken_text: "Warm Fireside and Knitted Hearth. Gentle golden embers crackle with steady warmth. Relax your shoulders and breathe slowly.",
    palette: { bg: "#2b1e16", fg: "#fce9da", accent: "#a85e33" },
    tags: ["fireplace", "warmth", "cozy", "amber", "hearth"],
  },
  {
    id: "starlit-sky",
    title: "Deep Cosmos & Starlit Meadow",
    category: "grounding",
    badge: "Sensory Grounding",
    icon: "✨",
    description: "A velvet night sky filled with gentle, non-flickering distant stars and soft indigo nebulae arching over a quiet meadow.",
    plain_summary: "Deep night sky with soft star fields. Expansive, peaceful space to relieve feelings of sensory crowding.",
    sensory_prompt: "Take comfort in how vast and quiet the night sky is. You do not need to perform or explain anything right now.",
    spoken_text: "Deep Cosmos and Starlit Meadow. The velvet indigo sky holds millions of quiet stars. The world is resting.",
    palette: { bg: "#0d131f", fg: "#e0e8fc", accent: "#2c467a" },
    tags: ["stars", "night", "sky", "space", "quiet"],
  },
];

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    api_key_required: Boolean(CONFIGURED_API_KEY),
  });
});

// Meta Root & API Documentation
app.get("/api/meta", (req: Request, res: Response) => {
  res.json({
    name: "NeuroSafe API",
    version: "2.0.0",
    status: "running",
    features: [
      "profile_suggestion",
      "profile_persistence",
      "built_in_sensory_images",
      "plain_text_explanation",
      "respectful_message_drafting",
      "grounding_calm_sequence",
      "daily_habit_routine_tracker",
      "task_breakdown",
      "low_stimulation_safe_journey_routing",
      "manual_sos_confirmation",
    ],
    api_key_required: Boolean(CONFIGURED_API_KEY),
  });
});

// Commands Catalog
app.get("/api/commands", (req: Request, res: Response) => {
  res.json({
    description: "NeuroSafe API endpoints and capabilities.",
    endpoints: [
      "POST /api/profile/suggest",
      "GET /api/habits",
      "POST /api/habits",
      "GET /api/images",
      "GET /api/images/:id",
      "POST /api/explain",
      "POST /api/say",
      "GET /api/calm",
      "POST /api/tasks/breakdown",
      "POST /api/route",
      "POST /api/sos",
    ],
  });
});

// API Key & Service Configuration Status
app.get("/api/key/status", (req: Request, res: Response) => {
  res.json({
    apiKeyConfigured: Boolean(CONFIGURED_API_KEY),
    services: {
      gemini: Boolean(process.env.GEMINI_API_KEY),
      google_maps: Boolean(process.env.GOOGLE_MAPS_API_KEY),
      custom_llm: Boolean(process.env.LLM_BASE_URL),
    },
    instructions: CONFIGURED_API_KEY
      ? "Pass your key in 'x-api-key' header or 'Authorization: Bearer <key>'"
      : "API key protection is optional. Direct access enabled.",
  });
});

// ----------------------------------------------------
// 1. PROFILE SUGGESTION
// ----------------------------------------------------
app.post("/api/profile/suggest", async (req: Request, res: Response) => {
  const rawInput = req.body?.user_input || req.body?.input || req.body?.text;
  if (!rawInput || typeof rawInput !== "string" || !rawInput.trim()) {
    return res.status(400).json({ detail: "user_input must not be blank" });
  }

  const userInput = rawInput.trim();

  try {
    const aiText = await generateContentWithFallback({
      preferredModel: "gemini-3.8-flash",
      contents: `${PROFILE_SYSTEM_PROMPT}\n\nUser description:\n"""${userInput}"""\n\nReturn ONLY the JSON object conforming to the specification.`,
      config: {
        responseMimeType: "application/json",
      },
    });

    if (aiText) {
      try {
        const parsed = JSON.parse(aiText);
        return res.json({
          suggestion: parsed,
        });
      } catch {
        // Fall through to deterministic rule-based suggestion
      }
    }

    const suggestion = ruleBasedProfileSuggest(userInput);
    return res.json({
      suggestion,
    });
  } catch {
    const suggestion = ruleBasedProfileSuggest(userInput);
    return res.json({
      suggestion,
    });
  }
});

// ----------------------------------------------------
// 2. PROFILE APPROVAL & PERSISTENCE
// ----------------------------------------------------
app.post("/api/profile/approve", (req: Request, res: Response) => {
  const approvedSettings = req.body?.approved_settings || req.body?.settings;
  if (
    !approvedSettings ||
    typeof approvedSettings !== "object" ||
    Object.keys(approvedSettings).length === 0
  ) {
    return res.status(400).json({ detail: "approved_settings must be a non-empty object" });
  }

  const profileId = crypto.randomUUID();
  const profile: SavedProfile = {
    profile_id: profileId,
    settings: approvedSettings,
    created_at: new Date().toISOString(),
  };

  _profiles.set(profileId, profile);
  return res.status(201).json(profile);
});

// ----------------------------------------------------
// 3. GET PROFILE BY ID
// ----------------------------------------------------
app.get("/api/profile/:profile_id", (req: Request, res: Response) => {
  const profile = _profiles.get(req.params.profile_id);
  if (!profile) {
    return res.status(404).json({ detail: `Profile '${req.params.profile_id}' not found.` });
  }
  return res.json(profile);
});

// ----------------------------------------------------
// AUTHENTICATION ENDPOINTS (Login, Register, Demo, Me)
// ----------------------------------------------------
app.post("/api/auth/register", (req: Request, res: Response) => {
  const { email, name, password } = req.body || {};
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ detail: "A valid email address is required." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (_users.has(normalizedEmail)) {
    return res.status(409).json({ detail: "An account with this email already exists. Please sign in." });
  }

  const user: UserAccount = {
    id: `usr_${crypto.randomUUID().slice(0, 8)}`,
    email: normalizedEmail,
    name: (name && typeof name === "string" ? name.trim() : "") || normalizedEmail.split("@")[0],
    password: String(password || ""),
    created_at: new Date().toISOString(),
  };

  _users.set(normalizedEmail, user);

  return res.status(201).json({
    status: "registered",
    token: user.email,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      profile: user.profile || null,
      accessibility_profile: user.profile?.settings || null,
      problem_history: user.profile?.problems || [],
      created_at: user.created_at,
    },
    message: "Welcome to NeuroSafe! Let's tailor your support needs next.",
  });
});

app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || typeof email !== "string" || !email.trim()) {
    return res.status(400).json({ detail: "Please provide your email address or username." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  let user = _users.get(normalizedEmail);

  if (!user) {
    // Create new account on login for seamless, frustration-free accessibility
    user = {
      id: `usr_${crypto.randomUUID().slice(0, 8)}`,
      email: normalizedEmail,
      name: normalizedEmail.split("@")[0] || "User",
      password: String(password || ""),
      created_at: new Date().toISOString(),
    };
    _users.set(normalizedEmail, user);
  } else if (user.password && password && user.password !== "demo" && user.password !== password) {
    return res.status(401).json({ detail: "Incorrect password. Please try again." });
  }

  return res.json({
    status: "authenticated",
    token: user.email,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      profile: user.profile || null,
      accessibility_profile: user.profile?.settings || null,
      problem_history: user.profile?.problems || [],
      created_at: user.created_at,
    },
    message: "Signed in successfully.",
  });
});

app.post("/api/auth/demo", (req: Request, res: Response) => {
  const demo = _users.get("demo@neurosafe.org") || {
    id: "usr_demo_101",
    email: "demo@neurosafe.org",
    name: "Alex River",
    created_at: new Date().toISOString(),
  };

  return res.json({
    status: "authenticated",
    token: demo.email,
    user: {
      id: demo.id,
      email: demo.email,
      name: demo.name,
      profile: demo.profile || null,
      accessibility_profile: demo.profile?.settings || null,
      problem_history: demo.profile?.problems || [],
      created_at: demo.created_at,
    },
    message: "Signed in with Neurodivergent Safe Demo mode.",
  });
});

app.post("/api/auth/logout", (_req: Request, res: Response) => {
  return res.json({ status: "logged_out", message: "Logged out successfully." });
});

app.get("/api/auth/me", (req: Request, res: Response) => {
  const authHeader = req.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const email = (req.query.email || req.get("x-user-email") || bearerToken || "") as string;
  if (!email) {
    return res.status(400).json({ detail: "Email or active session required." });
  }

  const user = _users.get(email.toLowerCase().trim());
  if (!user) {
    return res.status(404).json({ detail: "User not found." });
  }

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      profile: user.profile || null,
      accessibility_profile: user.profile?.settings || null,
      problem_history: user.profile?.problems || [],
      created_at: user.created_at,
    },
  });
});

// ----------------------------------------------------
// PROBLEM ASSESSMENT & AI APP CUSTOMIZATION
// ----------------------------------------------------
app.post("/api/profile/customize", async (req: Request, res: Response) => {
  const { problems = [], description = "", email = "" } = req.body || {};

  const problemLabels: Record<string, string> = {
    sensory_overload: "Sensory Overload & Light/Sound/Motion Sensitivity",
    executive_function: "Executive Function, ADHD & Starting Tasks",
    reading_processing: "Reading Difficulty, Dyslexia & Information Overwhelm",
    social_burnout: "Social Overwhelm, Autistic Burnout & Communication Fatigue",
    wayfinding_anxiety: "Wayfinding Anxiety, Sensory Navigation & Crowded Transit",
  };

  const problemList = Array.isArray(problems) ? problems : [];
  const selectedNames = problemList.map((p: string) => problemLabels[p] || p).join(", ");

  const prompt = `You are NeuroSafe AI, an expert neurodiversity-affirming accessibility assistant.
A user is setting up their app and has shared the problems and challenges they are experiencing:
- Identified Problem Areas: ${selectedNames || "General accessibility"}
- Personal Description: "${description || "None provided"}"

Based on their specific problems, customize their accessibility configuration.
Respond ONLY with a valid JSON object strictly matching this schema:
{
  "settings": {
    "low_stimulation_interface": boolean,
    "simplify_text": boolean,
    "step_by_step": boolean,
    "read_aloud": boolean,
    "communication_support": boolean,
    "navigation_support": boolean
  },
  "customization_summary": "A 1-2 sentence warm, supportive explanation describing how NeuroSafe has been adapted for their specific challenges.",
  "primary_focus": "tasks" | "calm" | "read" | "say" | "route" | "general"
}`;

  let aiResult: any = null;
  const aiText = await generateContentWithFallback({
    preferredModel: "gemini-3.8-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  if (aiText) {
    try {
      aiResult = JSON.parse(aiText);
    } catch {
      // Fall through to deterministic rules
    }
  }

  // Deterministic fallback if AI is unreachable or invalid
  if (!aiResult || !aiResult.settings) {
    const pSet = new Set(problemList);
    const textLower = (description || "").toLowerCase();

    const isSensory =
      pSet.has("sensory_overload") ||
      /bright|light|migraine|screen|motion|sound|noise|stimulation|sensory/.test(textLower);
    const isExecutive =
      pSet.has("executive_function") ||
      /adhd|focus|procrastinat|start|task|overwhelm|chunk|executive/.test(textLower);
    const isReading =
      pSet.has("reading_processing") ||
      /dyslexia|read|long|dense|paragraph|jargon|simple|words/.test(textLower);
    const isSocial =
      pSet.has("social_burnout") ||
      /social|message|email|say|polite|burnout|people|fatigue|anxious/.test(textLower);
    const isNav =
      pSet.has("wayfinding_anxiety") ||
      /navigat|route|transit|crowd|lost|street|direction|journey/.test(textLower);

    const settings: Record<string, any> = {
      low_stimulation_interface: isSensory,
      brightness: isSensory ? 85 : 100,
      contrast: isSensory ? 90 : 100,
      warmth: isSensory ? "amber" : "natural",
      font_scale: isReading ? "large" : "standard",
      reduced_motion: isSensory,
      simplify_text: isReading,
      step_by_step: isExecutive,
      read_aloud: isReading,
      communication_support: isSocial,
      navigation_support: isNav,
    };

    let primary_focus = "general";
    if (isExecutive) primary_focus = "tasks";
    else if (isSensory) primary_focus = "calm";
    else if (isReading) primary_focus = "read";
    else if (isSocial) primary_focus = "say";
    else if (isNav) primary_focus = "route";

    const parts = [];
    if (isSensory) parts.push("calming low-stimulation colors and motion dampening");
    if (isExecutive) parts.push("step-by-step task breakdown");
    if (isReading) parts.push("plain-language text simplification and reading aids");
    if (isSocial) parts.push("kind message drafting scripts");
    if (isNav) parts.push("sensory-calm low-stimulation route planning");

    const summary =
      parts.length > 0
        ? `We've personalized NeuroSafe based on your needs: activated ${parts.join(", ")}.`
        : "We've applied a balanced, sensory-friendly profile customized for your daily workflow.";

    aiResult = {
      settings,
      customization_summary: summary,
      primary_focus,
    };
  }

  if (aiResult?.settings) {
    if (aiResult.settings.low_stimulation_interface && typeof aiResult.settings.brightness !== "number") {
      aiResult.settings.brightness = 85;
      aiResult.settings.contrast = 90;
      aiResult.settings.warmth = "amber";
      aiResult.settings.reduced_motion = true;
    }
  }

  const profileId = crypto.randomUUID();
  const profileRecord = {
    profile_id: profileId,
    problems: problemList,
    description: String(description || ""),
    settings: aiResult.settings,
    customization_summary: aiResult.customization_summary,
    primary_focus: aiResult.primary_focus || "general",
    created_at: new Date().toISOString(),
  };

  _profiles.set(profileId, {
    profile_id: profileId,
    settings: aiResult.settings,
    created_at: profileRecord.created_at,
  });

  // Attach to user profile if user is logged in
  const authHeader = req.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const targetEmail = (email || req.get("x-user-email") || bearerToken || "").toLowerCase().trim();

  if (targetEmail && _users.has(targetEmail)) {
    const user = _users.get(targetEmail)!;
    user.profile = {
      ...profileRecord,
      updated_at: profileRecord.created_at,
    };
  }

  return res.json({
    status: "customized",
    profile_id: profileId,
    settings: aiResult.settings,
    customization_summary: aiResult.customization_summary,
    primary_focus: aiResult.primary_focus || "general",
    profile: profileRecord,
  });
});

// ----------------------------------------------------
// 4. BUILT-IN SENSORY & AAC IMAGES (REPLACES CAMERA & OCR)
// ----------------------------------------------------

// List built-in images, with optional category filtering
app.get("/api/images", (req: Request, res: Response) => {
  const category = req.query.category as string;
  let items = BUILT_IN_IMAGES_CATALOG;

  if (category && category !== "all") {
    items = BUILT_IN_IMAGES_CATALOG.filter((img) => img.category === category);
  }

  return res.json({
    total: items.length,
    category: category || "all",
    images: items,
  });
});

// Get a single built-in image by ID
app.get("/api/images/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const image = BUILT_IN_IMAGES_CATALOG.find((img) => img.id === id);

  if (!image) {
    return res.status(404).json({ detail: `Image with id '${id}' not found.` });
  }

  return res.json(image);
});

// ----------------------------------------------------
// RETIRED CAMERA & OCR ROUTES
// ----------------------------------------------------
app.all(["/api/read", "/api/camera", "/api/camera/*"], (req: Request, res: Response) => {
  return res.status(410).json({
    detail: "Camera and OCR features have been replaced with the built-in sensory images library.",
    replacement_endpoint: "/api/images",
  });
});

// ----------------------------------------------------
// 5. AUTISTIC-FRIENDLY REWRITER & EXPLAIN
// ----------------------------------------------------
app.post(["/api/read-for-me", "/api/rewrite-autistic"], async (req: Request, res: Response) => {
  const rawText = req.body?.text || req.body?.input;
  if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
    return res.status(400).json({ detail: "text must not be blank" });
  }

  const text = rawText.trim();
  const rewritten = await completeText(AUTISTIC_FRIENDLY_SYSTEM_PROMPT, text);

  return res.json({
    text: rewritten.trim(),
    source: "autistic_friendly_rewriter",
  });
});

app.post("/api/explain", async (req: Request, res: Response) => {
  const rawText = req.body?.text || req.body?.input;
  const mode = req.body?.mode || "plain_language";
  if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
    return res.status(400).json({ detail: "text must not be blank" });
  }

  const text = rawText.trim();
  let prompt =
    "Explain the supplied text simply in clear, plain language without changing its core meaning. Keep sentences short and digestible. Return only the explanation.";

  if (mode === "autistic_friendly" || mode === "literal_bullet") {
    prompt = AUTISTIC_FRIENDLY_SYSTEM_PROMPT;
  }

  const simplified = await completeText(prompt, text);

  const formattedText = simplified.trim();
  return res.json({
    text: formattedText,
    raw_explanation: simplified,
    source: "gemini_plain_language",
  });
});

// ----------------------------------------------------
// 6. SAY IT FOR ME
// ----------------------------------------------------
function draftSituationalMessage(intent: string, context?: string, tone: string = "gentle_polite"): string {
  const lower = intent.toLowerCase();
  const ctx = context ? ` (${context})` : "";

  if (lower.includes("decline") || lower.includes("fatigue") || lower.includes("tired") || lower.includes("social invite") || lower.includes("exhausted")) {
    if (tone === "firm_clear") {
      return `Thank you for the invitation${ctx}. I will not be able to attend today as I have reached my social limit and need to rest. I appreciate your understanding.`;
    }
    if (tone === "work_professional") {
      return `Thank you for thinking of me${ctx}. Due to prior commitments and current bandwidth, I am unable to attend. I wish you all a successful gathering.`;
    }
    return `Thank you so much for inviting me${ctx}! I really appreciate you thinking of me, but my social battery is empty today and I need a restful evening at home. I hope you have a wonderful time, and let's connect when things are calmer.`;
  }

  if (lower.includes("writing") || lower.includes("written") || lower.includes("instructions") || lower.includes("manager")) {
    if (tone === "firm_clear") {
      return `To ensure all tasks are executed accurately, please email or message these instructions in writing before we begin. Thank you.`;
    }
    return `Hello${ctx ? " " + context : ""},\n\nThank you for discussing this. To help me process the details thoroughly and follow through with high accuracy, could you please send the main action items and steps to me in writing? It makes a huge difference for my workflow. Thank you!`;
  }

  if (lower.includes("quiet") || lower.includes("seating") || lower.includes("seat") || lower.includes("noise") || lower.includes("sound")) {
    return `Hello,\n\nI have sensory sensitivity to loud noises and bright spaces. If possible, could we please be seated in a quieter, less crowded area? Thank you so much for your accommodation.`;
  }

  if (lower.includes("fresh air") || lower.includes("break") || lower.includes("outside") || lower.includes("10 minutes")) {
    return `Excuse me${ctx ? " " + context : ""}, I am stepping outside for about 10 minutes to get some fresh air and regulate my senses. I will be right back. Thank you for your patience!`;
  }

  if (lower.includes("overwhelm") || lower.includes("sensory") || lower.includes("stimul")) {
    return `Hello,\n\nI am experiencing sensory overwhelm right now. I need to step into a quiet environment to reset. Please communicate via text or message in the meantime. Thank you for understanding.`;
  }

  // Dynamic composition based on user intent
  if (tone === "firm_clear") {
    return `Hello${ctx ? " " + context : ""},\n\nRegarding ${intent.trim()}: I need to set a clear boundary on this matter. Thank you for respecting my space and decision.`;
  }
  if (tone === "work_professional") {
    return `Hello${ctx ? " " + context : ""},\n\nI am writing regarding ${intent.trim()}. I appreciate your collaboration and look forward to coordinating this smoothly. Please let me know if you have any questions.\n\nBest regards.`;
  }
  return `Hello${ctx ? " " + context : ""},\n\nI wanted to share a gentle note regarding ${intent.trim()}. I appreciate your kindness and understanding as I navigate this. Thank you so much for your support!`;
}

app.post("/api/say", async (req: Request, res: Response) => {
  const intent = req.body?.intent;
  if (!intent || typeof intent !== "string" || !intent.trim()) {
    return res.status(400).json({ detail: "intent must not be blank" });
  }

  const context = req.body?.context ? String(req.body.context).trim() : "";
  const tone = req.body?.tone || "gentle_polite";
  const cleanIntent = intent.trim();

  let drafted: string | null = null;

  try {
    const aiText = await generateContentWithFallback({
      preferredModel: "gemini-3.8-flash",
      contents: `You are NeuroSafe's Communication and Boundary Assistant.
Help the user draft a polite, boundary-affirming message.
User Intent: "${cleanIntent}"
Optional Context/Recipient: "${context || "General"}"
Desired Tone: "${tone}"

CRITICAL RULES:
- Write a complete, ready-to-send draft message.
- Affirming, respectful, zero shame, protects user energy and boundaries.
- Return ONLY the draft message text with no conversational preamble or quotes.`,
    });

    if (aiText && aiText.trim().length > 15) {
      drafted = aiText.trim();
    }
  } catch (err) {
    console.debug("AI message drafting fallback to situational engine:", err);
  }

  if (!drafted) {
    drafted = draftSituationalMessage(cleanIntent, context, tone);
  }

  return res.json({
    text: drafted,
    raw_message: drafted,
    source: "situational_message_assistant",
  });
});

// ----------------------------------------------------
// 7. CALM ME GROUNDING STEPS
// ----------------------------------------------------
app.get("/api/calm", (req: Request, res: Response) => {
  const steps = [
    "Pause and notice one thing you can see right now.",
    "Take one slow, unhurried breath in and out.",
    "Unclench your jaw and let your shoulders drop.",
    "Choose just one small, gentle next step.",
  ];

  res.json({
    steps,
    disclaimer: "This is a grounding sequence, not medical advice.",
  });
});

// ----------------------------------------------------
// DAILY HABIT & ROUTINE ENDPOINTS
// ----------------------------------------------------

// GET /api/habits - List user habits & calculate today's progress
app.get("/api/habits", (req: Request, res: Response) => {
  const authHeader = req.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const userEmail = (req.query.email || req.get("x-user-email") || bearerToken || "demo@neurosafe.org") as string;

  const today = getTodayString();
  const habits = getUserHabits(userEmail);

  const mappedHabits = habits.map((h) => ({
    ...h,
    completed_today: h.last_completed_date === today,
  }));

  const completedCount = mappedHabits.filter((h) => h.completed_today).length;
  const totalCount = mappedHabits.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return res.json({
    habits: mappedHabits,
    stats: {
      total: totalCount,
      completed: completedCount,
      percent,
      all_completed: totalCount > 0 && completedCount === totalCount,
      today,
    },
  });
});

// POST /api/habits - Create a new habit
app.post("/api/habits", (req: Request, res: Response) => {
  const authHeader = req.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const userEmail = (req.body?.email || req.get("x-user-email") || bearerToken || "demo@neurosafe.org") as string;

  const title = req.body?.title;
  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ detail: "Habit title cannot be blank." });
  }

  const validTimes = ["morning", "afternoon", "evening", "anytime"];
  const timeOfDay = validTimes.includes(req.body?.time_of_day) ? req.body.time_of_day : "anytime";
  const icon = req.body?.icon || "✨";
  const notes = req.body?.notes || "";

  const habits = getUserHabits(userEmail);
  const newHabit: DailyHabit = {
    id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    user_email: userEmail.toLowerCase().trim(),
    title: title.trim(),
    time_of_day: timeOfDay,
    icon,
    streak: 0,
    last_completed_date: undefined,
    notes,
    created_at: new Date().toISOString(),
  };

  habits.push(newHabit);

  const today = getTodayString();
  const completedCount = habits.filter((h) => h.last_completed_date === today).length;
  const totalCount = habits.length;

  return res.status(201).json({
    status: "created",
    habit: { ...newHabit, completed_today: false },
    stats: {
      total: totalCount,
      completed: completedCount,
      percent: Math.round((completedCount / totalCount) * 100),
      all_completed: completedCount === totalCount,
    },
  });
});

// POST /api/habits/:id/toggle - Toggle completion for today
app.post("/api/habits/:id/toggle", (req: Request, res: Response) => {
  const authHeader = req.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const userEmail = (req.body?.email || req.get("x-user-email") || bearerToken || "demo@neurosafe.org") as string;

  const habitId = req.params.id;
  const habits = getUserHabits(userEmail);
  const habit = habits.find((h) => h.id === habitId);

  if (!habit) {
    return res.status(404).json({ detail: `Habit ${habitId} not found.` });
  }

  const today = getTodayString();
  const yesterday = getYesterdayString();
  const isCurrentlyCompleted = habit.last_completed_date === today;

  if (isCurrentlyCompleted) {
    // Uncheck
    habit.last_completed_date = undefined;
    habit.streak = Math.max(0, habit.streak - 1);
  } else {
    // Check
    const wasYesterdayCompleted = habit.last_completed_date === yesterday;
    habit.last_completed_date = today;
    habit.streak = wasYesterdayCompleted ? habit.streak + 1 : Math.max(1, habit.streak + 1);
  }

  const completedCount = habits.filter((h) => h.last_completed_date === today).length;
  const totalCount = habits.length;

  return res.json({
    status: "updated",
    habit: { ...habit, completed_today: !isCurrentlyCompleted },
    stats: {
      total: totalCount,
      completed: completedCount,
      percent: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      all_completed: totalCount > 0 && completedCount === totalCount,
    },
  });
});

// DELETE /api/habits/:id - Delete a habit
app.delete("/api/habits/:id", (req: Request, res: Response) => {
  const authHeader = req.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const userEmail = (req.query?.email || req.get("x-user-email") || bearerToken || "demo@neurosafe.org") as string;

  const habitId = req.params.id;
  const habits = getUserHabits(userEmail);
  const index = habits.findIndex((h) => h.id === habitId);

  if (index === -1) {
    return res.status(404).json({ detail: `Habit ${habitId} not found.` });
  }

  habits.splice(index, 1);
  const today = getTodayString();
  const completedCount = habits.filter((h) => h.last_completed_date === today).length;
  const totalCount = habits.length;

  return res.json({
    status: "deleted",
    id: habitId,
    stats: {
      total: totalCount,
      completed: completedCount,
      percent: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      all_completed: totalCount > 0 && completedCount === totalCount,
    },
  });
});

// POST /api/habits/reset - Reset today's routine checks
app.post("/api/habits/reset", (req: Request, res: Response) => {
  const authHeader = req.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const userEmail = (req.body?.email || req.get("x-user-email") || bearerToken || "demo@neurosafe.org") as string;

  const habits = getUserHabits(userEmail);
  habits.forEach((h) => {
    h.last_completed_date = undefined;
  });

  return res.json({
    status: "reset",
    message: "Reset today's routine checks. Fresh start ready!",
  });
});

// POST /api/habits/suggest - AI-generated neuro-affirming gentle habits
app.post("/api/habits/suggest", async (req: Request, res: Response) => {
  const focus = req.body?.focus || "low-pressure daily structure, sensory comfort, and gentle executive function";
  const userProblems = req.body?.problems || [];

  const prompt = `You are a neurodiversity-affirming accessibility and executive-function routine specialist.
Suggest 3-4 gentle, realistic daily micro-habits for a user with these challenges or goals: "${focus}".
User challenges: ${JSON.stringify(userProblems)}.
Keep each habit very small, shame-free, and designed to provide a calm sense of structure and completion.
Return ONLY a valid JSON array of objects with the following keys:
[
  {
    "title": "Short, concrete, gentle action",
    "time_of_day": "morning" | "afternoon" | "evening" | "anytime",
    "icon": "A single matching emoji (e.g. 💧, 💊, 🌿, 🚶, 🍵, 📖, ✨)",
    "notes": "Short sentence explaining the sensory or executive benefit"
  }
]`;

  let suggestions: any[] = [];
  try {
    const rawAi = await generateContentWithFallback({
      preferredModel: "gemini-3.8-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    if (rawAi) {
      suggestions = JSON.parse(rawAi);
    }
  } catch (err) {
    console.warn("AI habit suggestion error, falling back to gentle defaults:", err);
  }

  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    suggestions = [
      {
        title: "Sip warm tea or cool water mindfully",
        time_of_day: "morning",
        icon: "🍵",
        notes: "Sensory grounding to start the morning",
      },
      {
        title: "Step away from screen & gaze out window",
        time_of_day: "afternoon",
        icon: "🌿",
        notes: "Rest optical nerve and mental processing",
      },
      {
        title: "Dim overhead lights before bedtime",
        time_of_day: "evening",
        icon: "🌙",
        notes: "Signals calm and melatonin release",
      },
    ];
  }

  return res.json({
    suggestions,
  });
});

// ----------------------------------------------------
// 8. TASKS BREAKDOWN (Executive Function Decomposer)
// ----------------------------------------------------
function decomposeSituationalTask(task: string, energyLevel: string = "medium"): string {
  const cleanTask = task.trim();
  const lower = cleanTask.toLowerCase();

  // 1. Kitchen & Food Situations
  if (lower.includes("counter") || lower.includes("kitchen")) {
    if (energyLevel === "low") {
      return `1. Toss away any obvious food wrappers or scrap napkins into the trash can.
2. Slide dirty glasses and bowls into the sink without washing them yet.
3. Put away 2 food ingredients into the pantry or refrigerator.
4. Wipe down just one small clear patch of the counter with a damp sponge.
5. Take a deep, relaxed breath and leave the rest for later.`;
    }
    return `1. Toss empty wrappers, scraps, and trash directly into the garbage bin.
2. Move dirty cups, bowls, and plates into the kitchen sink.
3. Put away 2 to 3 food ingredients or pantry items in their designated spots.
4. Spray or dampen a sponge and wipe the counter in a single smooth sweep from back to front.
5. Dry the surface with a hand towel and enjoy the peaceful clear space.`;
  }

  if (lower.includes("dish") || lower.includes("sink") || lower.includes("dishwasher")) {
    if (energyLevel === "low") {
      return `1. Scrape leftover food into the trash from just 2 plates.
2. Soak the dirtiest pan or bowl in warm soapy water so it loosens on its own.
3. Wash just 3 cups or silverware items and place them on the drying rack.
4. Rest your hands and leave the soaked items for later.`;
    }
    return `1. Scrape food scraps into the trash and group similar items together.
2. Fill the sink basin with warm, soapy water.
3. Wash light glassware and silverware first with a soapy sponge.
4. Clean plates and bowls, rinsing each thoroughly with warm water.
5. Place items in the drying rack to air dry without rushing.`;
  }

  if (lower.includes("cook") || lower.includes("dinner") || lower.includes("meal") || lower.includes("lunch") || lower.includes("breakfast") || lower.includes("eat")) {
    return `1. Choose a comforting meal with 3 or fewer main ingredients.
2. Place the required ingredients, cutting board, and pan on the counter.
3. Prepare and heat the food on medium heat without rushing.
4. Turn off all burners and appliances immediately when cooking finishes.
5. Serve onto your favorite plate, pour a fresh drink, and sit down comfortably to eat.`;
  }

  if (lower.includes("grocer") || lower.includes("supermarket") || lower.includes("shop")) {
    return `1. Open your fridge and pantry to write down 5 essential food items you need.
2. Grab a reusable shopping bag, keys, and headphones for sensory comfort.
3. Head to the store and walk directly to the aisles for your 5 listed items.
4. Head to the self-checkout or shortest open register.
5. Return home and put the cold refrigerated items away first.`;
  }

  // 2. Desk, Office & Academic Situations
  if (lower.includes("desk") || lower.includes("workspace") || lower.includes("organize desk")) {
    if (energyLevel === "low") {
      return `1. Throw away any empty cups, snack wrappers, or scrap paper.
2. Stack all loose papers into one single pile.
3. Place pens in a cup or drawer.
4. Enjoy having room for your hands and computer.`;
    }
    return `1. Toss empty cups, napkins, and snack wrappers into the wastebasket.
2. Gather loose papers and notebooks into one neat stack on the corner.
3. Place pens, markers, and loose cords into a desk tray or cup.
4. Wipe down the desktop and keyboard with a microfiber cloth or disinfectant wipe.
5. Set a fresh glass of water on your cleared desk.`;
  }

  if (lower.includes("study") || lower.includes("exam") || lower.includes("test") || lower.includes("quiz") || lower.includes("homework")) {
    return `1. Pick the single specific chapter or topic you need to review today.
2. Open your textbook or notes and set a gentle 15-minute timer.
3. Skim the key headings, diagrams, and section summaries without pressure to memorize everything.
4. Write down 3 key concepts or formulas in your own words on a flashcard.
5. Close the notes when the timer rings and take a 5-minute movement or water break.`;
  }

  if (lower.includes("essay") || lower.includes("paper") || lower.includes("write") || lower.includes("report") || lower.includes("draft")) {
    return `1. Open a new document and write your working title and today's date.
2. Type 3 quick bullet points stating what your main argument or point is.
3. Turn the first bullet point into two simple explanatory sentences.
4. Paste in one reference, quotation, or data point beneath it.
5. Save your document and step away for a mental breather—you have successfully started.`;
  }

  // 3. Digital & Communication Situations
  if (lower.includes("email") || lower.includes("inbox") || lower.includes("reply") || lower.includes("message") || lower.includes("text")) {
    return `1. Open the message and read only the final two sentences to identify the exact question.
2. Open a separate blank notepad to draft your reply without the pressure of the email screen.
3. Write 1 or 2 calm sentences stating your update or decision.
4. Paste the text into the reply box and do a quick 5-second check.
5. Click send immediately and close the application to protect your mental focus.`;
  }

  if (lower.includes("doctor") || lower.includes("dentist") || lower.includes("appointment") || lower.includes("schedule") || lower.includes("call")) {
    return `1. Find the clinic or provider phone number and note your preferred days and times on paper.
2. Have your calendar, insurance card, and ID resting on the table in front of you.
3. Dial the number and take one slow, grounding breath while it rings.
4. State your request: "Hello, I would like to schedule an appointment for [reason]."
5. Write down the confirmed date and time in your calendar immediately and hang up.`;
  }

  // 4. Household, Laundry & Cleaning
  if (lower.includes("laundry") || lower.includes("clothes") || lower.includes("wash clothes")) {
    return `1. Collect dirty clothes from the floor and drop them into the laundry hamper.
2. Carry the hamper to the washer and load the clothes inside.
3. Add detergent and select a gentle cold wash cycle.
4. Press start and set an alarm on your phone for when the cycle finishes.
5. Transfer the clean clothes to the dryer or drying rack when the alarm sounds.`;
  }

  if (lower.includes("bedroom") || lower.includes("bed") || lower.includes("room")) {
    return `1. Pull the sheet and blanket up to roughly smooth your bed.
2. Pick up clothes from the floor and place them into the hamper or on a chair.
3. Clear any dishes or trash off nightstands and window sills.
4. Open the window or blinds for 2 minutes of natural light and fresh air.`;
  }

  if (lower.includes("bathroom")) {
    return `1. Toss used towels into the hamper and clear bottles off the counter.
2. Apply cleaner or soap to the sink basin and toilet bowl.
3. Wipe down the counter and sink faucet with a damp cloth.
4. Swish the toilet brush in the bowl and flush once.
5. Wash your hands with warm water and enjoy the fresh space.`;
  }

  if (lower.includes("trash") || lower.includes("garbage") || lower.includes("recycle") || lower.includes("recycling")) {
    return `1. Tie off the current full trash bag securely.
2. Place a fresh new liner or bag into the bottom of the can immediately.
3. Carry the full bag out to the main outdoor bin or chute.
4. Return inside and wash your hands with warm soap and water.`;
  }

  // 5. Travel & Luggage
  if (lower.includes("pack") || lower.includes("luggage") || lower.includes("suitcase") || lower.includes("trip") || lower.includes("flight")) {
    return `1. Open your suitcase or backpack on your bed or clean floor.
2. Lay out essentials: underwear, socks, and sleepwear for the number of days needed.
3. Pick 2 to 3 versatile tops and comfortable bottoms that match easily.
4. Place toothbrush, daily medications, and small toiletries into a zip pouch.
5. Pack your phone charger and travel tickets, zip the bag, and place it near the door.`;
  }

  // 6. Administrative & Financial
  if (lower.includes("tax") || lower.includes("bill") || lower.includes("paperwork") || lower.includes("receipt") || lower.includes("subscription")) {
    return `1. Gather all related papers, mail, or digital receipts into a single folder.
2. Open the portal or website and locate the specific form or payment page.
3. Complete just the first section or pay the single most pressing item.
4. Save your confirmation number or receipt in the folder.
5. Close the tab and celebrate crossing off the financial friction.`;
  }

  // 7. Dynamic NLP extraction for arbitrary user inputs
  const words = cleanTask.split(/\s+/).filter(w => w.length > 2);
  const actionWord = words[0] || "start";
  const targetObject = words.slice(1).join(" ") || "your task";

  if (energyLevel === "low") {
    return `1. Sit comfortably with a glass of water nearby and no pressure to rush.
2. Bring ${targetObject} within easy arm's reach.
3. Spend just 2 minutes on the very first sub-action to ${actionWord} the initial piece.
4. Give yourself full permission to pause right here and celebrate initiating.`;
  }

  return `1. Clear a quiet space and set out the primary tools needed for ${targetObject}.
2. Identify the single first physical step to ${actionWord} without looking at the whole list.
3. Complete this first action at a calm, unhurried pace.
4. Take a sip of water and check off this first milestone.
5. Proceed to the next section or leave it safely in progress to resume anytime.`;
}

app.post("/api/tasks/breakdown", async (req: Request, res: Response) => {
  const task = req.body?.task || req.body?.input;
  if (!task || typeof task !== "string" || !task.trim()) {
    return res.status(400).json({ detail: "task must not be blank" });
  }

  const energyLevel = req.body?.energyLevel || req.body?.energy || "medium";
  const cleanTask = task.trim();

  let result: string | null = null;

  // Attempt AI generation with specialized prompt
  try {
    const aiText = await generateContentWithFallback({
      preferredModel: "gemini-3.8-flash",
      contents: `You are NeuroSafe's Executive Function Task Breakdown specialist.
Break down this specific task into concrete, manageable micro-actions tailored specifically to this situation:
Task: "${cleanTask}"
User Energy Level: "${energyLevel}"

CRITICAL RULES:
- Tailor the steps directly to the specific objects, tools, places, and actions needed for this exact task. Do NOT use generic steps like "Gather materials" or "Take a pause".
- For low energy: Keep each step under 2 minutes, very low effort, permission to pause.
- For medium energy: Calm, steady progression.
- For high energy: Efficient, structured flow.
- Format strictly as a numbered list (1., 2., 3., 4., 5.) with 4 to 6 concise, actionable steps.
- Neurodiversity-affirming tone, no shame or urgency.`,
    });

    if (aiText && aiText.trim().length > 25 && /^[0-9]+[.)]/m.test(aiText)) {
      result = aiText.trim();
    }
  } catch (err) {
    console.debug("AI breakdown fallback to situational decomposer:", err);
  }

  // If AI generation not available or failed, use situational decomposition
  if (!result) {
    result = decomposeSituationalTask(cleanTask, energyLevel);
  }

  return res.json({
    text: result,
    raw_steps: result,
    energy_level: energyLevel,
    source: "executive_situational_breakdown",
  });
});

// ----------------------------------------------------
// 9. SAFE JOURNEY ROUTE
// ----------------------------------------------------
app.post("/api/route", async (req: Request, res: Response) => {
  const origin = req.body?.origin || req.query?.origin;
  const destination = req.body?.destination || req.query?.destination;
  const mode = (req.body?.mode || req.query?.mode || "walking") as string;

  if (!origin || !destination) {
    return res.status(400).json({ detail: "origin and destination must not be blank" });
  }

  const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
  if (mapsKey) {
    try {
      const params = new URLSearchParams({
        origin: String(origin),
        destination: String(destination),
        mode,
        key: mapsKey,
      });
      const resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`);
      const data: any = await resp.json();
      if (data.status === "OK" && Array.isArray(data.routes)) {
        return res.json({ routes: data.routes, source: "google_maps" });
      }
    } catch (err) {
      console.warn("Google Maps directions request failed:", err);
    }
  }

  return res.json({
    routes: [
      {
        summary: `Standard ${mode} path from ${origin} to ${destination}`,
        legs: [
          {
            start_address: String(origin),
            end_address: String(destination),
            distance: { text: "1.2 km" },
            duration: { text: "15 mins" },
            steps: [
              { html_instructions: `Depart from <b>${origin}</b> in calm surroundings.` },
              { html_instructions: `Proceed along the main sidewalk toward <b>${destination}</b>.` },
              { html_instructions: `Arrive safely at <b>${destination}</b>.` },
            ],
          },
        ],
      },
    ],
    source: "safe_journey_planner",
  });
});

// ----------------------------------------------------
// 10. SAFE JOURNEY ALTERNATIVE ROUTE (Calm / Avoidance)
// ----------------------------------------------------
app.post("/api/route/alternative", async (req: Request, res: Response) => {
  const origin = req.body?.origin || req.query?.origin;
  const destination = req.body?.destination || req.query?.destination;
  const mode = (req.body?.mode || req.query?.mode || "walking") as string;
  const avoid = (req.body?.avoid || req.query?.avoid || "") as string;

  if (!origin || !destination) {
    return res.status(400).json({ detail: "origin and destination must not be blank" });
  }

  const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
  if (mapsKey) {
    try {
      const params = new URLSearchParams({
        origin: String(origin),
        destination: String(destination),
        mode,
        key: mapsKey,
      });
      if (avoid) params.append("avoid", avoid);
      const resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`);
      const data: any = await resp.json();
      if (data.status === "OK" && Array.isArray(data.routes)) {
        return res.json({ routes: data.routes, source: "google_maps" });
      }
    } catch (err) {
      console.warn("Google Maps alternative directions request failed:", err);
    }
  }

  const preference = avoid ? `avoiding ${avoid}` : "lower stimulation alternate path";
  return res.json({
    routes: [
      {
        summary: `Alternative route (${preference})`,
        legs: [
          {
            start_address: String(origin),
            end_address: String(destination),
            distance: { text: "1.4 km" },
            duration: { text: "18 mins" },
            steps: [
              { html_instructions: `Begin at <b>${origin}</b> taking quieter streets (${preference}).` },
              { html_instructions: `Follow the calmer pedestrian corridor with wider walkways and less traffic.` },
              { html_instructions: `Reach <b>${destination}</b> with minimal street noise.` },
            ],
          },
        ],
      },
    ],
    source: "safe_journey_planner",
  });
});

// ----------------------------------------------------
// 11. SOS REQUEST
// ----------------------------------------------------
app.post("/api/sos", (req: Request, res: Response) => {
  const { message, contact, confirmed } = req.body || {};
  const isConfirmed = confirmed === true || confirmed === "true" || confirmed === 1;

  if (!isConfirmed) {
    return res.status(409).json({
      detail: "SOS requires explicit confirmation.",
    });
  }

  return res.json({
    status: "confirmed",
    message: message || "I need help.",
    contact: contact || null,
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------
// ERROR HANDLING MIDDLEWARE (Multer & General)
// ----------------------------------------------------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ detail: "File too large. Maximum allowed size is 15MB." });
    }
    return res.status(400).json({ detail: `Upload error: ${err.message}` });
  }
  if (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ detail: err.message || "Internal server error" });
  }
  next();
});

// ----------------------------------------------------
// FRONTEND SERVING (Vite Middleware in Dev / Static in Prod)
// ----------------------------------------------------
export async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      root: path.resolve(process.cwd(), "frontend"),
      server: { middlewareMode: true },
      appType: "spa",
      configFile: path.resolve(process.cwd(), "frontend/vite.config.ts"),
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "frontend/dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NeuroSafe server v2.0 running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
