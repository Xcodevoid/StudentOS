import { useEffect, useMemo, useRef, useState } from 'react'
import { Timer, Play, Pause, X, Check, Star } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Field, Input, Select } from '../ui/Form'
import { Badge, EmptyState } from '../ui/Misc'
import { ProgressRing } from '../ui/ProgressRing'
import { todayKey, lastNDays } from '../../lib/momentum'
import { sortByDateAsc } from '../../lib/dates'

const DURATIONS = [15, 25, 45, 60]

function fmtClock(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function FocusSection() {
  const { data, addItem, updateItem, recordActivityToday } = useStore()
  const [status, setStatus] = useState('idle') // idle | running | paused | reflecting
  const [remaining, setRemaining] = useState(0)
  const [total, setTotal] = useState(0)
  const [taskLabel, setTaskLabel] = useState('')
  const [commitmentId, setCommitmentId] = useState('')
  const [minutes, setMinutes] = useState(25)
  const intervalRef = useRef(null)

  const todaysOpenCommitments = useMemo(
    () => data.commitments.filter((c) => c.date === todayKey() && !c.done),
    [data.commitments]
  )

  const recentSessions = useMemo(() => {
    const week = lastNDays(14)
    return sortByDateAsc(data.momentumSessions.filter((s) => week.includes(s.date)), 'date').reverse().slice(0, 6)
  }, [data.momentumSessions])

  useEffect(() => {
    if (status !== 'running') return
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current)
          setStatus('reflecting')
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [status])

  function start() {
    const seconds = minutes * 60
    setTotal(seconds)
    setRemaining(seconds)
    setStatus('running')
  }

  function finishEarly() {
    clearInterval(intervalRef.current)
    setStatus('reflecting')
  }

  function abandon() {
    clearInterval(intervalRef.current)
    setStatus('idle')
    setTaskLabel('')
    setCommitmentId('')
  }

  function saveReflection({ goalCompleted, focusRating }) {
    const actualMinutes = Math.round((total - remaining) / 60) || Math.round(total / 60)
    addItem('momentumSessions', {
      commitmentId: commitmentId || null,
      taskLabel: taskLabel || 'Focus session',
      plannedMinutes: Math.round(total / 60),
      actualMinutes,
      goalCompleted,
      focusRating,
      date: todayKey(),
    })
    if (goalCompleted && commitmentId) {
      updateItem('commitments', commitmentId, { done: true })
    }
    recordActivityToday()
    setStatus('idle')
    setTaskLabel('')
    setCommitmentId('')
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <CardHeader title="Start a Focus Session" subtitle="Full-screen, distraction-free. One task, one block of time." />
        <div className="mt-4 space-y-4">
          <Field label="Link to today's mission" hint="Optional — pick one of today's commitments to focus on.">
            <Select
              value={commitmentId}
              onChange={(e) => {
                const id = e.target.value
                setCommitmentId(id)
                const c = todaysOpenCommitments.find((x) => x.id === id)
                if (c) setTaskLabel(c.title)
              }}
            >
              <option value="">Something else</option>
              {todaysOpenCommitments.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </Select>
          </Field>
          <Field label="What are you focusing on?">
            <Input value={taskLabel} onChange={(e) => setTaskLabel(e.target.value)} placeholder="e.g. Read Chapter 4" />
          </Field>
          <Field label="Duration">
            <div className="flex gap-1.5">
              {DURATIONS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMinutes(m)}
                  className={`px-3 py-2 rounded-xl text-[13.5px] font-medium transition-colors ${
                    minutes === m ? 'bg-accent-500 text-white' : 'bg-black/[0.05] text-neutral-600 dark:bg-white/10 dark:text-neutral-300'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </Field>
          <Button icon={Timer} onClick={start} className="w-full sm:w-auto">
            Enter Focus Mode
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <CardHeader title="Recent Sessions" subtitle="Last 14 days" />
        <div className="mt-4">
          {recentSessions.length === 0 ? (
            <EmptyState icon={Timer} title="No focus sessions yet" description="Your completed sessions will show up here." />
          ) : (
            <div className="divide-y divide-black/5 dark:divide-white/10">
              {recentSessions.map((s) => (
                <div key={s.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-medium text-neutral-800 dark:text-neutral-100 truncate">{s.taskLabel}</p>
                    <p className="text-[12px] text-neutral-400">{s.actualMinutes} min</p>
                  </div>
                  {s.goalCompleted === true && <Badge tone="green">Goal met</Badge>}
                  {s.goalCompleted === false && <Badge tone="neutral">Didn't finish</Badge>}
                  {s.focusRating && (
                    <span className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} fill={i < s.focusRating ? 'currentColor' : 'none'} strokeWidth={1.5} />
                      ))}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {status !== 'idle' && (
        <FocusOverlay
          status={status}
          remaining={remaining}
          total={total}
          taskLabel={taskLabel}
          onPause={() => setStatus('paused')}
          onResume={() => setStatus('running')}
          onFinishEarly={finishEarly}
          onAbandon={abandon}
          onSaveReflection={saveReflection}
        />
      )}
    </div>
  )
}

function FocusOverlay({ status, remaining, total, taskLabel, onPause, onResume, onFinishEarly, onAbandon, onSaveReflection }) {
  const [goalCompleted, setGoalCompleted] = useState(null)
  const [focusRating, setFocusRating] = useState(0)
  const pct = total > 0 ? ((total - remaining) / total) * 100 : 0

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-950 text-white flex flex-col items-center justify-center px-6">
      <button onClick={onAbandon} className="absolute top-6 right-6 w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10">
        <X size={20} />
      </button>

      {status !== 'reflecting' ? (
        <>
          <p className="text-white/50 text-[14px] mb-2">Focusing on</p>
          <p className="text-[22px] font-semibold mb-10 text-center max-w-md">{taskLabel || 'Deep work'}</p>
          <ProgressRing value={pct} size={220} strokeWidth={8} tone="accent">
            <span className="text-[48px] font-semibold tabular-nums">{fmtClock(remaining)}</span>
          </ProgressRing>
          <div className="flex items-center gap-3 mt-12">
            {status === 'running' ? (
              <Button variant="secondary" size="lg" icon={Pause} onClick={onPause}>Pause</Button>
            ) : (
              <Button variant="secondary" size="lg" icon={Play} onClick={onResume}>Resume</Button>
            )}
            <Button variant="ghost" size="lg" onClick={onFinishEarly} className="text-white/60 hover:text-white">
              I'm done early
            </Button>
          </div>
        </>
      ) : (
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent-500 flex items-center justify-center mx-auto mb-5">
            <Check size={26} strokeWidth={2.5} />
          </div>
          <p className="text-[20px] font-semibold mb-1">Session complete</p>
          <p className="text-white/50 text-[14px] mb-8">{taskLabel || 'Deep work'}</p>

          <p className="text-[14px] font-medium mb-3">Did you finish your goal?</p>
          <div className="flex gap-2 justify-center mb-8">
            <button
              onClick={() => setGoalCompleted(true)}
              className={`px-5 py-2.5 rounded-full text-[14px] font-medium transition-colors ${goalCompleted === true ? 'bg-green-500 text-white' : 'bg-white/10 text-white/70'}`}
            >
              Yes
            </button>
            <button
              onClick={() => setGoalCompleted(false)}
              className={`px-5 py-2.5 rounded-full text-[14px] font-medium transition-colors ${goalCompleted === false ? 'bg-white/25 text-white' : 'bg-white/10 text-white/70'}`}
            >
              Not yet
            </button>
          </div>

          <p className="text-[14px] font-medium mb-3">How focused were you?</p>
          <div className="flex gap-2 justify-center mb-10">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setFocusRating(n)} className="text-amber-400">
                <Star size={28} fill={n <= focusRating ? 'currentColor' : 'none'} strokeWidth={1.5} />
              </button>
            ))}
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled={goalCompleted === null || focusRating === 0}
            onClick={() => onSaveReflection({ goalCompleted, focusRating })}
          >
            Save & Finish
          </Button>
        </div>
      )}
    </div>
  )
}
