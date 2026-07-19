import { DIMENSIONS } from '../../lib/northStar'

// Shared multi-select used on the Portfolio and College Prep forms so a
// project or activity can declare which parts of North Star it grows.
export function DimensionTagPicker({ value, onChange }) {
  function toggle(id) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {DIMENSIONS.map((dim) => {
        const active = value.includes(dim.id)
        return (
          <button
            type="button"
            key={dim.id}
            onClick={() => toggle(dim.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-medium border transition-colors ${
              active
                ? 'bg-accent-500/10 border-accent-500/40 text-accent-700 dark:text-accent-400'
                : 'bg-transparent border-black/10 dark:border-white/15 text-neutral-500 hover:border-accent-500/40'
            }`}
          >
            <dim.icon size={13} strokeWidth={2} />
            {dim.shortLabel}
          </button>
        )
      })}
    </div>
  )
}
