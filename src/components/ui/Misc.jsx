export function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-black/[0.05] text-neutral-600 dark:bg-white/10 dark:text-neutral-300',
    accent: 'bg-accent-50 text-accent-700 dark:bg-accent-500/15 dark:text-accent-400',
    green: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    red: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}

export function ProgressBar({ value, max = 100, tone = 'accent', className = '' }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  const tones = {
    accent: 'bg-accent-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
  }
  return (
    <div className={`h-1.5 w-full rounded-full bg-black/[0.06] dark:bg-white/10 overflow-hidden ${className}`}>
      <div className={`h-full rounded-full ${tones[tone]} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-black/[0.04] dark:bg-white/10 flex items-center justify-center mb-3">
          <Icon size={22} strokeWidth={1.75} className="text-neutral-400" />
        </div>
      )}
      <p className="text-[14px] font-medium text-neutral-700 dark:text-neutral-200">{title}</p>
      {description && <p className="text-[13px] text-neutral-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function StatCard({ label, value, sub, tone = 'default' }) {
  const tones = {
    default: 'text-neutral-900 dark:text-white',
    accent: 'text-accent-600 dark:text-accent-400',
  }
  return (
    <div className="rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-[var(--shadow-card)] px-4 py-4">
      <p className="text-[12px] font-medium text-neutral-400">{label}</p>
      <p className={`text-[26px] font-semibold tracking-tight mt-0.5 ${tones[tone]}`}>{value}</p>
      {sub && <p className="text-[12px] text-neutral-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-neutral-400">{children}</h2>
      {action}
    </div>
  )
}
