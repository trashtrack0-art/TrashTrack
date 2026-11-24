export type UserRole = 'resident' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  contact: string;
  phone: string;
  purok: string;
  role: UserRole;
  notificationsEnabled: boolean;
}

export interface PurokProgress {
  id: string;
  name: string;
  collectedHouseholds: number;
  totalHouseholds: number;
}

export interface NextSchedule {
  id: string;
  dateLabel: string;
  timeWindow: string;
  location: string;
  collectedHouseholds: number;
  totalHouseholds: number;
  puroks: PurokProgress[];
  notes: string;
  updatedAt: string;
}

export interface CollectionRecord {
  id: string;
  dateLabel: string;
  dayOfWeek: string;
  collectedHouseholds: number;
  totalHouseholds: number;
  status: 'Completed' | 'Scheduled' | 'Partial';
  notes: string;
  createdAt: string;
}

export type ReportStatus = 'Pending' | 'In Progress' | 'Resolved';

export type ReportType =
  | 'Uncollected Waste'
  | 'Illegal Dumping'
  | 'Overflowing Bin'
  | 'Damaged Collection Bin'
  | 'Missed Street / Purok'
  | 'Hazardous Waste'
  | 'Other Concern';

export interface WasteReport {
  id: string;
  userId: string;
  reporterName: string;
  reporterContact: string;
  purok: string;
  type: ReportType;
  description: string;
  photoDataUrl: string | null;
  resolutionPhotoDataUrl?: string | null;
  status: ReportStatus;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportSummary {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  byType: Record<string, number>;
}

export interface AdminStatus {
  configured: boolean;
  source: 'env' | 'claimed' | 'unclaimed';
}

export type AppScreen =
  | 'home'
  | 'schedule'
  | 'records'
  | 'submit-report'
  | 'hotline'
  | 'profile'
  | 'cleanliness-tips'
  | 'five-rs'
  | 'my-reports'
  | 'admin-dashboard'
  | 'admin-reports'
  | 'admin-records'
  | 'admin-schedule'
  | 'admin-summary';
