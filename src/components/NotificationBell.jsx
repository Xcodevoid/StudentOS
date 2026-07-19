import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, AlertCircle, CalendarClock } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { getReminderItems, bucketReminders, KIND_LABEL } from '../lib/reminders'
import { formatDate, countdownLabel } from '../lib/dates'
import { Badge } from './ui/Misc'

export default function NotificationBell({ className = '' }) {
  const { data } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const items = getReminderItems(data)
  const { overdue, today, upcoming } = bucketReminders(items)
  const urgentCount = overdue.length + today.length

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:bg-black/[0.05] dark:text-neutral-300 dark:hover:bg-white/10"
        aria-label="Reminders"
      >
        <Bell size={18} strokeWidth={2} />
        {urgentCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-[3px] rounded-full bg-red-500 text-white text-[9.5px] font-semibold flex items-center justify-center">
            {urgentCount > 9 ? '9+' : urgentCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 sm:left-0 top-11 w-[calc(100vw-2rem)] max-w-sm bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-black/5 dark:border-white/10">
            <p className="text-[13.5px] font-semibold text-neutral-900 dark:text-white">Reminders</p>
          </div>
          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <CalendarClock size={22} className="mx-auto text-neutral-300 mb-2" />
                <p className="text-[13px] text-neutral-400">Nothing due — you're all caught up.</p>
              </div>
            ) : (
              <>
                <ReminderGroup label="Overdue" items={overdue} tone="red" onNavigate={() => setOpen(false)} />
                <ReminderGroup label="Due Today" items={today} tone="red" onNavigate={() => setOpen(false)} />
                <ReminderGroup label="Next 7 Days" items={upcoming} tone="accent" onNavigate={() => setOpen(false)} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ReminderGroup({ label, items, tone, onNavigate }) {
  if (items.length === 0) return null
  return (
    <div className="px-4 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 mb-1.5">{label}</p>
      <div className="space-y-2">
        {items.slice(0, 6).map((item) => (
          <Link key={`${item.kind}-${item.id}`} to={item.path} onClick={onNavigate} className="flex items-center gap-2.5 group">
            <AlertCircle size={14} className="text-neutral-300 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-neutral-800 dark:text-neutral-100 truncate group-hover:text-accent-600 dark:group-hover:text-accent-400">
                {item.title}
              </p>
              <p className="text-[11px] text-neutral-400">{KIND_LABEL[item.kind]} · {formatDate(item.date)}</p>
            </div>
            <Badge tone={tone}>{countdownLabel(item.date)}</Badge>
          </Link>
        ))}
      </div>
    </div>
  )
}
