const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

function getToken(): string | null {
  try {
    const saved = localStorage.getItem('kumbh_user');
    return saved ? JSON.parse(saved)?.token || null : null;
  } catch { return null; }
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json().catch(() => ({ message: res.statusText }));
  if (!res.ok) throw new Error(data.message || `API Error ${res.status}`);
  return data as T;
}

export const authApi = {
  demoLogin: (role: 'user' | 'volunteer' | 'admin') => fetchApi<{ success: boolean; data: { user: any; token: string } }>('/auth/demo-login', { method: 'POST', body: JSON.stringify({ role }) }),
  login: (email: string, password: string) => fetchApi<{ success: boolean; data: { user: any; token: string } }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data: Record<string, unknown>) => fetchApi<{ success: boolean; data: { user: any; token: string } }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
};

export const sosApi = {
  createSos: (data: { category: string; location: { type: 'Point'; coordinates: [number, number] }; accuracy: number; timestamp: number; message?: string }) => fetchApi<{ success: boolean; data: any }>('/sos/create', { method: 'POST', body: JSON.stringify(data) }),
  acceptSos: (sosId: string) => fetchApi<{ success: boolean; data: any }>(`/sos/${encodeURIComponent(sosId)}/accept`, { method: 'POST', body: '{}' }),
  rejectSos: (sosId: string, reason?: string) => fetchApi<{ success: boolean; data: any }>(`/sos/${encodeURIComponent(sosId)}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  getVolunteerDuty: () => fetchApi<{ success: boolean; data: { dutyStatus: 'OFF_DUTY' | 'ON_DUTY' | 'RESPONDING' | 'BREAK' } }>('/sos/volunteer-duty'),
  updateVolunteerDuty: (dutyStatus: 'OFF_DUTY' | 'ON_DUTY' | 'BREAK') => fetchApi<{ success: boolean; data: any }>('/sos/volunteer-duty', { method: 'POST', body: JSON.stringify({ dutyStatus }) }),
  updateVolunteerLocation: (lat: number, lng: number, accuracy?: number, timestamp = Date.now()) => fetchApi<{ success: boolean; data: any }>('/sos/volunteer-location', { method: 'POST', body: JSON.stringify({ lat, lng, accuracy, timestamp }) }),
  updateLocation: (sosId: string, lat: number, lng: number, accuracy?: number, timestamp = Date.now()) => fetchApi<{ success: boolean; data: any }>(`/sos/${encodeURIComponent(sosId)}/location`, { method: 'POST', body: JSON.stringify({ lat, lng, accuracy, timestamp }) }),
  updateStatus: (sosId: string, status: string, notes?: string) => fetchApi<{ success: boolean; data: any }>(`/sos/${encodeURIComponent(sosId)}/status`, { method: 'POST', body: JSON.stringify({ status, notes }) }),
  cancelSos: (sosId: string) => fetchApi<{ success: boolean; data: any }>(`/sos/${encodeURIComponent(sosId)}/cancel`, { method: 'POST', body: '{}' }),
  updateUserLocation: (sosId: string, lat: number, lng: number, accuracy?: number, timestamp = Date.now()) => fetchApi<{ success: boolean; data: any }>(`/sos/${encodeURIComponent(sosId)}/user-location`, { method: 'POST', body: JSON.stringify({ lat, lng, accuracy, timestamp }) }),
  getActiveSos: () => fetchApi<{ success: boolean; data: any[] }>('/sos/active'),
  getSosById: (sosId: string) => fetchApi<{ success: boolean; data: any }>(`/sos/${encodeURIComponent(sosId)}`),
};

export const crowdApi = {
  getZones: () => fetchApi<{ success: boolean; data: any[] }>('/crowd/zones'),
  updateDensity: (zoneId: string, currentCount: number) => fetchApi<{ success: boolean; data: any }>('/crowd/update', { method: 'POST', body: JSON.stringify({ zoneId, currentCount }) }),
  approveDeployment: (alertId: string, selectedVolunteerIds: string[]) => fetchApi<{ success: boolean; data: any }>('/crowd/deployments/approve', { method: 'POST', body: JSON.stringify({ alertId, selectedVolunteerIds }) }),
};
export const geofenceApi = {
  updateLocation: (data: { volunteerId: string; lat: number; lng: number; zoneCenterLat?: number; zoneCenterLng?: number; zoneRadiusMeters?: number }) => fetchApi<{ success: boolean; data: any }>('/geofence/update-location', { method: 'POST', body: JSON.stringify(data) }),
  getViolations: () => fetchApi<{ success: boolean; data: any[] }>('/geofence/violations'),
};
export const incidentApi = {
  createIncident: (data: any) => fetchApi<{ success: boolean; data: any }>('/incidents/create', { method: 'POST', body: JSON.stringify(data) }),
  getIncidents: () => fetchApi<{ success: boolean; data: any[] }>('/incidents'),
  updateStatus: (incidentId: string, status: string, resolutionNotes?: string) => fetchApi<{ success: boolean; data: any }>(`/incidents/${incidentId}/status`, { method: 'POST', body: JSON.stringify({ status, resolutionNotes }) }),
};
export const taskApi = {
  getTasks: (volunteerId?: string) => fetchApi<{ success: boolean; data: any[] }>(`/tasks${volunteerId ? `?volunteerId=${volunteerId}` : ''}`),
  updateStatus: (taskId: string, status: string, verificationNotes?: string) => fetchApi<{ success: boolean; data: any }>(`/tasks/${taskId}/status`, { method: 'POST', body: JSON.stringify({ status, verificationNotes }) }),
};
export const dutyApi = {
  getRoster: (volunteerId?: string) => fetchApi<{ success: boolean; data: any[] }>(`/duties/roster${volunteerId ? `?volunteerId=${volunteerId}` : ''}`),
  checkIn: (volunteerId: string, lat?: number, lng?: number) => fetchApi<{ success: boolean; data: any }>('/duties/check-in', { method: 'POST', body: JSON.stringify({ volunteerId, lat, lng }) }),
  checkOut: (attendanceId: string, lat?: number, lng?: number) => fetchApi<{ success: boolean; data: any }>(`/duties/check-out`, { method: 'POST', body: JSON.stringify({ attendanceId, lat, lng }) }),
};
export const volunteerApi = {
  getVolunteers: () => fetchApi<{ success: boolean; data: any[] }>('/volunteers'),
  updateStatus: (volunteerId: string, dutyStatus: string) => fetchApi<{ success: boolean; data: any }>('/volunteers/status', { method: 'POST', body: JSON.stringify({ volunteerId, dutyStatus }) }),
};
