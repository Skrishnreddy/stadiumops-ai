import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ReportIncident } from './pages/ReportIncident';
import { IncidentDetails } from './pages/IncidentDetails';
import { IncidentHistory } from './pages/IncidentHistory';
import { Settings } from './pages/Settings';
import type { Incident } from './types';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('Sofia (Manager)');
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
    setCurrentPage('details');
  };

  const handleReportSuccess = (newIncident: Incident) => {
    setIncidents(prev => [newIncident, ...prev]);
    // Auto navigate to details of newly filed incident
    setSelectedIncidentId(newIncident.id);
    setCurrentPage('details');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            onSelectIncident={handleSelectIncident}
            incidents={incidents}
            setIncidents={setIncidents}
          />
        );
      case 'report':
        return (
          <ReportIncident 
            onReportSuccess={handleReportSuccess} 
          />
        );
      case 'details':
        return selectedIncidentId ? (
          <IncidentDetails 
            incidentId={selectedIncidentId} 
            userRole={userRole}
            onBack={() => {
              setSelectedIncidentId(null);
              setCurrentPage('dashboard');
            }}
          />
        ) : (
          <Dashboard 
            onSelectIncident={handleSelectIncident}
            incidents={incidents}
            setIncidents={setIncidents}
          />
        );
      case 'history':
        return (
          <IncidentHistory 
            onSelectIncident={handleSelectIncident} 
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return (
          <Dashboard 
            onSelectIncident={handleSelectIncident}
            incidents={incidents}
            setIncidents={setIncidents}
          />
        );
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      setCurrentPage={setCurrentPage} 
      userRole={userRole} 
      setUserRole={setUserRole}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;
