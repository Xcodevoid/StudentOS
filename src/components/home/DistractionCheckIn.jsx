import { useMemo, useState } from 'react'
import { ShieldCheck, ShieldAlert } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card, CardHeader } from '../ui/Card'
import { Input } from '../ui/Form'
import { todayKey } from '../../lib/momentum'
import { dateKey } from '../../lib/calendarGrid'

function last7Days() {
  const days = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d)
  }
  return days
}

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function DistractionCheckIn() {
  const { data, addItem, updateItem, recordActivityToday } = useStore()
  const today = todayKey()

  const todaysCheckIn = useMemo(
    () => data.distractions.find((d) => d.date === today && typeof d.stayedFocused === 'boolean'),
    [data.distractions, today]
  )
  const [note, setNote] = useState(todaysCheckIn?.note || '')

  function checkIn(stayedFocused) {
    if (todaysCheckIn) {
      updateItem('distractions', todaysCheckIn.id, { stayedFocused })
    } else {
      recordActivityToday()
      addItem('distractions', { stayedFocused, note: '', date: today, description: '', minutesLost: 0, time: '' })
    }
  }

  function saveNote() {
    if (todaysCheckIn) updateItem('distractions', todaysCheckIn.id, { note })
  }

  const byDate = useMemo(() => {
    const map = {}
    data.distractions.forEach((d) => {
      if (typeof d.stayedFocused === 'boolean') map[d.date] = d.stayedFocused
    })
    return map
  }, [data.distractions])

  return (
    <Card id="aware" className="p-5 h-full flex flex-col">
      <CardHeader title="Focus Check-In" subtitle="One honest question, once a day." />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => checkIn(true)}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[13.5px] font-medium transition-colors ${
            todaysCheckIn?.stayedFocused === true
              ? 'bg-green-500 text-white'
              : 'bg-black/[0.05] text-neutral-600 hover:bg-black/[0.08] dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/15'
          }`}
        >
          <ShieldCheck size={15} /> Stayed focused
        </button>
        <button
          onClick={() => checkIn(false)}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[13.5px] font-medium transition-colors ${
            todaysCheckIn?.stayedFocused === false
              ? 'bg-amber-500 text-white'
              : 'bg-black/[0.05] text-neutral-600 hover:bg-black/[0.08] dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/15'
          }`}
        >
          <ShieldAlert size={15} /> Got distracted
        </button>
      </div>

      {todaysCheckIn && (
        <Input
          className="mt-3"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={saveNote}
          placeholder="Optional — what pulled you away, or what kept you on track?"
        />
      )}

      <div className="mt-auto pt-5 flex items-center justify-between">
        {last7Days().map((d) => {
          const key = dateKey(d)
          const val = byDate[key]
          const isToday = key === today
          return (
            <div key={key} className="flex flex-col items-center gap-1">
              <div
                title={key}
                className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  val === true
                    ? 'bg-green-500'
                    : val === false
                    ? 'bg-amber-500'
                    : 'bg-black/[0.06] dark:bg-white/10'
                } ${isToday ? 'ring-2 ring-accent-500 ring-offset-1 ring-offset-white dark:ring-offset-neutral-900' : ''}`}
              />
              <span className="text-[10px] text-neutral-400">{DAY_LETTERS[d.getDay()]}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
