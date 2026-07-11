import React from 'react';
import type { Incident } from '../types';
import { Badge } from './UI/Badge';

interface DashboardCardsProps {
  incidents: Incident[];
  onSelectIncident: (id: string) => void;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ incidents, onSelectIncident }) => {
  // Compute metrics
  const openCount = incidents.filter(i => i.status === 'Open').length;
  const inProgressCount = incidents.filter(i => i.status === 'In Progress').length;
  const resolvedCount = incidents.filter(i => i.status === 'Resolved').length;
  const criticalCount = incidents.filter(i => i.severity === 'Critical' && i.status !== 'Closed').length;

  const totalActive = incidents.filter(i => i.status !== 'Closed').length;

  // Simulated Zone Conditions
  const zones = [
    { name: 'Zone A (North Bow)', status: 'Optimal', load: '32%', color: 'var(--status-resolved)' },
    { name: 'Zone B (East Bow)', status: 'Elevated Crowds', load: '84%', color: 'var(--severity-medium)' },
    { name: 'Zone C (South Bow)', status: 'Optimal', load: '41%', color: 'var(--status-resolved)' },
    { name: 'Zone D (West Bow)', status: 'Gate Delay', load: '67%', color: 'var(--severity-high)' }
  ];

  // Group by category for visual graph representation
  const categoryCounts: { [key: string]: number } = {};
  incidents.forEach(inc => {
    categoryCounts[inc.category] = (categoryCounts[inc.category] || 0) + 1;
  });

  const topRecent = incidents.slice(0, 4);

  return (
    <div>
      {/* 4 Stats Cards */}
      <div className="dashboard-grid">
        <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', fontSize: '4.5rem', opacity: 0.05 }} aria-hidden="true">🚨</div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Active Incidents</span>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px' }}>{totalActive}</h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {openCount} Open, {inProgressCount} In Progress
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden', borderLeft: '3px solid var(--severity-critical)' }}>
          <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', fontSize: '4.5rem', opacity: 0.05 }} aria-hidden="true">⚠️</div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Critical Issues</span>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px', color: 'var(--severity-critical)' }}>{criticalCount}</h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Active threats requiring dispatch</div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', fontSize: '4.5rem', opacity: 0.05 }} aria-hidden="true">⏱️</div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Avg Resolution Time</span>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px' }}>14.2m</h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Meets FIFA target window (&lt; 15m)</div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', fontSize: '4.5rem', opacity: 0.05 }} aria-hidden="true">✅</div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Resolved Incidents</span>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px', color: 'var(--status-resolved)' }}>{resolvedCount}</h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Shift-wide completed audits</div>
        </div>
      </div>

      {/* Grid: Zone Conditions and Recent list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', flexWrap: 'wrap' }} className="responsive-container">
        
        {/* Stadium Zone Status Dashboard */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📍</span> Stadium Zone Conditions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {zones.map((zone, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--surface-border)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{zone.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Load Factor: {zone.load}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    backgroundColor: zone.color,
                    borderRadius: '50%'
                  }}></span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{zone.status}</span>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '1.2rem', marginTop: '30px', marginBottom: '15px' }}>🚨 Distribution by Category</h3>
          {incidents.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No logs reported.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const percentage = Math.round((count / incidents.length) * 100);
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <span>{cat}</span>
                      <span>{count} ({percentage}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Incidents Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📋</span> Recent Incident Feed
          </h3>
          {topRecent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }} aria-hidden="true">🍃</span>
              No incidents reported recently. Clean stadium status.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topRecent.map(inc => (
                <div 
                  key={inc.id}
                  onClick={() => onSelectIncident(inc.id)}
                  className="interactive-card"
                  style={{ padding: '14px' }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectIncident(inc.id); }}
                  aria-label={`View details of incident: ${inc.title}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{inc.title}</h4>
                    <Badge type="severity" value={inc.severity} />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: '12px' }}>
                    {inc.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>📍 Gate {inc.location_gate} • Zone {inc.location_zone}</span>
                    <Badge type="status" value={inc.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
