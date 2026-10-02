/**
 * Centralized API Service for KumbhSmart
 */

const API_BASE_URL = 'http://localhost:5000/api/v1';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(errData.message || `API Error ${res.status}`);
    }

    return await res.json();
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`API Call failed [${endpoint}]:`, error.message);
    throw error;
  }
}

// ─── SOS Endpoints ────────────────────────────────────────────────────────────
export const sosApi = {
  createSos: (data: { category: string; location?: { coordinates: [number, number] }; locationText?: string; message?: string; userName?: string; userPhone?: string }) =>
    fetchApi<{ success: boolean; data: any }>('/sos/create', { method: 'POST', body: JSON.stringify(data) }),

  acceptSos: (sosId: string, volunteerId?: string, volunteerName?: string) =>
    fetchApi<{ success: boolean; data: any }>(`/sos/${sosId}/accept`, { method: 'POST', body: JSON.stringify({ volunteerId, volunteerName }) }),

  rejectSos: (sosId: string, volunteerId?: string, reason?: string) =>
    fetchApi<{ success: boolean; data: any }>(`/sos/${sosId}/reject`, { method: 'POST', body: JSON.stringify({ volunteerId, reason }) }),

  updateLocation: (sosId: string, lat: number, lng: number) =>
    fetchApi<{ success: boolean; data: { etaSeconds: number; distanceMeters: number; status: string } }>(`/sos/${sosId}/location`, {
      method: 'POST',
      body: JSON.stringify({ lat, lng }),
    }),

  updateStatus: (sosId: string, status: string, notes?: string) =>
    fetchApi<{ success: boolean; data: any }>(`/sos/${sosId}/status`, { method: 'POST', body: JSON.stringify({ status, notes }) }),

  getActiveSos: () => fetchApi<{ success: boolean; data: any[] }>('/sos/active'),
  getSosById: (sosId: string) => fetchApi<{ success: boolean; data: any }>(`/sos/${sosId}`),
};

// ─── Crowd Endpoints ──────────────────────────────────────────────────────────
export const crowdApi = {
  getZones: () => fetchApi<{ success: boolean; data: any[] }>('/crowd/zones'),
  updateDensity: (zoneId: string, currentCount: number) =>
    fetchApi<{ success: boolean; data: any }>('/crowd/update', { method: 'POST', body: JSON.stringify({ zoneId, currentCount }) }),
  approveDeployment: (alertId: string, selectedVolunteerIds: string[]) =>
    fetchApi<{ success: boolean; data: any }>('/crowd/deployments/approve', { method: 'POST', body: JSON.stringify({ alertId, selectedVolunteerIds }) }),
};

// ─── Geofence Endpoints ───────────────────────────────────────────────────────
export const geofenceApi = {
  updateLocation: (data: { volunteerId: string; lat: number; lng: number; zoneCenterLat?: number; zoneCenterLng?: number; zoneRadiusMeters?: number }) =>
    fetchApi<{ success: boolean; data: any }>('/geofence/update-location', { method: 'POST', body: JSON.stringify(data) }),
  getViolations: () => fetchApi<{ success: boolean; data: any[] }>('/geofence/violations'),
};

// ─── Incident Endpoints ───────────────────────────────────────────────────────
export const incidentApi = {
  createIncident: (data: any) => fetchApi<{ success: boolean; data: any }>('/incidents/create', { method: 'POST', body: JSON.stringify(data) }),
  getIncidents: () => fetchApi<{ success: boolean; data: any[] }>('/incidents'),
  updateStatus: (incidentId: string, status: string, resolutionNotes?: string) =>
    fetchApi<{ success: boolean; data: any }>(`/incidents/${incidentId}/status`, { method: 'POST', body: JSON.stringify({ status, resolutionNotes }) }),
};

// ─── Task Endpoints ───────────────────────────────────────────────────────────
export const taskApi = {
  getTasks: (volunteerId?: string) => fetchApi<{ success: boolean; data: any[] }>(`/tasks${volunteerId ? `?volunteerId=${volunteerId}` : ''}`),
  updateStatus: (taskId: string, status: string, verificationNotes?: string) =>
    fetchApi<{ success: boolean; data: any }>(`/tasks/${taskId}/status`, { method: 'POST', body: JSON.stringify({ status, verificationNotes }) }),
};

// ─── Duty Endpoints ───────────────────────────────────────────────────────────
export const dutyApi = {
  getRoster: (volunteerId?: string) => fetchApi<{ success: boolean; data: any[] }>(`/duties/roster${volunteerId ? `?volunteerId=${volunteerId}` : ''}`),
  checkIn: (volunteerId: string, lat?: number, lng?: number) =>
    fetchApi<{ success: boolean; data: any }>('/duties/check-in', { method: 'POST', body: JSON.stringify({ volunteerId, lat, lng }) }),
  checkOut: (attendanceId: string, lat?: number, lng?: number) =>
    fetchApi<{ success: boolean; data: any }>('/duties/check-out', { method: 'POST', body: JSON.stringify({ attendanceId, lat, lng }) }),
};

// ─── Volunteer Endpoints ──────────────────────────────────────────────────────
export const volunteerApi = {
  getVolunteers: () => fetchApi<{ success: boolean; data: any[] }>('/volunteers'),
  updateStatus: (volunteerId: string, dutyStatus: string) =>
    fetchApi<{ success: boolean; data: any }>('/volunteers/status', { method: 'POST', body: JSON.stringify({ volunteerId, dutyStatus }) }),
};
