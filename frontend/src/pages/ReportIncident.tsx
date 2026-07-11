import React from 'react';
import { IncidentForm } from '../components/IncidentForm';
import type { Incident } from '../types';

interface ReportIncidentProps {
  onReportSuccess: (incident: Incident) => void;
}

export const ReportIncident: React.FC<ReportIncidentProps> = ({ onReportSuccess }) => {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Dispatch Incident Log</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          File a stadium incident report. StadiumOps AI will process the text, categorize the issue, assign severity, and return a matching safety protocol.
        </p>
      </div>

      <IncidentForm onSubmitSuccess={onReportSuccess} />
    </div>
  );
};
