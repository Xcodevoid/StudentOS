import { Pause, Play, Square, Timer as TimerIcon } from 'lucide-react'
import { useTimer } from '../context/TimerContext'

function fmt(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function FloatingTimer() {
  const { status, remaining, total, label, pause, resume, stop } = useTimer()
  if (status === 'idle') return null

  const pct = total > 0 ? ((total - remaining) / total) * 100 : 0

  return (
    <div className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-3 bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 rounded-full shadow-xl pl-1.5 pr-4 py-1.5">
      <div className="relative w-9 h-9 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-black/10 dark:text-white/10" />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-accent-500"
            strokeDasharray={2 * Math.PI * 15.5}
            strokeDashoffset={2 * Math.PI * 15.5 * (1 - pct / 100)}
          />
        </svg>
        <TimerIcon size={13} className="absolute inset-0 m-auto text-accent-600 dark:text-accent-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[13.5px] font-semibold text-neutral-900 dark:text-white tabular-nums leading-tight">{fmt(remaining)}</p>
        <p className="text-[11px] text-neutral-400 truncate max-w-[100px] leading-tight">{label || 'Focus session'}</p>
      </div>
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {status === 'running' ? (
          <button onClick={pause} className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-500 hover:bg-black/[0.05] dark:hover:bg-white/10">
            <Pause size={14} fill="currentColor" />
          </button>
        ) : (
          <button onClick={resume} className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-500 hover:bg-black/[0.05] dark:hover:bg-white/10">
            <Play size={14} fill="currentColor" />
          </button>
        )}
        <button onClick={stop} className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:bg-black/[0.05] dark:hover:bg-white/10">
          <Square size={12} fill="currentColor" />
        </button>
      </div>
    </div>
  )
}
