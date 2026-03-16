# Slay The Syllabus

## Overview

AI-powered study platform that helps students convert long lectures, PDFs, and notes into structured study materials. Features a stunning dark purple/blue glassmorphism theme.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/slay-the-syllabus)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (zod/v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)
- **Build**: esbuild (CJS bundle)

## Features

1. **Splash Screen** - Fun study joke on first load before entering the app
2. **AI Summarizer** - Short summaries, bullet points, exam notes, key concepts, formulas
3. **Flashcard Generator** - Auto-generated flashcards with flip animations
4. **Quiz Generator** - MCQ, True/False, Fill-in-blank, Short answer with difficulty levels
5. **Mind Map Generator** - Visual hierarchical concept maps
6. **Study Planner** - Personalized day-by-day study plans with exam date
7. **AI Doubt Chatbot** - Chat interface for asking study questions
8. **Concept Explainer** - ELI5, Beginner, Intermediate, Advanced levels
9. **Pomodoro Timer** - 25-minute study session timer
10. **Gamification** - XP points, streaks (localStorage)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server with AI routes
│   └── slay-the-syllabus/  # React + Vite frontend (at /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   ├── integrations-openai-ai-server/  # OpenAI server-side client
│   └── integrations-openai-ai-react/   # OpenAI React hooks
```

## API Routes

- `GET /api/healthz` - Health check
- `GET /api/ai/joke` - Get a study joke for splash screen
- `POST /api/ai/summarize` - Summarize content (type: short/bullets/exam_notes/key_concepts/formulas)
- `POST /api/ai/flashcards` - Generate flashcards
- `POST /api/ai/quiz` - Generate quiz (difficulty: easy/medium/hard/exam, type: mcq/truefalse/fillinblank/short)
- `POST /api/ai/mindmap` - Generate mind map tree
- `POST /api/ai/studyplan` - Generate study plan with exam date
- `POST /api/ai/explain` - Explain concept at a level (eli5/beginner/intermediate/advanced)
- `POST /api/ai/chat` - AI doubt solver chat
- `POST /api/ai/youtube` - Extract transcript from YouTube URL and generate study notes

## Environment Variables

- `AI_INTEGRATIONS_OPENAI_BASE_URL` - Set by Replit AI Integrations
- `AI_INTEGRATIONS_OPENAI_API_KEY` - Set by Replit AI Integrations
- `DATABASE_URL` - PostgreSQL connection string (auto-provisioned)

## Development

- `pnpm --filter @workspace/api-server run dev` - Start API server
- `pnpm --filter @workspace/slay-the-syllabus run dev` - Start frontend
- `pnpm --filter @workspace/api-spec run codegen` - Regenerate API client
