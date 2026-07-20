import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Star, TrendingUp, BookOpen } from 'lucide-react'
import { IdentityTab } from '../components/growth/IdentityTab'
import { ProgressTab } from '../components/growth/ProgressTab'
import { StoryTab } from '../components/growth/StoryTab'

const TABS = [
  { id: 'identity', label: 'Identity & Map', icon: Star },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'story', label: 'Story', icon: BookOpen },
]

export default function GrowthJourney() {
  const [searchParams] = useSearchParams()
  const requested = searchParams.get('tab')
  const [tab, setTab] = useState(TABS.some((t) => t.id === requested) ? requested : 'identity')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-neutral-900 dark:text-white">Growth Journey</h1>
        <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
          Grades measure a semester. This is who you're becoming — your identity, whether it's actually moving, and the
          story it adds up to.
        </p>
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

      {tab === 'identity' && <IdentityTab />}
      {tab === 'progress' && <ProgressTab />}
      {tab === 'story' && <StoryTab />}
    </div>
  )
}
