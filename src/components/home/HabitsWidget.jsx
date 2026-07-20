import { useMemo, useState } from 'react'
import { Plus, Trash2, Flame, Repeat } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card, CardHeader } from '../ui/Card'
import { Button, IconButton } from '../ui/Button'
import { Input, Checkbox } from '../ui/Form'
import { EmptyState } from '../ui/Misc'
import { ProgressRing } from '../ui/ProgressRing'
import { habitStats, todayKey } from '../../lib/momentum'
import { dateKey } from '../../lib/calendarGrid'

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function currentWeekDays() {
  const days = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d)
  }
  return days
}

const WEEK_DAYS = currentWeekDays()

function WeekStrip({ dates }) {
  const set = useMemo(() => new Set(dates), [dates])
  const today = todayKey()
  return (
    <div className="flex items-center gap-1.5">
      {WEEK_DAYS.map((d) => {
        const key = dateKey(d)
        const done = set.has(key)
        const isToday = key === today
        return (
          <div key={key} className="flex flex-col items-center gap-1">
            <div
              title={key}
              className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                done ? 'bg-accent-500' : 'bg-black/[0.06] dark:bg-white/10'
              } ${isToday ? 'ring-2 ring-accent-500 ring-offset-1 ring-offset-white dark:ring-offset-neutral-900' : ''}`}
            />
            <span className="text-[10px] text-neutral-400">{DAY_LETTERS[d.getDay()]}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function HabitsWidget() {
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
    <Card id="habits" className="p-5">
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
                <div key={h.id} className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 group">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Checkbox checked={stats.doneToday} onChange={() => toggleToday(h.id)} />
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-neutral-900 dark:text-white truncate">{h.title}</p>
                      {stats.streak > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[11.5px] text-orange-500 font-medium mt-0.5">
                          <Flame size={11} fill="currentColor" /> {stats.streak} day{stats.streak === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 pl-8 sm:pl-0">
                    <WeekStrip dates={stats.dates} />
                    <ProgressRing value={stats.completionRate} size={38} strokeWidth={4} tone="green">
                      <span className="text-[10.5px] font-semibold text-neutral-700 dark:text-neutral-200">{stats.completionRate}%</span>
                    </ProgressRing>
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
