# NeuroSafe

> **Neurodiversity-affirming accessibility and safety support assistant**

NeuroSafe is a full-stack accessibility web application built with TypeScript, Express, and modern browser interfaces. It is designed to assist neurodivergent individuals with executive function, sensory overload, communication anxiety, plain-language text processing, daily routines, and safe travel.

---

## Features

- **Personalized Accessibility Onboarding**: Interactive assessment that identifies specific cognitive and sensory challenges (sensory overload, executive function, reading processing, social burnout, wayfinding anxiety) and tailors the interface accordingly.
- **Daily Habit & Routine**: Gentle, low-pressure daily habit tracker with completion progress, time-of-day filtering (Morning, Afternoon, Evening), streak tracking, and AI-powered routine recommendations via Gemini.
- **Sensory-Friendly Controls**: Instant toggle between low-stimulation mode (reduced motion, muted tones), simplified plain-language text, step-by-step task pacing, and Text-to-Speech (TTS) read-aloud support.
- **Read for Me (OCR & Camera)**: Document and sign scanning powered by Google Vision API and Gemini visual comprehension.
- **Explain Simply**: Plain-language translation and cognitive breakdown of complex notices, legal forms, or dense instructions.
- **Say It for Me**: Respectful, socially calm message drafting with adjustable tone filters (direct, warm, gentle boundary).
- **Calm Me**: Sensory grounding 5-4-3-2-1 sequence and diaphragmatic pacing.
- **Task Breakdown**: Step-by-step decomposition of overwhelming multi-stage chores or work projects.
- **Safe Journey**: Low-stimulation wayfinding routes avoiding highways, crowded intersections, and overwhelming transfer hubs.
- **SOS Urgent Support**: Explicit two-step confirmed emergency beacon for designated contacts.

---

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, `@google/genai` SDK
- **Frontend**: Vanilla TypeScript/ES6, CSS Variables, accessible semantic HTML
- **Tooling**: `tsx` (dev server), `esbuild` (production bundling)

---

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm, yarn, or pnpm

### Installation

1. Clone or download the repository:
   ```bash
   git clone <your-repo-url>
   cd neurosafe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in any applicable API keys:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The application runs on `http://localhost:3000`.

### Production Build

To build and run in production:
```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API key for AI assistant features |
| `GOOGLE_VISION_API_KEY` | Vision OCR API key (optional fallback) |
| `GOOGLE_MAPS_API_KEY` | Google Maps Directions API key for route routing |
| `NEUROSAFE_API_KEY` | Optional API key to lock down endpoints |
