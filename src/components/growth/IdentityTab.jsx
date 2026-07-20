import { useMemo } from 'react'
import { Sparkles } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card, CardHeader } from '../ui/Card'
import { Textarea } from '../ui/Form'
import { RadarChart } from '../northstar/RadarChart'
import { DimensionCard } from '../northstar/DimensionCard'
import { DiscoveryQuiz } from './DiscoveryQuiz'
import { computeNorthStar } from '../../lib/northStar'

export function IdentityTab() {
  const { data, setNorthStar } = useStore()
  const northStar = useMemo(() => computeNorthStar(data), [data])
  const chosenIds = useMemo(() => data.northStar.characteristics || [], [data.northStar.characteristics])
  const chosen = useMemo(() => northStar.dimensions.filter((d) => chosenIds.includes(d.id)), [northStar.dimensions, chosenIds])
  const totalEvidence = useMemo(() => chosen.reduce((sum, d) => sum + d.evidenceCount, 0), [chosen])

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

      {chosen.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-accent-500/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={22} className="text-accent-500" strokeWidth={1.75} />
          </div>
          <p className="text-[16px] font-semibold text-neutral-900 dark:text-white">Find your characteristics</p>
          <p className="text-[13.5px] text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-md mx-auto leading-relaxed">
            Not a universal rubric everyone gets scored on — pick what actually represents you. A short quiz can suggest a
            starting set (plus a direction worth exploring), or skip straight to picking your own.
          </p>
          <div className="mt-5 flex justify-center">
            <DiscoveryQuiz />
          </div>
        </Card>
      ) : (
        <>
          <Card className="p-6 flex flex-col lg:flex-row items-center gap-8">
            <RadarChart dimensions={chosen} tone="accent" size={300} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2.5 mb-3">
                <span className="text-[40px] font-semibold text-neutral-900 dark:text-white leading-none">{totalEvidence}</span>
                <div>
                  <p className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400 leading-tight">Pieces of evidence</p>
                  <p className="text-[12px] text-neutral-400 leading-tight">across {chosen.length} characteristic{chosen.length === 1 ? '' : 's'}</p>
                </div>
              </div>
              <p className="text-[15px] font-semibold text-neutral-900 dark:text-white">How this grows</p>
              <p className="text-[13.5px] text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                Every characteristic is built from real evidence, not points you can farm. Tag a Portfolio project or
                activity with the parts of you it grows, and it lights up here. Nothing here is graded — it's just a map
                of where you've actually put in the work, and where there's still room to build.
              </p>
              <div className="mt-4">
                <DiscoveryQuiz triggerLabel="Retake the Quiz" variant="secondary" size="sm" />
              </div>
            </div>
          </Card>

          {data.northStar.directions?.length > 0 && (
            <Card className="p-5">
              <CardHeader title="Directions Worth Exploring" subtitle="From your last Discovery Quiz — majors and fields that fit how you answered." />
              <div className="mt-3 flex flex-wrap gap-2">
                {data.northStar.directions.map((d) => (
                  <span key={d.id} className="inline-flex items-center px-3 py-1.5 rounded-full text-[12.5px] font-medium bg-accent-500/10 text-accent-700 dark:text-accent-400">
                    {d.label}
                  </span>
                ))}
              </div>
            </Card>
          )}

          <div>
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-neutral-400 mb-3">Your Characteristics</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {chosen.map((dim) => (
                <DimensionCard
                  key={dim.id}
                  dimension={dim}
                  goal={data.northStar.goals[dim.id] || ''}
                  onGoalChange={(value) => setNorthStar({ goals: { [dim.id]: value } })}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
