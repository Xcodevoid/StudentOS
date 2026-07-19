import { useMemo, useState } from 'react'
import { Plus, Trash2, Smartphone, Lightbulb } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Field, Input } from '../ui/Form'
import { EmptyState } from '../ui/Misc'
import { distractionInsight, lastNDays, todayKey } from '../../lib/momentum'
import { formatDate, sortByDateAsc } from '../../lib/dates'

function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const emptyDistraction = { description: '', minutesLost: '', time: nowTime() }

export default function DistractionsSection() {
  const { data, addItem, removeItem } = useStore()
  const [form, setForm] = useState(emptyDistraction)

  const insight = useMemo(() => distractionInsight(data.distractions), [data.distractions])
  const recent = useMemo(() => {
    const window = lastNDays(14)
    return sortByDateAsc(data.distractions.filter((d) => window.includes(d.date)), 'date').reverse()
  }, [data.distractions])

  function save(e) {
    e.preventDefault()
    if (!form.description.trim()) return
    addItem('distractions', {
      description: form.description.trim(),
      minutesLost: form.minutesLost === '' ? 0 : Number(form.minutesLost),
      time: form.time,
      date: todayKey(),
    })
    setForm({ ...emptyDistraction, time: nowTime() })
  }

  return (
    <div className="space-y-6">
      {insight && (
        <Card className="p-5 flex items-start gap-3 bg-amber-50/50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <Lightbulb size={16} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">This Week</p>
            <p className="text-[14px] text-neutral-700 dark:text-neutral-200 mt-0.5">{insight.sentence}</p>
          </div>
        </Card>
      )}

      <Card className="p-5">
        <CardHeader title="Log a Distraction" subtitle="The moment it happens, not later — memory is unreliable." />
        <form onSubmit={save} className="mt-4 space-y-3">
          <Field label="What pulled you away?">
            <Input value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="e.g. Phone notification, Instagram" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Minutes lost">
              <Input type="number" min="0" value={form.minutesLost} onChange={(e) => setForm((prev) => ({ ...prev, minutesLost: e.target.value }))} placeholder="10" />
            </Field>
            <Field label="Time">
              <Input type="time" value={form.time} onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))} />
            </Field>
          </div>
          <Button type="submit" icon={Plus}>Log it</Button>
        </form>
      </Card>

      <Card className="p-5">
        <CardHeader title="Recent" subtitle="Last 14 days" />
        <div className="mt-4">
          {recent.length === 0 ? (
            <EmptyState icon={Smartphone} title="Nothing logged yet" description="Track what pulls your focus to see patterns build up." />
          ) : (
            <div className="divide-y divide-black/5 dark:divide-white/10">
              {recent.map((d) => (
                <div key={d.id} className="flex items-center gap-3 py-2.5 group">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-medium text-neutral-800 dark:text-neutral-100">{d.description}</p>
                    <p className="text-[12px] text-neutral-400">
                      {formatDate(d.date)} {d.time && `· ${d.time}`} {d.minutesLost ? `· ${d.minutesLost} min lost` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem('distractions', d.id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-opacity flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
