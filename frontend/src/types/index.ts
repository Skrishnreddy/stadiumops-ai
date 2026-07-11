export interface Incident {
  id: string;
  title: string;
  description: string;
  location_zone: string;
  location_section: string;
  location_gate: string;
  reporter_name: string;
  status: 'Open' | 'Acknowledged' | 'In Progress' | 'Resolved' | 'Closed';
  category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  confidence: number;
  responsible_team: string;
  immediate_actions: string[];
  reasoning_summary: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  incident_id: string;
  action: string;
  actor: string;
  details: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  incident_id: string;
  text_en: string;
  text_es: string;
  text_fr: string;
  text_ar: string;
  is_approved: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface IncidentDetail {
  incident: Incident;
  audit_logs: AuditLog[];
  announcements: Announcement[];
}

export interface PostIncidentReport {
  incident_id: string;
  generated_at: string;
  report_markdown: string;
}

export interface SOP {
  category: string;
  title: string;
  matched_section: string;
  recommended_steps: string[];
  safety_warning: string;
  source_reference: string;
}
