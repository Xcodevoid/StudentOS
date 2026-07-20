import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Gauge } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card, CardHeader } from '../ui/Card'
import { Button, IconButton } from '../ui/Button'
import { Field, Input, Select, Textarea } from '../ui/Form'
import { Modal } from '../ui/Modal'
import { Badge, EmptyState } from '../ui/Misc'
import { countdownLabel, formatDate, isOverdue, sortByDateAsc } from '../../lib/dates'
import { TEST_TYPES, TEST_TYPE_OPTIONS, computeComposite, bestSingleAttempt, superscore, scoreGap } from '../../lib/standardizedTests'

const STATUS_TONE = { planned: 'neutral', completed: 'green' }

function emptyEntry(testType = TEST_TYPE_OPTIONS[0].value) {
  return { testType, date: '', registrationDeadline: '', status: 'planned', scores: {}, notes: '' }
}

export default function TestPrepView() {
  const { data, addItem, updateItem, removeItem } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyEntry())

  const entriesByType = useMemo(() => {
    const map = {}
    data.testEntries.forEach((e) => {
      if (!map[e.testType]) map[e.testType] = []
      map[e.testType].push(e)
    })
    Object.keys(map).forEach((k) => {
      map[k] = sortByDateAsc(map[k]).reverse()
    })
    return map
  }, [data.testEntries])

  const activeTypes = Object.keys(entriesByType)
  const type = TEST_TYPES[form.testType]

  function openAdd() {
    setForm(emptyEntry())
    setEditingId(null)
    setModalOpen(true)
  }
  function openEdit(entry) {
    setForm({ ...emptyEntry(entry.testType), ...entry, scores: { ...entry.scores } })
    setEditingId(entry.id)
    setModalOpen(true)
  }
  function save(e) {
    e.preventDefault()
    if (editingId) updateItem('testEntries', editingId, form)
    else addItem('testEntries', form)
    setModalOpen(false)
  }
  function setScore(key, value) {
    setForm((prev) => ({ ...prev, scores: { ...prev.scores, [key]: value } }))
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <CardHeader
          title="Standardized Tests"
          subtitle="SAT, ACT, TOEFL, IELTS, and more — scores, superscores, and target gaps."
          action={<Button size="sm" icon={Plus} onClick={openAdd}>Add Test Entry</Button>}
        />
      </Card>

      {activeTypes.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={Gauge}
            title="No tests logged yet"
            description="Add a planned or completed SAT, ACT, TOEFL, or IELTS sitting to start tracking your scores."
            action={<Button size="sm" icon={Plus} onClick={openAdd}>Add Test Entry</Button>}
          />
        </Card>
      ) : (
        activeTypes.map((testType) => (
          <TestTypeCard
            key={testType}
            testType={testType}
            entries={entriesByType[testType]}
            onEdit={openEdit}
            onDelete={(id) => removeItem('testEntries', id)}
          />
        ))
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Test Entry' : 'Add Test Entry'}
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editingId ? 'Save Changes' : 'Add Test Entry'}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Test">
              <Select
                value={form.testType}
                onChange={(e) => setForm((prev) => ({ ...prev, testType: e.target.value, scores: {} }))}
                disabled={Boolean(editingId)}
              >
                {TEST_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                <option value="planned">Planned</option>
                <option value="completed">Completed</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Test date" hint="Optional if still registering">
              <Input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} />
            </Field>
            <Field label="Registration deadline" hint="Optional">
              <Input type="date" value={form.registrationDeadline} onChange={(e) => setForm((prev) => ({ ...prev, registrationDeadline: e.target.value }))} />
            </Field>
          </div>
          {form.status === 'completed' && (
            <div>
              <p className="text-[13px] font-medium text-neutral-600 dark:text-neutral-300 mb-2">Section scores</p>
              <div className="grid grid-cols-2 gap-3">
                {type.sections.map((s) => (
                  <Field key={s.key} label={`${s.label} (max ${s.max})`}>
                    <Input
                      type="number"
                      min="0"
                      max={s.max}
                      value={form.scores[s.key] ?? ''}
                      onChange={(e) => setScore(s.key, e.target.value)}
                    />
                  </Field>
                ))}
              </div>
            </div>
          )}
          <Field label="Notes" hint="Optional">
            <Textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} rows={2} placeholder="e.g. Rushed the essay section, retake without it next time." />
          </Field>
        </form>
      </Modal>
    </div>
  )
}

function TestTypeCard({ testType, entries, onEdit, onDelete }) {
  const { data, setTestTargets } = useStore()
  const type = TEST_TYPES[testType]
  const best = bestSingleAttempt(entries, testType)
  const supered = superscore(entries, testType)
  const target = data.testPrep.targets[testType] ?? ''
  const [targetInput, setTargetInput] = useState(target)
  const gap = scoreGap(target, supered ?? best)

  function saveTarget() {
    setTestTargets({ [testType]: targetInput === '' ? '' : Number(targetInput) })
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[15px] font-semibold text-neutral-900 dark:text-white">{type.label}</p>
          <p className="text-[12.5px] text-neutral-400 mt-0.5">{entries.length} sitting{entries.length === 1 ? '' : 's'} logged</p>
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          {best !== null && <Stat label="Best attempt" value={best} max={type.maxScore} />}
          {supered !== null && <Stat label="Superscore" value={supered} max={type.maxScore} tone="accent" />}
          <div className="flex flex-col items-start gap-1">
            <span className="text-[11px] text-neutral-400">Target</span>
            <div className="flex items-center gap-1.5">
              <Input
                className="w-16 !py-1 !px-2 text-[13px]"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                onBlur={saveTarget}
                placeholder="—"
              />
              {gap !== null && <Badge tone={gap <= 0 ? 'green' : 'amber'}>{gap <= 0 ? 'Met' : `+${gap} to go`}</Badge>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 divide-y divide-black/5 dark:divide-white/10">
        {entries.map((e) => {
          const composite = computeComposite(testType, e.scores)
          return (
            <div key={e.id} className="flex items-center gap-3 py-2.5 group">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[13.5px] font-medium text-neutral-800 dark:text-neutral-100">{e.date ? formatDate(e.date) : 'Date TBD'}</p>
                  <Badge tone={STATUS_TONE[e.status]}>{e.status === 'completed' ? 'Completed' : 'Planned'}</Badge>
                </div>
                {e.registrationDeadline && (
                  <p className="text-[12px] text-neutral-400 mt-0.5">Register by {formatDate(e.registrationDeadline)}</p>
                )}
              </div>
              {composite !== null && <p className="text-[16px] font-semibold text-neutral-900 dark:text-white flex-shrink-0">{composite}</p>}
              {e.status === 'planned' && e.date && !isOverdue(e.date) && <Badge tone="neutral">{countdownLabel(e.date)}</Badge>}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <IconButton icon={Pencil} onClick={() => onEdit(e)} />
                <IconButton icon={Trash2} onClick={() => onDelete(e.id)} />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function Stat({ label, value, max, tone = 'neutral' }) {
  return (
    <div className="text-right">
      <p className={`text-[20px] font-semibold leading-none ${tone === 'accent' ? 'text-accent-600 dark:text-accent-400' : 'text-neutral-900 dark:text-white'}`}>
        {value}
      </p>
      <p className="text-[11px] text-neutral-400 mt-1">{label} / {max}</p>
    </div>
  )
}
