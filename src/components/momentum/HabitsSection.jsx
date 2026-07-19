import { useMemo, useState } from 'react'
import { Plus, Trash2, Flame, Repeat } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card, CardHeader } from '../ui/Card'
import { Button, IconButton } from '../ui/Button'
import { Input, Checkbox } from '../ui/Form'
import { EmptyState } from '../ui/Misc'
import { habitStats, todayKey } from '../../lib/momentum'
import { dateKey } from '../../lib/calendarGrid'

const HEATMAP_WEEKS = 10

function buildHeatmapDays() {
  const days = []
  const today = new Date()
  for (let i = HEATMAP_WEEKS * 7 - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d)
  }
  return days
}

const HEATMAP_DAYS = buildHeatmapDays()

function HabitHeatmap({ dates }) {
  const set = useMemo(() => new Set(dates), [dates])
  const today = todayKey()
  return (
    <div className="grid grid-rows-7 grid-flow-col gap-[3px] w-fit">
      {HEATMAP_DAYS.map((d) => {
        const key = dateKey(d)
        const done = set.has(key)
        const isToday = key === today
        return (
          <div
            key={key}
            title={key}
            className={`w-[9px] h-[9px] rounded-[2px] ${done ? 'bg-accent-500' : 'bg-black/[0.06] dark:bg-white/10'} ${
              isToday ? 'ring-1 ring-accent-500 ring-offset-1 ring-offset-white dark:ring-offset-neutral-900' : ''
            }`}
          />
        )
      })}
    </div>
  )
}

export default function HabitsSection() {
  const { data, addItem, removeItem } = useStore()
  const [newHabit, setNewHabit] = useState('')

  function addHabit(e) {
    e.preventDefault()
    if (!newHabit.trim()) return
    addItem('habits', { title: newHabit.trim(), archived: false })
    setNewHabit('')
  }

  function toggleToday(habitId) {
    const today = todayKey()
    const existing = data.habitLogs.find((l) => l.habitId === habitId && l.date === today)
    if (existing) removeItem('habitLogs', existing.id)
    else addItem('habitLogs', { habitId, date: today })
  }

  function deleteHabit(habitId) {
    removeItem('habits', habitId)
    data.habitLogs.filter((l) => l.habitId === habitId).forEach((l) => removeItem('habitLogs', l.id))
  }

  const activeHabits = data.habits.filter((h) => !h.archived)

  return (
    <Card className="p-5">
      <CardHeader title="Habits" subtitle="Small, repeatable actions. Consistency compounds." />
      <form onSubmit={addHabit} className="flex gap-2 mt-4">
        <Input value={newHabit} onChange={(e) => setNewHabit(e.target.value)} placeholder="e.g. Read 20 minutes" />
        <Button type="submit" icon={Plus} aria-label="Add habit" />
      </form>

      <div className="mt-5">
        {activeHabits.length === 0 ? (
          <EmptyState icon={Repeat} title="No habits yet" description="Add something small you want to do every day." />
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/10">
            {activeHabits.map((h) => {
              const stats = habitStats(data.habitLogs, h.id)
              return (
                <div key={h.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 group">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Checkbox checked={stats.doneToday} onChange={() => toggleToday(h.id)} />
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-neutral-900 dark:text-white truncate">{h.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {stats.streak > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[11.5px] text-orange-500 font-medium">
                            <Flame size={11} fill="currentColor" /> {stats.streak}d
                          </span>
                        )}
                        <span className="text-[11.5px] text-neutral-400">{stats.completionRate}% last 30d</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <HabitHeatmap dates={stats.dates} />
                    <IconButton icon={Trash2} onClick={() => deleteHabit(h.id)} className="opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
