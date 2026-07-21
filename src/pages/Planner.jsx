import { useState } from 'react'
import { CalendarRange, Repeat } from 'lucide-react'
import { WeekView } from '../components/planner/WeekView'
import { RoutinesView } from '../components/planner/RoutinesView'

const TABS = [
  { id: 'week', label: 'Week', icon: CalendarRange },
  { id: 'routines', label: 'Routine', icon: Repeat },
]

export default function Planner() {
  const [tab, setTab] = useState('week')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-neutral-900 dark:text-white">Planner</h1>
        <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-1">
          Plan every block of your day — sleep, meals, study, breaks — and get a nudge when each one starts.
        </p>
      </div>

      <div className="inline-flex p-1 rounded-full bg-black/[0.05] dark:bg-white/10">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13.5px] font-medium transition-colors ${
              tab === t.id ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500'
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'week' && <WeekView />}
      {tab === 'routines' && <RoutinesView />}
    </div>
  )
}
