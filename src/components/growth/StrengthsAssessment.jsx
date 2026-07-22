import { useState } from 'react'
import { Sparkles, Check } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { RATING_SCALE, scoreAssessment, isComplete } from '../../lib/strengthsAssessment'
import { CHARACTERISTICS, CATEGORIES, DIRECTIONS } from '../../lib/northStar'
import { StrengthsProfileChart } from '../northstar/StrengthsProfileChart'

export function StrengthsAssessment({ triggerLabel = 'Take the Strengths Assessment', variant = 'primary', size = 'md' }) {
  const { data, setNorthStar } = useStore()
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState('assessment') // 'assessment' | 'picker' | 'results'
  const [ratings, setRatings] = useState({})
  const [result, setResult] = useState(null)
  const [tracked, setTracked] = useState([])

  function openAssessment() {
    setStage('assessment')
    setRatings({})
    setOpen(true)
  }
  function openPicker() {
    setStage('picker')
    setTracked(data.northStar.characteristics || [])
    setOpen(true)
  }
  function rate(id, value) {
    setRatings((prev) => ({ ...prev, [id]: value }))
  }
  function seeResults() {
    const r = scoreAssessment(ratings)
    setResult(r)
    setTracked(r.topAdvantages)
    setStage('results')
  }
  function toggleTracked(id) {
    setTracked((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }
  function save() {
    setNorthStar({ characteristics: tracked, directions: result.directions, traitScores: result.traitScores })
    setOpen(false)
  }
  function saveFromPicker() {
    setNorthStar({ characteristics: tracked, directions: [] })
    setOpen(false)
  }

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant={variant} size={size} icon={Sparkles} onClick={openAssessment}>
          {triggerLabel}
        </Button>
        <Button variant="ghost" size={size} onClick={openPicker}>
          Skip — pick my own
        </Button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={stage === 'results' ? 'Your Strengths Profile' : stage === 'picker' ? 'Pick Your Characteristics' : 'Strengths Assessment'}
        wide
        footer={
          stage === 'assessment' ? (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={seeResults} disabled={!isComplete(ratings)}>See my results</Button>
            </>
          ) : stage === 'picker' ? (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={saveFromPicker} disabled={tracked.length === 0}>Save</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStage('assessment')}>Back</Button>
              <Button onClick={save} disabled={tracked.length === 0}>Save & Continue</Button>
            </>
          )
        }
      >
        {stage === 'assessment' && (
          <div className="space-y-6">
            <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
              Rate how much each statement sounds like you. Be honest, not aspirational — this isn't graded.
            </p>
            {CATEGORIES.map((cat) => {
              const traits = CHARACTERISTICS.filter((c) => c.category === cat.id)
              return (
                <div key={cat.id}>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: `var(--cat-${cat.id})` }} />
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-400">{cat.label}</p>
                  </div>
                  <div className="space-y-4">
                    {traits.map((t) => (
                      <div key={t.id}>
                        <p className="text-[13.5px] text-neutral-800 dark:text-neutral-100 mb-1.5">{t.statement}</p>
                        <div className="flex gap-1.5">
                          {RATING_SCALE.map((r) => (
                            <button
                              type="button"
                              key={r.value}
                              onClick={() => rate(t.id, r.value)}
                              title={r.label}
                              className={`flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                                ratings[t.id] === r.value
                                  ? 'bg-accent-500 text-white'
                                  : 'bg-black/[0.05] dark:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:bg-black/[0.08] dark:hover:bg-white/15'
                              }`}
                            >
                              {r.value}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {stage === 'picker' && <TraitGrid picked={tracked} onToggle={toggleTracked} />}

        {stage === 'results' && result && (
          <div className="space-y-6">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-400 mb-2.5">Your Full Strengths Profile</p>
              <StrengthsProfileChart traitScores={result.traitScores} topAdvantages={result.topAdvantages} />
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-400 mb-2.5">Directions Worth Exploring</p>
              <div className="space-y-2">
                {result.directions.map((d) => {
                  const full = DIRECTIONS.find((x) => x.id === d.id)
                  return (
                    <div key={d.id} className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04]">
                      <p className="text-[13.5px] font-medium text-neutral-900 dark:text-white">{d.label}</p>
                      {full && <p className="text-[12.5px] text-neutral-500 dark:text-neutral-400 mt-0.5">{full.description}</p>}
                    </div>
                  )
                })}
              </div>
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-400 mb-2.5">
                Track these on your Identity tab — uncheck anything that doesn't feel right, or add more
              </p>
              <TraitGrid picked={tracked} onToggle={toggleTracked} />
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

function TraitGrid({ picked, onToggle }) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {CHARACTERISTICS.map((c) => {
        const active = picked.includes(c.id)
        const Icon = c.icon
        return (
          <button
            type="button"
            key={c.id}
            onClick={() => onToggle(c.id)}
            className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-colors ${
              active ? 'bg-accent-500/10 border-accent-500/40' : 'border-black/10 dark:border-white/15 hover:border-accent-500/30'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-accent-500 text-white' : 'bg-black/[0.05] dark:bg-white/10 text-neutral-500'}`}>
              <Icon size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-[13px] font-medium ${active ? 'text-accent-700 dark:text-accent-400' : 'text-neutral-800 dark:text-neutral-100'}`}>{c.label}</p>
              <p className="text-[11.5px] text-neutral-400 mt-0.5 leading-tight">{c.tagline}</p>
            </div>
            {active && <Check size={14} className="text-accent-500 flex-shrink-0 mt-1" />}
          </button>
        )
      })}
    </div>
  )
}
