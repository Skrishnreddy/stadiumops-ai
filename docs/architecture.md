# StadiumOps AI Architecture Documentation

## System Overview

StadiumOps AI is a dual-tier smart stadium assistant built to support tournament operations teams during major sporting events like the FIFA World Cup 2026. The solution manages incident reports, runs automated GenAI-based risk classifications, loads Standard Operating Procedures (SOPs), drafts emergency public announcements in multiple languages, and provides immutable audit timelines.

```
+-------------------------------------------------------------+
|                         CLIENT UI                           |
|      React + TypeScript + Vite (Deployed on Vercel)          |
+------------------------------+------------------------------+
                               | HTTP / JSON
                               v
+-------------------------------------------------------------+
|                       FASTAPI BACKEND                       |
|          Python + Pydantic + Uvicorn (Render/Railway)        |
|                                                             |
|  +-------------------+  +-------------------+  +----------+ |
|  |    API Routers    |  | Security / CORS   |  | Rate     | |
|  |  (Incidents, SOP) |  |   Middleware      |  | Limiter  | |
|  +---------+---------+  +---------+---------+  +----+-----+ |
|            |                      |                 |       |
|            +----------+-----------+-----------------+       |
|                       v                                     |
|  +-------------------------------------------------------+  |
|  |                   SERVICES LAYER                      |  |
|  |                                                       |  |
|  |  +---------------------+    +----------------------+  |  |
|  |  |  SOP Retrieval Svc  |    | Gemini API Service   |  |  |
|  |  |  (Lightweight JSON) |    | (Structured JSON)    |  |  |
|  |  +----------+----------+    +----------+-----------+  |  |
|  |             |                          |              |  |
|  |             |                          v (Fallback)   |  |
|  |             |               +----------+-----------+  |  |
|  |             |               | Rule-Based Classifier|  |  |
|  |             |               +----------+-----------+  |  |
|  +-------------+--------------------------+--------------+  |
|                |                          |                 |
|                v                          v                 |
|  +-------------------------------------------------------+  |
|  |                  DATA ACCESS LAYER                    |  |
|  |  +---------------------+    +----------------------+  |  |
|  |  | SQLAlchemy / SQLite |    | SOP JSON Data Store  |  |  |
|  |  +---------------------+    +----------------------+  |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```

## Modular Structure

### 1. Backend Layer (FastAPI)
- **app/core**: Configuration settings (`config.py`), database engine hook (`database.py`), and centralized error overrides (`exceptions.py`).
- **app/models**: Database entity definitions (`database.py`) using SQLAlchemy ORM for SQLite.
- **app/schemas**: Pydantic models (`incidents.py`) enforcing string sanitation and state structures.
- **app/services**:
  - `gemini.py`: Interacts with Google's Gemini API, parsing structured JSON schema outputs with a 4s timeout and prompt-injection mitigation checks.
  - `classifier.py`: Rule-based keyword matching service executing fallback classifications.
  - `sop.py`: Lightweight file scanner querying `backend/app/data/sops.json`.
- **app/middleware**: Custom headers injection, CORS handling, and sliding-window request rate-limit throttling.

### 2. Frontend Layer (React + TS + Vite)
- **src/components**: Layout frames, custom badging indicators, timeline grids, checklist panels, and modal shells.
- **src/pages**: State-routed page frames for the main dashboard view, report log form, history tables, details view, and configurations library.
- **src/services**: Unified HTTP connection client interfacing endpoints.

## Intelligent Decision Flow

1. **Incident Submitted**: User submits incident description and location.
2. **Security Scan**: System checks input length (<2000 chars) and performs prompt injection analysis.
3. **GenAI Classification**: API compiles a prompt requesting JSON formatting from `gemini-1.5-flash`.
4. **Fallback Handler**: If Gemini API errors out, rate limits, or times out, the local `RuleBasedClassifier` runs regex scans.
5. **Procedural Retrieval**: The system matches the resolved incident category with `backend/app/data/sops.json`.
6. **Persistence**: Database records the incident, maps recommended actions, and triggers a "Created" audit log event.
