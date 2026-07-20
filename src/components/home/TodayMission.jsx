import { useMemo, useState } from 'react'
import { Zap, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Field, Input, Checkbox } from '../ui/Form'
import { Modal } from '../ui/Modal'
import { Badge, EmptyState } from '../ui/Misc'
import { todayKey } from '../../lib/momentum'

const emptyCommitment = { title: '', why: '', estimatedMinutes: '', deadline: '' }

export default function TodayMission() {
  const { data, addItem, updateItem, removeItem, recordActivityToday } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyCommitment)

  const today = todayKey()
  const todaysCommitments = useMemo(() => data.commitments.filter((c) => c.date === today), [data.commitments, today])

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
    <Card id="mission" className="p-5">
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
    </Card>
  )
}
