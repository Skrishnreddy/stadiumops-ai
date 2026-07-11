import React, { useState, useEffect } from 'react';
import type { SOP } from '../types';

interface SOPPanelProps {
  sop: SOP | null;
  loading: boolean;
}

export const SOPPanel: React.FC<SOPPanelProps> = ({ sop, loading }) => {
  const [checkedSteps, setCheckedSteps] = useState<{ [key: number]: boolean }>({});

  // Reset check states when SOP changes
  useEffect(() => {
    setCheckedSteps({});
  }, [sop]);

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
        <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '10px' }} aria-hidden="true">🔄</span>
        Retrieving matched SOP guidelines...
      </div>
    );
  }

  if (!sop) {
    return (
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No SOP active. Select or report an incident to view operations guidelines.
      </div>
    );
  }

  const toggleStep = (idx: number) => {
    setCheckedSteps(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', borderLeft: '3px solid var(--primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active Safety Protocol
          </span>
          <h3 style={{ fontSize: '1.2rem', marginTop: '4px' }}>{sop.title}</h3>
        </div>
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        <strong>Matched Guideline:</strong> {sop.matched_section}
      </div>

      {/* Safety Warning Callout */}
      {sop.safety_warning && (
        <div 
          style={{ 
            backgroundColor: 'rgba(245, 158, 11, 0.1)', 
            border: '1px solid var(--severity-medium)', 
            borderRadius: '8px', 
            padding: '16px', 
            marginBottom: '24px',
            color: 'var(--text-primary)'
          }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.1rem' }} aria-hidden="true">⚠️</span>
            <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--severity-medium)' }}>Critical Safety Warning</strong>
          </div>
          <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{sop.safety_warning}</p>
        </div>
      )}

      {/* Recommended steps checklist */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', fontWeight: 600 }}>Action Checklist:</h4>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sop.recommended_steps.map((step, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <input
                id={`sop-step-${idx}`}
                type="checkbox"
                checked={!!checkedSteps[idx]}
                onChange={() => toggleStep(idx)}
                style={{ 
                  marginTop: '4px', 
                  width: '16px', 
                  height: '16px', 
                  cursor: 'pointer',
                  accentColor: 'var(--primary)'
                }}
              />
              <label 
                htmlFor={`sop-step-${idx}`}
                style={{ 
                  fontSize: '0.9rem', 
                  lineHeight: '1.4', 
                  color: checkedSteps[idx] ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: checkedSteps[idx] ? 'line-through' : 'none',
                  cursor: 'pointer'
                }}
              >
                {step}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--surface-border)', paddingTop: '12px' }}>
        <strong>Reference Authority:</strong> {sop.source_reference}
      </div>
    </div>
  );
};
