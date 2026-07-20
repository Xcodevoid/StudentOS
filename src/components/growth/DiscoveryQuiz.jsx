import { useState } from 'react'
import { Compass, Check } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { QUESTIONS, DIRECTIONS, scoreQuiz, isComplete } from '../../lib/discoveryQuiz'
import { CHARACTERISTICS } from '../../lib/northStar'

export function DiscoveryQuiz({ triggerLabel = 'Take the Discovery Quiz', variant = 'primary', size = 'md' }) {
  const { data, setNorthStar } = useStore()
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState('quiz') // 'quiz' | 'picker' | 'results'
  const [answers, setAnswers] = useState({})
  const [picked, setPicked] = useState([])
  const [directions, setDirections] = useState([])

  function openQuiz() {
    setStage('quiz')
    setAnswers({})
    setOpen(true)
  }
  function openPicker() {
    setStage('picker')
    setPicked(data.northStar.characteristics || [])
    setOpen(true)
  }
  function selectAnswer(qId, i) {
    setAnswers((prev) => ({ ...prev, [qId]: i }))
  }
  function seeResults() {
    const result = scoreQuiz(answers)
    setPicked(result.characteristics)
    setDirections(result.directions)
    setStage('results')
  }
  function togglePicked(id) {
    setPicked((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }
  function save() {
    setNorthStar({ characteristics: picked, directions })
    setOpen(false)
  }
  function saveFromPicker() {
    setNorthStar({ characteristics: picked, directions: [] })
    setOpen(false)
  }

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant={variant} size={size} icon={Compass} onClick={openQuiz}>
          {triggerLabel}
        </Button>
        <Button variant="ghost" size={size} onClick={openPicker}>
          Pick my own instead
        </Button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={stage === 'results' ? 'Your Results' : stage === 'picker' ? 'Pick Your Characteristics' : 'Discovery Quiz'}
        wide
        footer={
          stage === 'quiz' ? (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={seeResults} disabled={!isComplete(answers)}>See my results</Button>
            </>
          ) : stage === 'picker' ? (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={saveFromPicker} disabled={picked.length === 0}>Save</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStage('quiz')}>Back to quiz</Button>
              <Button onClick={save} disabled={picked.length === 0}>Save & Continue</Button>
            </>
          )
        }
      >
        {stage === 'quiz' && (
          <div className="space-y-6">
            <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
              8 quick questions — there's no wrong answer, just pick what's closest to true for you.
            </p>
            {QUESTIONS.map((q) => (
              <div key={q.id}>
                <p className="text-[14px] font-medium text-neutral-900 dark:text-white mb-2.5">{q.text}</p>
                <div className="space-y-1.5">
                  {q.options.map((opt, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => selectAnswer(q.id, i)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[13.5px] transition-colors ${
                        answers[q.id] === i
                          ? 'bg-accent-500/10 border border-accent-500/40 text-accent-700 dark:text-accent-400 font-medium'
                          : 'border border-black/10 dark:border-white/15 text-neutral-600 dark:text-neutral-300 hover:border-accent-500/30'
                      }`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {stage === 'picker' && <TraitGrid picked={picked} onToggle={togglePicked} />}

        {stage === 'results' && (
          <div className="space-y-6">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-400 mb-2.5">Directions worth exploring</p>
              <div className="space-y-2">
                {directions.map((d) => {
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
                Your characteristics — uncheck anything that doesn't feel right, or add more
              </p>
              <TraitGrid picked={picked} onToggle={togglePicked} />
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
