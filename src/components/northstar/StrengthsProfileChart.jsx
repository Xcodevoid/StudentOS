import { Star } from 'lucide-react'
import { CHARACTERISTICS, CATEGORIES } from '../../lib/northStar'

// Grouped horizontal bar chart — one bar per trait, grouped under its
// category, category = the fixed categorical color (assigned in order, never
// derived from rank/score). A radar with 17 axes is unreadable past ~8, so
// the full profile lives here instead; the existing RadarChart stays for the
// student's smaller tracked subset.
export function StrengthsProfileChart({ traitScores, topAdvantages = [] }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-5">
        {CATEGORIES.map((cat) => (
          <div key={cat.id} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: `var(--cat-${cat.id})` }} />
            <span className="text-[12px] text-neutral-500 dark:text-neutral-400">{cat.label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {CATEGORIES.map((cat) => {
          const traits = CHARACTERISTICS.filter((c) => c.category === cat.id)
          return (
            <div key={cat.id}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: `var(--cat-${cat.id})` }} />
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{cat.label}</p>
              </div>
              <div className="space-y-2">
                {traits.map((t) => {
                  const score = traitScores[t.id] ?? 0
                  const isTop = topAdvantages.includes(t.id)
                  const Icon = t.icon
                  return (
                    <div key={t.id} className="flex items-center gap-3">
                      <div className="w-32 flex-shrink-0 flex items-center gap-1.5 min-w-0">
                        <Icon size={13} className="text-neutral-400 flex-shrink-0" />
                        <span className="text-[12.5px] text-neutral-700 dark:text-neutral-200 truncate">{t.label}</span>
                      </div>
                      <div
                        className="flex-1 h-2 rounded-full bg-black/[0.05] dark:bg-white/10 overflow-hidden"
                        title={`${t.label}: ${score}/100`}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${score}%`, backgroundColor: `var(--cat-${cat.id})` }}
                        />
                      </div>
                      <span className="w-7 text-right text-[12px] text-neutral-500 dark:text-neutral-400 flex-shrink-0 tabular-nums">
                        {score}
                      </span>
                      {isTop && <Star size={12} className="text-amber-400 flex-shrink-0" fill="currentColor" />}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
