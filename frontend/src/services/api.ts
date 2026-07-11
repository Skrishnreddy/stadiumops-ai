import type { Incident, IncidentDetail, Announcement, PostIncidentReport, SOP } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'An unexpected error occurred';
    try {
      const errBody = await response.json();
      errorMessage = errBody.detail || errorMessage;
    } catch {
      // JSON parsing failed, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
}

export const apiService = {
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    return handleResponse<{ status: string; database: string; service: string }>(res);
  },

  async listIncidents(filters?: { status?: string; severity?: string; zone?: string }): Promise<Incident[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.zone) params.append('zone', filters.zone);

    const res = await fetch(`${API_BASE_URL}/api/incidents?${params.toString()}`);
    return handleResponse<Incident[]>(res);
  },

  async createIncident(data: Omit<Incident, 'id' | 'status' | 'category' | 'severity' | 'priority' | 'confidence' | 'responsible_team' | 'immediate_actions' | 'reasoning_summary' | 'created_at' | 'updated_at'>): Promise<Incident> {
    const res = await fetch(`${API_BASE_URL}/api/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Incident>(res);
  },

  async getIncidentDetails(id: string): Promise<IncidentDetail> {
    const res = await fetch(`${API_BASE_URL}/api/incidents/${id}`);
    return handleResponse<IncidentDetail>(res);
  },

  async updateIncidentStatus(id: string, status: string, actor: string): Promise<Incident> {
    const res = await fetch(`${API_BASE_URL}/api/incidents/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, actor }),
    });
    return handleResponse<Incident>(res);
  },

  async createAnnouncementDraft(id: string): Promise<Announcement> {
    const res = await fetch(`${API_BASE_URL}/api/incidents/${id}/announcement`, {
      method: 'POST',
    });
    return handleResponse<Announcement>(res);
  },

  async approveAnnouncement(id: string, announcementId: string, actor: string): Promise<Announcement> {
    const res = await fetch(`${API_BASE_URL}/api/incidents/${id}/announcement/${announcementId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ actor }),
    });
    return handleResponse<Announcement>(res);
  },

  async generatePostIncidentReport(id: string, actor: string): Promise<PostIncidentReport> {
    const res = await fetch(`${API_BASE_URL}/api/incidents/${id}/report?actor=${encodeURIComponent(actor)}`, {
      method: 'POST',
    });
    return handleResponse<PostIncidentReport>(res);
  },

  async getIncidentSop(id: string): Promise<SOP> {
    const res = await fetch(`${API_BASE_URL}/api/incidents/${id}/sop`);
    return handleResponse<SOP>(res);
  }
};
