import { useMemo, useState } from 'react'
import { ExternalLink, Plus, Landmark } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { useToast } from '../../context/ToastContext'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Form'
import { Badge, EmptyState } from '../ui/Misc'
import { REGIONS, UNIVERSITIES } from '../../lib/universities'

export default function UniversitiesView() {
  const { addItem } = useStore()
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
      </Card>

      {results.length === 0 ? (
        <Card className="p-5">
          <EmptyState icon={Landmark} title="No matches" description="Try a different search term or region." />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {results.map((u) => (
            <Card key={u.id} className="p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold text-neutral-900 dark:text-white">{u.name}</p>
                  <p className="text-[12.5px] text-neutral-400 mt-0.5">{u.city}, {u.country}</p>
                </div>
                <Badge tone="accent" className="flex-shrink-0">{u.region}</Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {u.notableFor.map((n) => (
                  <Badge key={n} tone="neutral">{n}</Badge>
                ))}
              </div>

              <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-3 leading-relaxed flex-1">{u.values}</p>

              <div className="mt-4 flex items-center gap-2">
                <Button
                  as="a"
                  href={u.website}
                  target="_blank"
                  rel="noreferrer"
                  variant="ghost"
                  size="sm"
                  icon={ExternalLink}
                >
                  Visit site
                </Button>
                <Button variant="secondary" size="sm" icon={Plus} onClick={() => addToOpportunities(u)}>
                  Add to Opportunities
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
