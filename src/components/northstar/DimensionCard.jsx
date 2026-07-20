import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Card } from '../ui/Card'
import { Textarea } from '../ui/Form'
import { formatDate } from '../../lib/dates'

const DEFAULT_LINKS = [{ to: '/portfolio?tab=activities', label: 'Log an activity' }, { to: '/portfolio?tab=projects', label: 'Log a project' }]

const EVIDENCE_LINKS = {
  impact: [{ to: '/portfolio?tab=projects', label: 'Log a project' }],
  skills: [{ to: '/portfolio?tab=projects', label: 'Log a project' }],
  curiosity: [{ to: '/portfolio?tab=projects', label: 'Log a project' }],
  character: [{ to: '/', label: 'Open Home' }],
}

export function DimensionCard({ dimension, goal, onGoalChange }) {
  const Icon = dimension.icon
  const links = EVIDENCE_LINKS[dimension.id] || DEFAULT_LINKS
  const count = dimension.evidenceCount ?? dimension.evidence.length

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/10 flex items-center justify-center flex-shrink-0">
          <Icon size={18} className="text-neutral-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-neutral-900 dark:text-white">{dimension.label}</p>
          <p className="text-[12.5px] text-neutral-400 mt-0.5">{dimension.tagline}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[20px] font-semibold text-neutral-900 dark:text-white leading-none">{count}</p>
          <p className="text-[10.5px] text-neutral-400 mt-1">evidence</p>
        </div>
      </div>

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
    communicator: 'Give a talk or presentation that actually lands',
    analytical: 'Solve a genuinely hard problem, start to finish',
    creative: 'Make something you\'re proud to put your name on',
    strategic: 'Plan and pull off something with a lot of moving parts',
    collaborator: 'Be the reason a team actually works well together',
    independent: 'Start something nobody asked you to start',
    competitive: 'Compete at the highest level you can find',
    innovator: 'Try an idea nobody else on your team thought of',
  }
  return examples[id] || 'What does growth look like here?'
}
