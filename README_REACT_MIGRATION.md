# NeuroSafe React frontend migration

This package contains a complete React/Vite frontend redesign for the supplied NeuroSafe frontend.

Included:
- React + TypeScript + Vite
- peach/spring accessibility-first design
- authentication and demo login integration
- onboarding/personalization
- dashboard
- Read for Me/OCR
- live camera + capture/describe/analyze
- Explain Simply
- Say It For Me
- browser speech synthesis
- Calm Me
- Task Breakdown
- Daily Habits
- Safe Journey
- SOS confirmation
- accessibility settings
- responsive desktop/tablet/mobile UI
- centralized API service

The existing backend should remain the source of truth.

Before replacing the current project files, compare `frontend/src/services/api.ts` with the actual backend endpoint definitions and keep the existing backend feature implementations intact.
