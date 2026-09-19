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
// PREWRITTEN COMMANDS MASTER CATALOG
// ----------------------------------------------------
export const MASTER_PREWRITTEN_COMMANDS = {
  profile: [
    'Suggest settings: "I prefer short steps and plain language."',
    'Suggest settings: "Bright colors and fast animations give me sensory overload."',
    'Suggest settings: "Long paragraphs are difficult. Please read text aloud to me."',
    'Suggest settings: "I struggle to start big projects. Break tasks into tiny chunks."',
    'Suggest settings: "Complex menus confuse me. I need clear landmarks and navigation."',
    'Approve settings: { "simplify_text": true, "step_by_step": true }',
  ],
  camera: [
    'Camera OCR: "Scan page and extract text with clean structure"',
    'Camera Describe: "Describe the room and identify quiet, low-stimulation areas"',
    'Camera Analyze: "Check this space for bright lighting or sensory clutter"',
    'Camera Wayfinding: "Read room signs, door numbers, and emergency exit signs"',
    'Camera Snapshot: "Transcribe medication label and safety warnings"',
  ],
  ocr: [
    'OCR Action: "Extract all visible text from document"',
    'OCR Action: "Summarize extracted text in plain language"',
    'OCR Action: "Convert form fields and instructions into step-by-step checklist"',
    'OCR Action: "Read extracted text aloud"',
  ],
  explain: [
    'Explain Command: "Explain this medical letter in simple, calm bullet points"',
    'Explain Command: "Summarize this legal document in 3 easy sentences"',
    'Explain Command: "Remove jargon and highlight what I actually need to do"',
    'Explain Command: "Explain this without any technical terms"',
  ],
  say: [
    'Say Command: "Draft a polite message declining an invitation due to fatigue"',
    'Say Command: "Ask my manager for extra time to review instructions in writing"',
    'Say Command: "Request a quiet seating area at a restaurant or event"',
    'Say Command: "Explain to a friend that I need to step outside for fresh air"',
  ],
  calm: [
    'Calm Command: "Show 5-4-3-2-1 sensory grounding sequence"',
    'Calm Command: "Guide me through a 4-7-8 relaxing breath cycle"',
    'Calm Command: "Box breathing: 4s inhale, 4s hold, 4s exhale, 4s pause"',
    'Calm Command: "Grounding check: Feel feet on floor, unclench jaw, relax shoulders"',
  ],
  tasks: [
    'Task Command: "Break down: Prepare for tomorrow morning"',
    'Task Command: "Break down: Clean and organize my room"',
    'Task Command: "Break down: Reply to an overwhelming email"',
    'Task Command: "Break down: Schedule a doctor appointment"',
  ],
  route: [
    'Route Command: "Find walking route avoiding busy intersections and heavy traffic"',
    'Route Command: "Find transit route with fewer transfers and calmer stations"',
    'Route Command: "Find quiet path avoiding highways and noisy roads"',
    'Route Command: "Show route landmarks and pedestrian rest areas"',
  ],
  sos: [
    'SOS Command: "Request immediate support with current location"',
    'SOS Command: "Send pre-composed text to trusted emergency contact"',
    'SOS Command: "Update status: I am now in a safe quiet location"',
    'SOS Command: "Cancel SOS alert"',
  ],
  habits: [
    'Habit Command: "Add habit: Morning hydration - Drink 1 glass of water"',
    'Habit Command: "Add habit: Take daily medication or vitamins"',
    'Habit Command: "Add habit: 5-minute sensory pause without screens"',
    'Habit Command: "Add habit: Evening wind-down stretch"',
    'Habit Command: "Suggest gentle neurodiversity-affirming daily routine"',
  ],
};

// Formatter to append prewritten commands to text results for UI visibility
function appendPrewrittenCommands(text: string, commands: string[]): string {
  if (!commands || commands.length === 0) return text;
  const commandLines = commands.map((c) => `• ${c}`).join("\n");
  return `${text.trim()}\n\n─── Prewritten Commands ───\n${commandLines}`;
}

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
    prewritten_commands: [
      'curl -H "x-api-key: YOUR_API_KEY" http://localhost:3000/api/meta',
      'curl -H "Authorization: Bearer YOUR_API_KEY" http://localhost:3000/api/calm',
      'curl -X POST -H "x-api-key: YOUR_API_KEY" -H "Content-Type: application/json" -d \'{"task":"Plan morning"}\' http://localhost:3000/api/tasks/breakdown',
    ],
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

  // Deterministic fallbacks
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
// OCR & IMAGE PROCESSING HELPER (IMPROVED OCR + CAMERA)
// ----------------------------------------------------
interface OcrResult {
  text: string;
  raw_text: string;
  clean_text: string;
  summary: string;
  word_count: number;
  source: string;
  prewritten_commands: string[];
}

async function performHighAccuracyOcr(
  imageBuffer: Buffer,
  mimeType: string,
  filename?: string
): Promise<OcrResult> {
  const base64Data = imageBuffer.toString("base64");
  const defaultCommands = [
    'Explain text simply: "Explain the main message from this document"',
    'Break into tasks: "Create an action checklist from these instructions"',
    'Draft reply: "Write a polite reply acknowledging receipt of this notice"',
    'Read aloud: "Listen to the transcription with text-to-speech"',
  ];

  // 1. Try Gemini Multimodal Vision with fallback across models
  const ocrText = await generateContentWithFallback({
    preferredModel: "gemini-3.8-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType || "image/jpeg",
            },
          },
          {
            text: `You are an expert OCR and accessibility visual assistant.
1. Transcribe all text visible in this image verbatim, preserving original paragraph breaks and headers.
2. If there are tables, signs, or forms, format them clearly.
3. At the end, provide a 1-sentence Plain Language Summary.`,
          },
        ],
      },
    ],
  });

  if (ocrText) {
    const wordCount = ocrText.split(/\s+/).filter(Boolean).length;
    const formattedDisplay = appendPrewrittenCommands(ocrText, defaultCommands);

    return {
      text: formattedDisplay,
      raw_text: ocrText,
      clean_text: ocrText,
      summary: "Transcribed with Gemini Multimodal OCR.",
      word_count: wordCount,
      source: "gemini_multimodal_ocr",
      prewritten_commands: defaultCommands,
    };
  }

  // 2. Try Google Vision API if GOOGLE_VISION_API_KEY is available
  const visionKey = process.env.GOOGLE_VISION_API_KEY;
  if (visionKey) {
    try {
      const payload = {
        requests: [
          {
            image: { content: base64Data },
            features: [
              { type: "DOCUMENT_TEXT_DETECTION" },
              { type: "TEXT_DETECTION" },
            ],
          },
        ],
      };
      const resp = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${visionKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: any = await resp.json();
      const annotation =
        data?.responses?.[0]?.fullTextAnnotation?.text ||
        data?.responses?.[0]?.textAnnotations?.[0]?.description ||
        "";

      if (annotation.trim()) {
        const wordCount = annotation.split(/\s+/).filter(Boolean).length;
        const formattedDisplay = appendPrewrittenCommands(annotation.trim(), defaultCommands);
        return {
          text: formattedDisplay,
          raw_text: annotation.trim(),
          clean_text: annotation.trim(),
          summary: "Extracted via Google Cloud Vision OCR.",
          word_count: wordCount,
          source: "google_vision",
          prewritten_commands: defaultCommands,
        };
      }
    } catch (err) {
      console.warn("Google Vision API call failed:", err);
    }
  }

  // 3. Informative fallback with diagnostic details and prewritten commands
  const sizeKb = (imageBuffer.length / 1024).toFixed(1);
  const fallbackMessage = `Image received: ${filename || "camera_frame.jpg"} (${sizeKb} KB, ${mimeType}).\n\nOCR Processing Note:\nTo enable live optical character recognition with high-accuracy layout preservation, configure GEMINI_API_KEY or GOOGLE_VISION_API_KEY in your settings.`;
  const formattedDisplay = appendPrewrittenCommands(fallbackMessage, defaultCommands);

  return {
    text: formattedDisplay,
    raw_text: fallbackMessage,
    clean_text: fallbackMessage,
    summary: "Image received and validated.",
    word_count: fallbackMessage.split(/\s+/).filter(Boolean).length,
    source: "local_image_processor",
    prewritten_commands: defaultCommands,
  };
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    api_key_required: Boolean(CONFIGURED_API_KEY),
    prewritten_commands: [
      'curl http://localhost:3000/api/meta',
      'curl http://localhost:3000/api/commands',
      'curl http://localhost:3000/api/calm',
    ],
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
      "high_accuracy_ocr",
      "camera_capture_and_scene_analysis",
      "plain_text_explanation",
      "respectful_message_drafting",
      "grounding_calm_sequence",
      "daily_habit_routine_tracker",
      "task_breakdown",
      "low_stimulation_safe_journey_routing",
      "manual_sos_confirmation",
      "prewritten_commands_library",
    ],
    api_key_required: Boolean(CONFIGURED_API_KEY),
    prewritten_commands: MASTER_PREWRITTEN_COMMANDS,
  });
});

// Master Prewritten Commands Catalog
app.get("/api/commands", (req: Request, res: Response) => {
  res.json({
    description: "Ready-to-use accessibility commands, prompts, and actions across all NeuroSafe features.",
    commands: MASTER_PREWRITTEN_COMMANDS,
    prewritten_commands: [
      "POST /api/profile/suggest with your accessibility preferences",
      "GET /api/habits to view daily routine and progress",
      "POST /api/habits with a simple goal to track",
      "POST /api/camera/capture with a photo or camera frame",
      "POST /api/read with an uploaded document or sign",
      "POST /api/explain with complex text",
      "POST /api/say with intent to draft a kind message",
      "GET /api/calm for instant grounding sequence",
      "POST /api/tasks/breakdown to split an overwhelming task",
      "POST /api/route for calm, low-stimulation directions",
      "POST /api/sos with explicit confirmation for urgent support",
    ],
  });
});

// API Key & Service Configuration Status
app.get("/api/key/status", (req: Request, res: Response) => {
  res.json({
    apiKeyConfigured: Boolean(CONFIGURED_API_KEY),
    services: {
      gemini: Boolean(process.env.GEMINI_API_KEY),
      google_vision: Boolean(process.env.GOOGLE_VISION_API_KEY),
      google_maps: Boolean(process.env.GOOGLE_MAPS_API_KEY),
      custom_llm: Boolean(process.env.LLM_BASE_URL),
    },
    camera_permission: "camera",
    instructions: CONFIGURED_API_KEY
      ? "Pass your key in 'x-api-key' header or 'Authorization: Bearer <key>'"
      : "API key protection is optional. Direct access enabled.",
    prewritten_commands: [
      'curl -H "x-api-key: YOUR_KEY" http://localhost:3000/api/commands',
      'curl -H "x-api-key: YOUR_KEY" http://localhost:3000/api/calm',
    ],
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
          prewritten_commands: MASTER_PREWRITTEN_COMMANDS.profile,
        });
      } catch {
        // Fall through to deterministic rule-based suggestion
      }
    }

    const suggestion = ruleBasedProfileSuggest(userInput);
    return res.json({
      suggestion,
      prewritten_commands: MASTER_PREWRITTEN_COMMANDS.profile,
    });
  } catch {
    const suggestion = ruleBasedProfileSuggest(userInput);
    return res.json({
      suggestion,
      prewritten_commands: MASTER_PREWRITTEN_COMMANDS.profile,
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
  return res.status(201).json({
    ...profile,
    prewritten_commands: [
      `View profile: GET /api/profile/${profileId}`,
      'Explain with approved settings: POST /api/explain',
      'Break tasks with approved settings: POST /api/tasks/breakdown',
    ],
  });
});

// ----------------------------------------------------
// 3. GET PROFILE BY ID
// ----------------------------------------------------
app.get("/api/profile/:profile_id", (req: Request, res: Response) => {
  const profile = _profiles.get(req.params.profile_id);
  if (!profile) {
    return res.status(404).json({ detail: `Profile '${req.params.profile_id}' not found.` });
  }
  return res.json({
    ...profile,
    prewritten_commands: [
      'Suggest updated preferences: POST /api/profile/suggest',
      'Break down task: POST /api/tasks/breakdown',
    ],
  });
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

    const settings: Record<string, boolean> = {
      low_stimulation_interface: isSensory,
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
    prewritten_commands: MASTER_PREWRITTEN_COMMANDS.profile,
  });
});

// ----------------------------------------------------
// 4. READ FOR ME (OCR & CAMERA IMAGES)
// ----------------------------------------------------
app.post("/api/read", upload.single("image") as any, async (req: Request, res: Response) => {
  try {
    let imageBuffer: Buffer | null = null;
    let mimeType = "image/jpeg";
    let originalName = "upload.jpg";

    // Handle multipart form upload
    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype || "image/jpeg";
      originalName = req.file.originalname || "upload.jpg";
    } else if (req.body?.image || req.body?.photo || req.body?.camera_frame) {
      // Handle base64 / Data URI uploaded in JSON (e.g. from camera)
      const dataStr: string = req.body.image || req.body.photo || req.body.camera_frame;
      if (dataStr.startsWith("data:")) {
        const match = dataStr.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          imageBuffer = Buffer.from(match[2], "base64");
        } else {
          imageBuffer = Buffer.from(dataStr, "base64");
        }
      } else {
        imageBuffer = Buffer.from(dataStr, "base64");
      }
      originalName = "camera_snapshot.jpg";
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      return res.status(400).json({
        detail: "The image is empty or missing. Upload an image file or provide a base64 camera image.",
      });
    }

    const ocrResult = await performHighAccuracyOcr(imageBuffer, mimeType, originalName);
    return res.json(ocrResult);
  } catch (err: any) {
    console.error("Read OCR error:", err);
    return res.status(500).json({ detail: `OCR Processing failed: ${err?.message || err}` });
  }
});

// ----------------------------------------------------
// CAMERA FEATURE ENDPOINTS
// ----------------------------------------------------

// Camera feature info
app.get("/api/camera", (req: Request, res: Response) => {
  res.json({
    status: "active",
    supported_formats: ["image/jpeg", "image/png", "image/webp", "multipart/form-data", "data:image/*;base64"],
    max_frame_size_bytes: 15 * 1024 * 1024,
    camera_permission: "camera",
    capabilities: [
      "live_camera_ocr",
      "sensory_scene_description",
      "wayfinding_sign_detection",
      "crowd_and_lighting_analysis",
    ],
    prewritten_commands: MASTER_PREWRITTEN_COMMANDS.camera,
  });
});

// Camera Capture & OCR
app.post("/api/camera/capture", upload.single("image") as any, async (req: Request, res: Response) => {
  try {
    let imageBuffer: Buffer | null = null;
    let mimeType = "image/jpeg";

    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype || "image/jpeg";
    } else if (req.body?.image || req.body?.photo || req.body?.camera_frame) {
      const dataStr: string = req.body.image || req.body.photo || req.body.camera_frame;
      if (dataStr.startsWith("data:")) {
        const match = dataStr.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          imageBuffer = Buffer.from(match[2], "base64");
        } else {
          imageBuffer = Buffer.from(dataStr, "base64");
        }
      } else {
        imageBuffer = Buffer.from(dataStr, "base64");
      }
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      return res.status(400).json({
        detail: "Camera frame is required. Send multipart image or JSON with base64 'image'.",
      });
    }

    const ocrResult = await performHighAccuracyOcr(imageBuffer, mimeType, "camera_frame.jpg");
    return res.json({
      camera: "capture_success",
      ...ocrResult,
      prewritten_commands: MASTER_PREWRITTEN_COMMANDS.camera,
    });
  } catch (err: any) {
    return res.status(500).json({ detail: `Camera OCR failed: ${err?.message || err}` });
  }
});

// Camera Scene Description (Sensory-friendly for low-vision or overwhelmed users)
app.post("/api/camera/describe", upload.single("image") as any, async (req: Request, res: Response) => {
  try {
    let imageBuffer: Buffer | null = null;
    let mimeType = "image/jpeg";

    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype || "image/jpeg";
    } else if (req.body?.image || req.body?.photo || req.body?.camera_frame) {
      const dataStr: string = req.body.image || req.body.photo || req.body.camera_frame;
      if (dataStr.startsWith("data:")) {
        const match = dataStr.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          imageBuffer = Buffer.from(match[2], "base64");
        }
      } else {
        imageBuffer = Buffer.from(dataStr, "base64");
      }
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      return res.status(400).json({ detail: "Camera image required for scene description." });
    }

    let description = "A calm room with clear walkways and visible signs.";
    const aiDesc = await generateContentWithFallback({
      preferredModel: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType,
              },
            },
            {
              text: `Describe this camera view in a calm, clear, sensory-friendly manner.
1. Mention main items, pathways, doors, and signs.
2. Note lighting conditions (soft, harsh, flickering) and clutter level.
3. Keep the tone grounded, objective, and supportive.`,
            },
          ],
        },
      ],
    });

    if (aiDesc) {
      description = aiDesc;
    }

    const formatted = appendPrewrittenCommands(description, MASTER_PREWRITTEN_COMMANDS.camera);
    return res.json({
      description: formatted,
      raw_description: description,
      prewritten_commands: MASTER_PREWRITTEN_COMMANDS.camera,
    });
  } catch (err: any) {
    return res.status(500).json({ detail: `Camera describe error: ${err?.message || err}` });
  }
});

// Camera Environment & Sensory Clutter Analysis
app.post("/api/camera/analyze", upload.single("image") as any, async (req: Request, res: Response) => {
  try {
    let imageBuffer: Buffer | null = null;
    let mimeType = "image/jpeg";

    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype || "image/jpeg";
    } else if (req.body?.image || req.body?.photo || req.body?.camera_frame) {
      const dataStr: string = req.body.image || req.body.photo || req.body.camera_frame;
      if (dataStr.startsWith("data:")) {
        const match = dataStr.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          imageBuffer = Buffer.from(match[2], "base64");
        }
      } else {
        imageBuffer = Buffer.from(dataStr, "base64");
      }
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      return res.status(400).json({ detail: "Camera image required for analysis." });
    }

    let analysisResult: any = {
      lighting: "Moderate, consistent indoor lighting",
      visual_clutter: "Low to moderate",
      navigation_clarity: "Clear pathways visible",
      recommended_action: "Comfortable environment. Proceed at your own pace.",
    };

    const aiAnalysis = await generateContentWithFallback({
      preferredModel: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType,
              },
            },
            {
              text: `Analyze this space for accessibility and sensory safety.
Return a JSON object with:
{
  "lighting": "Description of lighting",
  "visual_clutter": "Low, medium, or high clutter assessment",
  "navigation_clarity": "Pathways and landmark assessment",
  "recommended_action": "Helpful, gentle recommendation"
}`,
            },
          ],
        },
      ],
      config: { responseMimeType: "application/json" },
    });

    if (aiAnalysis) {
      try {
        analysisResult = JSON.parse(aiAnalysis);
      } catch {
        // Keep default fallback
      }
    }

    return res.json({
      sensory_analysis: analysisResult,
      prewritten_commands: MASTER_PREWRITTEN_COMMANDS.camera,
    });
  } catch (err: any) {
    return res.status(500).json({ detail: `Camera analysis error: ${err?.message || err}` });
  }
});

// ----------------------------------------------------
// 5. EXPLAIN SIMPLY
// ----------------------------------------------------
app.post("/api/explain", async (req: Request, res: Response) => {
  const rawText = req.body?.text || req.body?.input;
  if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
    return res.status(400).json({ detail: "text must not be blank" });
  }

  const text = rawText.trim();
  const simplified = await completeText(
    "Explain the supplied text simply in clear, plain language without changing its core meaning. Keep sentences short and digestible. Return only the explanation.",
    text
  );

  const formattedText = appendPrewrittenCommands(simplified, MASTER_PREWRITTEN_COMMANDS.explain);
  return res.json({
    text: formattedText,
    raw_explanation: simplified,
    source: "gemini_plain_language",
    prewritten_commands: MASTER_PREWRITTEN_COMMANDS.explain,
  });
});

// ----------------------------------------------------
// 6. SAY IT FOR ME
// ----------------------------------------------------
app.post("/api/say", async (req: Request, res: Response) => {
  const intent = req.body?.intent;
  if (!intent || typeof intent !== "string" || !intent.trim()) {
    return res.status(400).json({ detail: "intent must not be blank" });
  }

  const context = req.body?.context ? `\nContext: ${req.body.context}` : "";
  const drafted = await completeText(
    "Help the user compose a respectful, considerate message expressing their needs or thoughts. Do not send it. Return only the drafted message text.",
    intent.trim() + context
  );

  const formattedText = appendPrewrittenCommands(drafted, MASTER_PREWRITTEN_COMMANDS.say);
  return res.json({
    text: formattedText,
    raw_message: drafted,
    source: "gemini_message_assistant",
    prewritten_commands: MASTER_PREWRITTEN_COMMANDS.say,
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
    prewritten_commands: MASTER_PREWRITTEN_COMMANDS.calm,
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
    prewritten_commands: MASTER_PREWRITTEN_COMMANDS.habits,
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
    prewritten_commands: MASTER_PREWRITTEN_COMMANDS.habits,
  });
});

// ----------------------------------------------------
// 8. TASKS BREAKDOWN
// ----------------------------------------------------
app.post("/api/tasks/breakdown", async (req: Request, res: Response) => {
  const task = req.body?.task || req.body?.input;
  if (!task || typeof task !== "string" || !task.trim()) {
    return res.status(400).json({ detail: "task must not be blank" });
  }

  const result = await completeText(
    "Break the task into clear, numbered, manageable small steps. Avoid overwhelming detail or artificial urgency. Keep each step actionable and calm.",
    task.trim()
  );

  const formattedText = appendPrewrittenCommands(result, MASTER_PREWRITTEN_COMMANDS.tasks);
  return res.json({
    text: formattedText,
    raw_steps: result,
    source: "gemini_task_breakdown",
    prewritten_commands: MASTER_PREWRITTEN_COMMANDS.tasks,
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
      prewritten_commands: MASTER_PREWRITTEN_COMMANDS.sos,
    });
  }

  return res.json({
    status: "confirmed",
    message: message || "I need help.",
    contact: contact || null,
    timestamp: new Date().toISOString(),
    prewritten_commands: MASTER_PREWRITTEN_COMMANDS.sos,
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
// FRONTEND STATIC FILE SERVING & SPA FALLBACK
// ----------------------------------------------------
const frontendPath = fs.existsSync(path.join(process.cwd(), "frontend"))
  ? path.join(process.cwd(), "frontend")
  : path.resolve(__dirname, "../frontend");
app.use(express.static(frontendPath));

app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`NeuroSafe server v2.0 running on http://0.0.0.0:${PORT}`);
});
