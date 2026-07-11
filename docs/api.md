# StadiumOps AI API Documentation

The backend API handles incident logging, status changes, SOP queries, and announcement translations.

## Base URL
In local development, the API runs at `http://localhost:8000`.

---

## 1. Health Probe
- **Endpoint**: `GET /api/health`
- **Description**: Verifies liveness and checks active database connection integrity.
- **Response**:
  ```json
  {
    "status": "online",
    "database": "healthy",
    "service": "stadiumops-ai-backend"
  }
  ```

---

## 2. Report Incident
- **Endpoint**: `POST /api/incidents`
- **Request Body**:
  ```json
  {
    "title": "Smoke at West Concourse",
    "description": "Localized thick smoke near the concessions sector.",
    "location_zone": "D",
    "location_section": "Lower Stand 104",
    "location_gate": "Gate 12",
    "reporter_name": "Marcus Vance"
  }
  ```
- **Response**:
  ```json
  {
    "id": "f5bb8626-d3eb-460d-83cb-f4f56f4d5462",
    "title": "Smoke at West Concourse",
    "description": "Localized thick smoke near the concessions sector.",
    "location_zone": "D",
    "location_section": "Lower Stand 104",
    "location_gate": "Gate 12",
    "reporter_name": "Marcus Vance",
    "status": "Open",
    "category": "Fire or smoke",
    "severity": "Critical",
    "priority": "P1",
    "confidence": 0.95,
    "responsible_team": "Stadium Fire & Rescue Marshall Service",
    "immediate_actions": [
      "Isolate and evacuate the immediate seating blocks and rows",
      "Dispatch nearest fire marshals with heavy duty extinguishers",
      "Trigger automated alarms and notify municipal fire services"
    ],
    "reasoning_summary": "Smoke report matches Fire or Smoke trigger keywords.",
    "created_at": "2026-07-11T12:00:00Z",
    "updated_at": "2026-07-11T12:00:00Z"
  }
  ```

---

## 3. List Incidents
- **Endpoint**: `GET /api/incidents`
- **Query Parameters**:
  - `status` (string, optional): Filter by `Open`, `Acknowledged`, `In Progress`, `Resolved`, `Closed`
  - `severity` (string, optional): Filter by `Low`, `Medium`, `High`, `Critical`
  - `zone` (string, optional): Filter by zone reference (e.g. `A`, `B`)
  - `skip` (integer, default `0`): Pagination offset
  - `limit` (integer, default `20`): Pagination size limit (max `100`)
- **Response**: List of Incident records.

---

## 4. Get Incident Details
- **Endpoint**: `GET /api/incidents/{incident_id}`
- **Response**:
  ```json
  {
    "incident": { ... },
    "audit_logs": [
      {
        "id": "a1b2c3d4-...",
        "incident_id": "f5bb8626-...",
        "action": "Created",
        "actor": "Marcus Vance",
        "details": "Incident reported...",
        "timestamp": "2026-07-11T12:00:00Z"
      }
    ],
    "announcements": [ ... ]
  }
  ```

---

## 5. Update Status
- **Endpoint**: `PATCH /api/incidents/{incident_id}/status`
- **Request Body**:
  ```json
  {
    "status": "In Progress",
    "actor": "Marcus Vance"
  }
  ```
- **State Transition Rules**:
  - `Open` -> `Acknowledged` or `Closed`
  - `Acknowledged` -> `In Progress` or `Closed`
  - `In Progress` -> `Resolved` or `Closed`
  - `Resolved` -> `Closed`
  - Any out-of-order transition (e.g. `Closed` -> `Open`) returns a **400 Bad Request**.

---

## 6. Draft Multilingual Announcement
- **Endpoint**: `POST /api/incidents/{incident_id}/announcement`
- **Description**: Triggers translation into English, Spanish, French, and Arabic. Returns translation draft.
- **Response**:
  ```json
  {
    "id": "e8838d22-...",
    "incident_id": "f5bb8626-...",
    "text_en": "Attention: Safety response is active in Zone D...",
    "text_es": "Atención: Respuesta de seguridad activa en Zona D...",
    "text_fr": "Attention: Intervention de sécurité active dans Zone D...",
    "text_ar": "انتباه: استجابة أمنية نشطة في المنطقة د...",
    "is_approved": false
  }
  ```

---

## 7. Approve Announcement
- **Endpoint**: `POST /api/incidents/{incident_id}/announcement/{announcement_id}/approve`
- **Request Body**:
  ```json
  {
    "actor": "Sofia (Manager)"
  }
  ```
- **Response**: Updated announcement record with `is_approved = true`.

---

## 8. Generate Post-Incident Report
- **Endpoint**: `POST /api/incidents/{incident_id}/report`
- **Query Parameters**:
  - `actor` (string, default `System`): Name of supervisor generating the audit report
- **Response**:
  ```json
  {
    "incident_id": "f5bb8626-...",
    "generated_at": "2026-07-11T12:15:00Z",
    "report_markdown": "# FIFA World Cup 2026 - Incident Operations Report\n..."
  }
  ```
