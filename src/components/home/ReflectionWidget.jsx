import { useMemo, useState, useEffect } from 'react'
import { Moon, Check, ChevronDown } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Field, Textarea } from '../ui/Form'
import { todayKey } from '../../lib/momentum'
import { formatDate, sortByDateAsc } from '../../lib/dates'

const QUESTIONS = [
  { key: 'accomplished', label: 'What did you accomplish today?' },
  { key: 'blocked', label: 'What prevented you from achieving your goals?' },
  { key: 'improve', label: 'What will you improve tomorrow?' },
]

const HISTORY_PREVIEW = 3

export default function ReflectionWidget() {
  const { data, addItem, updateItem, recordActivityToday } = useStore()
  const today = todayKey()
  const todaysReflection = useMemo(() => data.reflections.find((r) => r.date === today), [data.reflections, today])

  const [form, setForm] = useState({ accomplished: '', blocked: '', improve: '' })
  const [saved, setSaved] = useState(false)
  const [showAllHistory, setShowAllHistory] = useState(false)

  useEffect(() => {
    if (todaysReflection) {
      setForm({ accomplished: todaysReflection.accomplished, blocked: todaysReflection.blocked, improve: todaysReflection.improve })
    }
  }, [todaysReflection])

  function save(e) {
    e.preventDefault()
    if (todaysReflection) {
      updateItem('reflections', todaysReflection.id, form)
    } else {
      addItem('reflections', { ...form, date: today })
      recordActivityToday()
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const history = useMemo(
    () => sortByDateAsc(data.reflections.filter((r) => r.date !== today)).reverse(),
    [data.reflections, today]
  )
  const visibleHistory = showAllHistory ? history : history.slice(0, HISTORY_PREVIEW)

  return (
    <Card id="reflection" className="p-5">
      <CardHeader title="Tonight's Reflection" subtitle={formatDate(today, { weekday: 'long' })} />
      <form onSubmit={save} className="mt-4 space-y-4">
        {QUESTIONS.map((q) => (
          <Field key={q.key} label={q.label}>
            <Textarea
              value={form[q.key]}
              onChange={(e) => setForm((prev) => ({ ...prev, [q.key]: e.target.value }))}
              rows={2}
              placeholder="Be honest — this is just for you."
            />
          </Field>
        ))}
        <Button type="submit" icon={saved ? Check : Moon}>{saved ? 'Saved' : todaysReflection ? 'Update reflection' : 'Save reflection'}</Button>
      </form>

      {history.length > 0 && (
        <div className="mt-6 pt-5 border-t border-black/5 dark:border-white/10">
          <p className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400 mb-3">Past Reflections</p>
          <div className="space-y-4 divide-y divide-black/5 dark:divide-white/10">
            {visibleHistory.map((r) => (
              <div key={r.id} className="pt-4 first:pt-0">
                <p className="text-[13px] font-semibold text-neutral-900 dark:text-white mb-2">{formatDate(r.date, { weekday: 'long' })}</p>
                <div className="space-y-1.5">
                  {QUESTIONS.map(
                    (q) =>
                      r[q.key] && (
                        <p key={q.key} className="text-[13px] text-neutral-500 dark:text-neutral-400">
                          <span className="text-neutral-400 dark:text-neutral-500">{q.label} </span>
                          {r[q.key]}
                        </p>
                      )
                  )}
                </div>
              </div>
            ))}
          </div>
          {history.length > HISTORY_PREVIEW && (
            <button
              onClick={() => setShowAllHistory((v) => !v)}
              className="flex items-center gap-1 mt-4 text-[12.5px] font-medium text-accent-600 dark:text-accent-400 hover:underline"
            >
              {showAllHistory ? 'Show less' : `View all ${history.length}`}
              <ChevronDown size={13} className={`transition-transform ${showAllHistory ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      )}

      {history.length === 0 && (
        <p className="text-[12.5px] text-neutral-400 mt-5 pt-5 border-t border-black/5 dark:border-white/10">
          Keep going — your reflections build a record of what's actually working.
        </p>
      )}
    </Card>
  )
}
