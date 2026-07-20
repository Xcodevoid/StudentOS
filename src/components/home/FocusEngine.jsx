import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Target, Sparkles } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { computeFocusSignals } from '../../lib/focusEngine'
import { todayKey } from '../../lib/momentum'

const DOMAIN_LABEL = { 'test-prep': 'Test Prep', recommenders: 'Recommenders', opportunities: 'Opportunity' }

export default function FocusEngine() {
  const { data, addItem } = useStore()
  const signals = useMemo(() => computeFocusSignals(data).slice(0, 3), [data])

  function addToToday(signal) {
    addItem('commitments', {
      title: signal.title,
      why: signal.detail,
      estimatedMinutes: '',
      deadline: '',
      date: todayKey(),
      done: false,
    })
  }

  return (
    <Card className="p-5">
      <CardHeader title="Focus" subtitle="Your highest-leverage gap across the whole application, not just one tab." />
      <div className="mt-4">
        {signals.length === 0 ? (
          <div className="flex items-center gap-2.5 py-3">
            <Sparkles size={16} className="text-accent-500 flex-shrink-0" />
            <p className="text-[13.5px] text-neutral-500 dark:text-neutral-400">Nothing urgent right now — you're on track.</p>
          </div>
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/10">
            {signals.map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-2.5">
                <Target size={15} className="text-amber-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <Link to={s.path} className="text-[13.5px] font-medium text-neutral-900 dark:text-white hover:underline">
                    {s.title}
                  </Link>
                  <p className="text-[12px] text-neutral-400 mt-0.5">{DOMAIN_LABEL[s.domain]} — {s.detail}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => addToToday(s)} className="flex-shrink-0">
                  Add to Today
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
