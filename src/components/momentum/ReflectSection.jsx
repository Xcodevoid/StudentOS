import { useMemo, useState, useEffect } from 'react'
import { Moon, Check } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Field, Textarea } from '../ui/Form'
import { EmptyState } from '../ui/Misc'
import { todayKey } from '../../lib/momentum'
import { formatDate, sortByDateAsc } from '../../lib/dates'

const QUESTIONS = [
  { key: 'accomplished', label: 'What did you accomplish today?' },
  { key: 'blocked', label: 'What prevented you from achieving your goals?' },
  { key: 'improve', label: 'What will you improve tomorrow?' },
]

export default function ReflectSection() {
  const { data, addItem, updateItem, recordActivityToday } = useStore()
  const today = todayKey()
  const todaysReflection = useMemo(() => data.reflections.find((r) => r.date === today), [data.reflections, today])

  const [form, setForm] = useState({ accomplished: '', blocked: '', improve: '' })
  const [saved, setSaved] = useState(false)

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
    () => sortByDateAsc(data.reflections.filter((r) => r.date !== today)).reverse().slice(0, 14),
    [data.reflections, today]
  )

  return (
    <div className="space-y-6">
      <Card className="p-5">
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
      </Card>

      <Card className="p-5">
        <CardHeader title="Past Reflections" />
        <div className="mt-4">
          {history.length === 0 ? (
            <EmptyState icon={Moon} title="No history yet" description="Your reflections build a record of what's actually working." />
          ) : (
            <div className="space-y-4 divide-y divide-black/5 dark:divide-white/10">
              {history.map((r) => (
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
          )}
        </div>
      </Card>
    </div>
  )
}
