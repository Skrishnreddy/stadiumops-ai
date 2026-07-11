import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.exceptions import (
    IncidentNotFoundException,
    InvalidStatusTransitionException,
    StadiumOpsException
)
from backend.app.models.database import Incident, AuditLog, Announcement
from backend.app.schemas.incidents import (
    IncidentCreate,
    IncidentResponse,
    IncidentUpdateStatus,
    IncidentDetailResponse,
    AnnouncementResponse,
    AnnouncementApprove,
    PostIncidentReportResponse,
    AuditLogResponse
)
from backend.app.services.gemini import GeminiService
from backend.app.services.sop import SOPService

router = APIRouter()

def to_incident_response(inc: Incident) -> IncidentResponse:
    try:
        actions = json.loads(inc.immediate_actions)
    except Exception:
        actions = []
    return IncidentResponse(
        id=inc.id,
        title=inc.title,
        description=inc.description,
        location_zone=inc.location_zone,
        location_section=inc.location_section,
        location_gate=inc.location_gate,
        reporter_name=inc.reporter_name,
        status=inc.status,
        category=inc.category,
        severity=inc.severity,
        priority=inc.priority,
        confidence=inc.confidence,
        responsible_team=inc.responsible_team,
        immediate_actions=actions,
        reasoning_summary=inc.reasoning_summary,
        created_at=inc.created_at,
        updated_at=inc.updated_at
    )

# Helper status transition check
def validate_transition(current: str, target: str) -> None:
    if current == target:
        return

    # Valid transitions mapping
    valid_transitions = {
        "Open": ["Acknowledged", "Closed"],
        "Acknowledged": ["In Progress", "Closed"],
        "In Progress": ["Resolved", "Closed"],
        "Resolved": ["Closed"],
        "Closed": []  # Terminal state
    }
    
    allowed = valid_transitions.get(current, [])
    if target not in allowed:
        raise InvalidStatusTransitionException(from_status=current, to_status=target)

@router.post("/incidents", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    """
    Submits an incident, runs AI classification or rule-based fallback, retrieves SOP,
    saves the incident, logs the audit entry, and returns.
    """
    # 1. Run AI classification
    class_result = GeminiService.classify_incident(
        description=payload.description,
        zone=payload.location_zone,
        gate=payload.location_gate
    )

    # 2. Retrieve SOP for safety details
    sop_result = SOPService.retrieve_sop(
        category=class_result["category"],
        text=payload.description
    )

    # 3. Create incident model
    new_incident = Incident(
        title=payload.title,
        description=payload.description,
        location_zone=payload.location_zone,
        location_section=payload.location_section,
        location_gate=payload.location_gate,
        reporter_name=payload.reporter_name,
        status="Open",
        category=class_result["category"],
        severity=class_result["severity"],
        priority=class_result["priority"],
        confidence=class_result["confidence"],
        responsible_team=class_result["responsible_team"],
        immediate_actions=json.dumps(class_result["immediate_actions"]),
        reasoning_summary=class_result["reasoning_summary"]
    )
    
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    # 4. Log the audit entry
    audit_entry = AuditLog(
        incident_id=new_incident.id,
        action="Created",
        actor=payload.reporter_name,
        details=f"Incident reported. AI Classified as '{new_incident.category}' (Severity: {new_incident.severity}, Priority: {new_incident.priority}, Confidence: {new_incident.confidence:.2f}). SOP Matched: '{sop_result['title']}'."
    )
    db.add(audit_entry)
    db.commit()

    return to_incident_response(new_incident)


@router.get("/incidents", response_model=List[IncidentResponse])
def list_incidents(
    status_filter: Optional[str] = Query(None, alias="status"),
    severity_filter: Optional[str] = Query(None, alias="severity"),
    zone_filter: Optional[str] = Query(None, alias="zone"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Lists incidents with pagination and filters.
    """
    query = db.query(Incident)
    
    if status_filter:
        query = query.filter(Incident.status == status_filter)
    if severity_filter:
        query = query.filter(Incident.severity == severity_filter)
    if zone_filter:
        query = query.filter(Incident.location_zone == zone_filter)
        
    incidents = query.order_by(Incident.created_at.desc()).offset(skip).limit(limit).all()
    return [to_incident_response(inc) for inc in incidents]


@router.get("/incidents/{incident_id}", response_model=IncidentDetailResponse)
def get_incident_details(incident_id: str, db: Session = Depends(get_db)):
    """
    Returns full incident details, audits, and announcements.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise IncidentNotFoundException(incident_id)

    audits = db.query(AuditLog).filter(AuditLog.incident_id == incident_id).order_by(AuditLog.timestamp.asc()).all()
    announcements = db.query(Announcement).filter(Announcement.incident_id == incident_id).order_by(Announcement.created_at.desc()).all()

    return {
        "incident": to_incident_response(incident),
        "audit_logs": audits,
        "announcements": announcements
    }


@router.patch("/incidents/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(incident_id: str, payload: IncidentUpdateStatus, db: Session = Depends(get_db)):
    """
    Validates status transition, updates DB, logs audit event, and returns.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise IncidentNotFoundException(incident_id)

    old_status = incident.status
    target_status = payload.status

    # Validate transition path
    validate_transition(old_status, target_status)

    incident.status = target_status
    db.commit()
    db.refresh(incident)

    # Log audit entry
    audit_entry = AuditLog(
        incident_id=incident.id,
        action="StatusChanged",
        actor=payload.actor,
        details=f"Status changed from '{old_status}' to '{target_status}' by {payload.actor}."
    )
    db.add(audit_entry)
    db.commit()

    return to_incident_response(incident)


@router.post("/incidents/{incident_id}/announcement", response_model=AnnouncementResponse)
def create_announcement_draft(incident_id: str, db: Session = Depends(get_db)):
    """
    Drafts a multilingual announcement for the incident. Requires manual approval.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise IncidentNotFoundException(incident_id)

    location = f"Zone {incident.location_zone}, Section {incident.location_section}, near Gate {incident.location_gate}"
    
    # Generate draft translation languages
    draft_dict = GeminiService.generate_announcement(
        incident_title=incident.title,
        category=incident.category,
        location=location,
        severity=incident.severity
    )

    new_announcement = Announcement(
        incident_id=incident.id,
        text_en=draft_dict["text_en"],
        text_es=draft_dict["text_es"],
        text_fr=draft_dict["text_fr"],
        text_ar=draft_dict["text_ar"],
        is_approved=False
    )
    
    db.add(new_announcement)
    db.commit()
    db.refresh(new_announcement)

    # Log audit trail
    audit_entry = AuditLog(
        incident_id=incident.id,
        action="AnnouncementDrafted",
        actor="StadiumOps System",
        details=f"AI drafted multilingual announcements (ID: {new_announcement.id}). Pending Manager sign-off."
    )
    db.add(audit_entry)
    db.commit()

    return new_announcement


@router.post("/incidents/{incident_id}/announcement/{announcement_id}/approve", response_model=AnnouncementResponse)
def approve_announcement(incident_id: str, announcement_id: str, payload: AnnouncementApprove, db: Session = Depends(get_db)):
    """
    Approves the drafted announcement. Logs the event in the audit timeline.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise IncidentNotFoundException(incident_id)

    announcement = db.query(Announcement).filter(
        Announcement.id == announcement_id,
        Announcement.incident_id == incident_id
    ).first()
    if not announcement:
        raise StadiumOpsException("Announcement not found for this incident", status_code=404)

    announcement.is_approved = True
    announcement.approved_by = payload.actor
    announcement.approved_at = datetime.datetime.utcnow()
    
    db.commit()
    db.refresh(announcement)

    # Log audit trail
    audit_entry = AuditLog(
        incident_id=incident.id,
        action="AnnouncementApproved",
        actor=payload.actor,
        details=f"Multilingual announcement (ID: {announcement.id}) approved and broadcasted by {payload.actor}."
    )
    db.add(audit_entry)
    db.commit()

    return announcement


@router.post("/incidents/{incident_id}/report", response_model=PostIncidentReportResponse)
def generate_post_incident_report(incident_id: str, actor: str = Query("System"), db: Session = Depends(get_db)):
    """
    Compiles database metadata and audit timelines into a structured Markdown Post-Incident Report.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise IncidentNotFoundException(incident_id)

    audits = db.query(AuditLog).filter(AuditLog.incident_id == incident_id).order_by(AuditLog.timestamp.asc()).all()
    sop_details = SOPService.retrieve_sop(incident.category, incident.description)

    # Build report layout
    timeline_md = ""
    for log in audits:
        timestamp_str = log.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC")
        timeline_md += f"- **[{timestamp_str}]** *{log.action}* (by {log.actor}): {log.details}\n"

    sop_steps_md = ""
    for step in sop_details.get("recommended_steps", []):
        sop_steps_md += f"- [ ] {step}\n"

    actions_taken_md = ""
    actions_list = json.loads(incident.immediate_actions)
    for act in actions_list:
        actions_taken_md += f"- [x] {act}\n"

    report_markdown = f"""# FIFA World Cup 2026 - Incident Operations Report

## 1. Incident Executive Summary
- **Incident ID**: `{incident.id}`
- **Title**: {incident.title}
- **Category**: {incident.category}
- **Severity**: {incident.severity}
- **Priority**: {incident.priority}
- **Reporter Staff**: {incident.reporter_name}
- **Created At**: {incident.created_at.strftime("%Y-%m-%d %H:%M:%S UTC")}
- **Current Status**: {incident.status}

### Description
{incident.description}

---

## 2. Location Analysis
- **Zone**: {incident.location_zone}
- **Section**: {incident.location_section}
- **Gate Reference**: Gate {incident.location_gate}

---

## 3. Operations Response & Recommended SOP
- **Assigned Response Team**: {incident.responsible_team}
- **Safety SOP Standard**: {sop_details.get("title", "N/A")}
- **Matched Guidelines Section**: {sop_details.get("matched_section", "N/A")}

### Recommended Procedural Steps
{sop_steps_md}
### Immediate Actions Executed
{actions_taken_md}
### Critical SOP Safety Warning
> [!WARNING]
> {sop_details.get("safety_warning", "No specific safety warning provided.")}

- **Standard Authority Reference**: {sop_details.get("source_reference", "N/A")}

---

## 4. Incident Response Audit Timeline
The following log represents the verified operational timeline recorded in the StadiumOps database:

{timeline_md}
---

## 5. Security & Post-Incident Review
- **AI Classification Confidence**: {incident.confidence * 100:.1f}%
- **Classification Reasoning Summary**: {incident.reasoning_summary}
- **Report Compiled By**: {actor}
- **Generation Timestamp**: {datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")}

*Note: This report is a verified log and serves as the official tournament Operations Review document.*
"""

    # Log report generation in audit trail
    audit_entry = AuditLog(
        incident_id=incident.id,
        action="PostIncidentReportGenerated",
        actor=actor,
        details=f"Post-Incident Report generated by {actor}."
    )
    db.add(audit_entry)
    db.commit()

    return {
        "incident_id": incident.id,
        "generated_at": datetime.datetime.utcnow(),
        "report_markdown": report_markdown.strip()
    }


@router.get("/incidents/{incident_id}/sop")
def get_incident_sop(incident_id: str, db: Session = Depends(get_db)):
    """
    Returns the retrieved SOP details for the incident.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise IncidentNotFoundException(incident_id)

    sop_details = SOPService.retrieve_sop(incident.category, incident.description)
    return sop_details
