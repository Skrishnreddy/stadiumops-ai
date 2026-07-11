import datetime
import uuid
from sqlalchemy import Column, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    location_zone = Column(String(50), nullable=False)
    location_section = Column(String(50), nullable=False)
    location_gate = Column(String(50), nullable=False)
    reporter_name = Column(String(100), nullable=False)
    status = Column(String(20), default="Open", nullable=False)
    
    # Classification results
    category = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    priority = Column(String(20), nullable=False)
    confidence = Column(Float, default=1.0, nullable=False)
    responsible_team = Column(String(255), nullable=False)
    immediate_actions = Column(Text, nullable=False)  # JSON-serialized array of strings
    reasoning_summary = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    audit_logs = relationship("AuditLog", back_populates="incident", cascade="all, delete-orphan")
    announcements = relationship("Announcement", back_populates="incident", cascade="all, delete-orphan")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    incident_id = Column(String(36), ForeignKey("incidents.id"), nullable=False)
    action = Column(String(100), nullable=False)
    actor = Column(String(100), nullable=False)
    details = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    incident = relationship("Incident", back_populates="audit_logs")


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    incident_id = Column(String(36), ForeignKey("incidents.id"), nullable=False)
    text_en = Column(Text, nullable=False)
    text_es = Column(Text, nullable=False)
    text_fr = Column(Text, nullable=False)
    text_ar = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=False, nullable=False)
    approved_by = Column(String(100), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    incident = relationship("Incident", back_populates="announcements")
