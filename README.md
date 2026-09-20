# NeuroSafe

> **Neurodiversity-affirming accessibility and safety support assistant**

NeuroSafe is a full-stack accessibility web application built with TypeScript, Express, and modern browser interfaces. It is designed to assist neurodivergent individuals with executive function, sensory overload, communication anxiety, plain-language text processing, daily routines, and safe travel.

---

## Repository Structure

The project is strictly separated into dedicated `backend` and `frontend` folders:

```
├── backend/                  # Backend service & APIs
│   └── server.ts             # Express server, Gemini multimodal OCR, camera endpoints, TTS, habits
├── frontend/                 # Client user interface & accessibility tools
│   ├── index.html            # Semantic HTML, Live camera viewfinder, habit tracker, onboarding
│   ├── styles.css            # Sensory-friendly design system, camera reticle, accessible states
│   └── app.js                # Camera stream manager, OCR processor, habit engine, TTS
├── server.ts                 # Root delegator to backend/server.ts
├── package.json              # Full-stack dependencies & build commands
├── tsconfig.json             # TypeScript configuration
└── metadata.json             # AI Studio capabilities & camera permissions
```

---

## Features

- **Read for Me (Camera OCR & Multimodal Vision)**:
  - **Live Camera Scanner**: Real-time camera viewfinder with alignment reticle and instant frame capture.
  - **Multimodal OCR**: Powered by Gemini Vision to extract text and generate plain-language summaries for cognitive ease.
  - **Describe Scene**: Surrounding environment analyzer identifying signs, physical layouts, and sensory triggers.
  - **Dual Lens & Controls**: Switch front/back cameras, pause/resume video streams, or use phone native camera capture.
  - **Listen & Copy**: Instant calm Text-to-Speech (TTS) readout and clipboard export.
- **Personalized Accessibility Onboarding**: Interactive assessment that identifies specific cognitive and sensory challenges and customizes the entire app.
- **Daily Habit & Routine**: Gentle, low-pressure daily habit tracker with completion progress, time-of-day filtering (Morning, Afternoon, Evening), streak tracking, and AI-powered routine recommendations via Gemini.
- **Sensory-Friendly Controls**: Instant toggle between low-stimulation mode, simplified plain text, step pacing, and calm color palettes.
- **Explain Simply**: Plain-language translation and cognitive breakdown of complex notices or instructions.
- **Say It for Me**: Respectful, socially calm message drafting with adjustable tone filters.
- **Calm Me**: Sensory grounding 5-4-3-2-1 sequence and diaphragmatic pacing.
- **Task Breakdown**: Step-by-step decomposition of overwhelming multi-stage tasks.
- **Safe Journey**: Low-stimulation wayfinding avoiding overwhelming traffic and crowds.
- **SOS Urgent Support**: Explicit two-step confirmed emergency beacon.

---

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, `@google/genai` SDK
- **Frontend**: Vanilla TypeScript/ES6, CSS Variables, accessible semantic HTML
- **Tooling**: `tsx` (dev server), `esbuild` (production bundling)

---

## Getting Started

### Render deployment

Create a Render **Web Service** with:

| Setting | Value |
| :--- | :--- |
| Environment | Node |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/health` |

Render supplies `PORT` automatically. The backend binds to it and listens on
`0.0.0.0`.

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
| `GEMINI_VISION_MODEL` | Optional Gemini model for OCR and gallery vision |
| `GOOGLE_VISION_API_KEY` | Vision OCR API key (optional fallback) |
| `GOOGLE_MAPS_API_KEY` | Google Maps Directions API key for route routing |
| `NEUROSAFE_API_KEY` | Optional API key to lock down endpoints |
