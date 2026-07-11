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
StadiumOps AI bridges the gap between incident reporting and dispatch. When safety staff log a situation, our GenAI-powered assistant instantly classifies the category, assigns severity levels, assigns responsible stadium response teams, and extracts active procedural steps. It automatically drafts translated warning announcements in the tournament's official languages (English, Spanish, French, Arabic) for immediate manager review, while logging every state change in an immutable database audit timeline to maintain a post-event reporting log.

## 3. Key Features
- **Semantic Classification**: Real-time risk estimation predicting incident category, severity, and response squads.
- **Fail-Safe Fallback**: Zero-downtime local Python classifier checking regex keywords if Gemini API hits timeouts or quota limits.
- **Lightweight SOP Retrieval**: Instant indexing of pre-approved safety procedures without large vector databases.
- **Multilingual PA Broadcasting**: Dual-path drafting of emergency announcements (English, Spanish, French, Arabic).
- **Human-in-the-loop Gateways**: Critical dispatch actions require explicit Operations Manager sign-off.
- **Structured Audit Trails**: Chronologically ordered, database-written timeline tracking incident lifecycles.
- **Post-Incident Reporting**: Automatic markdown summary generation for compliance reviews.

## 4. Intelligent Decision Logic
- **Input Checking**: Reject text inputs containing SQL/Script inject markers.
- **GenAI Interface**: Model requests structured JSON outputs matching strict schema validators.
- **Status State Machine**: Rigid transition rules (e.g. `Open` -> `Acknowledged` -> `In Progress` -> `Resolved` -> `Closed`). Backward steps or arbitrary jumps (except direct `Open` -> `Closed` for false alarms) are blocked.

## 5. Technology Stack
- **Frontend**: React, TypeScript, Vite, Vanilla CSS.
- **Backend**: FastAPI, Python 3, SQLAlchemy, Pydantic (validation and configuration).
- **Database**: SQLite for local persistence.
- **AI**: Gemini API (`gemini-1.5-flash`), with structured JSON enforcement.

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
- **Keyboard Friendly**: Custom focus indicators, escape-to-close modal handlers, and skip navigation buttons.
- **Semantic Structure**: HTML5 landmarks (`<main>`, `<aside>`, `<nav>`, `<header>`).
- **High Contrast**: Badge styling displays text alongside color categories to avoid color-only indicators.

## 12. Testing
Test suites cover both rule classifier matches, SOP lookups, security middlewares, and validation schemas. For details, refer to [docs/testing.md](file:///Users/gsaikrishnareddy/.gemini/antigravity-ide/scratch/stadiumops-ai/docs/testing.md).

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

## 14. Deployment Steps

### Backend (Render / Railway / Cloud Run)
- Build command: `pip install -r backend/requirements.txt`
- Start command: `python -m backend.app.main`
- Set environment variables on the hosting platform:
  - `PORT=8000`
  - `ENVIRONMENT=production`
  - `GEMINI_API_KEY=your_key_here`

### Frontend (Vercel)
- Set Environment Variable: `VITE_API_URL=https://your-backend-url.com`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

---

## 15. Assumptions & Limitations
For a detailed review of our architectural assumptions and constraints, check [docs/assumptions.md](file:///Users/gsaikrishnareddy/.gemini/antigravity-ide/scratch/stadiumops-ai/docs/assumptions.md).

## 16. Future Improvements
- Implement WebSockets for real-time dashboard notifications without manual page refreshes.
- Integrate with live audio text-to-speech engines to stream approved multilingual broadcasts directly to PA units.
- Enable offline SQLite synchronization for edge deployments.

---

## 17. Demo & Media
- **Demo Link**: [https://stadiumops-ai.vercel.app](https://stadiumops-ai.vercel.app) *(Placeholder)*
- **Screenshots**: *Place screenshot here*

---

## Disclaimer
This is an independent prototype created for PromptWars Challenge 04. It is not affiliated with or endorsed by FIFA.
