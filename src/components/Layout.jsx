import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, GraduationCap, CalendarClock, Sparkles, Compass, CalendarDays, Settings, GalleryVerticalEnd, Cloud, CloudOff, Zap, Star, LineChart, FolderOpen, BookOpen } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import BackgroundEngine from './BackgroundEngine'
import FloatingTimer from './FloatingTimer'
import MigrationPrompt from './MigrationPrompt'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/north-star', label: 'North Star', mobileLabel: 'Star', icon: Star },
  { to: '/growth', label: 'Growth Analytics', mobileLabel: 'Growth', icon: LineChart },
  { to: '/momentum', label: 'Momentum', mobileLabel: 'Boost', icon: Zap },
  { to: '/academics', label: 'Academics', icon: GraduationCap },
  { to: '/exams', label: 'Exams', icon: CalendarClock },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/portfolio', label: 'Portfolio', icon: Sparkles },
  { to: '/evidence', label: 'Evidence Vault', mobileLabel: 'Evidence', icon: FolderOpen },
  { to: '/story', label: 'Your Story', mobileLabel: 'Story', icon: BookOpen },
  { to: '/college-prep', label: 'College Prep', mobileLabel: 'Prep', icon: Compass },
]

export default function Layout() {
  const { data, mode, cloudLoading } = useStore()
  const { isCloudConfigured, user } = useAuth()
  const initials = (data.profile.name || 'S')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen flex bg-canvas dark:bg-[#0b0b0f]">
      <BackgroundEngine />
      <FloatingTimer />
      <MigrationPrompt />

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 z-30 border-r border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 px-4 h-16 flex-shrink-0">
          <div className="flex items-center gap-2 pl-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-accent-500 flex items-center justify-center flex-shrink-0">
              <GalleryVerticalEnd size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-neutral-900 dark:text-white truncate">StudentOS</span>
          </div>
          <NotificationBell />
        </div>
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-[14px] font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-500/10 text-accent-600 dark:text-accent-400'
                    : 'text-neutral-500 hover:bg-black/[0.04] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white'
                }`
              }
            >
              <item.icon size={18} strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-black/5 dark:border-white/10">
          {isCloudConfigured && (
            <NavLink
              to={user ? '/settings' : '/login'}
              className="flex items-center gap-1.5 px-3 py-1.5 mb-1 text-[11.5px] font-medium text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              {mode === 'cloud' ? (
                <>
                  <Cloud size={12} className="text-green-500" /> {cloudLoading ? 'Syncing…' : 'Synced to cloud'}
                </>
              ) : (
                <>
                  <CloudOff size={12} /> Guest mode — sign in to sync
                </>
              )}
            </NavLink>
          )}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive ? 'bg-black/[0.04] dark:bg-white/5' : 'hover:bg-black/[0.04] dark:hover:bg-white/5'
              }`
            }
          >
            <div className="w-8 h-8 rounded-full bg-neutral-800 dark:bg-white/20 flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-neutral-900 dark:text-white truncate">{data.profile.name || 'Your profile'}</p>
              <p className="text-[11px] text-neutral-400 truncate">{user?.email || data.profile.gradeLevel}</p>
            </div>
            <Settings size={16} className="text-neutral-400 flex-shrink-0" />
          </NavLink>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center justify-between px-4 bg-white/80 dark:bg-[#0b0b0f]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent-500 flex items-center justify-center">
            <GalleryVerticalEnd size={13} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-neutral-900 dark:text-white">StudentOS</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <NavLink to="/settings" className="w-8 h-8 rounded-full bg-neutral-800 dark:bg-white/20 flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0 relative">
            {initials}
            {isCloudConfigured && (
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#0b0b0f] ${
                  mode === 'cloud' ? 'bg-green-500' : 'bg-neutral-300'
                }`}
              />
            )}
          </NavLink>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 md:ml-60 pt-14 md:pt-0 pb-20 md:pb-0 min-w-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch bg-white/90 dark:bg-[#0b0b0f]/90 backdrop-blur-xl shadow-[var(--shadow-nav)] pb-[env(safe-area-inset-bottom)]">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-medium transition-colors ${
                isActive ? 'text-accent-600 dark:text-accent-400' : 'text-neutral-400'
              }`
            }
          >
            <item.icon size={17} strokeWidth={2} />
            <span className="truncate max-w-[48px]">{item.mobileLabel || item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
