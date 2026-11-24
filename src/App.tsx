import { useCallback, useEffect, useState } from 'react';
import { AppShell } from './components/AppShell';
import { AuthScreen } from './components/AuthScreen';
import {
  AdminDashboardPage,
  AdminRecordsPage,
  AdminReportsPage,
  AdminSchedulePage,
  AdminSummaryPage,
} from './components/AdminScreens';
import {
  CleanlinessTipsPage,
  FiveRsPage,
  HotlinePage,
  MyReportsPage,
  PastRecordsPage,
  ProfilePage,
  ResidentHomePage,
  SchedulePage,
  SubmitReportPage,
} from './components/ResidentScreens';
import { api } from './lib/api';
import type {
  AppScreen,
  CollectionRecord,
  NextSchedule,
  ReportSummary,
  UserProfile,
  WasteReport,
} from './types';

const SCREEN_TITLES: Record<AppScreen, string> = {
  home: 'TrashTrack',
  schedule: 'Waste Collection Schedule',
  records: 'Past Collection Records',
  'submit-report': 'Submit a Report',
  hotline: 'Hotline Directory',
  profile: 'Profile',
  'cleanliness-tips': 'Cleanliness Tips',
  'five-rs': '5Rs of Waste Management',
  'my-reports': 'My Reports',
  'admin-dashboard': 'Admin Dashboard',
  'admin-reports': 'Submitted Reports',
  'admin-records': 'Manage Collection Records',
  'admin-schedule': 'Update Next Collection',
  'admin-summary': 'Reports Summary',
};

const ADMIN_ONLY_SCREENS = new Set<AppScreen>([
  'admin-dashboard',
  'admin-reports',
  'admin-records',
  'admin-schedule',
  'admin-summary',
]);

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [screen, setScreen] = useState<AppScreen>('home');
  const [history, setHistory] = useState<AppScreen[]>([]);

  const [nextSchedule, setNextSchedule] = useState<NextSchedule | null>(null);
  const [records, setRecords] = useState<CollectionRecord[]>([]);
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    byType: {},
  });
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const loadSchedule = useCallback(async () => {
    try {
      const data = await api.getSchedule();
      setNextSchedule(data.nextSchedule);
      setRecords(data.records);
      setDataError(null);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Unable to load barangay schedule.');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const loadUserReports = useCallback(async (authToken: string) => {
    try {
      const data = await api.getReports(authToken);
      setReports(data.reports);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch {
      // ignore if session expired; handled by explicit auth flow
    }
  }, []);

  const handleAuthenticated = async (authToken: string, profile: UserProfile) => {
    setToken(authToken);
    setUser(profile);
    const initialScreen: AppScreen = profile.role === 'admin' ? 'admin-dashboard' : 'home';
    setScreen(initialScreen);
    setHistory([]);
    await Promise.all([loadSchedule(), loadUserReports(authToken)]);
  };

  const handleNavigate = (target: AppScreen) => {
    if (!user) return;
    if (ADMIN_ONLY_SCREENS.has(target) && user.role !== 'admin') {
      return;
    }
    if (target === screen) return;
    setHistory((prev) => [...prev.slice(-10), screen]);
    setScreen(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (!user) return;
    const fallback: AppScreen = user.role === 'admin' ? 'admin-dashboard' : 'home';
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setScreen(prev);
    } else {
      setScreen(fallback);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setReports([]);
    setHistory([]);
    setScreen('home');
  };

  if (!token || !user) {
    return <AuthScreen nextSchedule={nextSchedule} onAuthenticated={handleAuthenticated} />;
  }

  const isRootScreen =
    (user.role === 'resident' && screen === 'home') ||
    (user.role === 'admin' && screen === 'admin-dashboard');

  const safeScreen: AppScreen =
    ADMIN_ONLY_SCREENS.has(screen) && user.role !== 'admin' ? 'home' : screen;

  return (
    <AppShell
      user={user}
      screen={safeScreen}
      pageTitle={SCREEN_TITLES[safeScreen]}
      showBack={!isRootScreen}
      onBack={handleBack}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {loadingData && !nextSchedule ? (
        <div className="space-y-4">
          <div className="h-28 rounded-2xl bg-white border border-[#D5E5DB] animate-pulse" />
          <div className="grid grid-cols-2 gap-3.5">
            <div className="h-24 rounded-2xl bg-white border border-[#D5E5DB] animate-pulse" />
            <div className="h-24 rounded-2xl bg-white border border-[#D5E5DB] animate-pulse" />
          </div>
        </div>
      ) : dataError || !nextSchedule ? (
        <div className="bg-white rounded-2xl border border-red-200 p-6 text-sm text-red-800">
          {dataError || 'Unable to load TrashTrack data.'}
          <button
            type="button"
            onClick={loadSchedule}
            className="mt-3 block px-4 py-2 rounded-xl bg-[#1D6B44] text-white text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {safeScreen === 'home' && (
            <ResidentHomePage nextSchedule={nextSchedule} onNavigate={handleNavigate} />
          )}
          {safeScreen === 'schedule' && <SchedulePage nextSchedule={nextSchedule} />}
          {safeScreen === 'records' && <PastRecordsPage records={records} />}
          {safeScreen === 'submit-report' && (
            <SubmitReportPage
              token={token}
              user={user}
              onReportSubmitted={(rep) => setReports((prev) => [rep, ...prev])}
              onNavigate={handleNavigate}
            />
          )}
          {safeScreen === 'hotline' && <HotlinePage />}
          {safeScreen === 'profile' && (
            <ProfilePage
              token={token}
              user={user}
              reportCount={reports.length}
              onUserUpdated={setUser}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
            />
          )}
          {safeScreen === 'my-reports' && (
            <MyReportsPage
              token={token}
              reports={reports}
              onReportDeleted={(deletedId, nextSummary) => {
                setReports((prev) => prev.filter((r) => r.id !== deletedId));
                if (nextSummary) {
                  setSummary(nextSummary);
                }
              }}
              onNavigate={handleNavigate}
            />
          )}
          {safeScreen === 'cleanliness-tips' && <CleanlinessTipsPage />}
          {safeScreen === 'five-rs' && <FiveRsPage />}

          {safeScreen === 'admin-dashboard' && user.role === 'admin' && (
            <AdminDashboardPage
              token={token}
              nextSchedule={nextSchedule}
              summary={summary}
              onScheduleUpdated={setNextSchedule}
              onNavigate={handleNavigate}
            />
          )}
          {safeScreen === 'admin-reports' && user.role === 'admin' && (
            <AdminReportsPage
              token={token}
              reports={reports}
              onReportUpdated={(updated, nextSummary) => {
                setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
                setSummary(nextSummary);
              }}
            />
          )}
          {safeScreen === 'admin-schedule' && user.role === 'admin' && (
            <AdminSchedulePage
              token={token}
              nextSchedule={nextSchedule}
              onScheduleUpdated={setNextSchedule}
            />
          )}
          {safeScreen === 'admin-records' && user.role === 'admin' && (
            <AdminRecordsPage
              token={token}
              records={records}
              onRecordsUpdated={setRecords}
            />
          )}
          {safeScreen === 'admin-summary' && user.role === 'admin' && (
            <AdminSummaryPage
              summary={summary}
              records={records}
              onNavigate={handleNavigate}
            />
          )}
        </>
      )}
    </AppShell>
  );
}
