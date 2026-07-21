import { useMemo, useState } from 'react'
import { ExternalLink, Plus, Landmark, Compass, RotateCcw } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { useToast } from '../../context/ToastContext'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Form'
import { Badge, EmptyState } from '../ui/Misc'
import { REGIONS, UNIVERSITIES, recommendUniversities } from '../../lib/universities'
import MajorFitQuiz, { MajorFitResultSummary } from './MajorFitQuiz'

export default function UniversitiesView() {
  const { data, addItem } = useStore()
  const { push } = useToast()
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('All')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return UNIVERSITIES.filter((u) => {
      if (region !== 'All' && u.region !== region) return false
      if (!q) return true
      return (
        u.name.toLowerCase().includes(q) ||
        u.id.replace(/-/g, '').includes(q) ||
        u.country.toLowerCase().includes(q) ||
        u.notableFor.some((n) => n.toLowerCase().includes(q))
      )
    })
  }, [query, region])

  const recommended = useMemo(
    () => (data.majorFit.completedAt ? recommendUniversities(data.majorFit.topMajors, 6) : []),
    [data.majorFit]
  )

  function addToOpportunities(u) {
    addItem('opportunities', {
      title: `${u.name} — Application`,
      schoolName: u.name,
      date: '',
      category: 'college-application',
      applicationRound: '',
      status: 'not-started',
      notes: '',
      checklist: [],
    })
    push(`Added ${u.name} to Opportunities`, { tone: 'success' })
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        {data.majorFit.completedAt ? (
          <>
            <CardHeader
              title="Your Major Fit"
              subtitle="Not sure this still feels right? Retake it any time — nothing here is permanent."
              action={<MajorFitQuiz triggerLabel="Retake quiz" variant="ghost" size="sm" />}
            />
            <div className="mt-4">
              <MajorFitResultSummary result={data.majorFit} />
            </div>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-accent-50 dark:bg-accent-500/15 flex items-center justify-center flex-shrink-0">
              <Compass size={20} className="text-accent-600 dark:text-accent-400" />
            </div>
            <div className="flex-1">
              <p className="text-[14.5px] font-semibold text-neutral-900 dark:text-white">Not sure where to start?</p>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                A 2-minute diagnostic that sorts STEM vs. non-STEM affinity, points to specific majors worth exploring, and recommends schools strong in them.
              </p>
            </div>
            <MajorFitQuiz />
          </div>
        )}
      </Card>

      {recommended.length > 0 && (
        <Card className="p-5">
          <CardHeader title="Recommended For You" subtitle="Matched to the majors from your Major Fit results." />
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            {recommended.map((u) => (
              <UniversityCard key={u.id} u={u} onAdd={() => addToOpportunities(u)} />
            ))}
          </div>
        </Card>
      )}

      <Card className="p-5">
        <CardHeader
          title="Universities"
          subtitle="A curated starting point, not a ranking engine — research each school further before you decide."
        />
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Input
            className="sm:flex-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, country, or major…"
          />
          <div className="inline-flex flex-wrap gap-1 p-1 rounded-full bg-black/[0.05] dark:bg-white/10">
            {['All', ...REGIONS].map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                  region === r ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <p className="text-[12px] text-neutral-400 mt-3">{results.length} of {UNIVERSITIES.length} universities</p>
      </Card>

      {results.length === 0 ? (
        <Card className="p-5">
          <EmptyState icon={Landmark} title="No matches" description="Try a different search term or region." action={<Button size="sm" variant="secondary" icon={RotateCcw} onClick={() => { setQuery(''); setRegion('All') }}>Clear filters</Button>} />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {results.map((u) => (
            <UniversityCard key={u.id} u={u} onAdd={() => addToOpportunities(u)} />
          ))}
        </div>
      )}
    </div>
  )
}

function UniversityCard({ u, onAdd }) {
  return (
    <Card className="p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14.5px] font-semibold text-neutral-900 dark:text-white">{u.name}</p>
          <p className="text-[12.5px] text-neutral-400 mt-0.5">{u.city}, {u.country}</p>
        </div>
        <Badge tone="accent" className="flex-shrink-0">{u.region}</Badge>
      </div>

      <div className="flex items-center gap-1.5 mt-2 text-[11.5px] text-neutral-400">
        <span>{u.type}</span>
        <span>·</span>
        <span>{u.size}</span>
        <span>·</span>
        <span>{u.setting}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {u.notableFor.map((n) => (
          <Badge key={n} tone="neutral">{n}</Badge>
        ))}
      </div>

      <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-3 leading-relaxed flex-1">{u.values}</p>

      <div className="mt-4 flex items-center gap-2">
        <Button as="a" href={u.website} target="_blank" rel="noreferrer" variant="ghost" size="sm" icon={ExternalLink}>
          Visit site
        </Button>
        <Button variant="secondary" size="sm" icon={Plus} onClick={onAdd}>
          Add to Opportunities
        </Button>
      </div>
    </Card>
  )
}
