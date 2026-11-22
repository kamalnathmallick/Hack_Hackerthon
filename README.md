# 🚀 HackFlow AI

> **Autonomous Multi-Agent Platform for Hackathon Teams & Project Orchestration**

HackFlow AI is an end-to-end multi-agent AI system powered by the official **Google Gemini AI SDK (`@google/genai`)**, **PostgreSQL**, **Socket.IO**, and **Next.js**. It transforms raw hackathon project problem statements into dynamic technical architecture, milestone breakdowns, skill-matched task assignments, judge simulations, and native `.pptx` PowerPoint presentation decks.

---

## ✨ Key Features

- 🤖 **Multi-Agent Gemini AI Pipeline**:
  - **Problem Analysis Agent**: Extracts core challenges, target users, technical hurdles, and mitigation plans with Structured Outputs (`responseJsonSchema`).
  - **Task Breakdown Agent**: Breaks down project requirements into priority-weighted, effort-estimated tasks intelligently assigned to actual project team members based on their technical domains.
  - **Presentation Agent**: Auto-generates comprehensive 7-slide pitch decks (Title, Problem, Solution, Architecture, Tech Stack, Roadmap, Impact) with bullet points and presenter speaker notes.
- ⚡ **Non-Blocking Async Execution with Socket.IO**:
  - Project creation responds immediately (`201 Created`) with status `GENERATING`.
  - Room-scoped live streaming progress events (`agent:status`, `agent:step_complete`, `agent:done`, `agent:error`) deliver a step-by-step progress checklist to the leader in real time.
- 📊 **Native `.pptx` PowerPoint Export**:
  - Generates downloadable 16:9 widescreen presentations using `pptxgenjs` with modern styling, key takeaway banners, and embedded presenter speaker notes.
- 🛡️ **Production-Grade RBAC & Security**:
  - Standardized `TEAM_LEADER` and `TEAM_MEMBER` roles with JWT authentication.
  - Multi-tenant project scoping: team members only see projects they created or are assigned to.
  - Robust password reset flow requiring current password or signed time-limited reset tokens.
- 🐳 **Full-Stack Dockerization**:
  - One-command startup for PostgreSQL 16, Node.js Backend, and Next.js Frontend via Docker Compose with healthchecks.

---

## 🏃 Quick Start with Docker (Recommended)

Run the full stack with a single command:

```bash
# Start PostgreSQL, Backend, and Frontend in Docker
npm run docker:up

# Check container status
docker compose ps

# View live logs
npm run docker:logs

# Stop the stack
npm run docker:down
```

- **Frontend**: [http://localhost:3001](http://localhost:3001) (or `http://localhost:3000` via `FRONTEND_PORT`)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **PostgreSQL**: `localhost:5433` (Docker container: `hackflow-postgres`)

---

## 💻 Local Development (Without Docker)

### 1. Prerequisites
- Node.js 20+
- PostgreSQL database running locally

### 2. Configure Environment Files

```bash
# Backend
copy backend\.env.example backend\.env

# Frontend
copy frontend\.env.local.example frontend\.env.local
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Both Services
```bash
npm run dev
```

---

## 🔑 Demo Access

Demo accounts can be registered directly through the signup page (`/login`) as either a **Team Leader** or **Team Member**, or configured via your local `.env` file.

---

## 🧪 Testing

```bash
# Run backend test suite (Auth, Agents, Projects, PPTX Export)
npm test --prefix backend

# Build frontend production bundle
npm run build --prefix frontend
```

---

## 🏛️ Architecture & Tech Stack

- **AI Engine**: Google Gemini API via `@google/genai` (Gemini 2.5 Flash with JSON Schema)
- **Backend**: Node.js, Express, Socket.IO, PostgreSQL (`pg`), `pptxgenjs`, `bcryptjs`, `jsonwebtoken`, `zod`
- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React, Framer Motion
- **DevOps**: Docker, Docker Compose, Multi-stage builds, Alpine Linux
