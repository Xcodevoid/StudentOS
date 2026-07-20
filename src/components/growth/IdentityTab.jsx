import { useMemo } from 'react'
import { useStore } from '../../context/StoreContext'
import { Card, CardHeader } from '../ui/Card'
import { Textarea } from '../ui/Form'
import { RadarChart } from '../northstar/RadarChart'
import { DimensionCard } from '../northstar/DimensionCard'
import { computeNorthStar, tierTone } from '../../lib/northStar'

export function IdentityTab() {
  const { data, setNorthStar } = useStore()
  const northStar = useMemo(() => computeNorthStar(data), [data])
  const overallTone = tierTone(northStar.overallScore)

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <CardHeader title="Future Identity" subtitle="In one or two sentences, who do you want to become?" />
        <Textarea
          className="mt-3"
          rows={2}
          value={data.northStar.identity}
          onChange={(e) => setNorthStar({ identity: e.target.value })}
          placeholder="e.g. A builder who uses technology to help underserved communities — someone who leads by doing, not just talking."
        />
      </Card>

      <Card className="p-6 flex flex-col lg:flex-row items-center gap-8">
        <RadarChart dimensions={northStar.dimensions} tone={overallTone} size={300} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[40px] font-semibold text-neutral-900 dark:text-white leading-none">
              {northStar.overallScore ?? '—'}
            </span>
            <div>
              <p className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400 leading-tight">Overall</p>
              <p className="text-[12px] text-neutral-400 leading-tight">{northStar.overallTier || 'Just getting started'}</p>
            </div>
          </div>
          <p className="text-[15px] font-semibold text-neutral-900 dark:text-white">How this grows</p>
          <p className="text-[13.5px] text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
            Every dimension is built from real evidence, not points you can farm. Tag a Portfolio project or activity with
            the parts of you it grows, and that dimension lights up. Discipline and follow-through — tracked in Momentum —
            feed Character. Nothing here is graded; it's just a map of where you've actually put in the work, and where
            there's still room to build.
          </p>
        </div>
      </Card>

      <div>
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-neutral-400 mb-3">Dimensions</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {northStar.dimensions.map((dim) => (
            <DimensionCard
              key={dim.id}
              dimension={dim}
              goal={data.northStar.goals[dim.id] || ''}
              onGoalChange={(value) => setNorthStar({ goals: { [dim.id]: value } })}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
