import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, Sparkles, Target } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { Card } from '../components/ui/Card'
import { computeGrowthSummary } from '../lib/northStar'

export default function GrowthAnalytics() {
  const { data } = useStore()

  const { deltas, mostDeveloped, growthOpportunity } = useMemo(() => computeGrowthSummary(data), [data])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-neutral-900 dark:text-white">Growth Analytics</h1>
        <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
          Not hours logged — how your North Star has actually shifted over the last 30 days.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-accent-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-neutral-400">Most developed area</p>
            {mostDeveloped ? (
              <>
                <p className="text-[17px] font-semibold text-neutral-900 dark:text-white mt-0.5">{mostDeveloped.label}</p>
                <p className="text-[13px] text-green-600 dark:text-green-400 mt-0.5">
                  +{mostDeveloped.delta} point{mostDeveloped.delta === 1 ? '' : 's'} this month
                </p>
              </>
            ) : (
              <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-0.5">Nothing to compare yet — keep building.</p>
            )}
          </div>
        </Card>

        <Card className="p-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/10 flex items-center justify-center flex-shrink-0">
            <Target size={18} className="text-neutral-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-neutral-400">Growth opportunity</p>
            {growthOpportunity ? (
              <>
                <p className="text-[17px] font-semibold text-neutral-900 dark:text-white mt-0.5">{growthOpportunity.label}</p>
                <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {growthOpportunity.hasNow ? `${growthOpportunity.score}/100 — the room to grow is here` : "Not started yet — that's the opening"}
                </p>
              </>
            ) : (
              <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-0.5">Every dimension has evidence — nice work.</p>
            )}
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-neutral-400 mb-3">This month, by dimension</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {deltas.map((d) => (
            <DeltaTile key={d.id} dimension={d} />
          ))}
        </div>
      </div>

      <p className="text-[12px] text-neutral-400 max-w-2xl">
        This compares your North Star score today against a reconstruction of it 30 days ago from the same dated evidence — it's a
        trend line, not a precise audit. Retagging an old project or activity today will also reshape how the past looks.
      </p>
    </div>
  )
}

function DeltaTile({ dimension }) {
  const Icon = dimension.icon
  const positive = dimension.delta > 0
  const negative = dimension.delta < 0
  const TrendIcon = positive ? TrendingUp : negative ? TrendingDown : Minus
  const trendColor = positive ? 'text-green-600 dark:text-green-400' : negative ? 'text-red-500' : 'text-neutral-400'

  return (
    <Card className="p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/10 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-neutral-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-medium text-neutral-800 dark:text-neutral-100">{dimension.label}</p>
        <p className="text-[12px] text-neutral-400">{dimension.hasNow ? `${dimension.score}/100 now` : 'Not started'}</p>
      </div>
      <div className={`flex items-center gap-1 text-[14px] font-semibold flex-shrink-0 ${trendColor}`}>
        <TrendIcon size={14} />
        {dimension.hasNow ? `${positive ? '+' : ''}${dimension.delta}` : '—'}
      </div>
    </Card>
  )
}
