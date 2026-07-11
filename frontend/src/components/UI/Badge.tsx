import React from 'react';

interface BadgeProps {
  type: 'status' | 'severity';
  value: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, value }) => {
  const getStyles = () => {
    if (type === 'severity') {
      switch (value) {
        case 'Critical':
          return { background: 'var(--severity-critical)', color: 'white' };
        case 'High':
          return { background: 'var(--severity-high)', color: 'white' };
        case 'Medium':
          return { background: 'var(--severity-medium)', color: '#070a13' };
        case 'Low':
        default:
          return { background: 'var(--severity-low)', color: '#070a13' };
      }
    } else {
      switch (value) {
        case 'Open':
          return { background: 'rgba(34, 211, 238, 0.15)', border: '1px solid var(--status-open)', color: 'var(--status-open)' };
        case 'Acknowledged':
          return { background: 'rgba(59, 130, 246, 0.15)', border: '1px solid var(--status-ack)', color: 'var(--status-ack)' };
        case 'In Progress':
          return { background: 'rgba(167, 139, 250, 0.15)', border: '1px solid var(--status-progress)', color: 'var(--status-progress)' };
        case 'Resolved':
          return { background: 'rgba(52, 211, 153, 0.15)', border: '1px solid var(--status-resolved)', color: 'var(--status-resolved)' };
        case 'Closed':
        default:
          return { background: 'rgba(156, 163, 175, 0.15)', border: '1px solid var(--status-closed)', color: 'var(--status-closed)' };
      }
    }
  };

  const style = getStyles();

  return (
    <span 
      className="badge" 
      style={style}
      aria-label={`${type}: ${value}`}
    >
      <span aria-hidden="true" style={{
        width: '6px', 
        height: '6px', 
        borderRadius: '50%', 
        backgroundColor: type === 'severity' ? 'rgba(255,255,255,0.8)' : style.color
      }}></span>
      {value}
    </span>
  );
};
