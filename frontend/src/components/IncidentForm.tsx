import React, { useState } from 'react';
import { apiService } from '../services/api';
import type { Incident } from '../types';

interface IncidentFormProps {
  onSubmitSuccess: (incident: Incident) => void;
}

export const IncidentForm: React.FC<IncidentFormProps> = ({ onSubmitSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [zone, setZone] = useState('A');
  const [section, setSection] = useState('');
  const [gate, setGate] = useState('Gate 4');
  const [reporterName, setReporterName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters.');
      return;
    }
    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters.');
      return;
    }
    if (section.trim().length < 2) {
      setError('Section reference is required.');
      return;
    }
    if (reporterName.trim().length < 2) {
      setError('Reporter name is required.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.createIncident({
        title,
        description,
        location_zone: zone,
        location_section: section,
        location_gate: gate,
        reporter_name: reporterName
      });
      
      // Success
      setTitle('');
      setDescription('');
      setSection('');
      setReporterName('');
      
      onSubmitSuccess(response);
    } catch (err: any) {
      setError(err.message || 'Failed to submit incident. Please check server logs.');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoScenario = () => {
    setTitle('Gate 4 Crowd Compress');
    setDescription('A crowd is increasing rapidly near Gate 4. Two people have fallen and fans are pushing each other.');
    setZone('B');
    setSection('Lower Tier Gate 4 Corridor');
    setGate('Gate 4');
    setReporterName('Marcus Vance (Safety Steward)');
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '30px' }} aria-labelledby="form-title">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 id="form-title" style={{ fontSize: '1.25rem' }}>Report New Incident</h3>
        <button 
          type="button" 
          onClick={loadDemoScenario} 
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
        >
          ⚡ Load Demo Scenario
        </button>
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
          <strong>Submission Error:</strong> {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="title" className="form-label">Incident Summary / Title *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-input"
          placeholder="e.g. Broken turnstile causing delay"
          required
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">Full Incident Description *</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-input"
          style={{ height: '120px', resize: 'vertical' }}
          placeholder="Please describe what is happening in detail. The AI engine will scan this text to load appropriate safety SOPs."
          required
          maxLength={2000}
        />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
          {description.length} / 2000 characters
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }} className="responsive-container">
        <div className="form-group">
          <label htmlFor="zone" className="form-label">Stadium Zone *</label>
          <select id="zone" value={zone} onChange={(e) => setZone(e.target.value)} className="form-input">
            <option value="A">Zone A (North)</option>
            <option value="B">Zone B (East)</option>
            <option value="C">Zone C (South)</option>
            <option value="D">Zone D (West)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="section" className="form-label">Section Reference *</label>
          <input
            id="section"
            type="text"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="form-input"
            placeholder="e.g. Stand 104 Row M"
            required
            maxLength={50}
          />
        </div>

        <div className="form-group">
          <label htmlFor="gate" className="form-label">Nearest Gate *</label>
          <select id="gate" value={gate} onChange={(e) => setGate(e.target.value)} className="form-input">
            {Array.from({ length: 12 }, (_, i) => `Gate ${i + 1}`).map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '30px' }}>
        <label htmlFor="reporter" className="form-label">Reporting Staff Member *</label>
        <input
          id="reporter"
          type="text"
          value={reporterName}
          onChange={(e) => setReporterName(e.target.value)}
          className="form-input"
          placeholder="e.g. Officer John Doe"
          required
          maxLength={100}
        />
      </div>

      <button 
        type="submit" 
        className="btn btn-primary" 
        style={{ width: '100%', padding: '14px' }}
        disabled={loading}
      >
        {loading ? 'Analyzing with StadiumOps AI...' : 'Submit Incident & Trigger AI Dispatch'}
      </button>
    </form>
  );
};
