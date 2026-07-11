from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

VALID_STATUSES = ["Open", "Acknowledged", "In Progress", "Resolved", "Closed"]

class IncidentCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=100, description="Brief summary of the incident")
    description: str = Field(..., min_length=10, max_length=2000, description="Full description of what is happening")
    location_zone: str = Field(..., min_length=1, max_length=50, description="Stadium zone (e.g. Zone A)")
    location_section: str = Field(..., min_length=2, max_length=50, description="Stadium section (e.g. Section 102)")
    location_gate: str = Field(..., min_length=2, max_length=50, description="Nearest entry/exit gate (e.g. Gate 4)")
    reporter_name: str = Field(..., min_length=2, max_length=100, description="Name of the reporting staff member")

    @field_validator("title", "description", "location_zone", "location_section", "location_gate", "reporter_name")
    @classmethod
    def sanitize_strings(cls, v: str) -> str:
        # Basic sanitization: strip whitespaces, remove potential HTML tags
        v = v.strip()
        # Prevent prompt injection markers or HTML script tag lookalikes
        if "<script" in v.lower() or "javascript:" in v.lower():
            raise ValueError("Input contains prohibited script tags or keywords")
        return v

class IncidentUpdateStatus(BaseModel):
    status: str = Field(..., description="Target status for transition")
    actor: str = Field(..., min_length=2, max_length=100, description="Name of the person updating the status")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in VALID_STATUSES:
            raise ValueError(f"Status must be one of {VALID_STATUSES}")
        return v

class AuditLogResponse(BaseModel):
    id: str
    incident_id: str
    action: str
    actor: str
    details: str
    timestamp: datetime

    class Config:
        from_attributes = True

class AnnouncementResponse(BaseModel):
    id: str
    incident_id: str
    text_en: str
    text_es: str
    text_fr: str
    text_ar: str
    is_approved: bool
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AnnouncementApprove(BaseModel):
    actor: str = Field(..., min_length=2, max_length=100, description="Manager name approving the announcement")

class IncidentResponse(BaseModel):
    id: str
    title: str
    description: str
    location_zone: str
    location_section: str
    location_gate: str
    reporter_name: str
    status: str
    category: str
    severity: str
    priority: str
    confidence: float
    responsible_team: str
    immediate_actions: List[str]
    reasoning_summary: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class IncidentDetailResponse(BaseModel):
    incident: IncidentResponse
    audit_logs: List[AuditLogResponse]
    announcements: List[AnnouncementResponse]

class PostIncidentReportResponse(BaseModel):
    incident_id: str
    generated_at: datetime
    report_markdown: str

class IncidentAnalyseInput(BaseModel):
    description: str = Field(..., min_length=10, max_length=2000, description="Full description of what is happening")
    location_zone: str = Field(..., min_length=1, max_length=50, description="Stadium zone (e.g. Zone A)")
    location_gate: str = Field(..., min_length=2, max_length=50, description="Nearest entry/exit gate (e.g. Gate 4)")

    @field_validator("description", "location_zone", "location_gate")
    @classmethod
    def sanitize_strings(cls, v: str) -> str:
        v = v.strip()
        if "<script" in v.lower() or "javascript:" in v.lower():
            raise ValueError("Input contains prohibited script tags or keywords")
        return v

class IncidentAnalyseResponse(BaseModel):
    category: str
    severity: str
    priority: str
    confidence: float
    responsible_team: str
    immediate_actions: List[str]
    reasoning_summary: str

