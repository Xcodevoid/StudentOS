import { useMemo, useState } from 'react'
import { Zap, Target, Timer as TimerIcon, Smartphone, Repeat, Moon, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Field, Input, Checkbox } from '../components/ui/Form'
import { Modal } from '../components/ui/Modal'
import { Badge, EmptyState } from '../components/ui/Misc'
import { ProgressRing } from '../components/ui/ProgressRing'
import { computeMomentumScore, todayKey } from '../lib/momentum'
import FocusSection from '../components/momentum/FocusSection'
import HabitsSection from '../components/momentum/HabitsSection'
import DistractionsSection from '../components/momentum/DistractionsSection'
import ReflectSection from '../components/momentum/ReflectSection'

const TABS = [
  { id: 'today', label: 'Today', icon: Target },
  { id: 'focus', label: 'Focus', icon: TimerIcon },
  { id: 'habits', label: 'Habits', icon: Repeat },
  { id: 'distractions', label: 'Distractions', icon: Smartphone },
  { id: 'reflect', label: 'Reflect', icon: Moon },
]

const emptyCommitment = { title: '', why: '', estimatedMinutes: '', deadline: '' }

export default function Momentum() {
  const [tab, setTab] = useState('today')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-neutral-900 dark:text-white">Momentum</h1>
        <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-1">
          You don't fail because you don't know what to do — you fail because you can't consistently act. This is the system for that.
        </p>
      </div>

      <div className="inline-flex flex-wrap gap-1 p-1 rounded-full bg-black/[0.05] dark:bg-white/10">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
              tab === t.id ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'today' && <TodayTab />}
      {tab === 'focus' && <FocusSection />}
      {tab === 'habits' && <HabitsSection />}
      {tab === 'distractions' && <DistractionsSection />}
      {tab === 'reflect' && <ReflectSection />}
    </div>
  )
}

function TodayTab() {
  const { data, addItem, updateItem, removeItem, recordActivityToday } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyCommitment)

  const today = todayKey()
  const todaysCommitments = useMemo(() => data.commitments.filter((c) => c.date === today), [data.commitments, today])
  const momentum = useMemo(() => computeMomentumScore(data), [data])

  function openAdd() {
    setForm(emptyCommitment)
    setModalOpen(true)
  }

  function save(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    addItem('commitments', {
      title: form.title.trim(),
      why: form.why.trim(),
      estimatedMinutes: form.estimatedMinutes === '' ? '' : Number(form.estimatedMinutes),
      deadline: form.deadline,
      date: today,
      done: false,
    })
    setModalOpen(false)
  }

  function toggleDone(c) {
    if (!c.done) recordActivityToday()
    updateItem('commitments', c.id, { done: !c.done })
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 flex flex-col sm:flex-row items-center gap-6">
        {momentum.score === null ? (
          <ProgressRing value={0} tone="accent">
            <span className="text-[13px] text-neutral-400 text-center px-4">Get started below</span>
          </ProgressRing>
        ) : (
          <ProgressRing value={momentum.score} tone={momentum.score >= 65 ? 'green' : momentum.score >= 40 ? 'amber' : 'red'}>
            <div className="text-center">
              <p className="text-[30px] font-semibold text-neutral-900 dark:text-white leading-none">{momentum.score}</p>
              <p className="text-[11px] text-neutral-400 mt-1">/ 100</p>
            </div>
          </ProgressRing>
        )}
        <div className="text-center sm:text-left">
          <p className="text-[16px] font-semibold text-neutral-900 dark:text-white">Momentum Score</p>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            {momentum.tier || 'Set a commitment, run a focus session, or log a habit to get your first score.'}
          </p>
          {momentum.commitmentsSummary && <p className="text-[13px] text-neutral-400 mt-1">{momentum.commitmentsSummary}</p>}
        </div>
      </Card>

      <Card className="p-5">
        <CardHeader
          title="Today's Mission"
          subtitle="Your 1-3 most important tasks today — not everything, just what matters."
          action={
            todaysCommitments.length < 3 && (
              <Button size="sm" icon={Plus} onClick={openAdd}>
                Add
              </Button>
            )
          }
        />
        <div className="mt-4">
          {todaysCommitments.length === 0 ? (
            <EmptyState
              icon={Zap}
              title="No mission set for today"
              description="Choose 1-3 things that actually matter today. Everything else can wait."
              action={<Button size="sm" icon={Plus} onClick={openAdd}>Set today's mission</Button>}
            />
          ) : (
            <div className="space-y-2">
              {todaysCommitments.map((c) => (
                <div key={c.id} className="flex items-start gap-3 py-2.5 group">
                  <div className="pt-0.5">
                    <Checkbox checked={c.done} onChange={() => toggleDone(c)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[14.5px] font-medium ${c.done ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-white'}`}>
                      {c.title}
                    </p>
                    {c.why && <p className="text-[12.5px] text-neutral-400 mt-0.5">Why: {c.why}</p>}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {c.estimatedMinutes !== '' && <Badge>{c.estimatedMinutes} min</Badge>}
                      {c.deadline && <Badge tone="amber">Due {c.deadline}</Badge>}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem('commitments', c.id)}
                    className="opacity-0 group-hover:opacity-100 text-[12px] text-neutral-400 hover:text-red-500 transition-opacity flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add to Today's Mission"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>Add</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="What needs to be done">
            <Input autoFocus value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. Finish Calc BC problem set" />
          </Field>
          <Field label="Why it matters" hint="A real reason makes you 10x more likely to actually do it.">
            <Input value={form.why} onChange={(e) => setForm((prev) => ({ ...prev, why: e.target.value }))} placeholder="e.g. Falling behind here hurts my exam score" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estimated time (min)">
              <Input type="number" min="0" value={form.estimatedMinutes} onChange={(e) => setForm((prev) => ({ ...prev, estimatedMinutes: e.target.value }))} placeholder="30" />
            </Field>
            <Field label="Deadline today" hint="Optional">
              <Input type="time" value={form.deadline} onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))} />
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  )
}
