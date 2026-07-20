import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Checkbox, Input } from '../ui/Form'
import { uid } from '../../lib/storage'

// A small per-opportunity prep checklist (essay drafted, recommender asked,
// transcript sent, ...). Lives entirely inside the opportunity's own
// `checklist` jsonb array — no separate entity/table needed.
export function OpportunityChecklist({ value, onChange }) {
  const [draft, setDraft] = useState('')

  function add() {
    const text = draft.trim()
    if (!text) return
    onChange([...value, { id: uid(), text, done: false }])
    setDraft('')
  }

  function toggle(id) {
    onChange(value.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  }

  function remove(id) {
    onChange(value.filter((item) => item.id !== id))
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {value.map((item) => (
            <div key={item.id} className="flex items-center gap-2 group">
              <Checkbox checked={item.done} onChange={() => toggle(item.id)} />
              <span className={`flex-1 text-[13.5px] ${item.done ? 'line-through text-neutral-400' : 'text-neutral-800 dark:text-neutral-100'}`}>
                {item.text}
              </span>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-opacity flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder="e.g. Ask for a recommendation letter"
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-black/[0.05] dark:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.08] dark:hover:bg-white/15 flex-shrink-0"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}
