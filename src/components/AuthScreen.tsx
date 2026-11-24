import { useEffect, useState, type FormEvent } from 'react';
import {
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Lock,
  MapPin,
  ShieldCheck,
  User,
} from 'lucide-react';
import { api } from '../lib/api';
import type { AdminStatus, NextSchedule, UserProfile } from '../types';
import {
  ASSETS,
  SafeIllustration,
  TrashTrackLogo,
  VillageIllustration,
} from './TrashTrackLogo';

interface AuthScreenProps {
  nextSchedule: NextSchedule | null;
  onAuthenticated: (token: string, user: UserProfile) => void;
}

export function AuthScreen({ nextSchedule, onAuthenticated }: AuthScreenProps) {
  const [portalMode, setPortalMode] = useState<'resident' | 'admin'>('resident');
  const [residentView, setResidentView] = useState<'login' | 'signup'>('login');

  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [purok, setPurok] = useState('Purok 1, Barangay Calongay');
  const [showPassword, setShowPassword] = useState(false);

  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [adminConfirmPasscode, setAdminConfirmPasscode] = useState('');
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .getAdminStatus()
      .then((status) => {
        if (active) setAdminStatus(status);
      })
      .catch(() => {
        if (active) setAdminStatus({ configured: false, source: 'unclaimed' });
      });
    return () => {
      active = false;
    };
  }, []);

  const handleResidentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (residentView === 'login') {
        const res = await api.loginResident({ contact, password });
        onAuthenticated(res.token, res.user);
      } else {
        const res = await api.registerResident({ name, contact, purok, password });
        onAuthenticated(res.token, res.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleResident = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.demoResidentLogin();
      onAuthenticated(res.token, res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to open sample resident account.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (adminStatus && !adminStatus.configured) {
      if (adminPasscode.trim().length < 6) {
        setError('Please choose an admin passcode of at least 6 characters.');
        return;
      }
      if (adminPasscode !== adminConfirmPasscode) {
        setError('Passcodes do not match.');
        return;
      }
      setLoading(true);
      try {
        const res = await api.claimAdmin(adminPasscode);
        onAuthenticated(res.token, res.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to claim admin account.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await api.adminLogin(adminPasscode);
      onAuthenticated(res.token, res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  const pct =
    nextSchedule && nextSchedule.totalHouseholds > 0
      ? ((nextSchedule.collectedHouseholds / nextSchedule.totalHouseholds) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="min-h-screen bg-[#F6F9F7] text-[#12291D] flex flex-col lg:grid lg:grid-cols-12">
      {/* Desktop Left Civic Showcase */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between bg-[#EAF3ED] border-r border-[#D5E5DB] p-12">
        <div className="max-w-xl">
          <div className="flex items-center gap-3.5 mb-8">
            <TrashTrackLogo size={48} />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#12291D]">TrashTrack</h1>
              <p className="text-sm text-[#486454]">Barangay Calongay · Pilar, Sorsogon</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-[#12291D] leading-tight mb-4 [text-wrap:balance]">
            A cleaner barangay starts with you.
          </h2>
          <p className="text-base text-[#486454] leading-relaxed max-w-lg">
            Check upcoming waste collection schedules, review barangay collection progress, and report neighborhood waste concerns privately to the Barangay Captain.
          </p>
        </div>

        <div className="my-8 rounded-2xl overflow-hidden border border-[#D5E5DB] bg-white shadow-sm">
          <SafeIllustration
            src={ASSETS.villageHills}
            alt="Clean green community neighborhood in Barangay Calongay"
            className="w-full h-64 object-cover"
            fallback={<VillageIllustration className="w-full h-64" />}
          />
          {nextSchedule && (
            <div className="p-6 bg-white border-t border-[#D5E5DB]">
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-xs font-semibold tracking-wide text-[#1D6B44]">
                  Next Scheduled Collection
                </span>
                <span className="text-xs text-[#486454] tabular-nums">
                  {nextSchedule.collectedHouseholds} / {nextSchedule.totalHouseholds} households ({pct}%)
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#12291D]">
                <span className="inline-flex items-center gap-2 font-semibold">
                  <Calendar className="w-4 h-4 text-[#1D6B44]" />
                  {nextSchedule.dateLabel}
                </span>
                <span className="inline-flex items-center gap-2 text-[#486454]">
                  <Clock className="w-4 h-4 text-[#1D6B44]" />
                  {nextSchedule.timeWindow}
                </span>
                <span className="inline-flex items-center gap-2 text-[#486454]">
                  <MapPin className="w-4 h-4 text-[#1D6B44]" />
                  {nextSchedule.location}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-[#486454]">
          <ShieldCheck className="w-4 h-4 text-[#1D6B44] shrink-0" />
          <span>
            Resident reports are strictly private and visible only to the Barangay Captain administrator.
          </span>
        </div>
      </div>

      {/* Auth Column (Full mobile Screen 1 + Desktop Right Panel) */}
      <div className="flex-1 lg:col-span-5 flex flex-col justify-between bg-white lg:bg-[#F6F9F7] lg:p-10">
        <div className="w-full max-w-md mx-auto my-auto px-6 pt-8 pb-6 lg:bg-white lg:rounded-2xl lg:border lg:border-[#D5E5DB] lg:p-8 lg:shadow-sm">
          {/* Mobile Brand Header (Hidden on lg because left showcase displays it) */}
          <div className="flex flex-col items-center text-center mb-6 lg:hidden">
            <TrashTrackLogo size={56} />
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#1D6B44]">TrashTrack</h1>
            <p className="mt-1 text-xs font-medium text-[#1D6B44]">
              Barangay Calongay · Pilar, Sorsogon
            </p>
            <p className="mt-2 text-sm text-[#486454]">A cleaner barangay starts with you.</p>
          </div>

          {/* Desktop Card Header */}
          <div className="hidden lg:block mb-6">
            <h2 className="text-xl font-bold text-[#12291D]">
              {portalMode === 'admin'
                ? 'Barangay Captain Portal'
                : residentView === 'login'
                ? 'Resident Sign In'
                : 'Create Resident Account'}
            </h2>
            <p className="text-sm text-[#486454] mt-1">
              {portalMode === 'admin'
                ? 'Manage collection schedules, records, and private reports.'
                : 'Access schedules, cleanliness tips, and private reporting.'}
            </p>
          </div>

          {/* Role Portal Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#EAF3ED] rounded-xl mb-5 border border-[#D5E5DB]">
            <button
              type="button"
              onClick={() => {
                setPortalMode('resident');
                setError(null);
              }}
              className={`min-h-[44px] px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                portalMode === 'resident'
                  ? 'bg-white text-[#1D6B44] shadow-sm'
                  : 'text-[#486454] hover:text-[#12291D]'
              }`}
            >
              Resident
            </button>
            <button
              type="button"
              onClick={() => {
                setPortalMode('admin');
                setError(null);
              }}
              className={`min-h-[44px] px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                portalMode === 'admin'
                  ? 'bg-white text-[#1D6B44] shadow-sm'
                  : 'text-[#486454] hover:text-[#12291D]'
              }`}
            >
              Barangay Captain
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800"
            >
              {error}
            </div>
          )}

          {portalMode === 'resident' ? (
            <>
              <form onSubmit={handleResidentSubmit} className="space-y-3.5">
                {residentView === 'signup' && (
                  <>
                    <div>
                      <label htmlFor="res-name" className="block text-xs font-medium text-[#486454] mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#486454] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="res-name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Juan Dela Cruz"
                          className="w-full min-h-[44px] pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D5E5DB] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6B44]"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="res-purok" className="block text-xs font-medium text-[#486454] mb-1">
                        Purok / Street
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-[#486454] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <select
                          id="res-purok"
                          value={purok}
                          onChange={(e) => setPurok(e.target.value)}
                          className="w-full min-h-[44px] pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D5E5DB] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6B44]"
                        >
                          <option value="Purok 1, Barangay Calongay">Purok 1, Barangay Calongay</option>
                          <option value="Purok 2, Barangay Calongay">Purok 2, Barangay Calongay</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="res-contact" className="sr-only">
                    Email or Phone Number
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#486454] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="res-contact"
                      type="text"
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Email or Phone Number"
                      className="w-full min-h-[44px] pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D5E5DB] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6B44]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="res-password" className="sr-only">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#486454] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="res-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full min-h-[44px] pl-10 pr-11 py-2.5 text-sm bg-white border border-[#D5E5DB] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6B44]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#486454] hover:text-[#12291D]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[46px] py-2.5 px-5 rounded-xl bg-[#1D6B44] hover:bg-[#155334] text-white font-semibold text-sm transition-colors disabled:opacity-60"
                >
                  {loading
                    ? 'Please wait...'
                    : residentView === 'login'
                    ? 'Log In'
                    : 'Sign Up'}
                </button>
              </form>

              <div className="mt-4 text-center text-xs text-[#486454]">
                {residentView === 'login' ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setResidentView('signup');
                        setError(null);
                      }}
                      className="font-semibold text-[#1D6B44] hover:underline"
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setResidentView('login');
                        setError(null);
                      }}
                      className="font-semibold text-[#1D6B44] hover:underline"
                    >
                      Log In
                    </button>
                  </>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-[#E6EFEA]">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSampleResident}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-[#D5E5DB] bg-[#F6F9F7] hover:bg-[#EAF3ED] text-[#1D6B44] text-xs font-semibold transition-colors"
                >
                  Continue as Sample Resident (Juan Dela Cruz)
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              {adminStatus && !adminStatus.configured ? (
                <div className="rounded-xl border border-[#D5E5DB] bg-[#EAF3ED] p-3.5 text-xs text-[#12291D]">
                  <p className="font-semibold text-[#1D6B44] mb-1">
                    First-Time Barangay Captain Setup
                  </p>
                  <p className="text-[#486454] leading-relaxed">
                    No admin passcode is configured yet. Choose an administrator password below to claim the Barangay Captain account.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-[#D5E5DB] bg-[#F6F9F7] p-3.5 text-xs text-[#486454]">
                  Enter the Barangay Captain passcode to review private resident reports and manage collection records.
                </div>
              )}

              <div>
                <label htmlFor="admin-passcode" className="block text-xs font-medium text-[#486454] mb-1">
                  {adminStatus && !adminStatus.configured
                    ? 'Set Barangay Captain Passcode'
                    : 'Barangay Captain Passcode'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#486454] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="admin-passcode"
                    type={showAdminPasscode ? 'text' : 'password'}
                    required
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full min-h-[44px] pl-10 pr-11 py-2.5 text-sm bg-white border border-[#D5E5DB] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6B44]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPasscode((prev) => !prev)}
                    aria-label={showAdminPasscode ? 'Hide passcode' : 'Show passcode'}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#486454] hover:text-[#12291D]"
                  >
                    {showAdminPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {adminStatus && !adminStatus.configured && (
                <div>
                  <label htmlFor="admin-confirm" className="block text-xs font-medium text-[#486454] mb-1">
                    Confirm Passcode
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#486454] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="admin-confirm"
                      type={showAdminPasscode ? 'text' : 'password'}
                      required
                      value={adminConfirmPasscode}
                      onChange={(e) => setAdminConfirmPasscode(e.target.value)}
                      placeholder="Re-enter passcode"
                      className="w-full min-h-[44px] pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D5E5DB] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6B44]"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[46px] py-2.5 px-5 rounded-xl bg-[#1D6B44] hover:bg-[#155334] text-white font-semibold text-sm transition-colors disabled:opacity-60"
              >
                {loading
                  ? 'Verifying...'
                  : adminStatus && !adminStatus.configured
                  ? 'Claim Admin Account'
                  : 'Log In as Barangay Captain'}
              </button>
            </form>
          )}
        </div>

        {/* Mobile Bottom Village Illustration matching Screen 1 */}
        <div className="lg:hidden w-full mt-4 overflow-hidden">
          <SafeIllustration
            src={ASSETS.villageHills}
            alt="Barangay Calongay green community"
            className="w-full h-40 object-cover object-bottom"
            fallback={<VillageIllustration className="w-full h-40" />}
          />
        </div>
      </div>
    </div>
  );
}
