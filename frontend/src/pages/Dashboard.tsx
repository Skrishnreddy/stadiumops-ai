import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Incident } from '../types';
import { DashboardCards } from '../components/DashboardCards';

interface DashboardProps {
  onSelectIncident: (id: string) => void;
  incidents: Incident[];
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectIncident, incidents, setIncidents }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.listIncidents();
      setIncidents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch incidents. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  }, [setIncidents]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Live Operations Board</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time incident response management for FIFA World Cup 2026 Azteca Stadium.
          </p>
        </div>
        <button 
          onClick={fetchIncidents} 
          className="btn btn-secondary" 
          disabled={loading}
          aria-label="Refresh operational data"
        >
          {loading ? 'Refreshing...' : '🔄 Refresh Board'}
        </button>
      </div>

      {error && (
        <div 
          role="alert" 
          style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.15)', 
            border: '1px solid var(--severity-critical)', 
            color: 'var(--severity-critical)', 
            padding: '16px', 
            borderRadius: '12px', 
            marginBottom: '24px' 
          }}
        >
          <strong>Connection Error:</strong> {error}
        </div>
      )}

      {loading && incidents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <span style={{ fontSize: '2rem', display: 'block', marginBottom: '15px' }} className="animate-fade-in" aria-hidden="true">🔄</span>
          Loading stadium telemetry...
        </div>
      ) : (
        <DashboardCards incidents={incidents} onSelectIncident={onSelectIncident} />
      )}
    </div>
  );
};
