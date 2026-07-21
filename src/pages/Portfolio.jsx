import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Sparkles, Users, FolderOpen, Eye, Trophy } from 'lucide-react'
import { ProjectsTab } from '../components/portfolio/ProjectsTab'
import { ActivitiesTab } from '../components/portfolio/ActivitiesTab'
import { AwardsTab } from '../components/portfolio/AwardsTab'
import { EvidenceTab } from '../components/portfolio/EvidenceTab'
import { PreviewTab } from '../components/portfolio/PreviewTab'

const TABS = [
  { id: 'projects', label: 'Projects', icon: Sparkles },
  { id: 'activities', label: 'Activities', icon: Users },
  { id: 'awards', label: 'Awards', icon: Trophy },
  { id: 'evidence', label: 'Evidence', icon: FolderOpen },
  { id: 'preview', label: 'Preview', icon: Eye },
]

export default function Portfolio() {
  const [searchParams] = useSearchParams()
  const requested = searchParams.get('tab')
  const [tab, setTab] = useState(TABS.some((t) => t.id === requested) ? requested : 'projects')

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-neutral-900 dark:text-white">Portfolio</h1>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-1">
            Log your work once — projects, activities, honors, and the evidence that proves it — and get a shareable portfolio for free.
          </p>
        </div>
        <div className="inline-flex flex-wrap p-1 rounded-full bg-black/[0.05] dark:bg-white/10 flex-shrink-0">
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
      </div>

      {tab === 'projects' && <ProjectsTab />}
      {tab === 'activities' && <ActivitiesTab />}
      {tab === 'awards' && <AwardsTab />}
      {tab === 'evidence' && <EvidenceTab />}
      {tab === 'preview' && <PreviewTab />}
    </div>
  )
}
