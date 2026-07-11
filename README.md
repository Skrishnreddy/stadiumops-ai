# StadiumOps AI

An intelligent, GenAI-powered assistant for stadium operations and safety teams managing incidents during FIFA World Cup 2026 style tournaments.

---

### Challenge Name
**PromptWars Challenge 04**

### Selected Vertical
**Smart Stadiums & Tournament Operations**

---

## 1. Problem Statement
Managing a massive stadium crowd during global events like the FIFA World Cup involves coordinate efforts across safety stewards, facilities engineers, medical responders, and public announcers. During critical incidents, delay in decision-making or incorrect triage of severity leads to increased risks of crowd crush, untreated medical emergencies, or communication panic. Traditional operations centers rely on manual lookup of Standard Operating Procedures (SOPs) and slow translation procedures for emergency public announcements.

## 2. Solution Overview
StadiumOps AI bridges the gap between incident reporting and dispatch. When safety staff log a situation, our GenAI-powered assistant instantly classifies the category, assigns severity levels, assigns responsible stadium response teams, and extracts active procedural steps. It automatically drafts translated warning announcements in the tournament's official languages (English, Spanish, French, Arabic) for immediate manager review, while logging every state change in an audit timeline to maintain a post-event reporting log.

## 3. Key Features
- **Semantic Classification**: Real-time risk estimation predicting incident category, severity, and response squads.
- **Fail-Safe Fallback**: Local Python classifier checking regex keywords if Gemini API hits timeouts or quota limits.
- **Lightweight SOP Retrieval**: Instant indexing of pre-approved safety procedures without large vector databases.
- **Multilingual PA Broadcasting**: Dual-path drafting of emergency announcements (English, Spanish, French, Arabic).
- **Human-in-the-loop Gateways**: Critical dispatch actions require explicit Operations Manager sign-off.
- **Structured Audit Trails**: Chronologically ordered database timeline tracking incident lifecycles.
- **Post-Incident Reporting**: Automatic markdown summary generation for compliance reviews.

## 4. Intelligent Decision Logic
- **Input Checking**: Reject text inputs containing SQL/Script inject markers.
- **GenAI Interface**: Model requests structured JSON outputs matching strict schema validators.
- **Status State Machine**: Rigid transition rules (e.g. `Open` -> `Acknowledged` -> `In Progress` -> `Resolved` -> `Closed`). Backward steps or arbitrary jumps (except direct `Open` -> `Closed` for false alarms) are blocked.

## 5. Technology Stack
- **Frontend**: React, TypeScript, Vite, Vanilla CSS.
- **Backend**: FastAPI, Python 3, SQLAlchemy, Pydantic (validation and configuration).
- **Database**: SQLite for local persistence.
- **AI**: Gemini API (`gemini-1.5-flash`) using the supported `google-genai` SDK, with structured JSON schema enforcement.

## 6. Architecture & Data Flow
A detailed architectural review and ASCII flow diagram can be found in [docs/architecture.md](file:///Users/gsaikrishnareddy/.gemini/antigravity-ide/scratch/stadiumops-ai/docs/architecture.md).

## 7. Application Workflow
For a step-by-step review of standard operations and API endpoints, check [docs/api.md](file:///Users/gsaikrishnareddy/.gemini/antigravity-ide/scratch/stadiumops-ai/docs/api.md).

## 8. AI & Fallback Logic
The AI classification workflow tries to call the Gemini API with a strict 4.0-second timeout. If the request fails, the service catches the exception and routes the text through the `RuleBasedClassifier` (regex-keyword engine). This maintains operations continuity.

## 9. SOP Retrieval
Matching is handled by `SOPService` using category names or text keywords (e.g. searching "evacuate" returns the evacuation checklists). Standard operating procedures are stored as a lightweight JSON document in `backend/app/data/sops.json`.

## 10. Security Design
- **IP Rate Limiting**: Limit client calls to protect against Denial of Service.
- **Secure Headers**: Injected custom middleware adding HSTS, Content-Security-Policy, and XSS blocks.
- **Credential Protection**: The API key is stored strictly on the backend; the frontend never reads the keys.
- Full details are documented in [SECURITY.md](file:///Users/gsaikrishnareddy/.gemini/antigravity-ide/scratch/stadiumops-ai/SECURITY.md).

## 11. Accessibility (a11y)
Designed with WCAG 2.1 AA accessibility principles:
- **Keyboard Friendly**: Custom focus indicators, escape-to-close modal handlers, and skip navigation buttons.
- **Semantic Structure**: HTML5 landmarks (`<main>`, `<aside>`, `<nav>`, `<header>`).
- **High Contrast**: Badge styling displays text alongside color categories to avoid color-only indicators.

## 12. Testing & Coverage
Our testing strategy targets full coverage of logical state flows, validation schemes, and fallback handlers:
- **Backend Tests**: 14 tests passing, verifying health probes, inputs, classification rules, state machine transitions, and security rates.
- **Backend Coverage**: 90% total statements covered (via `pytest-cov`).
- **Frontend Tests**: 9 tests passing (via `vitest`), validating dashboard cards, badge labels, modal keyboard events, spinners, and form submissions.
- **Vite Build Result**: Success (0 type warnings).
- **Tracked Repository Size**: ~520 KB (well under the 10 MB limit).
Refer to [docs/testing.md](file:///Users/gsaikrishnareddy/.gemini/antigravity-ide/scratch/stadiumops-ai/docs/testing.md) for details.

---

## 13. Local Setup & Execution

### Prerequisites
- Python 3.10+
- Node.js 18+

### Step 1: Clone and Configure
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd stadiumops-ai
   ```
2. Create and populate backend configuration:
   ```bash
   cp .env.example backend/.env
   # Add your GEMINI_API_KEY inside backend/.env
   ```

### Step 2: Spin Up Backend
1. Initialize virtual environment and install packages:
   ```bash
   python3 -m venv backend/.venv
   source backend/.venv/bin/activate
   pip install -r backend/requirements.txt
   ```
2. Start Uvicorn:
   ```bash
   python3 -m backend.app.main
   # Backend will run on http://localhost:8000
   ```

### Step 3: Run Backend Tests
Ensure the virtual environment is active:
```bash
pytest backend/ -v
```

### Step 4: Spin Up Frontend
1. Navigate to frontend directory and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Launch Vite Dev server:
   ```bash
   npm run dev
   # App will run on http://localhost:5173
   ```

---

## 14. Production Deployment Steps

### Backend (Render Web Service)
- **Runtime**: `Python`
- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Endpoint**: `/api/health`
- **Environment Variables**:
  - `ENVIRONMENT=production`
  - `DATABASE_URL=sqlite:///./stadiumops.db`
  - `GEMINI_API_KEY=your_gemini_api_key`
  - `ALLOWED_ORIGINS=https://stadiumops-ai-frontend.onrender.com`

### Frontend (Render Static Site)
- **Runtime**: `Static`
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/dist`
- **Environment Variables**:
  - `VITE_API_URL=https://stadiumops-ai-backend.onrender.com`
- **Rewrite Routes (SPA)**:
  - Source: `/*`
  - Destination: `/index.html`

---

## 15. Assumptions & Limitations
For a detailed review of our architectural assumptions and constraints, check [docs/assumptions.md](file:///Users/gsaikrishnareddy/.gemini/antigravity-ide/scratch/stadiumops-ai/docs/assumptions.md).

## 16. Future Improvements
- Implement WebSockets for real-time dashboard notifications without manual page refreshes.
- Integrate with live audio text-to-speech engines to stream approved multilingual broadcasts directly to PA units.
- Enable offline SQLite synchronization for edge deployments.

---

## 17. Demo & Media
- **GitHub Repository**: [https://github.com/Skrishnreddy/stadiumops-ai](https://github.com/Skrishnreddy/stadiumops-ai)
- **Demo Link**: [https://stadiumops-ai-frontend.onrender.com/](https://stadiumops-ai-frontend.onrender.com/)
- **LinkedIn Post**: Available in [docs/linkedin-post.md](file:///Users/gsaikrishnareddy/.gemini/antigravity-ide/scratch/stadiumops-ai/docs/linkedin-post.md)

---

## Disclaimer
This is an independent prototype created for PromptWars Challenge 04. It is not affiliated with or endorsed by FIFA.
