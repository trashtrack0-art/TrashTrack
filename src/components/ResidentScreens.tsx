import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Ban,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  HelpCircle,
  Home,
  Info,
  Leaf,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Recycle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sprout,
  Trash2,
  TrendingDown,
  Upload,
  User,
  X,
} from 'lucide-react';
import { api } from '../lib/api';
import type {
  AppScreen,
  CollectionRecord,
  NextSchedule,
  ReportSummary,
  ReportType,
  UserProfile,
  WasteReport,
} from '../types';
import {
  ASSETS,
  CommunityCleanIllustration,
  EarthCareIllustration,
  SafeIllustration,
  TrashTrackLogo,
  VillageIllustration,
} from './TrashTrackLogo';

const REPORT_TYPES: ReportType[] = [
  'Uncollected Waste',
  'Illegal Dumping',
  'Overflowing Bin',
  'Damaged Collection Bin',
  'Missed Street / Purok',
  'Hazardous Waste',
  'Other Concern',
];

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning!';
  if (hour < 18) return 'Good afternoon!';
  return 'Good evening!';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StatusLabel({ status }: { status: WasteReport['status'] }) {
  if (status === 'Resolved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D6B44]">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Resolved
      </span>
    );
  }
  if (status === 'In Progress') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
        <Clock className="w-3.5 h-3.5" />
        In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
      <Info className="w-3.5 h-3.5" />
      Pending Review
    </span>
  );
}

/* ---------------- SCREEN 2: RESIDENT HOME / DASHBOARD ---------------- */
export function ResidentHomePage({
  nextSchedule,
  onNavigate,
}: {
  nextSchedule: NextSchedule;
  onNavigate: (screen: AppScreen) => void;
}) {
  const fiveRsQuick = [
    { label: 'Refuse', emoji: '🚫', icon: Ban, color: 'bg-red-500 text-white' },
    { label: 'Reduce', emoji: '📉', icon: TrendingDown, color: 'bg-amber-500 text-white' },
    { label: 'Reuse', emoji: '🫙', icon: RefreshCw, color: 'bg-[#278556] text-white' },
    { label: 'Recycle', emoji: '♻️', icon: Recycle, color: 'bg-teal-600 text-white' },
    { label: 'Rot', emoji: '🌱', icon: Sprout, color: 'bg-emerald-700 text-white' },
  ];

  const pct =
    nextSchedule.totalHouseholds > 0
      ? ((nextSchedule.collectedHouseholds / nextSchedule.totalHouseholds) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#12291D]">
          {getTimeGreeting()}
        </h2>
        <p className="text-sm text-[#486454] mt-1">
          Together for a cleaner and healthier Barangay Calongay.
        </p>
      </div>

      {/* Featured Next Waste Collection Card */}
      <button
        type="button"
        onClick={() => onNavigate('schedule')}
        className="w-full text-left bg-white rounded-2xl border border-[#D5E5DB] hover:border-[#1D6B44] p-5 sm:p-6 transition-colors group shadow-xs"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#1D6B44]">Next Waste Collection</div>
              <div className="text-lg sm:text-xl font-bold text-[#12291D] mt-0.5">
                {nextSchedule.dateLabel}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-[#486454]">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#1D6B44]" />
                  {nextSchedule.timeWindow}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1D6B44]" />
                  {nextSchedule.location}
                </span>
                <span className="tabular-nums font-medium text-[#1D6B44]">
                  {nextSchedule.collectedHouseholds}/{nextSchedule.totalHouseholds} households ({pct}%)
                </span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#486454] group-hover:text-[#1D6B44] shrink-0 mt-1" />
        </div>
      </button>

      {/* 2x2 Quick Actions (4 columns on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <button
          type="button"
          onClick={() => onNavigate('schedule')}
          className="min-h-[88px] bg-white hover:bg-[#EAF3ED]/60 rounded-2xl border border-[#D5E5DB] p-4 flex items-center gap-3.5 text-left transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-[#12291D] leading-snug">
            Collection Schedule
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('records')}
          className="min-h-[88px] bg-white hover:bg-[#EAF3ED]/60 rounded-2xl border border-[#D5E5DB] p-4 flex items-center gap-3.5 text-left transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-[#12291D] leading-snug">Past Records</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('submit-report')}
          className="min-h-[88px] bg-white hover:bg-[#EAF3ED]/60 rounded-2xl border border-[#D5E5DB] p-4 flex items-center gap-3.5 text-left transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-[#12291D] leading-snug">Submit Report</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('hotline')}
          className="min-h-[88px] bg-white hover:bg-[#EAF3ED]/60 rounded-2xl border border-[#D5E5DB] p-4 flex items-center gap-3.5 text-left transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-[#12291D] leading-snug">
            Hotline Directory
          </span>
        </button>
      </div>

      {/* Desktop 2-Col Split for Community Banner & 5Rs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Community Cleanliness Banner */}
        <button
          type="button"
          onClick={() => onNavigate('cleanliness-tips')}
          className="lg:col-span-6 text-left rounded-2xl border border-[#D5E5DB] bg-[#EAF3ED] hover:border-[#1D6B44] overflow-hidden grid grid-cols-12 items-stretch transition-colors"
        >
          <div className="col-span-5 relative min-h-[128px]">
            <SafeIllustration
              src={ASSETS.communityBanner}
              alt="Barangay Calongay residents keeping the park clean"
              className="w-full h-full object-cover"
              fallback={<CommunityCleanIllustration className="w-full h-full" />}
            />
          </div>
          <div className="col-span-7 p-4 sm:p-5 flex flex-col justify-center">
            <span className="text-xs font-semibold text-[#1D6B44] mb-1">Cleanliness Tips</span>
            <h3 className="text-base font-bold text-[#12291D] leading-snug">
              Keep our barangay clean and green!
            </h3>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#1D6B44]">
              Read practical tips
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </button>

        {/* 5Rs of Waste Management Strip */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#D5E5DB] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-base font-bold text-[#12291D]">5Rs of Waste Management</h3>
            <button
              type="button"
              onClick={() => onNavigate('five-rs')}
              className="text-xs font-semibold text-[#1D6B44] hover:underline whitespace-nowrap"
            >
              View Guide
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {fiveRsQuick.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onNavigate('five-rs')}
                  className="min-h-[72px] flex flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-[#F6F9F7] p-1.5 transition-colors"
                >
                  <span
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] font-semibold text-[#12291D] truncate max-w-full">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SCREEN 3: WASTE COLLECTION SCHEDULE ---------------- */
export function SchedulePage({ nextSchedule }: { nextSchedule: NextSchedule }) {
  const puroks =
    Array.isArray(nextSchedule.puroks) && nextSchedule.puroks.length > 0
      ? nextSchedule.puroks
      : [
          { id: 'purok-1', name: 'PUROK 1', collectedHouseholds: 0, totalHouseholds: 138 },
          { id: 'purok-2', name: 'PUROK 2', collectedHouseholds: 0, totalHouseholds: 140 },
        ];

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Next Collection Card */}
      <div className="bg-white rounded-2xl border border-[#D5E5DB] p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-[#1D6B44]">Next Collection</div>
            <h2 className="text-xl font-bold text-[#12291D] mt-0.5">{nextSchedule.dateLabel}</h2>
            <div className="mt-3 space-y-1.5 text-sm text-[#486454]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1D6B44] shrink-0" />
                <span>{nextSchedule.timeWindow}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1D6B44] shrink-0" />
                <span>{nextSchedule.location}</span>
              </div>
            </div>
            {nextSchedule.notes && (
              <p className="mt-4 pt-3 border-t border-[#E6EFEA] text-xs text-[#486454] leading-relaxed">
                {nextSchedule.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Separate Purok Collection Progress Cards */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2.5">
          <Home className="w-4 h-4 text-[#1D6B44]" />
          <h3 className="text-base font-bold text-[#12291D]">Collection Progress</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {puroks.map((purok) => {
            const remaining = Math.max(0, purok.totalHouseholds - purok.collectedHouseholds);
            const pct =
              purok.totalHouseholds > 0
                ? ((purok.collectedHouseholds / purok.totalHouseholds) * 100).toFixed(1)
                : '0.0';

            return (
              <div
                key={purok.id}
                className="bg-white rounded-2xl border border-[#D5E5DB] p-5"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-bold text-[#1D6B44]">{purok.name}</span>
                  <span className="text-xs font-semibold text-[#486454] tabular-nums">
                    {purok.totalHouseholds} Households
                  </span>
                </div>

                <p className="text-xs text-[#486454] tabular-nums mb-3.5">
                  {purok.collectedHouseholds} of {purok.totalHouseholds} households collected
                </p>

                <div className="w-full h-3 bg-[#EAF3ED] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#278556] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Number(pct))}%` }}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs font-semibold tabular-nums">
                  <span className="text-[#1D6B44]">{pct}% collected</span>
                  <span className="text-[#486454]">{remaining} remaining</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notice */}
      <div className="rounded-2xl bg-[#EAF3ED] border border-[#D5E5DB] px-4 py-3.5 flex items-center gap-2.5 text-xs sm:text-sm text-[#486454]">
        <Info className="w-4 h-4 text-[#1D6B44] shrink-0" />
        <span>Only the next collection schedule is shown.</span>
      </div>

      {/* Scenic Footer Illustration */}
      <div className="rounded-2xl overflow-hidden border border-[#D5E5DB] bg-white">
        <SafeIllustration
          src={ASSETS.villageHills}
          alt="Barangay Calongay green neighborhood"
          className="w-full h-44 object-cover object-bottom"
          fallback={<VillageIllustration className="w-full h-44" />}
        />
      </div>
    </div>
  );
}

/* ---------------- SCREEN 4: PAST COLLECTION RECORDS ---------------- */
export function PastRecordsPage({ records }: { records: CollectionRecord[] }) {
  const [selected, setSelected] = useState<CollectionRecord | null>(null);

  return (
    <div className="space-y-4 max-w-3xl">
      <p className="text-sm text-[#486454]">
        Completed household collection logs for Barangay Calongay. Select any date for route details.
      </p>

      {records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D5E5DB] p-8 text-center text-sm text-[#486454]">
          No past collection records logged yet.
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((rec) => {
            const pct =
              rec.totalHouseholds > 0
                ? ((rec.collectedHouseholds / rec.totalHouseholds) * 100).toFixed(1)
                : '0.0';
            return (
              <button
                key={rec.id}
                type="button"
                onClick={() => setSelected(rec)}
                className="w-full text-left bg-white hover:bg-[#EAF3ED]/40 rounded-2xl border border-[#D5E5DB] p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-bold text-[#12291D]">{rec.dateLabel}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#486454] tabular-nums">
                      <span>{rec.dayOfWeek}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {rec.collectedHouseholds} / {rec.totalHouseholds} households ({pct}%)
                      </span>
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D6B44]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{rec.status}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#486454] shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-[#D5E5DB] p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-semibold text-[#1D6B44]">Collection Summary</span>
                <h3 className="text-lg font-bold text-[#12291D] mt-0.5">{selected.dateLabel}</h3>
                <p className="text-xs text-[#486454]">{selected.dayOfWeek} · Barangay Calongay</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close details"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#486454] hover:bg-[#F6F9F7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl bg-[#F6F9F7] border border-[#D5E5DB] p-4 space-y-2 text-sm tabular-nums">
              <div className="flex justify-between">
                <span className="text-[#486454]">Households Collected</span>
                <span className="font-bold text-[#12291D]">
                  {selected.collectedHouseholds} / {selected.totalHouseholds}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#486454]">Completion Rate</span>
                <span className="font-bold text-[#1D6B44]">
                  {((selected.collectedHouseholds / selected.totalHouseholds) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#486454]">Status</span>
                <span className="font-semibold text-[#1D6B44]">{selected.status}</span>
              </div>
            </div>

            {selected.notes && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-[#486454] mb-1">Route Notes</div>
                <p className="text-sm text-[#12291D] leading-relaxed">{selected.notes}</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-6 w-full min-h-[44px] rounded-xl bg-[#1D6B44] hover:bg-[#155334] text-white text-sm font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- SCREEN 5: SUBMIT A REPORT ---------------- */
export function SubmitReportPage({
  token,
  user,
  onReportSubmitted,
  onNavigate,
}: {
  token: string;
  user: UserProfile;
  onReportSubmitted: (report: WasteReport) => void;
  onNavigate: (screen: AppScreen) => void;
}) {
  const [type, setType] = useState<string>('');
  const [purok, setPurok] = useState(user.purok || 'Barangay Calongay');
  const [description, setDescription] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<WasteReport | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2 MB.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoDataUrl(reader.result);
        setPhotoName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!type) {
      setError('Please select a report type.');
      return;
    }
    if (description.trim().length < 8) {
      setError('Please describe the problem and its location (at least 8 characters).');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.submitReport(token, {
        type,
        purok,
        description: description.trim(),
        photoDataUrl,
      });
      onReportSubmitted(res.report);
      setSubmitted(res.report);
      setType('');
      setDescription('');
      setPhotoDataUrl(null);
      setPhotoName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl bg-white rounded-2xl border border-[#D5E5DB] p-6 sm:p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#12291D]">Report Sent Privately</h2>
        <p className="text-sm text-[#486454] mt-2 leading-relaxed">
          Thank you for helping keep Barangay Calongay clean. Only the Barangay Captain admin can view your report, photo, and location details.
        </p>

        <div className="mt-5 rounded-xl bg-[#F6F9F7] border border-[#D5E5DB] p-4 text-left text-xs space-y-1.5">
          <div className="font-semibold text-[#12291D]">{submitted.type}</div>
          <div className="text-[#486454]">{submitted.purok}</div>
          <div className="text-[#486454] line-clamp-2">{submitted.description}</div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => onNavigate('my-reports')}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#1D6B44] hover:bg-[#155334] text-white text-sm font-semibold"
          >
            View My Reports
          </button>
          <button
            type="button"
            onClick={() => setSubmitted(null)}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl border border-[#D5E5DB] bg-white hover:bg-[#F6F9F7] text-[#12291D] text-sm font-semibold"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-4">
      <p className="text-sm text-[#486454]">Report a concern in Barangay Calongay.</p>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-[#D5E5DB] p-5 sm:p-6 space-y-4"
      >
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800"
          >
            {error}
          </div>
        )}

        <div>
          <label htmlFor="report-type" className="block text-xs font-semibold text-[#12291D] mb-1.5">
            Report Type
          </label>
          <select
            id="report-type"
            required
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full min-h-[44px] px-3.5 py-2.5 text-sm bg-white border border-[#D5E5DB] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6B44]"
          >
            <option value="">Select concern type</option>
            {REPORT_TYPES.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="report-purok" className="block text-xs font-semibold text-[#12291D] mb-1.5">
            Purok / Street Location
          </label>
          <input
            id="report-purok"
            type="text"
            value={purok}
            onChange={(e) => setPurok(e.target.value)}
            placeholder="e.g. Purok 2 near waiting shed"
            className="w-full min-h-[44px] px-3.5 py-2.5 text-sm bg-white border border-[#D5E5DB] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6B44]"
          />
        </div>

        <div>
          <label htmlFor="report-desc" className="block text-xs font-semibold text-[#12291D] mb-1.5">
            Description
          </label>
          <textarea
            id="report-desc"
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the problem and its location..."
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D5E5DB] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6B44]"
          />
        </div>

        <div>
          <span className="block text-xs font-semibold text-[#12291D] mb-1.5">
            Attach Photo <span className="font-normal text-[#486454]">(Optional)</span>
          </span>

          {photoDataUrl ? (
            <div className="rounded-xl border border-[#D5E5DB] p-3 bg-[#F6F9F7]">
              <img
                src={photoDataUrl}
                alt="Attached waste concern preview"
                className="w-full max-h-56 object-cover rounded-lg mb-2.5"
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-[#486454] truncate">{photoName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoDataUrl(null);
                    setPhotoName('');
                  }}
                  className="min-h-[36px] px-3 py-1 rounded-lg border border-red-200 bg-white text-xs font-semibold text-red-700 hover:bg-red-50 inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="min-h-[112px] rounded-xl border border-dashed border-[#A7C4B3] bg-[#F6F9F7] hover:bg-[#EAF3ED]/60 flex flex-col items-center justify-center gap-2 p-4 cursor-pointer transition-colors">
              <div className="w-10 h-10 rounded-full bg-white border border-[#D5E5DB] text-[#1D6B44] flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-[#486454]">Tap to upload an image</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[46px] py-2.5 px-5 rounded-xl bg-[#1D6B44] hover:bg-[#155334] text-white font-semibold text-sm transition-colors disabled:opacity-60"
        >
          {submitting ? 'Submitting Report...' : 'Submit Report'}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-xs text-[#486454] text-center pt-1">
          <Lock className="w-3.5 h-3.5 text-[#1D6B44] shrink-0" />
          <span>Your report will be sent to the barangay admin for review.</span>
        </div>
      </form>
    </div>
  );
}

/* ---------------- SCREEN 6: HOTLINE DIRECTORY ---------------- */
export function HotlinePage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const facebookUrl = 'https://www.facebook.com/blgu.calongay';
  const gmailAddress = 'Blgucalongayinlead@gmail.com';
  const contactNumber = '09693915117';
  const secretaryNumber = '09956435087';

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2000);
    } catch {
      setCopiedKey(null);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="bg-white rounded-2xl border border-[#D5E5DB] p-6 sm:p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-[#1D6B44] text-white flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-[#12291D]">BLGU CALONGAY</h2>
        <p className="text-sm text-[#486454] mt-0.5">Barangay Calongay · Pilar, Sorsogon</p>

        <div className="mt-6 space-y-3 text-left">
          {/* Facebook Account */}
          <div className="rounded-2xl bg-[#F6F9F7] border border-[#D5E5DB] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-[#486454]">Facebook Account</div>
                <div className="text-base font-bold text-[#12291D]">BLGU CALONGAY</div>
                <div className="text-xs text-[#1D6B44] truncate">{facebookUrl}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial min-h-[42px] px-4 py-2 rounded-xl bg-[#1D6B44] hover:bg-[#155334] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Visit
              </a>
              <button
                type="button"
                onClick={() => handleCopy('facebook', facebookUrl)}
                className="flex-1 sm:flex-initial min-h-[42px] px-4 py-2 rounded-xl border border-[#D5E5DB] bg-white hover:bg-[#EAF3ED] text-[#12291D] text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                {copiedKey === 'facebook' ? (
                  <Check className="w-3.5 h-3.5 text-[#1D6B44]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedKey === 'facebook' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Gmail Account */}
          <div className="rounded-2xl bg-[#F6F9F7] border border-[#D5E5DB] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-[#486454]">Gmail Account</div>
                <div className="text-sm sm:text-base font-bold text-[#12291D] break-all">
                  {gmailAddress}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <a
                href={`mailto:${gmailAddress}`}
                className="flex-1 sm:flex-initial min-h-[42px] px-4 py-2 rounded-xl bg-[#1D6B44] hover:bg-[#155334] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Mail className="w-3.5 h-3.5" />
                Email
              </a>
              <button
                type="button"
                onClick={() => handleCopy('gmail', gmailAddress)}
                className="flex-1 sm:flex-initial min-h-[42px] px-4 py-2 rounded-xl border border-[#D5E5DB] bg-white hover:bg-[#EAF3ED] text-[#12291D] text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                {copiedKey === 'gmail' ? (
                  <Check className="w-3.5 h-3.5 text-[#1D6B44]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedKey === 'gmail' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Contact Number */}
          <div className="rounded-2xl bg-[#F6F9F7] border border-[#D5E5DB] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-[#486454]">Contact Number</div>
                <div className="text-base font-bold text-[#12291D] font-mono-tabular">
                  {contactNumber}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <a
                href={`tel:${contactNumber}`}
                className="flex-1 sm:flex-initial min-h-[42px] px-4 py-2 rounded-xl bg-[#1D6B44] hover:bg-[#155334] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5" />
                Call
              </a>
              <button
                type="button"
                onClick={() => handleCopy('contact', contactNumber)}
                className="flex-1 sm:flex-initial min-h-[42px] px-4 py-2 rounded-xl border border-[#D5E5DB] bg-white hover:bg-[#EAF3ED] text-[#12291D] text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                {copiedKey === 'contact' ? (
                  <Check className="w-3.5 h-3.5 text-[#1D6B44]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedKey === 'contact' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Secretary Number */}
          <div className="rounded-2xl bg-[#F6F9F7] border border-[#D5E5DB] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-[#486454]">Secretary Number</div>
                <div className="text-base font-bold text-[#12291D] font-mono-tabular">
                  {secretaryNumber}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <a
                href={`tel:${secretaryNumber}`}
                className="flex-1 sm:flex-initial min-h-[42px] px-4 py-2 rounded-xl bg-[#1D6B44] hover:bg-[#155334] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5" />
                Call
              </a>
              <button
                type="button"
                onClick={() => handleCopy('secretary', secretaryNumber)}
                className="flex-1 sm:flex-initial min-h-[42px] px-4 py-2 rounded-xl border border-[#D5E5DB] bg-white hover:bg-[#EAF3ED] text-[#12291D] text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                {copiedKey === 'secretary' ? (
                  <Check className="w-3.5 h-3.5 text-[#1D6B44]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedKey === 'secretary' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-[#D5E5DB] bg-white">
        <SafeIllustration
          src={ASSETS.villageHills}
          alt="Barangay Calongay surroundings"
          className="w-full h-40 object-cover object-bottom"
          fallback={<VillageIllustration className="w-full h-40" />}
        />
      </div>
    </div>
  );
}

/* ---------------- SCREEN 7: PROFILE + MY REPORTS + HELP ---------------- */
export function ProfilePage({
  token,
  user,
  reportCount,
  onUserUpdated,
  onNavigate,
  onLogout,
}: {
  token: string;
  user: UserProfile;
  reportCount: number;
  onUserUpdated: (user: UserProfile) => void;
  onNavigate: (screen: AppScreen) => void;
  onLogout: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const [editName, setEditName] = useState(user.name);
  const [editContact, setEditContact] = useState(user.contact);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [editPurok, setEditPurok] = useState(user.purok);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await api.updateProfile(token, {
        name: editName,
        contact: editContact,
        phone: editPhone,
        purok: editPurok,
      });
      onUserUpdated(res.user);
      setEditOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      {/* User Summary Card */}
      <div className="bg-white rounded-2xl border border-[#D5E5DB] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 rounded-full bg-[#1D6B44] text-white flex items-center justify-center shrink-0">
            <User className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[#12291D] truncate">{user.name}</h2>
            <p className="text-sm text-[#486454] truncate">{user.contact}</p>
            <p className="text-xs text-[#486454] mt-0.5 truncate">{user.purok}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditName(user.name);
            setEditContact(user.contact);
            setEditPhone(user.phone);
            setEditPurok(user.purok);
            setError(null);
            setEditOpen(true);
          }}
          className="min-h-[42px] px-4 py-2 rounded-xl border border-[#D5E5DB] bg-[#F6F9F7] hover:bg-[#EAF3ED] text-xs font-semibold text-[#1D6B44] inline-flex items-center justify-center gap-1.5 shrink-0"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit Profile
        </button>
      </div>

      {/* Menu Actions */}
      <div className="bg-white rounded-2xl border border-[#D5E5DB] divide-y divide-[#E6EFEA] overflow-hidden">
        <button
          type="button"
          onClick={() => onNavigate(user.role === 'admin' ? 'admin-reports' : 'my-reports')}
          className="w-full min-h-[58px] px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#F6F9F7] text-left transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#12291D]">
                {user.role === 'admin' ? 'Submitted Resident Reports' : 'My Reports'}
              </div>
              <div className="text-xs text-[#486454] tabular-nums">
                {reportCount} {reportCount === 1 ? 'report' : 'reports'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#486454]" />
        </button>

        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className="w-full min-h-[58px] px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#F6F9F7] text-left transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAF3ED] text-[#1D6B44] flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#12291D]">Help &amp; Support</div>
              <div className="text-xs text-[#486454]">Waste segregation guide &amp; privacy info</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#486454]" />
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full min-h-[58px] px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-red-50 text-left transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-red-700">Log Out</div>
          </div>
          <ChevronRight className="w-4 h-4 text-red-400" />
        </button>
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <form
            onSubmit={handleSaveProfile}
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-[#D5E5DB] p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#12291D]">Edit Profile</h3>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                aria-label="Close edit profile"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#486454]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="edit-name" className="block text-xs font-semibold text-[#486454] mb-1">
                Full Name
              </label>
              <input
                id="edit-name"
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#D5E5DB] rounded-xl"
              />
            </div>

            <div>
              <label htmlFor="edit-contact" className="block text-xs font-semibold text-[#486454] mb-1">
                Email or Primary Contact
              </label>
              <input
                id="edit-contact"
                type="text"
                required
                value={editContact}
                onChange={(e) => setEditContact(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#D5E5DB] rounded-xl"
              />
            </div>

            <div>
              <label htmlFor="edit-phone" className="block text-xs font-semibold text-[#486454] mb-1">
                Mobile Number
              </label>
              <input
                id="edit-phone"
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#D5E5DB] rounded-xl"
              />
            </div>

            <div>
              <label htmlFor="edit-purok" className="block text-xs font-semibold text-[#486454] mb-1">
                Purok / Address
              </label>
              <input
                id="edit-purok"
                type="text"
                value={editPurok}
                onChange={(e) => setEditPurok(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#D5E5DB] rounded-xl"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="flex-1 min-h-[44px] rounded-xl border border-[#D5E5DB] text-sm font-semibold text-[#486454]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 min-h-[44px] rounded-xl bg-[#1D6B44] hover:bg-[#155334] text-white text-sm font-semibold"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Help & Support Modal */}
      {helpOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-[#D5E5DB] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#12291D]">Help &amp; Support</h3>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                aria-label="Close help"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#486454]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-[#486454]">
              <div className="p-3.5 rounded-xl bg-[#F6F9F7] border border-[#D5E5DB]">
                <div className="font-semibold text-[#12291D] mb-1">Are my waste reports private?</div>
                <p className="text-xs leading-relaxed">
                  Yes. Submitted reports, photos, and location descriptions are strictly private. Only the Barangay Captain administrator can view and respond to them.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F6F9F7] border border-[#D5E5DB]">
                <div className="font-semibold text-[#12291D] mb-1">When should bins be placed outside?</div>
                <p className="text-xs leading-relaxed">
                  Place segregated biodegradable, recyclable, and residual bins at your curbside 15 minutes before the scheduled collection window.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setHelpOpen(false)}
              className="w-full min-h-[44px] rounded-xl bg-[#1D6B44] text-white text-sm font-semibold"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function MyReportsPage({
  token,
  reports,
  onReportDeleted,
  onNavigate,
}: {
  token: string;
  reports: WasteReport[];
  onReportDeleted: (deletedId: string, summary?: ReportSummary) => void;
  onNavigate: (screen: AppScreen) => void;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      const res = await api.deleteReport(token, id);
      setConfirmId(null);
      onReportDeleted(res.deletedId, res.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete report.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-3xl space-y-4">
      <div className="rounded-2xl bg-[#EAF3ED] border border-[#D5E5DB] px-4 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#12291D]">
          <ShieldCheck className="w-4 h-4 text-[#1D6B44] shrink-0" />
          <span>
            Only your own submitted reports are shown here. Other residents cannot view them.
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('submit-report')}
          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#1D6B44] text-white text-xs font-semibold whitespace-nowrap shrink-0"
        >
          New Report
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800"
        >
          {error}
        </div>
      )}

      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D5E5DB] p-8 text-center">
          <p className="text-sm text-[#486454]">You haven&apos;t submitted any concerns yet.</p>
          <button
            type="button"
            onClick={() => onNavigate('submit-report')}
            className="mt-4 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1D6B44] text-white text-sm font-semibold"
          >
            Submit First Report
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((rep) => {
            const isConfirming = confirmId === rep.id;
            const isDeleting = deletingId === rep.id;

            return (
              <div
                key={rep.id}
                className="bg-white rounded-2xl border border-[#D5E5DB] p-5 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-[#12291D]">{rep.type}</h3>
                    <div className="text-xs text-[#486454] mt-0.5">
                      {rep.purok} · {formatDate(rep.createdAt)}
                    </div>
                  </div>
                  <StatusLabel status={rep.status} />
                </div>

                <p className="text-sm text-[#12291D] leading-relaxed">{rep.description}</p>

                {rep.photoDataUrl && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-[#486454]">Your Attached Photo</div>
                    <button
                      type="button"
                      onClick={() => setZoomPhoto(rep.photoDataUrl)}
                      className="block w-full text-left rounded-xl overflow-hidden border border-[#D5E5DB] hover:opacity-95"
                    >
                      <img
                        src={rep.photoDataUrl}
                        alt="Submitted report attachment"
                        className="w-full max-h-56 object-cover"
                      />
                    </button>
                  </div>
                )}

                {(rep.adminNotes || rep.resolutionPhotoDataUrl) && (
                  <div className="rounded-xl bg-[#F6F9F7] border border-[#D5E5DB] p-3.5 text-xs space-y-2.5">
                    <div className="font-semibold text-[#1D6B44]">
                      Barangay Captain Response
                    </div>
                    {rep.adminNotes && <p className="text-[#12291D]">{rep.adminNotes}</p>}
                    {rep.resolutionPhotoDataUrl && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-semibold text-[#486454]">
                          Resolution Photo
                        </div>
                        <button
                          type="button"
                          onClick={() => setZoomPhoto(rep.resolutionPhotoDataUrl ?? null)}
                          className="block rounded-xl overflow-hidden border border-[#D5E5DB] bg-white hover:opacity-95"
                        >
                          <img
                            src={rep.resolutionPhotoDataUrl}
                            alt="Barangay Captain resolution proof"
                            className="w-full max-w-sm max-h-56 object-cover"
                          />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-[#E6EFEA] flex flex-wrap items-center justify-end gap-2">
                  {isConfirming ? (
                    <div className="w-full flex flex-wrap items-center justify-between gap-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5">
                      <span className="text-xs font-medium text-red-900">
                        Delete this submitted report? This cannot be undone.
                      </span>
                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => setConfirmId(null)}
                          className="min-h-[36px] px-3 py-1.5 rounded-lg border border-[#D5E5DB] bg-white text-xs font-semibold text-[#486454] hover:bg-[#F6F9F7] disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDelete(rep.id)}
                          className="min-h-[36px] px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-60"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setConfirmId(rep.id);
                      }}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100 text-xs font-semibold text-red-700 inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Report
                    </button>
                  )}
                </div>
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
              alt="Full size report photo"
              className="w-full max-h-[80vh] object-contain rounded-2xl bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- SCREEN 8: CLEANLINESS TIPS ---------------- */
export function CleanlinessTipsPage() {
  const tips = [
    {
      title: 'Segregate your waste.',
      description: 'Keep recyclables, biodegradable, and residual waste separate.',
      icon: Trash2,
    },
    {
      title: 'Avoid single-use plastics.',
      description: 'Use reusable items whenever possible.',
      icon: Ban,
    },
    {
      title: 'Compost organic waste.',
      description: 'Turn food scraps into useful compost.',
      icon: Sprout,
    },
    {
      title: 'Keep your surroundings clean.',
      description: 'A clean barangay starts with you!',
      icon: Sparkles,
    },
  ];

  return (
    <div className="max-w-3xl space-y-5">
      <div className="rounded-2xl overflow-hidden border border-[#D5E5DB] bg-white">
        <SafeIllustration
          src={ASSETS.earthTips}
          alt="Hands caring for a green planet"
          className="w-full h-48 sm:h-56 object-cover"
          fallback={<EarthCareIllustration className="w-full h-48 sm:h-56" />}
        />
        <div className="p-5 sm:p-6 border-t border-[#D5E5DB]">
          <h2 className="text-xl sm:text-2xl font-bold text-[#12291D] [text-wrap:balance]">
            Small actions make a big difference!
          </h2>
          <p className="text-sm text-[#486454] mt-1">
            Practical everyday habits for every household in Barangay Calongay.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {tips.map((tip) => {
          const Icon = tip.icon;
          return (
            <div
              key={tip.title}
              className="bg-white rounded-2xl border border-[#D5E5DB] p-5 flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-full bg-[#1D6B44] text-white flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#12291D]">{tip.title}</h3>
                <p className="text-sm text-[#486454] mt-1 leading-relaxed">{tip.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- SCREEN 9: 5Rs OF WASTE MANAGEMENT ---------------- */
export function FiveRsPage() {
  const items = [
    {
      number: '1',
      title: 'Refuse',
      emoji: '🚫',
      exampleEmojis: '🛍️ 🥤',
      description:
        'Say no to unnecessary items that create waste, especially single-use plastics such as plastic bags, straws, and disposable utensils.',
      example: 'Bring your own eco-bag and reusable water bottle when going outside.',
      icon: Ban,
      color: 'bg-red-500 text-white',
      tint: 'bg-red-50 border-red-100',
    },
    {
      number: '2',
      title: 'Reduce',
      emoji: '📉',
      exampleEmojis: '🥗 📦',
      description:
        'Minimize the amount of waste you produce by consuming only what you need and avoiding unnecessary purchases.',
      example: 'Buy only enough food to avoid leftovers and choose products with less packaging.',
      icon: TrendingDown,
      color: 'bg-amber-500 text-white',
      tint: 'bg-amber-50 border-amber-100',
    },
    {
      number: '3',
      title: 'Reuse',
      emoji: '🫙',
      exampleEmojis: '🫙 👕',
      description:
        'Use items repeatedly instead of throwing them away after one use. Find other useful purposes for things that are still in good condition.',
      example: 'Reuse glass jars as storage containers and old clothes as cleaning rags.',
      icon: RefreshCw,
      color: 'bg-[#278556] text-white',
      tint: 'bg-emerald-50 border-emerald-100',
    },
    {
      number: '4',
      title: 'Recycle',
      emoji: '♻️',
      exampleEmojis: '🧴 📄 🥫',
      description:
        'Convert recyclable materials into new products instead of sending them directly to landfills.',
      example: 'Segregate clean plastic bottles, cardboard, paper, and metal cans for recycling.',
      icon: Recycle,
      color: 'bg-teal-600 text-white',
      tint: 'bg-teal-50 border-teal-100',
    },
    {
      number: '5',
      title: 'Rot',
      emoji: '🌱',
      exampleEmojis: '🍌 🥬 🍂',
      description:
        'Allow biodegradable waste to decompose naturally through composting, turning organic materials into nutrient-rich soil.',
      example: 'Compost fruit peels, vegetable scraps, dried leaves, and grass clippings.',
      icon: Sprout,
      color: 'bg-emerald-700 text-white',
      tint: 'bg-lime-50 border-lime-200',
    },
  ];

  const benefits = [
    { emoji: '🗑️', text: 'Reduce the amount of waste sent to disposal sites.' },
    { emoji: '🌬️', text: 'Prevent pollution in our surroundings.' },
    { emoji: '🌳', text: 'Conserve natural resources.' },
    { emoji: '🏡', text: 'Keep our homes and barangay clean.' },
    { emoji: '🤝', text: 'Promote responsible waste management.' },
  ];

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#D5E5DB] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-4">
          <TrashTrackLogo size={54} />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#12291D]">
              The 5Rs of Waste Management
            </h2>
            <p className="text-sm text-[#486454] mt-0.5">
              Simple everyday actions for a cleaner, healthier Barangay Calongay.
            </p>
          </div>
        </div>

        {/* Visual 5-Pillar Strip */}
        <div className="grid grid-cols-5 gap-2 pt-3 border-t border-[#E6EFEA]">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center justify-center text-center p-2 rounded-xl bg-[#F6F9F7] border border-[#E6EFEA]"
            >
              <span className="text-xl leading-none" aria-hidden="true">
                {item.emoji}
              </span>
              <span className="mt-1.5 text-[11px] font-bold text-[#12291D] truncate max-w-full">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* What Are the 5Rs Callout */}
      <div className="rounded-2xl bg-[#EAF3ED] border border-[#D5E5DB] p-5 sm:p-6">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white border border-[#D5E5DB] flex items-center justify-center text-xl shrink-0">
            <span aria-hidden="true">🌍</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1D6B44] tracking-tight">
              What Are the 5Rs?
            </h3>
            <p className="text-sm text-[#12291D] mt-1 leading-relaxed">
              The 5Rs are five practical ways to prevent and manage waste: Refuse, Reduce, Reuse,
              Recycle, and Rot. Practicing them helps lessen the waste we produce and protects our
              surroundings.
            </p>
          </div>
        </div>
      </div>

      {/* 5Rs Detailed Cards */}
      <div className="space-y-3.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-[#D5E5DB] p-5 space-y-3"
            >
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-[#D5E5DB] flex items-center justify-center text-xs shadow-xs"
                    aria-hidden="true"
                  >
                    {item.emoji}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-bold text-[#12291D]">
                    {item.number}. {item.title}
                  </h3>
                  <p className="text-sm text-[#486454] mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>

              <div className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${item.tint}`}>
                <span className="text-base leading-none mt-0.5 shrink-0" aria-hidden="true">
                  {item.exampleEmojis}
                </span>
                <p className="text-xs sm:text-sm text-[#12291D] leading-relaxed">
                  <span className="font-bold">Example:</span> {item.example}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Why Should We Practice the 5Rs? */}
      <div className="bg-white rounded-2xl border border-[#D5E5DB] p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[#12291D]">
            Why Should We Practice the 5Rs?
          </h3>
          <p className="text-sm text-[#486454] mt-0.5">Practicing the 5Rs helps our community:</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {benefits.map((b) => (
            <div
              key={b.text}
              className="rounded-xl bg-[#F6F9F7] border border-[#E6EFEA] p-3.5 flex items-center gap-3"
            >
              <span
                className="w-9 h-9 rounded-lg bg-white border border-[#D5E5DB] flex items-center justify-center text-lg shrink-0"
                aria-hidden="true"
              >
                {b.emoji}
              </span>
              <span className="text-sm font-medium text-[#12291D] leading-snug">{b.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Remember Callout */}
      <div className="rounded-2xl overflow-hidden border border-[#D5E5DB] bg-[#EAF3ED] grid grid-cols-1 sm:grid-cols-12 items-stretch">
        <div className="sm:col-span-5 min-h-[150px]">
          <SafeIllustration
            src={ASSETS.communityBanner}
            alt="Barangay Calongay community practicing responsible waste management"
            className="w-full h-full object-cover"
            fallback={<CommunityCleanIllustration className="w-full h-full" />}
          />
        </div>
        <div className="sm:col-span-7 p-5 sm:p-6 flex flex-col justify-center space-y-2">
          <div className="flex items-center gap-2 text-base font-bold text-[#1D6B44]">
            <Leaf className="w-4 h-4 shrink-0" />
            <span>Remember!</span>
          </div>
          <p className="text-sm text-[#12291D] leading-relaxed">
            Small actions can create a big difference. Start practicing the 5Rs at home and
            encourage others to do the same.
          </p>
          <p className="text-sm font-bold text-[#1D6B44] leading-snug pt-1">
            A cleaner Barangay Calongay starts with responsible waste management! 🌿
          </p>
        </div>
      </div>
    </div>
  );
}
