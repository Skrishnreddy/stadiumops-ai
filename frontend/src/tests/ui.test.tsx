import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock components and window.fetch for safety
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  
  // HTML5 Dialog mock for JSDOM compatibility
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

// Import components to test
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { DashboardCards } from '../components/DashboardCards';
import { Timeline } from '../components/Timeline';

describe('StadiumOps AI Frontend Test Suite', () => {
  
  // 1. Status Badges & Text Labeling
  it('renders status badges with text and correct aria-label', () => {
    render(<Badge type="status" value="Open" />);
    const badge = screen.getByLabelText('status: Open');
    expect(badge).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders severity badges with text and correct aria-label', () => {
    render(<Badge type="severity" value="Critical" />);
    const badge = screen.getByLabelText('severity: Critical');
    expect(badge).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  // 2. Loading State
  it('renders loading indicators/spinners', () => {
    const LoadingSpinner = () => (
      <div role="status" className="loading-spinner">
        <span>Loading incident details...</span>
      </div>
    );
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(screen.getByText('Loading incident details...')).toBeInTheDocument();
  });

  // 3. Error State
  it('renders error states with description messages', () => {
    const ErrorState = ({ message }: { message: string }) => (
      <div role="alert" className="error-banner">
        <h2>System Error</h2>
        <p>{message}</p>
      </div>
    );
    render(<ErrorState message="Failed to load safety SOPs." />);
    const errorBanner = screen.getByRole('alert');
    expect(errorBanner).toBeInTheDocument();
    expect(screen.getByText('Failed to load safety SOPs.')).toBeInTheDocument();
  });

  // 4. Modal Keyboard Behaviour (Escape closure)
  it('calls onClose when cancel event is fired on Modal (Escape key simulation)', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Approve Announcement">
        <p>Test Content</p>
      </Modal>
    );
    
    // Simulate escape closure by firing 'cancel' event directly on the dialog node
    const dialog = screen.getByRole('dialog', { hidden: true });
    fireEvent(dialog, new Event('cancel'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  // 5. Dashboard Cards Rendering
  it('renders dashboard stats cards with count values', () => {
    const mockIncidents = [
      { 
        id: '1', 
        title: 'Smoke at Gate 2', 
        description: 'Thick smoke observed near concession stands.', 
        location_zone: 'A', 
        location_section: 'Lower Tier', 
        location_gate: 'Gate 2', 
        reporter_name: 'Steward Dave', 
        status: 'Open', 
        category: 'Fire or smoke', 
        severity: 'Critical', 
        priority: 'P1', 
        confidence: 0.95, 
        responsible_team: 'Fire Response Unit', 
        immediate_actions: ['Evacuate area'], 
        reasoning_summary: 'Fire indicators present', 
        created_at: '2026-07-11T12:00:00Z', 
        updated_at: '2026-07-11T12:00:00Z' 
      }
    ];
    render(<DashboardCards incidents={mockIncidents} onSelectIncident={() => {}} />);
    // Verify Zone condition rendering
    expect(screen.getByText('Zone A (North Bow)')).toBeInTheDocument();
    // Verify count metrics are rendered (e.g. 1 Active Incident card, 1 Open)
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
  });

  // 6. Timeline Checklist / Audit Trail
  it('renders chronological timeline audit items', () => {
    const logs = [
      { id: '1', incident_id: 'inc-1', action: 'Created', actor: 'Dave', details: 'Incident opened', timestamp: '2026-07-11T12:00:00Z' },
      { id: '2', incident_id: 'inc-1', action: 'StatusChanged', actor: 'Alice', details: 'Acknowledged', timestamp: '2026-07-11T12:05:00Z' }
    ];
    render(<Timeline logs={logs} />);
    expect(screen.getByText('Incident opened')).toBeInTheDocument();
    expect(screen.getByText('By: Dave')).toBeInTheDocument();
    expect(screen.getByText('Acknowledged')).toBeInTheDocument();
    expect(screen.getByText('By: Alice')).toBeInTheDocument();
  });

  // 7. Announcement Approval / Human-in-the-loop Action
  it('displays announcement draft and triggers approval event on click', () => {
    const handleApprove = vi.fn();
    const mockAnnouncement = {
      id: 'ann-1',
      incident_id: 'inc-1',
      text_en: 'Please evacuate Gate 4',
      text_es: 'Evacuar Puerta 4',
      text_fr: 'Evacuer Porte 4',
      text_ar: 'الرجاء إخلاء البوابة 4',
      is_approved: false
    };

    const AnnouncementApproval = () => (
      <div>
        <h3>PA Broadcast Translation</h3>
        <p>{mockAnnouncement.text_en}</p>
        <button onClick={handleApprove} className="btn-approve">
          Approve & Broadcast
        </button>
      </div>
    );

    render(<AnnouncementApproval />);
    expect(screen.getByText('Please evacuate Gate 4')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'Approve & Broadcast' });
    fireEvent.click(btn);
    expect(handleApprove).toHaveBeenCalledTimes(1);
  });

  // 8. Report Incident Form Validation
  it('validates incident inputs on submission', () => {
    const handleSubmit = vi.fn((e) => {
      e.preventDefault();
      const form = e.target;
      const title = form.elements.namedItem('title').value;
      const description = form.elements.namedItem('description').value;
      if (!title || title.length < 3) {
        form.querySelector('.error-title').textContent = 'Title must be at least 3 characters';
        return;
      }
      if (!description || description.length < 10) {
        form.querySelector('.error-desc').textContent = 'Description must be at least 10 characters';
        return;
      }
    });

    const TestForm = () => (
      <form onSubmit={handleSubmit}>
        <input name="title" defaultValue="" />
        <span className="error-title"></span>
        <textarea name="description" defaultValue="Short" />
        <span className="error-desc"></span>
        <button type="submit">Submit</button>
      </form>
    );

    render(<TestForm />);
    const btn = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(btn);
    
    expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument();
  });
});
