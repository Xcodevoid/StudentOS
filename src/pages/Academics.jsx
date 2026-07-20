import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookOpen, ListChecks, GraduationCap, CalendarDays } from 'lucide-react'
import { ClassesTab } from '../components/academics/ClassesTab'
import { AssignmentsTab } from '../components/academics/AssignmentsTab'
import { ExamsTab } from '../components/academics/ExamsTab'
import { CalendarTab } from '../components/academics/CalendarTab'

const TABS = [
  { id: 'classes', label: 'Classes & GPA', icon: BookOpen },
  { id: 'assignments', label: 'Assignments', icon: ListChecks },
  { id: 'exams', label: 'Exams', icon: GraduationCap },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
]

export default function Academics() {
  const [searchParams] = useSearchParams()
  const requested = searchParams.get('tab')
  const [tab, setTab] = useState(TABS.some((t) => t.id === requested) ? requested : 'classes')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-neutral-900 dark:text-white">Academics</h1>
        <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-1">Classes, grades, assignments, exams, and your schedule — one system of record.</p>
      </div>

      <div className="inline-flex flex-wrap gap-1 p-1 rounded-full bg-black/[0.05] dark:bg-white/10">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
              tab === t.id ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'classes' && <ClassesTab />}
      {tab === 'assignments' && <AssignmentsTab />}
      {tab === 'exams' && <ExamsTab />}
      {tab === 'calendar' && <CalendarTab />}
    </div>
  )
}
