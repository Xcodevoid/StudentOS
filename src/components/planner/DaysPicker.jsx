import { WEEKDAYS } from '../../lib/planner'

export function DaysPicker({ value, onChange }) {
  function toggle(i) {
    onChange(value.includes(i) ? value.filter((d) => d !== i) : [...value, i].sort())
  }
  return (
    <div className="flex gap-1.5">
      {WEEKDAYS.map((label, i) => (
        <button
          key={i}
          type="button"
          onClick={() => toggle(i)}
          className={`w-9 h-9 rounded-full text-[12.5px] font-medium transition-colors ${
            value.includes(i) ? 'bg-accent-500 text-white' : 'bg-black/[0.05] text-neutral-500 dark:bg-white/10 dark:text-neutral-300'
          }`}
        >
          {label[0]}
        </button>
      ))}
    </div>
  )
}

export const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6]
export const WEEKDAYS_ONLY = [1, 2, 3, 4, 5]
