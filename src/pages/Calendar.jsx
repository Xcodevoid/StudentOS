import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Checkbox } from '../components/ui/Form'
import { Badge, EmptyState } from '../components/ui/Misc'
import { buildMonthGrid, dateKey, WEEKDAY_LABELS } from '../lib/calendarGrid'
import { formatDate } from '../lib/dates'

const KIND_STYLE = {
  assignment: { dot: 'bg-accent-500', tone: 'accent', label: 'Assignment' },
  exam: { dot: 'bg-purple-500', tone: 'purple', label: 'Exam' },
  deadline: { dot: 'bg-amber-500', tone: 'amber', label: 'Deadline' },
}

export default function CalendarPage() {
  const { data, updateItem } = useStore()
  const today = new Date()
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selected, setSelected] = useState(today)

  const eventsByDate = useMemo(() => {
    const map = new Map()
    const push = (dateStr, entry) => {
      if (!dateStr) return
      const key = dateKey(dateStr)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(entry)
    }
    data.assignments.forEach((a) => push(a.dueDate, { id: a.id, kind: 'assignment', title: a.title, done: a.status === 'done' }))
    data.exams.forEach((e) => push(e.date, { id: e.id, kind: 'exam', title: e.name }))
    data.deadlines.forEach((d) => push(d.date, { id: d.id, kind: 'deadline', title: d.title, done: d.status === 'submitted' }))
    return map
  }, [data.assignments, data.exams, data.deadlines])

  const days = useMemo(() => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor])
  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const selectedEvents = selected ? eventsByDate.get(dateKey(selected)) || [] : []

  function changeMonth(delta) {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1))
  }
  function goToday() {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelected(today)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-neutral-900 dark:text-white">Calendar</h1>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-1">Assignments, exams, and deadlines in one view.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {Object.values(KIND_STYLE).map((s) => (
            <span key={s.label} className="flex items-center gap-1.5 text-[12px] text-neutral-500">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[16px] font-semibold text-neutral-900 dark:text-white">{monthLabel}</p>
          <div className="flex items-center gap-1.5">
            <Button variant="secondary" size="sm" onClick={goToday}>Today</Button>
            <div className="flex items-center gap-0.5">
              <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:bg-black/[0.05] dark:hover:bg-white/10">
                <ChevronLeft size={17} />
              </button>
              <button onClick={() => changeMonth(1)} className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:bg-black/[0.05] dark:hover:bg-white/10">
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAY_LABELS.map((w) => (
            <div key={w} className="text-center text-[11px] font-semibold text-neutral-400 py-1">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const inMonth = d.getMonth() === cursor.getMonth()
            const isToday = dateKey(d) === dateKey(today)
            const isSelected = selected && dateKey(d) === dateKey(selected)
            const events = eventsByDate.get(dateKey(d)) || []
            return (
              <button
                key={dateKey(d)}
                onClick={() => setSelected(d)}
                className={`relative aspect-square sm:aspect-[4/3] rounded-xl p-1 sm:p-1.5 flex flex-col items-center sm:items-start text-left transition-colors ${
                  isSelected ? 'bg-accent-500/10 ring-1 ring-accent-500' : 'hover:bg-black/[0.04] dark:hover:bg-white/5'
                }`}
              >
                <span
                  className={`text-[11.5px] sm:text-[12.5px] font-medium w-5 h-5 sm:w-auto sm:h-auto flex items-center justify-center rounded-full ${
                    isToday ? 'bg-accent-500 text-white' : inMonth ? 'text-neutral-700 dark:text-neutral-200' : 'text-neutral-300 dark:text-neutral-600'
                  }`}
                >
                  {d.getDate()}
                </span>
                <div className="flex flex-wrap gap-0.5 mt-1 justify-center sm:justify-start">
                  {events.slice(0, 3).map((e) => (
                    <span key={e.id} className={`w-1.5 h-1.5 rounded-full ${KIND_STYLE[e.kind].dot} ${e.done ? 'opacity-30' : ''}`} />
                  ))}
                  {events.length > 3 && <span className="text-[9px] text-neutral-400">+{events.length - 3}</span>}
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-[14px] font-semibold text-neutral-900 dark:text-white">
          {selected ? formatDate(selected, { weekday: 'long' }) : 'Select a day'}
        </p>
        <div className="mt-3">
          {selectedEvents.length === 0 ? (
            <EmptyState icon={CalendarDays} title="Nothing scheduled" description="No assignments, exams, or deadlines this day." />
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((e) => (
                <div key={`${e.kind}-${e.id}`} className="flex items-center gap-3 py-1.5">
                  {e.kind === 'assignment' ? (
                    <Checkbox checked={e.done} onChange={() => updateItem('assignments', e.id, { status: e.done ? 'todo' : 'done' })} />
                  ) : (
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${KIND_STYLE[e.kind].dot}`} />
                  )}
                  <span className={`flex-1 text-[14px] ${e.done ? 'line-through text-neutral-400' : 'text-neutral-800 dark:text-neutral-100'}`}>
                    {e.title}
                  </span>
                  <Badge tone={KIND_STYLE[e.kind].tone}>{KIND_STYLE[e.kind].label}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
