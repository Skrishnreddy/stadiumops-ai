import React from 'react';

interface LayoutProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  userRole: string;
  setUserRole: (role: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentPage,
  setCurrentPage,
  userRole,
  setUserRole,
  children
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'report', label: 'Report Incident', icon: '🚨' },
    { id: 'history', label: 'Incident History', icon: '🗄️' },
    { id: 'announcement', label: 'Announcements', icon: '📢' },
    { id: 'settings', label: 'Settings & SOPs', icon: '⚙️' }
  ];

  return (
    <div className="layout-container">
      {/* Accessibility Skip Link */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Sidebar Navigation */}
      <aside 
        className="glass-panel" 
        style={{
          width: '260px',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--surface-border)',
          borderRadius: '0px'
        }}
        aria-label="Sidebar Navigation"
      >
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '2rem' }} aria-hidden="true">🏟️</span>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              StadiumOps AI
            </h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              FIFA WC 2026 PROTOTYPE
            </span>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none' }}>
            {menuItems.map((item) => {
              const isActive = currentPage === item.id || (item.id === 'history' && currentPage === 'details');
              return (
                <li key={item.id} style={{ marginBottom: '8px' }}>
                  <button
                    onClick={() => setCurrentPage(item.id)}
                    className="btn"
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--card-hover-border)' : 'transparent',
                      color: isActive ? 'white' : 'var(--text-secondary)',
                      padding: '12px 16px',
                      fontSize: '0.95rem'
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span style={{ marginRight: '12px' }} aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Persona Simulator widget */}
        <div 
          className="glass-panel" 
          style={{
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255,255,255,0.02)',
            marginTop: 'auto'
          }}
        >
          <label htmlFor="role-select" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>
            Active Persona:
          </label>
          <select
            id="role-select"
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="form-input"
            style={{
              padding: '6px 10px',
              fontSize: '0.85rem',
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderColor: 'var(--surface-border)'
            }}
          >
            <option value="Sofia (Manager)">Sofia (Operations Manager)</option>
            <option value="Marcus (Responder)">Marcus (Zone Responder)</option>
            <option value="Elena (Auditor)">Elena (Compliance Auditor)</option>
          </select>
        </div>
      </aside>

      {/* Main Panel Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Top Header */}
        <header 
          className="glass-panel" 
          style={{
            height: '70px',
            borderBottom: '1px solid var(--surface-border)',
            borderRadius: '0px',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              Command Center Control Panel
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Live Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="animate-fade-in" style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                backgroundColor: 'var(--status-resolved)',
                borderRadius: '50%',
                boxShadow: '0 0 8px var(--status-resolved)'
              }}></span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>System Active</span>
            </div>
            
            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--surface-border)' }}></div>

            {/* Stadium Details */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Azteca Stadium</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Matchday 14 - Group Stage</div>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main id="main-content" className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};
