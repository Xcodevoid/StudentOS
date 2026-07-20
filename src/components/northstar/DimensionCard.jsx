import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Card } from '../ui/Card'
import { Badge, ProgressBar } from '../ui/Misc'
import { Textarea } from '../ui/Form'
import { tierTone } from '../../lib/northStar'
import { formatDate } from '../../lib/dates'

const EVIDENCE_LINKS = {
  community: [{ to: '/portfolio?tab=activities', label: 'Log an activity' }, { to: '/portfolio?tab=projects', label: 'Log a project' }],
  leadership: [{ to: '/portfolio?tab=activities', label: 'Log an activity' }, { to: '/portfolio?tab=projects', label: 'Log a project' }],
  impact: [{ to: '/portfolio?tab=projects', label: 'Log a project' }],
  skills: [{ to: '/portfolio?tab=projects', label: 'Log a project' }],
  curiosity: [{ to: '/portfolio?tab=projects', label: 'Log a project' }],
  character: [{ to: '/', label: 'Open Home' }],
}

export function DimensionCard({ dimension, goal, onGoalChange }) {
  const Icon = dimension.icon
  const tone = tierTone(dimension.score)
  const links = EVIDENCE_LINKS[dimension.id] || []

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/10 flex items-center justify-center flex-shrink-0">
          <Icon size={18} className="text-neutral-500" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[15px] font-semibold text-neutral-900 dark:text-white">{dimension.label}</p>
            <Badge tone={tone}>{dimension.tier || 'Not started'}</Badge>
          </div>
          <p className="text-[12.5px] text-neutral-400 mt-0.5">{dimension.tagline}</p>
        </div>
        <p className="text-[20px] font-semibold text-neutral-900 dark:text-white flex-shrink-0">{dimension.score ?? '—'}</p>
      </div>

      <ProgressBar
        value={dimension.score ?? 0}
        tone={tone === 'purple' ? 'accent' : tone === 'neutral' ? 'accent' : tone}
        className="mt-4"
      />

      <div className="mt-4">
        <label className="block text-[12px] font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
          What are you aiming for here?
        </label>
        <Textarea
          value={goal}
          onChange={(e) => onGoalChange(e.target.value)}
          rows={2}
          placeholder={`e.g. ${placeholderFor(dimension.id)}`}
        />
      </div>

      <div className="mt-4">
        <p className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400 mb-2">Evidence</p>
        {dimension.evidence.length === 0 ? (
          <div className="flex flex-col items-start gap-2">
            <p className="text-[13px] text-neutral-400">Nothing logged yet — small actions count.</p>
            <div className="flex items-center gap-2 flex-wrap">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="inline-flex items-center gap-1 text-[12.5px] font-medium text-accent-600 dark:text-accent-400 hover:underline"
                >
                  <Sparkles size={12} /> {l.label}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {dimension.evidence.slice(0, 4).map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-2">
                <p className="text-[13px] text-neutral-700 dark:text-neutral-200 truncate">{e.title}</p>
                <span className="text-[11.5px] text-neutral-400 flex-shrink-0">{e.date ? formatDate(e.date) : e.source}</span>
              </div>
            ))}
            {dimension.evidence.length > 4 && (
              <p className="text-[12px] text-neutral-400">+{dimension.evidence.length - 4} more</p>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

function placeholderFor(id) {
  const examples = {
    community: 'Start a peer tutoring program at my school',
    leadership: 'Lead a team of 5+ on a real project',
    impact: 'Ship something 100+ people actually use',
    skills: 'Get comfortable building full-stack apps solo',
    curiosity: 'Finish an independent research project',
    character: 'Show up consistently, even on hard days',
  }
  return examples[id] || 'What does growth look like here?'
}
