import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Misc'
import { QUESTIONS, MAJOR_BY_ID, scoreMajorQuiz, isComplete } from '../../lib/majorFit'

export default function MajorFitQuiz({ triggerLabel = 'Take the Major Fit Quiz', variant = 'primary', size = 'md' }) {
  const { setMajorFit } = useStore()
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState('quiz') // 'quiz' | 'results'
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  function openQuiz() {
    setStage('quiz')
    setAnswers({})
    setOpen(true)
  }
  function selectAnswer(qId, i) {
    setAnswers((prev) => ({ ...prev, [qId]: i }))
  }
  function seeResults() {
    setResult(scoreMajorQuiz(answers))
    setStage('results')
  }
  function save() {
    setMajorFit({ ...result, completedAt: new Date().toISOString() })
    setOpen(false)
  }

  return (
    <>
      <Button variant={variant} size={size} icon={Sparkles} onClick={openQuiz}>
        {triggerLabel}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={stage === 'results' ? 'Your Major Fit' : 'Major Fit Quiz'}
        wide
        footer={
          stage === 'quiz' ? (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={seeResults} disabled={!isComplete(answers)}>See my results</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStage('quiz')}>Back to quiz</Button>
              <Button onClick={save}>Save results</Button>
            </>
          )
        }
      >
        {stage === 'quiz' && (
          <div className="space-y-6">
            <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
              10 quick questions — pick whatever's closest to true, there's no wrong answer.
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

        {stage === 'results' && result && <MajorFitResultSummary result={result} />}
      </Modal>
    </>
  )
}

export function MajorFitResultSummary({ result }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-2.5 rounded-full bg-black/[0.06] dark:bg-white/10 overflow-hidden flex">
            <div className="h-full bg-accent-500" style={{ width: `${result.stemPct}%` }} />
            <div className="h-full bg-purple-500" style={{ width: `${result.nonstemPct}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-between text-[12.5px] text-neutral-500">
          <span>STEM {result.stemPct}%</span>
          <span>Non-STEM {result.nonstemPct}%</span>
        </div>
        <Badge tone="accent" className="mt-3">{result.lean}</Badge>
      </div>

      <div>
        <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-400 mb-2.5">Majors worth exploring</p>
        <div className="space-y-2">
          {result.topMajors.map((id) => {
            const m = MAJOR_BY_ID[id]
            if (!m) return null
            return (
              <div key={id} className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04]">
                <div className="flex items-center gap-2">
                  <p className="text-[13.5px] font-medium text-neutral-900 dark:text-white">{m.label}</p>
                  <Badge tone={m.category === 'stem' ? 'accent' : 'purple'}>{m.category === 'stem' ? 'STEM' : 'Non-STEM'}</Badge>
                </div>
                <p className="text-[12.5px] text-neutral-500 dark:text-neutral-400 mt-0.5">{m.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
