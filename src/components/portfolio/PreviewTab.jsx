import { useMemo } from 'react'
import { Eye, Printer, ExternalLink } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge, EmptyState } from '../ui/Misc'
import { formatDate } from '../../lib/dates'
import { TYPES } from './ProjectsTab'

export function PreviewTab() {
  const { data } = useStore()
  const sorted = useMemo(() => {
    const list = [...data.projects]
    list.sort((a, b) => (b.featured - a.featured) || (new Date(b.date || 0) - new Date(a.date || 0)))
    return list
  }, [data.projects])

  if (data.projects.length === 0) {
    return (
      <Card className="p-5">
        <EmptyState icon={Eye} title="Nothing to preview yet" description="Add entries in the Projects tab and they'll appear here as a shareable portfolio." />
      </Card>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-3 no-print">
        <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
          Print / Save as PDF
        </Button>
      </div>
      <Card className="p-6 sm:p-10" id="portfolio-print">
        <div className="text-center border-b border-black/5 dark:border-white/10 pb-6 mb-6">
          <h2 className="text-[28px] font-semibold tracking-tight text-neutral-900 dark:text-white">{data.profile.name || 'Your Name'}</h2>
          <p className="text-[13.5px] text-neutral-400 mt-1">
            {[data.profile.gradeLevel, data.profile.school].filter(Boolean).join(' · ')}
          </p>
          {data.profile.bio && <p className="text-[14px] text-neutral-600 dark:text-neutral-300 mt-3 max-w-xl mx-auto leading-relaxed">{data.profile.bio}</p>}
        </div>

        <div className="space-y-5">
          {sorted.map((p) => {
            const T = TYPES[p.type] || TYPES.project
            return (
              <div key={p.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                  <T.icon size={17} className="text-neutral-500" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white">{p.title}</h3>
                    <span className="text-[12px] text-neutral-400 flex-shrink-0">{p.date ? formatDate(p.date) : ''}</span>
                  </div>
                  <p className="text-[12.5px] text-neutral-400 mt-0.5">
                    {[T.label, p.role].filter(Boolean).join(' · ')}
                  </p>
                  {p.description && <p className="text-[13.5px] text-neutral-600 dark:text-neutral-300 mt-1.5 leading-relaxed">{p.description}</p>}
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    {(p.tags || []).map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12px] text-accent-600 dark:text-accent-400 hover:underline">
                        <ExternalLink size={11} /> View
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
