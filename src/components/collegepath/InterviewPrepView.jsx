import { useMemo, useState } from 'react'
import { Mic, ChevronDown, Star, Trash2, AlertCircle } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Form'
import { Badge, EmptyState, ProgressBar } from '../ui/Misc'
import { QUESTION_BANK, QUESTION_CATEGORIES, matchStoryToQuestion, analyzeStarAnswer, coverageByCategory } from '../../lib/interviewPrep'
import { formatDate, sortByDateAsc } from '../../lib/dates'
import { todayKey } from '../../lib/momentum'

export default function InterviewPrepView() {
  const { data, addItem, removeItem, recordActivityToday } = useStore()
  const [expandedQ, setExpandedQ] = useState(null)
  const [answer, setAnswer] = useState('')
  const [rating, setRating] = useState(0)

  const coverage = useMemo(() => coverageByCategory(data, data.interviewPractice), [data])
  const history = useMemo(() => sortByDateAsc(data.interviewPractice, 'date').reverse().slice(0, 10), [data.interviewPractice])

  function openQuestion(q) {
    setExpandedQ(expandedQ === q.id ? null : q.id)
    setAnswer('')
    setRating(0)
  }

  function savePractice(question) {
    if (!answer.trim()) return
    addItem('interviewPractice', { questionId: question.id, questionText: question.text, answer: answer.trim(), selfRating: rating || '', date: todayKey() })
    recordActivityToday()
    setExpandedQ(null)
    setAnswer('')
    setRating(0)
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <CardHeader title="Prep Coverage" subtitle="A category is interview-ready once you have a matching story AND a practiced answer." />
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          {coverage.map((c) => (
            <div key={c.category} className="flex items-center justify-between gap-2 bg-black/[0.02] dark:bg-white/5 rounded-xl px-3 py-2.5">
              <span className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200">{c.category}</span>
              <div className="flex items-center gap-1.5">
                <Badge tone={c.withStory === c.total ? 'green' : c.withStory > 0 ? 'amber' : 'neutral'}>{c.withStory}/{c.total} story</Badge>
                <Badge tone={c.practiced === c.total ? 'green' : c.practiced > 0 ? 'amber' : 'neutral'}>{c.practiced}/{c.total} practiced</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <CardHeader title="Personalized Question Bank" subtitle="Every question is matched to one of your own tracked stories where possible." />
        <div className="mt-4">
          {QUESTION_CATEGORIES.map((category) => (
            <div key={category}>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-400 mt-4 mb-1.5">{category}</p>
              {QUESTION_BANK.filter((q) => q.category === category).map((q) => {
                const isOpen = expandedQ === q.id
                const match = matchStoryToQuestion(q, data)
                return (
                  <div key={q.id} className="border-t border-black/5 dark:border-white/10 first:border-t-0 py-3">
                    <button className="w-full flex items-center justify-between gap-3 text-left" onClick={() => openQuestion(q)}>
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-neutral-900 dark:text-white">{q.text}</p>
                        <p className="text-[12px] mt-0.5 flex items-center gap-1">
                          {match ? (
                            <span className="text-accent-600 dark:text-accent-400">Matched to "{match.chapter.title}"</span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <AlertCircle size={11} /> Gap — no strong story tracked yet
                            </span>
                          )}
                        </p>
                      </div>
                      <ChevronDown size={16} className={`text-neutral-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="mt-3">
                        <PracticeForm answer={answer} setAnswer={setAnswer} rating={rating} setRating={setRating} onSave={() => savePractice(q)} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <CardHeader title="Practice History" subtitle="Last 10 answers" />
        <div className="mt-4">
          {history.length === 0 ? (
            <EmptyState icon={Mic} title="No practice yet" description="Answer a question above to start building a track record." />
          ) : (
            <div className="divide-y divide-black/5 dark:divide-white/10">
              {history.map((h) => (
                <div key={h.id} className="flex items-start gap-3 py-3 group">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-medium text-neutral-800 dark:text-neutral-100">{h.questionText}</p>
                    <p className="text-[12.5px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">{h.answer}</p>
                    <p className="text-[11.5px] text-neutral-400 mt-1">{formatDate(h.date)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {h.selfRating && (
                      <span className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={11} fill={i < h.selfRating ? 'currentColor' : 'none'} strokeWidth={1.5} />
                        ))}
                      </span>
                    )}
                    <button onClick={() => removeItem('interviewPractice', h.id)} className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

function PracticeForm({ answer, setAnswer, rating, setRating, onSave }) {
  const analysis = useMemo(() => analyzeStarAnswer(answer), [answer])

  return (
    <div className="space-y-3">
      <Textarea rows={4} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Answer out loud first, then type what you said — this works best as practice, not composition." />
      <div className="flex items-center gap-2">
        <ProgressBar value={analysis.score} max={analysis.total} tone={analysis.score === analysis.total ? 'green' : 'accent'} className="flex-1" />
        <span className="text-[12px] text-neutral-400 flex-shrink-0">{analysis.score}/{analysis.total} STAR</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-1.5">
        {analysis.checks.map((c) => (
          <div key={c.id} className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.pass ? 'bg-green-500' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
            <span className={`text-[12px] ${c.pass ? 'text-neutral-500' : 'text-neutral-400'}`}>{c.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <span className="text-[12.5px] text-neutral-500 mr-1">How confident did that feel?</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} className="text-amber-400">
              <Star size={16} fill={n <= rating ? 'currentColor' : 'none'} strokeWidth={1.5} />
            </button>
          ))}
        </div>
        <Button size="sm" onClick={onSave} disabled={!answer.trim()}>Save Practice</Button>
      </div>
    </div>
  )
}
