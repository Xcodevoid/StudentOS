import { Flame, Check } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card } from '../ui/Card'
import { computeDailyBadges } from '../../lib/badges'

const RING_TONE = {
  purple: 'bg-purple-500',
  accent: 'bg-accent-500',
  amber: 'bg-amber-500',
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function DailyBadges() {
  const { data } = useStore()
  const badges = computeDailyBadges(data)
  const earnedCount = badges.filter((b) => b.earnedToday).length

  return (
    <Card className="p-5 bg-gradient-to-br from-white to-black/[0.015] dark:from-white/[0.04] dark:to-white/[0.01]">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[15px] font-semibold text-neutral-900 dark:text-white">Today's Badges</p>
        <span className="text-[12.5px] text-neutral-400">{earnedCount}/3 collected today</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {badges.map((b) => (
          <button
            key={b.id}
            onClick={() => scrollTo(b.id)}
            className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl transition-colors text-center ${
              b.earnedToday
                ? 'bg-black/[0.03] dark:bg-white/[0.06]'
                : 'bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
            }`}
          >
            <div className="relative">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  b.earnedToday ? `${RING_TONE[b.tone]} text-white shadow-sm` : 'bg-black/[0.05] dark:bg-white/10 text-neutral-400'
                }`}
              >
                <b.icon size={20} strokeWidth={2} />
              </div>
              {b.earnedToday && (
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                  <Check size={11} className="text-green-500" strokeWidth={3} />
                </div>
              )}
            </div>
            <p className={`text-[13px] font-medium ${b.earnedToday ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`}>
              {b.label}
            </p>
            {b.streak > 0 ? (
              <span className="inline-flex items-center gap-0.5 text-[11px] text-orange-500 font-medium">
                <Flame size={10} fill="currentColor" /> {b.streak}d
              </span>
            ) : (
              <span className="text-[11px] text-neutral-400">{b.description}</span>
            )}
          </button>
        ))}
      </div>
    </Card>
  )
}
