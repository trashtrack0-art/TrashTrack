import type {
  AdminStatus,
  CollectionRecord,
  NextSchedule,
  ReportStatus,
  ReportSummary,
  UserProfile,
  WasteReport,
} from '../types';

async function request<T>(
  path: string,
  options: {
    method?: string;
    token?: string | null;
    body?: unknown;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(path, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = typeof data.error === 'string' ? data.error : 'Request failed. Please try again.';
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  getAdminStatus: () => request<AdminStatus>('/api/auth/admin-status'),

  claimAdmin: (passcode: string) =>
    request<{ token: string; user: UserProfile }>('/api/auth/admin-claim', {
      method: 'POST',
      body: { passcode },
    }),

  adminLogin: (passcode: string) =>
    request<{ token: string; user: UserProfile }>('/api/auth/admin-login', {
      method: 'POST',
      body: { passcode },
    }),

  changeAdminPasscode: (
    token: string,
    payload: { currentPasscode: string; newPasscode: string },
  ) =>
    request<{ ok: boolean; message: string }>('/api/auth/admin-passcode', {
      method: 'PUT',
      token,
      body: payload,
    }),

  registerResident: (payload: { name: string; contact: string; purok: string; password: string }) =>
    request<{ token: string; user: UserProfile }>('/api/auth/register', {
      method: 'POST',
      body: payload,
    }),

  loginResident: (payload: { contact: string; password: string }) =>
    request<{ token: string; user: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: payload,
    }),

  demoResidentLogin: () =>
    request<{ token: string; user: UserProfile }>('/api/auth/demo-resident', {
      method: 'POST',
    }),

  updateProfile: (
    token: string,
    payload: Partial<Pick<UserProfile, 'name' | 'contact' | 'phone' | 'purok' | 'notificationsEnabled'>>,
  ) =>
    request<{ user: UserProfile }>('/api/profile', {
      method: 'PATCH',
      token,
      body: payload,
    }),

  getSchedule: () => request<{ nextSchedule: NextSchedule; records: CollectionRecord[] }>('/api/schedule'),

  updateSchedule: (
    token: string,
    payload: Partial<
      Pick<
        NextSchedule,
        'dateLabel' | 'timeWindow' | 'location' | 'collectedHouseholds' | 'totalHouseholds' | 'puroks' | 'notes'
      >
    >,
  ) =>
    request<{ nextSchedule: NextSchedule }>('/api/schedule', {
      method: 'PUT',
      token,
      body: payload,
    }),

  createRecord: (
    token: string,
    payload: Omit<CollectionRecord, 'id' | 'createdAt'>,
  ) =>
    request<{ record: CollectionRecord; records: CollectionRecord[] }>('/api/records', {
      method: 'POST',
      token,
      body: payload,
    }),

  updateRecord: (
    token: string,
    id: string,
    payload: Partial<Omit<CollectionRecord, 'id' | 'createdAt'>>,
  ) =>
    request<{ record: CollectionRecord; records: CollectionRecord[] }>(`/api/records/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      token,
      body: payload,
    }),

  deleteRecord: (token: string, id: string) =>
    request<{ records: CollectionRecord[] }>(`/api/records/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      token,
    }),

  getReports: (token: string) =>
    request<{ reports: WasteReport[]; summary?: ReportSummary }>('/api/reports', {
      token,
    }),

  submitReport: (
    token: string,
    payload: { type: string; description: string; purok: string; photoDataUrl?: string | null },
  ) =>
    request<{ report: WasteReport }>('/api/reports', {
      method: 'POST',
      token,
      body: payload,
    }),

  updateReport: (
    token: string,
    id: string,
    payload: { status?: ReportStatus; adminNotes?: string; resolutionPhotoDataUrl?: string | null },
  ) =>
    request<{ report: WasteReport; summary: ReportSummary }>(`/api/reports/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      token,
      body: payload,
    }),

  deleteReport: (token: string, id: string) =>
    request<{ deletedId: string; summary?: ReportSummary }>(`/api/reports/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      token,
    }),
};
