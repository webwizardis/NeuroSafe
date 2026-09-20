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
├── src/                      # Uploaded reusable UI components
│   ├── RoutineManager.jsx    # Optional React routine manager component
│   └── RoutineManager.css    # Routine manager component styles
├── server.ts                 # Root delegator to backend/server.ts
├── package.json              # Full-stack dependencies & build commands
├── tsconfig.json             # TypeScript configuration
└── metadata.json             # AI Studio capabilities & camera permissions
```

---

## Features

- **Read for Me (Image Gallery & Multimodal Vision)**:
  - **Calm Sample Gallery**: Permission-free example images for reading text and understanding environments.
  - **Multimodal OCR**: Powered by Gemini Vision to extract text and generate plain-language summaries for cognitive ease.
  - **Describe Scene**: Surrounding environment analyzer identifying signs, physical layouts, and sensory triggers.
  - **Optional Image Upload**: Add a local image when a gallery example is not the right fit.
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

### Render deployment

Create a Render **Web Service** from this repository with:

| Setting | Value |
| :--- | :--- |
| Environment | Node |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/health` |

Render supplies the `PORT` environment variable automatically; the server binds
to it and listens on `0.0.0.0`. Do not hard-code a different port in Render.

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
| `GEMINI_VISION_MODEL` | Optional Gemini model for OCR and camera vision (defaults to `gemini-2.5-flash`) |
| `GOOGLE_VISION_API_KEY` | Vision OCR API key (optional fallback) |
| `GOOGLE_MAPS_API_KEY` | Google Maps Directions API key for route routing |
| `NEUROSAFE_API_KEY` | Optional API key to lock down endpoints |

`GEMINI_API_KEY`, `GOOGLE_VISION_API_KEY`, and `GOOGLE_MAPS_API_KEY` are
optional at startup. Add the ones needed for the corresponding AI, OCR, and
route features. `NEUROSAFE_API_KEY` is optional; if set, clients must send it
as `x-api-key` or as a Bearer token for protected API routes.
