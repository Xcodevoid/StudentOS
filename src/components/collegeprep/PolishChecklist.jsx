import { Check, X } from 'lucide-react'
import { analyzeDescription, suggestedVerbs } from '../../lib/activityPolish'

export function PolishChecklist({ text, dimensions }) {
  const { checks, score, total } = analyzeDescription(text)
  const verbs = suggestedVerbs(dimensions)

  return (
    <div className="mt-2 rounded-xl bg-black/[0.03] dark:bg-white/5 p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Polish check</p>
        <span className={`text-[11.5px] font-medium ${score === total ? 'text-green-600 dark:text-green-400' : 'text-neutral-400'}`}>
          {score}/{total}
        </span>
      </div>
      <div className="space-y-1">
        {checks.map((c) => (
          <div key={c.id} className="flex items-center gap-1.5">
            {c.pass ? (
              <Check size={12} className="text-green-500 flex-shrink-0" />
            ) : (
              <X size={12} className="text-neutral-300 dark:text-neutral-600 flex-shrink-0" />
            )}
            <span className={`text-[12px] ${c.pass ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-400 dark:text-neutral-500'}`}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
      {verbs.length > 0 && (
        <div className="mt-2.5 pt-2.5 border-t border-black/5 dark:border-white/10">
          <p className="text-[11px] text-neutral-400 mb-1.5">Try a stronger opener:</p>
          <div className="flex flex-wrap gap-1.5">
            {verbs.map((v) => (
              <span
                key={v}
                className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white dark:bg-white/10 text-neutral-600 dark:text-neutral-300 border border-black/5 dark:border-white/10"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
