import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  BarChart3,
  Calendar,
  CalendarPlus,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Info,
  KeyRound,
  Lock,
  Minus,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { api } from '../lib/api';
import type {
  AdminStatus,
  AppScreen,
  CollectionRecord,
  NextSchedule,
  PurokProgress,
  ReportStatus,
  ReportSummary,
  WasteReport,
} from '../types';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/* ---------------- SCREEN 10: ADMIN DASHBOARD ---------------- */
export function AdminDashboardPage({
  token,
  nextSchedule,
  summary,
  onScheduleUpdated,
  onNavigate,
}: {
  token: string;
  nextSchedule: NextSchedule;
  summary: ReportSummary;
  onScheduleUpdated: (next: NextSchedule) => void;
  onNavigate: (screen: AppScreen) => void;
}) {
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [passcodeOpen, setPasscodeOpen] = useState(false);
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscodes, setShowPasscodes] = useState(false);
  const [savingPasscode, setSavingPasscode] = useState(false);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [passcodeSaved, setPasscodeSaved] = useState(false);

  const openPasscodeModal = async () => {
    setPasscodeError(null);
    setPasscodeSaved(false);
    setCurrentPasscode('');
    setNewPasscode('');
    setConfirmPasscode('');
    setShowPasscodes(false);
    setPasscodeOpen(true);
    try {
      const status = await api.getAdminStatus();
      setAdminStatus(status);
    } catch {
      setAdminStatus(null);
    }
  };

  const handlePasscodeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);
    setPasscodeSaved(false);

    if (!currentPasscode.trim()) {
      setPasscodeError('Please enter your current passcode.');
      return;
    }
    if (newPasscode.trim().length < 6) {
      setPasscodeError('New passcode must be at least 6 characters.');
      return;
    }
    if (newPasscode.trim() !== confirmPasscode.trim()) {
      setPasscodeError('New passcodes do not match.');
      return;
    }

    setSavingPasscode(true);
    try {
      await api.changeAdminPasscode(token, {
        currentPasscode: currentPasscode.trim(),
        newPasscode: newPasscode.trim(),
      });
      setPasscodeSaved(true);
      setCurrentPasscode('');
      setNewPasscode('');
      setConfirmPasscode('');
    } catch (err) {
      setPasscodeError(err instanceof Error ? err.message : 'Unable to update passcode.');
    } finally {
      setSavingPasscode(false);
    }
  };

  const puroks: PurokProgress[] =
    Array.isArray(nextSchedule.puroks) && nextSchedule.puroks.length > 0
      ? nextSchedule.puroks
      : [
          { id: 'purok-1', name: 'PUROK 1', collectedHouseholds: 0, totalHouseholds: 138 },
          { id: 'purok-2', name: 'PUROK 2', collectedHouseholds: 0, totalHouseholds: 140 },
        ];

  const adjustPurokHouseholds = async (purokId: string, delta: number) => {
    const nextPuroks = puroks.map((p) => {
      if (p.id !== purokId) return p;
      const target = Math.min(p.totalHouseholds, Math.max(0, p.collectedHouseholds + delta));
      return { ...p, collectedHouseholds: target };
    });
    setUpdatingProgress(true);
    try {
      const res = await api.updateSchedule(token, { puroks: nextPuroks });
      onScheduleUpdated(res.nextSchedule);
    } finally {
      setUpdatingProgress(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#12291D]">
          Welcome, Barangay Captain
        </h2>
        <p className="text-sm text-[#486454] mt-1">
          Manage your community and collection records.
        </p>
      </div>

      {/* 2x2 Admin Grid (4 columns on lg) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <button
          type="button"
          onClick={() => onNavigate('admin-reports')}
          className="bg-white hover:bg-[#EAF3ED]/60 rounded-2xl border border-[#D5E5DB] p-4 sm:p-5 text-left transition-colors flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#1D6B44] tabular-nums">
              {summary.pending} pending
            </span>
          </div>
          <div>
            <div className="text-base font-bold text-[#12291D]">Reports</div>
            <div className="text-xs text-[#486454] mt-0.5 leading-snug">
              View and manage submitted reports
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('admin-records')}
          className="bg-white hover:bg-[#EAF3ED]/60 rounded-2xl border border-[#D5E5DB] p-4 sm:p-5 text-left transition-colors flex flex-col justify-between gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-[#12291D]">Collection Records</div>
            <div className="text-xs text-[#486454] mt-0.5 leading-snug">
              Update and manage collection schedule
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('admin-schedule')}
          className="bg-white hover:bg-[#EAF3ED]/60 rounded-2xl border border-[#D5E5DB] p-4 sm:p-5 text-left transition-colors flex flex-col justify-between gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center">
            <CalendarPlus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-[#12291D]">Next Collection</div>
            <div className="text-xs text-[#486454] mt-0.5 leading-snug">
              Update the next collection date
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('admin-summary')}
          className="bg-white hover:bg-[#EAF3ED]/60 rounded-2xl border border-[#D5E5DB] p-4 sm:p-5 text-left transition-colors flex flex-col justify-between gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-[#12291D]">Reports Summary</div>
            <div className="text-xs text-[#486454] mt-0.5 leading-snug">
              View report statistics
            </div>
          </div>
        </button>
      </div>

      {/* Live Collection Progress Cards per Purok */}
      <div className="space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold text-[#12291D]">Collection Progress</h3>
          <span className="text-xs text-[#486454] tabular-nums">
            Total: {nextSchedule.collectedHouseholds} / {nextSchedule.totalHouseholds} households ·{' '}
            <span className="font-medium text-[#12291D]">{nextSchedule.dateLabel}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {puroks.map((purok) => {
            const pRemaining = Math.max(0, purok.totalHouseholds - purok.collectedHouseholds);
            const pPct =
              purok.totalHouseholds > 0
                ? ((purok.collectedHouseholds / purok.totalHouseholds) * 100).toFixed(1)
                : '0.0';

            return (
              <div
                key={purok.id}
                className="bg-white rounded-2xl border border-[#D5E5DB] p-5"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="text-sm font-bold text-[#1D6B44]">{purok.name}</div>
                    <p className="text-xs text-[#486454] tabular-nums mt-0.5">
                      {purok.collectedHouseholds} of {purok.totalHouseholds} households collected
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={updatingProgress}
                      onClick={() => adjustPurokHouseholds(purok.id, -1)}
                      aria-label={`Decrease ${purok.name} collected households by 1`}
                      className="min-w-[36px] min-h-[36px] px-2 rounded-xl border border-[#D5E5DB] hover:bg-[#F6F9F7] text-xs font-semibold inline-flex items-center justify-center"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={updatingProgress}
                      onClick={() => adjustPurokHouseholds(purok.id, 1)}
                      className="min-h-[36px] px-2.5 rounded-xl border border-[#D5E5DB] hover:bg-[#EAF3ED] text-xs font-semibold text-[#1D6B44] inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />1
                    </button>
                    <button
                      type="button"
                      disabled={updatingProgress}
                      onClick={() => adjustPurokHouseholds(purok.id, 5)}
                      className="min-h-[36px] px-2.5 rounded-xl bg-[#1D6B44] hover:bg-[#155334] text-white text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />5
                    </button>
                  </div>
                </div>

                <div className="w-full h-3 bg-[#EAF3ED] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#278556] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Number(pPct))}%` }}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs font-semibold tabular-nums">
                  <span className="text-[#1D6B44]">{pPct}% collected</span>
                  <span className="text-[#486454]">{pRemaining} remaining</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#12291D]">Quick Actions</h3>
        <div className="bg-white rounded-2xl border border-[#D5E5DB] divide-y divide-[#E6EFEA] overflow-hidden">
          <button
            type="button"
            onClick={() => onNavigate('admin-schedule')}
            className="w-full min-h-[56px] px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#F6F9F7] text-left transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-[#12291D]">
                Update Collection Schedule
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#486454]" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('admin-records')}
            className="w-full min-h-[56px] px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#F6F9F7] text-left transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center">
                <ClipboardList className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-[#12291D]">
                Manage Collection Records
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#486454]" />
          </button>

          <button
            type="button"
            onClick={openPasscodeModal}
            className="w-full min-h-[56px] px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#F6F9F7] text-left transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#12291D]">
                  Change Barangay Captain Passcode
                </div>
                <div className="text-xs text-[#486454]">
                  Update the administrator login passcode
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#486454]" />
          </button>
        </div>
      </div>

      {/* Change Barangay Captain Passcode Modal */}
      {passcodeOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <form
            onSubmit={handlePasscodeSubmit}
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-[#D5E5DB] p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#12291D]">
                Change Barangay Captain Passcode
              </h3>
              <button
                type="button"
                onClick={() => setPasscodeOpen(false)}
                aria-label="Close passcode settings"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#486454]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adminStatus?.source === 'env' ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 leading-relaxed">
                  The Barangay Captain passcode is currently managed by the{' '}
                  <span className="font-mono font-semibold">ADMIN_PASSCODE</span> server environment
                  variable. Update or remove that environment variable in your deployment settings to
                  manage the passcode from the dashboard.
                </div>
                <button
                  type="button"
                  onClick={() => setPasscodeOpen(false)}
                  className="w-full min-h-[44px] rounded-xl bg-[#1D6B44] text-white text-sm font-semibold"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                {passcodeError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800"
                  >
                    {passcodeError}
                  </div>
                )}

                {passcodeSaved && (
                  <div className="rounded-xl border border-[#D5E5DB] bg-[#EAF3ED] px-3.5 py-2.5 text-xs font-semibold text-[#1D6B44] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Barangay Captain passcode updated! Use your new passcode on your next sign-in.
                  </div>
                )}

                <div>
                  <label
                    htmlFor="current-admin-pass"
                    className="block text-xs font-semibold text-[#486454] mb-1"
                  >
                    Current Passcode
                  </label>
                  <div className="relative">
                    <input
                      id="current-admin-pass"
                      type={showPasscodes ? 'text' : 'password'}
                      required
                      value={currentPasscode}
                      onChange={(e) => setCurrentPasscode(e.target.value)}
                      placeholder="Enter current passcode"
                      className="w-full min-h-[44px] px-3.5 pr-11 py-2 text-sm border border-[#D5E5DB] rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscodes((prev) => !prev)}
                      aria-label={showPasscodes ? 'Hide passcodes' : 'Show passcodes'}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#486454]"
                    >
                      {showPasscodes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="new-admin-pass"
                    className="block text-xs font-semibold text-[#486454] mb-1"
                  >
                    New Passcode
                  </label>
                  <input
                    id="new-admin-pass"
                    type={showPasscodes ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#D5E5DB] rounded-xl"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm-admin-pass"
                    className="block text-xs font-semibold text-[#486454] mb-1"
                  >
                    Confirm New Passcode
                  </label>
                  <input
                    id="confirm-admin-pass"
                    type={showPasscodes ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    placeholder="Re-enter new passcode"
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#D5E5DB] rounded-xl"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPasscodeOpen(false)}
                    className="flex-1 min-h-[44px] rounded-xl border border-[#D5E5DB] text-sm font-semibold text-[#486454]"
                  >
                    {passcodeSaved ? 'Done' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={savingPasscode}
                    className="flex-1 min-h-[44px] rounded-xl bg-[#1D6B44] hover:bg-[#155334] text-white text-sm font-semibold disabled:opacity-60"
                  >
                    {savingPasscode ? 'Updating...' : 'Update Passcode'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

/* ---------------- ADMIN: PRIVATE REPORTS MANAGER ---------------- */
export function AdminReportsPage({
  token,
  reports,
  onReportUpdated,
}: {
  token: string;
  reports: WasteReport[];
  onReportUpdated: (report: WasteReport, summary: ReportSummary) => void;
}) {
  const [filter, setFilter] = useState<'All' | ReportStatus>('All');
  const [query, setQuery] = useState('');
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [reportErrors, setReportErrors] = useState<Record<string, string>>({});
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);

  const filtered = reports.filter((r) => {
    if (filter !== 'All' && r.status !== filter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      r.reporterName.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      r.purok.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  });

  const handleUpdate = async (
    report: WasteReport,
    nextStatus: ReportStatus,
    notes?: string,
    resolutionPhotoDataUrl?: string | null,
  ) => {
    setSavingId(report.id);
    setReportErrors((prev) => {
      const next = { ...prev };
      delete next[report.id];
      return next;
    });
    try {
      const payload: {
        status: ReportStatus;
        adminNotes: string;
        resolutionPhotoDataUrl?: string | null;
      } = {
        status: nextStatus,
        adminNotes: notes !== undefined ? notes : report.adminNotes,
      };
      if (resolutionPhotoDataUrl !== undefined) {
        payload.resolutionPhotoDataUrl = resolutionPhotoDataUrl;
      }
      const res = await api.updateReport(token, report.id, payload);
      onReportUpdated(res.report, res.summary);
    } catch (err) {
      setReportErrors((prev) => ({
        ...prev,
        [report.id]: err instanceof Error ? err.message : 'Unable to update report.',
      }));
    } finally {
      setSavingId(null);
    }
  };

  const handleResolutionPhotoChange = (
    report: WasteReport,
    e: ChangeEvent<HTMLInputElement>,
    draftNotes: string,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setReportErrors((prev) => ({
        ...prev,
        [report.id]: 'Please upload a JPG, PNG, or WebP image.',
      }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setReportErrors((prev) => ({
        ...prev,
        [report.id]: 'Resolution image must be under 2 MB.',
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        void handleUpdate(report, 'Resolved', draftNotes, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-[#EAF3ED] border border-[#D5E5DB] px-4 py-3.5 flex items-center gap-2.5 text-xs sm:text-sm text-[#12291D]">
        <Lock className="w-4 h-4 text-[#1D6B44] shrink-0" />
        <span>
          Private Barangay Captain View — Submitted reports, photos, and resident details are visible only to the website admin.
        </span>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-white border border-[#D5E5DB] rounded-xl">
          {(['All', 'Pending', 'In Progress', 'Resolved'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filter === tab
                  ? 'bg-[#1D6B44] text-white'
                  : 'text-[#486454] hover:text-[#12291D]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-[#486454] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reporter, purok, issue..."
            className="w-full min-h-[42px] pl-10 pr-4 py-2 text-xs bg-white border border-[#D5E5DB] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6B44]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D5E5DB] p-8 text-center text-sm text-[#486454]">
          No reports match your current filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((rep) => {
            const draftNotes = editingNotes[rep.id] ?? rep.adminNotes;
            return (
              <div
                key={rep.id}
                className="bg-white rounded-2xl border border-[#D5E5DB] p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-[#12291D]">{rep.type}</h3>
                      <span className="text-xs text-[#486454]">·</span>
                      <span className="text-xs text-[#486454]">{formatDateTime(rep.createdAt)}</span>
                    </div>
                    <div className="text-xs text-[#486454] mt-1">
                      Reported by <span className="font-semibold text-[#12291D]">{rep.reporterName}</span> ({rep.reporterContact}) · {rep.purok}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <label htmlFor={`status-${rep.id}`} className="sr-only">
                      Report status
                    </label>
                    <select
                      id={`status-${rep.id}`}
                      value={rep.status}
                      disabled={savingId === rep.id}
                      onChange={(e) => handleUpdate(rep, e.target.value as ReportStatus, draftNotes)}
                      className="min-h-[40px] px-3 py-1.5 text-xs font-semibold bg-[#F6F9F7] border border-[#D5E5DB] rounded-xl text-[#12291D]"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <p className="text-sm text-[#12291D] leading-relaxed">{rep.description}</p>

                {rep.photoDataUrl && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-[#486454]">Resident Attached Photo</div>
                    <button
                      type="button"
                      onClick={() => setZoomPhoto(rep.photoDataUrl)}
                      className="block rounded-xl overflow-hidden border border-[#D5E5DB] hover:opacity-95"
                    >
                      <img
                        src={rep.photoDataUrl}
                        alt="Resident attached concern"
                        className="w-full max-w-sm max-h-48 object-cover"
                      />
                    </button>
                  </div>
                )}

                {reportErrors[rep.id] && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800"
                  >
                    {reportErrors[rep.id]}
                  </div>
                )}

                <div className="pt-3 border-t border-[#E6EFEA] flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={draftNotes}
                    onChange={(e) =>
                      setEditingNotes((prev) => ({ ...prev, [rep.id]: e.target.value }))
                    }
                    placeholder="Add official Barangay Captain response or action note..."
                    className="flex-1 min-h-[42px] px-3.5 py-2 text-xs bg-[#F6F9F7] border border-[#D5E5DB] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6B44]"
                  />
                  <button
                    type="button"
                    disabled={savingId === rep.id}
                    onClick={() => handleUpdate(rep, rep.status, draftNotes)}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-[#1D6B44] hover:bg-[#155334] text-white text-xs font-semibold whitespace-nowrap disabled:opacity-60"
                  >
                    {savingId === rep.id ? 'Saving...' : 'Save Note'}
                  </button>
                </div>

                {rep.status === 'Resolved' && (
                  <div className="rounded-xl bg-[#F6F9F7] border border-[#D5E5DB] p-3.5 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-[#1D6B44]">
                          Resolution Photo (Visible to Resident)
                        </div>
                        <div className="text-[11px] text-[#486454]">
                          Attach proof of cleanup or completed action for {rep.reporterName}.
                        </div>
                      </div>
                    </div>

                    {rep.resolutionPhotoDataUrl ? (
                      <div className="space-y-2.5">
                        <button
                          type="button"
                          onClick={() => setZoomPhoto(rep.resolutionPhotoDataUrl ?? null)}
                          className="block rounded-xl overflow-hidden border border-[#D5E5DB] bg-white hover:opacity-95"
                        >
                          <img
                            src={rep.resolutionPhotoDataUrl}
                            alt="Admin resolution proof"
                            className="w-full max-w-sm max-h-48 object-cover"
                          />
                        </button>
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="min-h-[36px] px-3 py-1.5 rounded-lg border border-[#D5E5DB] bg-white hover:bg-[#EAF3ED] text-xs font-semibold text-[#1D6B44] inline-flex items-center gap-1.5 cursor-pointer">
                            <Camera className="w-3.5 h-3.5" />
                            {savingId === rep.id ? 'Uploading...' : 'Replace Photo'}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              disabled={savingId === rep.id}
                              onChange={(e) => handleResolutionPhotoChange(rep, e, draftNotes)}
                              className="sr-only"
                            />
                          </label>
                          <button
                            type="button"
                            disabled={savingId === rep.id}
                            onClick={() => handleUpdate(rep, rep.status, draftNotes, null)}
                            className="min-h-[36px] px-3 py-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-xs font-semibold text-red-700 inline-flex items-center gap-1.5 disabled:opacity-60"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove Photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="min-h-[84px] rounded-xl border border-dashed border-[#A7C4B3] bg-white hover:bg-[#EAF3ED]/50 flex items-center justify-center gap-2.5 p-3 cursor-pointer transition-colors">
                        <div className="w-9 h-9 rounded-full bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center shrink-0">
                          <Camera className="w-4 h-4" />
                        </div>
                        <div className="text-xs text-[#486454]">
                          <span className="font-semibold text-[#1D6B44]">
                            {savingId === rep.id ? 'Uploading photo...' : 'Upload resolution photo'}
                          </span>{' '}
                          (JPG, PNG, or WebP · max 2 MB)
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={savingId === rep.id}
                          onChange={(e) => handleResolutionPhotoChange(rep, e, draftNotes)}
                          className="sr-only"
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {zoomPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomPhoto(null)}
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setZoomPhoto(null)}
              aria-label="Close photo"
              className="absolute -top-12 right-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white text-[#12291D]"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomPhoto}
              alt="Full size report attachment"
              className="w-full max-h-[80vh] object-contain rounded-2xl bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- ADMIN: NEXT COLLECTION SCHEDULE EDITOR ---------------- */
export function AdminSchedulePage({
  token,
  nextSchedule,
  onScheduleUpdated,
}: {
  token: string;
  nextSchedule: NextSchedule;
  onScheduleUpdated: (next: NextSchedule) => void;
}) {
  const initialPuroks: PurokProgress[] =
    Array.isArray(nextSchedule.puroks) && nextSchedule.puroks.length > 0
      ? nextSchedule.puroks
      : [
          { id: 'purok-1', name: 'PUROK 1', collectedHouseholds: 0, totalHouseholds: 138 },
          { id: 'purok-2', name: 'PUROK 2', collectedHouseholds: 0, totalHouseholds: 140 },
        ];

  const [dateLabel, setDateLabel] = useState(nextSchedule.dateLabel);
  const [timeWindow, setTimeWindow] = useState(nextSchedule.timeWindow);
  const [location, setLocation] = useState(nextSchedule.location);
  const [puroks, setPuroks] = useState<PurokProgress[]>(initialPuroks);
  const [notes, setNotes] = useState(nextSchedule.notes);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurokChange = (
    idx: number,
    field: 'collectedHouseholds' | 'totalHouseholds',
    value: string,
  ) => {
    const numeric = Math.max(0, Math.floor(Number(value) || 0));
    setPuroks((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: numeric } : p)));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedMsg(false);

    for (const p of puroks) {
      if (!Number.isInteger(p.totalHouseholds) || p.totalHouseholds < 1) {
        setError(`${p.name} total households must be greater than 0.`);
        return;
      }
      if (
        !Number.isInteger(p.collectedHouseholds) ||
        p.collectedHouseholds < 0 ||
        p.collectedHouseholds > p.totalHouseholds
      ) {
        setError(`${p.name} collected households must be between 0 and ${p.totalHouseholds}.`);
        return;
      }
    }

    setSaving(true);
    try {
      const res = await api.updateSchedule(token, {
        dateLabel,
        timeWindow,
        location,
        puroks,
        notes,
      });
      onScheduleUpdated(res.nextSchedule);
      setSavedMsg(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update schedule.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <p className="text-sm text-[#486454]">
        Changes saved here immediately update the Next Waste Collection card and Purok progress bars for all Barangay Calongay residents.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-[#D5E5DB] p-5 sm:p-6 space-y-4"
      >
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
            {error}
          </div>
        )}
        {savedMsg && (
          <div className="rounded-xl border border-[#D5E5DB] bg-[#EAF3ED] px-4 py-3 text-xs font-semibold text-[#1D6B44] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Next collection schedule updated!
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sched-date" className="block text-xs font-semibold text-[#12291D] mb-1.5">
              Collection Date
            </label>
            <input
              id="sched-date"
              type="text"
              required
              value={dateLabel}
              onChange={(e) => setDateLabel(e.target.value)}
              placeholder="Wednesday, October 14"
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm border border-[#D5E5DB] rounded-xl"
            />
          </div>
          <div>
            <label htmlFor="sched-time" className="block text-xs font-semibold text-[#12291D] mb-1.5">
              Time Window
            </label>
            <input
              id="sched-time"
              type="text"
              required
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
              placeholder="7:00 AM - 10:00 AM"
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm border border-[#D5E5DB] rounded-xl"
            />
          </div>
        </div>

        <div>
          <label htmlFor="sched-loc" className="block text-xs font-semibold text-[#12291D] mb-1.5">
            Coverage Area / Barangay
          </label>
          <input
            id="sched-loc"
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full min-h-[44px] px-3.5 py-2.5 text-sm border border-[#D5E5DB] rounded-xl"
          />
        </div>

        <div className="space-y-3 pt-1">
          <div className="text-xs font-semibold text-[#12291D]">Collection Progress by Purok</div>
          {puroks.map((p, idx) => (
            <div
              key={p.id}
              className="rounded-xl bg-[#F6F9F7] border border-[#D5E5DB] p-3.5 space-y-2.5"
            >
              <div className="text-xs font-bold text-[#1D6B44]">{p.name}</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={`purok-collected-${p.id}`}
                    className="block text-xs font-medium text-[#486454] mb-1"
                  >
                    Households Collected
                  </label>
                  <input
                    id={`purok-collected-${p.id}`}
                    type="number"
                    min={0}
                    required
                    value={p.collectedHouseholds}
                    onChange={(e) => handlePurokChange(idx, 'collectedHouseholds', e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-[#D5E5DB] rounded-xl tabular-nums"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`purok-total-${p.id}`}
                    className="block text-xs font-medium text-[#486454] mb-1"
                  >
                    Total Households
                  </label>
                  <input
                    id={`purok-total-${p.id}`}
                    type="number"
                    min={1}
                    required
                    value={p.totalHouseholds}
                    onChange={(e) => handlePurokChange(idx, 'totalHouseholds', e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-[#D5E5DB] rounded-xl tabular-nums"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label htmlFor="sched-notes" className="block text-xs font-semibold text-[#12291D] mb-1.5">
            Route Instructions / Notes
          </label>
          <textarea
            id="sched-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-[#D5E5DB] rounded-xl"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full min-h-[46px] rounded-xl bg-[#1D6B44] hover:bg-[#155334] text-white font-semibold text-sm transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving Schedule...' : 'Save Collection Schedule'}
        </button>
      </form>
    </div>
  );
}

/* ---------------- ADMIN: COLLECTION RECORDS MANAGER ---------------- */
export function AdminRecordsPage({
  token,
  records,
  onRecordsUpdated,
}: {
  token: string;
  records: CollectionRecord[];
  onRecordsUpdated: (records: CollectionRecord[]) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [dateLabel, setDateLabel] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Tuesday');
  const [collectedHouseholds, setCollectedHouseholds] = useState('0');
  const [totalHouseholds, setTotalHouseholds] = useState('278');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<CollectionRecord | null>(null);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await api.createRecord(token, {
        dateLabel,
        dayOfWeek,
        collectedHouseholds: Number(collectedHouseholds),
        totalHouseholds: Number(totalHouseholds),
        status: 'Completed',
        notes,
      });
      onRecordsUpdated(res.records);
      setDateLabel('');
      setNotes('');
      setShowAdd(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add record.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      const res = await api.updateRecord(token, editing.id, {
        dateLabel: editing.dateLabel,
        dayOfWeek: editing.dayOfWeek,
        collectedHouseholds: editing.collectedHouseholds,
        totalHouseholds: editing.totalHouseholds,
        status: editing.status,
        notes: editing.notes,
      });
      onRecordsUpdated(res.records);
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update record.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await api.deleteRecord(token, id);
    onRecordsUpdated(res.records);
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[#486454]">
          Add or update completed waste collection logs visible to residents.
        </p>
        <button
          type="button"
          onClick={() => setShowAdd((prev) => !prev)}
          className="min-h-[42px] px-4 py-2 rounded-xl bg-[#1D6B44] hover:bg-[#155334] text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Record
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-2xl border border-[#D5E5DB] p-5 space-y-4"
        >
          <h3 className="text-base font-bold text-[#12291D]">Log Collection Record</h3>
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#486454] mb-1">Date</label>
              <input
                type="text"
                required
                value={dateLabel}
                onChange={(e) => setDateLabel(e.target.value)}
                placeholder="October 14, 2025"
                className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#D5E5DB] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#486454] mb-1">Day of Week</label>
              <input
                type="text"
                required
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#D5E5DB] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#486454] mb-1">
                Collected Households
              </label>
              <input
                type="number"
                required
                min={0}
                value={collectedHouseholds}
                onChange={(e) => setCollectedHouseholds(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#D5E5DB] rounded-xl tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#486454] mb-1">
                Total Households
              </label>
              <input
                type="number"
                required
                min={1}
                value={totalHouseholds}
                onChange={(e) => setTotalHouseholds(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#D5E5DB] rounded-xl tabular-nums"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#486454] mb-1">Route Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional summary of collection route"
              className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#D5E5DB] rounded-xl"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="min-h-[42px] px-4 py-2 rounded-xl border border-[#D5E5DB] text-xs font-semibold text-[#486454]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-[42px] px-5 py-2 rounded-xl bg-[#1D6B44] text-white text-xs font-semibold"
            >
              {saving ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      )}

      {records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D5E5DB] p-8 text-center text-sm text-[#486454]">
          No collection records logged yet. Click <span className="font-semibold text-[#12291D]">Add Record</span> to log the first collection.
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl border border-[#D5E5DB] p-4 sm:p-5 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="text-base font-bold text-[#12291D]">{rec.dateLabel}</div>
                <div className="text-xs text-[#486454] mt-1 tabular-nums">
                  {rec.dayOfWeek} · {rec.collectedHouseholds} / {rec.totalHouseholds} households ·{' '}
                  <span className="font-semibold text-[#1D6B44]">{rec.status}</span>
                </div>
                {rec.notes && <p className="text-xs text-[#486454] mt-1.5">{rec.notes}</p>}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditing(rec)}
                  aria-label={`Edit ${rec.dateLabel}`}
                  className="min-w-[40px] min-h-[40px] rounded-xl border border-[#D5E5DB] hover:bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(rec.id)}
                  aria-label={`Delete ${rec.dateLabel}`}
                  className="min-w-[40px] min-h-[40px] rounded-xl border border-[#D5E5DB] hover:bg-red-50 text-red-600 flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <form
            onSubmit={handleSaveEdit}
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-[#D5E5DB] p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#12291D]">Edit Collection Record</h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Close"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#486454]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#486454] mb-1">Date</label>
              <input
                type="text"
                required
                value={editing.dateLabel}
                onChange={(e) => setEditing({ ...editing, dateLabel: e.target.value })}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#D5E5DB] rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#486454] mb-1">Collected</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editing.collectedHouseholds}
                  onChange={(e) =>
                    setEditing({ ...editing, collectedHouseholds: Number(e.target.value) })
                  }
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#D5E5DB] rounded-xl tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#486454] mb-1">Total</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editing.totalHouseholds}
                  onChange={(e) =>
                    setEditing({ ...editing, totalHouseholds: Number(e.target.value) })
                  }
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#D5E5DB] rounded-xl tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#486454] mb-1">Notes</label>
              <input
                type="text"
                value={editing.notes}
                onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#D5E5DB] rounded-xl"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="flex-1 min-h-[44px] rounded-xl border border-[#D5E5DB] text-sm font-semibold text-[#486454]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 min-h-[44px] rounded-xl bg-[#1D6B44] text-white text-sm font-semibold"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ---------------- ADMIN: REPORTS SUMMARY ---------------- */
export function AdminSummaryPage({
  summary,
  records,
  onNavigate,
}: {
  summary: ReportSummary;
  records: CollectionRecord[];
  onNavigate: (screen: AppScreen) => void;
}) {
  const typeEntries = Object.entries(summary.byType).sort((a, b) => b[1] - a[1]);
  const avgCollection =
    records.length > 0
      ? (
          records.reduce(
            (acc, r) => acc + (r.totalHouseholds > 0 ? r.collectedHouseholds / r.totalHouseholds : 0),
            0,
          ) /
          records.length *
          100
        ).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-[#D5E5DB] p-5">
          <div className="text-xs font-semibold text-[#486454]">Total Reports</div>
          <div className="text-2xl font-bold text-[#12291D] mt-1 tabular-nums">{summary.total}</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#D5E5DB] p-5">
          <div className="text-xs font-semibold text-[#486454] inline-flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Pending
          </div>
          <div className="text-2xl font-bold text-slate-700 mt-1 tabular-nums">
            {summary.pending}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#D5E5DB] p-5">
          <div className="text-xs font-semibold text-amber-700 inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            In Progress
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1 tabular-nums">
            {summary.inProgress}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#D5E5DB] p-5">
          <div className="text-xs font-semibold text-[#1D6B44] inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resolved
          </div>
          <div className="text-2xl font-bold text-[#1D6B44] mt-1 tabular-nums">
            {summary.resolved}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#D5E5DB] p-5 sm:p-6">
          <h3 className="text-base font-bold text-[#12291D] mb-4">Concerns by Category</h3>
          {typeEntries.length === 0 ? (
            <p className="text-sm text-[#486454]">No resident reports submitted yet.</p>
          ) : (
            <div className="space-y-3.5">
              {typeEntries.map(([type, count]) => {
                const widthPct = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
                return (
                  <div key={type}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-[#12291D]">{type}</span>
                      <span className="text-[#486454] tabular-nums">
                        {count} ({widthPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#EAF3ED] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1D6B44] rounded-full"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#D5E5DB] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#12291D]">Collection Coverage Average</h3>
            <p className="text-xs text-[#486454] mt-1">
              Across {records.length} logged Barangay Calongay collection cycles
            </p>
            <div className="text-4xl font-bold text-[#1D6B44] mt-5 tabular-nums">
              {avgCollection}%
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('admin-reports')}
            className="mt-6 w-full min-h-[44px] rounded-xl bg-[#1D6B44] hover:bg-[#155334] text-white text-sm font-semibold"
          >
            Review Submitted Reports
          </button>
        </div>
      </div>
    </div>
  );
}
