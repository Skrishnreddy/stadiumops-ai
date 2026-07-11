import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Incident, AuditLog, Announcement, SOP } from '../types';
import { Badge } from '../components/UI/Badge';
import { SOPPanel } from '../components/SOPPanel';
import { Timeline } from '../components/Timeline';
import { Modal } from '../components/UI/Modal';

interface IncidentDetailsProps {
  incidentId: string;
  userRole: string;
  onBack: () => void;
}

export const IncidentDetails: React.FC<IncidentDetailsProps> = ({ incidentId, userRole, onBack }) => {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sop, setSop] = useState<SOP | null>(null);

  const [loading, setLoading] = useState(true);
  const [sopLoading, setSopLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const details = await apiService.getIncidentDetails(incidentId);
      setIncident(details.incident);
      setLogs(details.audit_logs);
      setAnnouncements(details.announcements);

      // Load SOP
      setSopLoading(true);
      const sopData = await apiService.getIncidentSop(incidentId);
      setSop(sopData);
    } catch (err: any) {
      setError(err.message || 'Failed to load incident details.');
    } finally {
      setLoading(false);
      setSopLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (targetStatus: string) => {
    if (!incident) return;
    setError(null);
    try {
      const updated = await apiService.updateIncidentStatus(incidentId, targetStatus, userRole);
      setIncident(updated);
      // Reload logs to reflect state audit
      const details = await apiService.getIncidentDetails(incidentId);
      setLogs(details.audit_logs);
    } catch (err: any) {
      setError(err.message || 'Status transition rejected.');
    }
  };

  const handleDraftAnnouncement = async () => {
    setDraftLoading(true);
    setError(null);
    try {
      await apiService.createAnnouncementDraft(incidentId);
      const details = await apiService.getIncidentDetails(incidentId);
      setAnnouncements(details.announcements);
      setLogs(details.audit_logs);
    } catch (err: any) {
      setError(err.message || 'Failed to generate announcement.');
    } finally {
      setDraftLoading(false);
    }
  };

  const handleApproveAnnouncement = async (annId: string) => {
    setApproveLoading(true);
    setError(null);
    try {
      await apiService.approveAnnouncement(incidentId, annId, userRole);
      const details = await apiService.getIncidentDetails(incidentId);
      setAnnouncements(details.announcements);
      setLogs(details.audit_logs);
    } catch (err: any) {
      setError(err.message || 'Approval failed.');
    } finally {
      setApproveLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setReportLoading(true);
    setReportModalOpen(true);
    try {
      const res = await apiService.generatePostIncidentReport(incidentId, userRole);
      setReportMarkdown(res.report_markdown);
      
      // Reload audits
      const details = await apiService.getIncidentDetails(incidentId);
      setLogs(details.audit_logs);
    } catch (err: any) {
      setReportMarkdown('Error generating report: ' + (err.message || 'Unknown error.'));
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <span style={{ fontSize: '2rem', display: 'block', marginBottom: '15px' }} aria-hidden="true">🔄</span>
        Loading operational details...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Incident Not Found</h3>
        <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: '15px' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Determine valid statuses based on state rules
  const nextActions: string[] = [];
  if (incident.status === 'Open') {
    nextActions.push('Acknowledged', 'Closed');
  } else if (incident.status === 'Acknowledged') {
    nextActions.push('In Progress', 'Closed');
  } else if (incident.status === 'In Progress') {
    nextActions.push('Resolved', 'Closed');
  } else if (incident.status === 'Resolved') {
    nextActions.push('Closed');
  }

  const activeAnnouncement = announcements[0];

  return (
    <div className="animate-fade-in">
      {/* Header toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <button onClick={onBack} className="btn btn-secondary" aria-label="Go back to Dashboard">
          ⬅️ Back
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleGenerateReport} 
            className="btn btn-secondary"
            aria-label="Generate Post-Incident Report"
          >
            📝 Compile Post-Incident Report
          </button>
        </div>
      </div>

      {error && (
        <div 
          role="alert" 
          style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.15)', 
            border: '1px solid var(--severity-critical)', 
            color: 'var(--severity-critical)', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '0.9rem'
          }}
        >
          <strong>Operational Error:</strong> {error}
        </div>
      )}

      {/* Main double column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }} className="responsive-container">
        
        {/* Left Column: Metadata & Announcements */}
        <div>
          {/* Metadata Block */}
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>INCIDENT ID: #{incident.id.slice(0, 8)}</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '4px' }}>{incident.title}</h3>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Badge type="severity" value={incident.severity} />
                <Badge type="status" value={incident.status} />
              </div>
            </div>

            <p style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '20px', whiteSpace: 'pre-line' }}>
              {incident.description}
            </p>

            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '15px', 
                padding: '16px', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '8px', 
                border: '1px solid var(--surface-border)',
                marginBottom: '20px'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>STADIUM LOCATION</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  Zone {incident.location_zone} • Section {incident.location_section} • Gate {incident.location_gate}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>REPORTER STAFF</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{incident.reporter_name}</span>
              </div>
            </div>

            {/* AI Reasoning block */}
            <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '16px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>AI CLASSIFICATION CONTEXT</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <strong>Reasoning Summary:</strong> {incident.reasoning_summary}
              </p>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Confidence: <strong>{Math.round(incident.confidence * 100)}%</strong></span>
                <span>Priority Index: <strong>{incident.priority}</strong></span>
                <span>Response Team: <strong style={{ color: 'var(--primary)' }}>{incident.responsible_team}</strong></span>
              </div>
            </div>

            {/* Status transitions control bar */}
            {nextActions.length > 0 && (
              <div style={{ borderTop: '1px solid var(--surface-border)', marginTop: '20px', paddingTop: '20px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '12px' }}>
                  OPERATIONAL LIFECYCLE ACTION:
                </span>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {nextActions.map((act) => (
                    <button
                      key={act}
                      onClick={() => handleStatusChange(act)}
                      className={`btn ${act === 'Closed' ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ fontSize: '0.85rem', padding: '8px 14px' }}
                    >
                      Move to "{act}"
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Multilingual Announcement dispatch panel */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📢</span> Public Warning Announcements
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Translate the security response instructions into the standard FIFA World Cup 2026 operational languages. Draft drafts require Manager review and approval prior to broadcast activation.
            </p>

            {!activeAnnouncement ? (
              <button
                onClick={handleDraftAnnouncement}
                className="btn btn-secondary"
                disabled={draftLoading}
                style={{ width: '100%' }}
              >
                {draftLoading ? 'Generating AI Translations...' : '⚡ Draft Multilingual Announcement'}
              </button>
            ) : (
              <div>
                {/* Visual Languages blocks */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px', border: '1px solid var(--surface-border)' }}>
                    <strong style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>ENGLISH (EN)</strong>
                    <p style={{ fontSize: '0.85rem' }}>{activeAnnouncement.text_en}</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px', border: '1px solid var(--surface-border)' }}>
                    <strong style={{ fontSize: '0.75rem', color: 'var(--secondary)', display: 'block', marginBottom: '4px' }}>SPANISH (ES)</strong>
                    <p style={{ fontSize: '0.85rem' }}>{activeAnnouncement.text_es}</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px', border: '1px solid var(--surface-border)' }}>
                    <strong style={{ fontSize: '0.75rem', color: 'var(--status-open)', display: 'block', marginBottom: '4px' }}>FRENCH (FR)</strong>
                    <p style={{ fontSize: '0.85rem' }}>{activeAnnouncement.text_fr}</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px', border: '1px solid var(--surface-border)' }}>
                    <strong style={{ fontSize: '0.75rem', color: 'var(--severity-medium)', display: 'block', marginBottom: '4px' }}>ARABIC (AR)</strong>
                    <p style={{ fontSize: '0.85rem', direction: 'rtl', textAlign: 'right' }}>{activeAnnouncement.text_ar}</p>
                  </div>
                </div>

                {activeAnnouncement.is_approved ? (
                  <div 
                    style={{ 
                      backgroundColor: 'rgba(52, 211, 153, 0.1)', 
                      border: '1px solid var(--status-resolved)', 
                      borderRadius: '8px', 
                      padding: '12px', 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', color: 'var(--status-resolved)', fontWeight: 600 }}>
                      ✓ Broadcast Approved & Dispatched
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      By: {activeAnnouncement.approved_by}
                    </span>
                  </div>
                ) : (
                  <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      ⚠️ Draft pending sign-off
                    </span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={handleDraftAnnouncement}
                        className="btn btn-secondary" 
                        disabled={draftLoading}
                        style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                      >
                        Re-draft
                      </button>
                      <button
                        onClick={() => handleApproveAnnouncement(activeAnnouncement.id)}
                        className="btn btn-primary"
                        disabled={approveLoading}
                        style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                      >
                        {approveLoading ? 'Processing...' : 'Approve and Broadcast'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Matched SOP & Audit Logs */}
        <div>
          {/* SOP recommendations */}
          <div style={{ marginBottom: '30px' }}>
            <SOPPanel sop={sop} loading={sopLoading} />
          </div>

          {/* Timeline Audit Logs */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <Timeline logs={logs} />
          </div>
        </div>

      </div>

      {/* Post-Incident Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Operations Post-Incident Report"
      >
        {reportLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '10px' }} aria-hidden="true">🔄</span>
            Generating document structure...
          </div>
        ) : (
          <div>
            <textarea
              readOnly
              value={reportMarkdown}
              style={{
                width: '100%',
                height: '350px',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'var(--text-primary)',
                padding: '12px',
                border: '1px solid var(--surface-border)',
                borderRadius: '8px',
                marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(reportMarkdown);
                  alert('Copied report to clipboard!');
                }}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                📋 Copy Markdown
              </button>
              <button 
                onClick={() => setReportModalOpen(false)}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
