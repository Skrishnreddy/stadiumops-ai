import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Incident } from '../types';
import { Badge } from '../components/UI/Badge';

interface IncidentHistoryProps {
  onSelectIncident: (id: string) => void;
}

export const IncidentHistory: React.FC<IncidentHistoryProps> = ({ onSelectIncident }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.listIncidents({
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
        zone: zoneFilter || undefined
      });
      setIncidents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch incident log.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, severityFilter, zoneFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Incident Archive</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Historical record and operational audit log of all reported tournament incidents.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '16px 20px', 
          marginBottom: '30px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '15px'
        }}
      >
        <div>
          <label htmlFor="filter-status" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
            FILTER BY STATUS
          </label>
          <select 
            id="filter-status" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="form-input"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-severity" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
            FILTER BY SEVERITY
          </label>
          <select 
            id="filter-severity" 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)} 
            className="form-input"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <option value="">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-zone" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
            FILTER BY ZONE
          </label>
          <select 
            id="filter-zone" 
            value={zoneFilter} 
            onChange={(e) => setZoneFilter(e.target.value)} 
            className="form-input"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <option value="">All Zones</option>
            <option value="A">Zone A</option>
            <option value="B">Zone B</option>
            <option value="C">Zone C</option>
            <option value="D">Zone D</option>
          </select>
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
            marginBottom: '20px'
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '10px' }} aria-hidden="true">🔄</span>
          Filtering historical logs...
        </div>
      ) : incidents.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }} aria-hidden="true">🗄️</span>
          No archived incidents found matching selection.
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }} aria-label="Incident History List">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.01)' }}>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>ID</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>Title</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>Category</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>Location</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>Severity</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr 
                  key={inc.id}
                  onClick={() => onSelectIncident(inc.id)}
                  style={{ 
                    borderBottom: '1px solid var(--surface-border)', 
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectIncident(inc.id); }}
                  aria-label={`Incident #${inc.id.slice(0,8)}: ${inc.title}`}
                >
                  <td style={{ padding: '16px 20px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    #{inc.id.slice(0, 8)}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 600 }}>{inc.title}</td>
                  <td style={{ padding: '16px 20px' }}>{inc.category}</td>
                  <td style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Zone {inc.location_zone} • Gate {inc.location_gate}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <Badge type="severity" value={inc.severity} />
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <Badge type="status" value={inc.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
