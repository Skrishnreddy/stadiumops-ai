🚀 Excited to share **StadiumOps AI**, our submission for the PromptWars Challenge 04!

Managing high-stakes safety and crowd operations at massive tournament venues (like the upcoming FIFA World Cup 2026) is a complex challenge. StadiumOps AI is a production-grade, GenAI-powered dashboard designed to help stadium operations teams triage incidents and dispatch help instantly.

### 🏟️ The Problem
During global sporting events, delays in incident reporting or standard manual lookup of safety Standard Operating Procedures (SOPs) can escalate localized problems (crowd surges, medical issues) into stadium-wide emergencies.

### 🚨 Solution & Key Features
- **GenAI Classification**: Leveraging Google's Gemini API to automatically categorize reports, prioritize severity, assign responsibilities, and suggest immediate actions.
- **Fail-Safe Local Heuristics**: If the AI experiences network issues or timeouts, a rule-based Python classifier automatically takes over—maintaining zero-downtime safety reporting.
- **Lightweight SOP Retrieval**: Instantly retrieves and logs pre-approved stadium safety instructions.
- **Multilingual Public Safety Announcements**: Automatically drafts translated broadcasts in English, Spanish, French, and Arabic.
- **Human-in-the-Loop Approval**: Crucial broadcast and dispatch actions require explicit Operations Manager verification.
- **Immutable Database Audit Trail**: Logs every status update chronologically for post-incident compliance reviews and Markdown report generation.

### 🛠️ Technology Stack
- **Frontend**: React, TypeScript, Vite, Vanilla CSS (designed for high-contrast accessibility).
- **Backend**: FastAPI, Python, Pydantic, SQLAlchemy.
- **Database**: SQLite.
- **AI**: Gemini API (`gemini-1.5-flash`) with structured JSON schema responses.

### 🔒 Security & ♿ Accessibility First
- Implemented sliding-window rate limiting, input sanitation to block injection attacks, and strict CORS/CSP configurations.
- 100% WCAG 2.1 AA compliant frontend, featuring complete keyboard navigation, focus indicators, and text-based semantics alongside status colors.

Check out the prototype:
💻 GitHub: https://github.com/Skrishnreddy/stadiumops-ai
🌐 Deployed Web App: https://stadiumops-ai.vercel.app (Deployment Placeholder)

#SmartStadiums #FastAPI #ReactJS #ViteJS #GeminiAPI #Accessibility #DevSecOps #PromptWars #FIFA2026
