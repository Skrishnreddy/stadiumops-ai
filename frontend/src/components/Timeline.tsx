import React from 'react';
import type { AuditLog } from '../types';

interface TimelineProps {
  logs: AuditLog[];
}

export const Timeline: React.FC<TimelineProps> = ({ logs }) => {
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC';
    } catch {
      return isoString;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Created':
        return 'var(--status-open)';
      case 'StatusChanged':
        return 'var(--status-progress)';
      case 'AnnouncementDrafted':
      case 'AnnouncementApproved':
        return 'var(--status-ack)';
      case 'PostIncidentReportGenerated':
        return 'var(--status-resolved)';
      default:
        return 'var(--text-muted)';
    }
  };

  return (
    <div style={{ padding: '10px 0' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🕒</span> Immutable Audit Trail
      </h3>
      {logs.length === 0 ? (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No audit events logged.</div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid var(--surface-border)' }}>
          {logs.map((log) => (
            <div 
              key={log.id} 
              style={{ 
                position: 'relative', 
                marginBottom: '20px',
                animation: 'fadeIn 0.3s ease-out'
              }}
            >
              {/* Timeline Indicator Dot */}
              <span style={{
                position: 'absolute',
                left: '-31px',
                top: '4px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: getActionColor(log.action),
                border: '3px solid var(--bg-color)',
                boxShadow: `0 0 8px ${getActionColor(log.action)}`
              }} aria-hidden="true"></span>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {formatTime(log.timestamp)}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  By: {log.actor}
                </span>
              </div>
              <div 
                style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--surface-border)', 
                  borderRadius: '6px', 
                  padding: '10px 14px',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ fontWeight: 600, color: getActionColor(log.action), marginBottom: '2px', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  {log.action}
                </div>
                <div style={{ color: 'var(--text-primary)' }}>{log.details}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
