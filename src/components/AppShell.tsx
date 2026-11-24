import { useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Phone,
  Recycle,
  Shield,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import type { AppScreen, UserProfile } from '../types';
import { TrashTrackLogo } from './TrashTrackLogo';

interface AppShellProps {
  user: UserProfile;
  screen: AppScreen;
  pageTitle: string;
  showBack?: boolean;
  onBack?: () => void;
  onNavigate: (screen: AppScreen) => void;
  onLogout: () => void;
  children: ReactNode;
}

export function AppShell({
  user,
  screen,
  pageTitle,
  showBack = false,
  onBack,
  onNavigate,
  onLogout,
  children,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isAdmin = user.role === 'admin';

  const residentNav = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'schedule' as const, label: 'Collection Schedule', icon: Calendar },
    { id: 'records' as const, label: 'Past Records', icon: ClipboardList },
    { id: 'submit-report' as const, label: 'Submit a Report', icon: FileText },
    { id: 'my-reports' as const, label: 'My Reports', icon: Shield },
    { id: 'hotline' as const, label: 'Hotline Directory', icon: Phone },
    { id: 'cleanliness-tips' as const, label: 'Cleanliness Tips', icon: Sparkles },
    { id: 'five-rs' as const, label: '5Rs Guide', icon: Recycle },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  const adminNav = [
    { id: 'admin-dashboard' as const, label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'admin-reports' as const, label: 'Manage Reports', icon: FileText },
    { id: 'admin-schedule' as const, label: 'Next Collection', icon: Calendar },
    { id: 'admin-records' as const, label: 'Collection Records', icon: ClipboardList },
    { id: 'admin-summary' as const, label: 'Reports Summary', icon: BarChart3 },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  const sidebarItems = isAdmin ? adminNav : residentNav;

  const mobileTabs = isAdmin
    ? [
        { id: 'admin-dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'admin-reports' as const, label: 'Reports', icon: FileText },
        { id: 'profile' as const, label: 'Profile', icon: User },
      ]
    : [
        { id: 'home' as const, label: 'Home', icon: Home },
        { id: 'schedule' as const, label: 'Schedule', icon: Calendar },
        { id: 'submit-report' as const, label: 'Reports', icon: FileText },
        { id: 'profile' as const, label: 'Profile', icon: User },
      ];

  const isTabActive = (tabId: AppScreen) => {
    if (tabId === 'home') return screen === 'home' || screen === 'cleanliness-tips' || screen === 'five-rs' || screen === 'hotline';
    if (tabId === 'schedule') return screen === 'schedule' || screen === 'records';
    if (tabId === 'submit-report') return screen === 'submit-report' || screen === 'my-reports';
    if (tabId === 'admin-dashboard') {
      return screen === 'admin-dashboard' || screen === 'admin-schedule' || screen === 'admin-records' || screen === 'admin-summary';
    }
    return screen === tabId;
  };

  return (
    <div className="min-h-screen bg-[#F6F9F7] text-[#12291D] flex flex-col lg:flex-row">
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-white border-r border-[#D5E5DB] sticky top-0 h-screen">
        <div className={`px-5 py-5 border-b border-[#D5E5DB] ${isAdmin ? 'bg-[#1D6B44] text-white' : 'bg-white'}`}>
          <button
            type="button"
            onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : 'home')}
            className="flex items-center gap-3 text-left w-full"
          >
            <TrashTrackLogo size={36} variant={isAdmin ? 'white' : 'green'} />
            <div className="min-w-0">
              <div className={`text-base font-bold leading-tight truncate ${isAdmin ? 'text-white' : 'text-[#12291D]'}`}>
                TrashTrack
              </div>
              <div className={`text-xs truncate ${isAdmin ? 'text-emerald-100' : 'text-[#486454]'}`}>
                Barangay Calongay · Pilar
              </div>
            </div>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Primary navigation">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = screen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full min-h-[42px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                  active
                    ? 'bg-[#EAF3ED] text-[#1D6B44] font-semibold'
                    : 'text-[#486454] hover:bg-[#F6F9F7] hover:text-[#12291D]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#1D6B44]' : 'text-[#486454]'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#D5E5DB] bg-[#F6F9F7]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#1D6B44] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#12291D] truncate">{user.name}</div>
              <div className="text-xs text-[#486454] truncate">
                {isAdmin ? 'Barangay Captain Admin' : user.purok}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="w-full min-h-[40px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[#D5E5DB] bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-xs font-semibold text-[#486454] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top App Bar (compact 56px) */}
        <header
          className={`lg:hidden sticky top-0 z-30 h-14 px-4 flex items-center justify-between border-b ${
            isAdmin && screen === 'admin-dashboard'
              ? 'bg-[#1D6B44] text-white border-[#155334]'
              : 'bg-white/95 backdrop-blur-md text-[#12291D] border-[#D5E5DB]'
          }`}
        >
          {showBack && onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center rounded-xl hover:bg-black/5"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : 'home')}
              className="flex items-center gap-2.5 text-left min-w-0"
            >
              <TrashTrackLogo
                size={30}
                variant={isAdmin && screen === 'admin-dashboard' ? 'white' : 'green'}
              />
              <div className="min-w-0">
                <div className="text-sm font-bold leading-none truncate">TrashTrack</div>
                <div
                  className={`text-[11px] truncate mt-0.5 ${
                    isAdmin && screen === 'admin-dashboard' ? 'text-emerald-100' : 'text-[#486454]'
                  }`}
                >
                  Barangay Calongay · Pilar
                </div>
              </div>
            </button>
          )}

          {showBack && (
            <h1 className="text-base font-bold truncate px-2 flex-1 text-center">{pageTitle}</h1>
          )}

          <div className="flex items-center gap-1 shrink-0">
            {isAdmin && screen === 'admin-dashboard' && (
              <span className="text-xs font-semibold text-emerald-100 mr-1">Admin</span>
            )}
            {screen === 'home' || screen === 'admin-dashboard' ? (
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                aria-label="Open Profile"
                className="min-w-[44px] min-h-[44px] -mr-1 flex items-center justify-center rounded-full"
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isAdmin ? 'bg-white text-[#1D6B44]' : 'bg-[#1D6B44] text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation menu"
                className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-xl hover:bg-black/5"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>

        {/* Desktop Top Workspace Header */}
        <header className="hidden lg:flex items-center justify-between gap-8 px-8 py-4 bg-white border-b border-[#D5E5DB] sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            {showBack && onBack && (
              <button
                type="button"
                onClick={onBack}
                className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[#D5E5DB] hover:bg-[#F6F9F7] inline-flex items-center gap-1.5 text-xs font-semibold text-[#486454]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <h1 className="text-xl font-bold text-[#12291D] truncate">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isAdmin && screen !== 'admin-reports' && (
              <button
                type="button"
                onClick={() => onNavigate('admin-reports')}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[#1D6B44] hover:bg-[#155334] text-white text-xs font-semibold whitespace-nowrap transition-colors"
              >
                View Private Reports
              </button>
            )}
          </div>
        </header>

        {/* Mobile Quick Drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-black/40 backdrop-blur-xs">
            <div className="w-72 max-w-[85vw] bg-white h-full flex flex-col border-l border-[#D5E5DB] shadow-xl">
              <div className="px-4 py-4 border-b border-[#D5E5DB] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-[#1D6B44]" />
                  <span className="font-bold text-sm">TrashTrack Menu</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#486454]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const active = screen === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onNavigate(item.id);
                        setDrawerOpen(false);
                      }}
                      className={`w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-left ${
                        active ? 'bg-[#EAF3ED] text-[#1D6B44] font-semibold' : 'text-[#486454]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="p-4 border-t border-[#D5E5DB]">
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    onLogout();
                  }}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Viewport */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-10">
          {children}
        </main>

        {/* Mobile Fixed Bottom Navigation Bar */}
        <nav
          aria-label="Mobile bottom navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#D5E5DB]"
        >
          <div
            className={`grid ${isAdmin ? 'grid-cols-3' : 'grid-cols-4'} h-16 max-w-md mx-auto`}
          >
            {mobileTabs.map((tab) => {
              const Icon = tab.icon;
              const active = isTabActive(tab.id);
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onNavigate(tab.id)}
                  className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors ${
                    active ? 'text-[#1D6B44] font-semibold' : 'text-[#486454] hover:text-[#12291D]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[11px] leading-none">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
