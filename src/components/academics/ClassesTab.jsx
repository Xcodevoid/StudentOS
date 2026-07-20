import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card, CardHeader } from '../ui/Card'
import { Button, IconButton } from '../ui/Button'
import { Field, Input, Select } from '../ui/Form'
import { Modal } from '../ui/Modal'
import { Badge, EmptyState, StatCard } from '../ui/Misc'
import { computeGPA, percentToLetter, WEIGHT_LABELS } from '../../lib/gpa'

const emptyClass = { name: '', subject: '', term: '', credits: 1, weight: 'regular', grade: '' }

export function ClassesTab() {
  const { data, addItem, updateItem, removeItem } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyClass)

  const gpa = useMemo(() => computeGPA(data.classes), [data.classes])

  function openAdd() {
    setForm(emptyClass)
    setEditingId(null)
    setModalOpen(true)
  }
  function openEdit(c) {
    setForm({ ...c, grade: c.grade ?? '' })
    setEditingId(c.id)
    setModalOpen(true)
  }
  function save(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    const payload = { ...form, credits: Number(form.credits) || 1, grade: form.grade === '' ? '' : Number(form.grade) }
    if (editingId) updateItem('classes', editingId, payload)
    else addItem('classes', payload)
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Weighted GPA" value={gpa.weighted ?? '—'} tone="accent" />
        <StatCard label="Unweighted GPA" value={gpa.unweighted ?? '—'} />
        <StatCard label="Classes" value={data.classes.length} />
        <StatCard label="Graded" value={gpa.count} sub={`of ${data.classes.length}`} />
      </div>

      <Card className="p-5">
        <CardHeader
          title="Classes"
          subtitle="Add classes with a grade to see them reflected in your GPA instantly."
          action={
            <Button size="sm" icon={Plus} onClick={openAdd}>
              Add Class
            </Button>
          }
        />
        <div className="mt-4">
          {data.classes.length === 0 ? (
            <EmptyState icon={BookOpen} title="No classes yet" description="Add your first class to start tracking your GPA." action={<Button size="sm" icon={Plus} onClick={openAdd}>Add Class</Button>} />
          ) : (
            <div className="divide-y divide-black/5 dark:divide-white/10">
              {data.classes.map((c) => (
                <div key={c.id} className="flex items-center gap-3 py-3 group">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-medium text-neutral-900 dark:text-white truncate">{c.name}</p>
                      <Badge tone={c.weight === 'ap' || c.weight === 'ib' ? 'purple' : c.weight === 'a-level' ? 'green' : c.weight === 'honors' ? 'accent' : 'neutral'}>
                        {WEIGHT_LABELS[c.weight]}
                      </Badge>
                    </div>
                    <p className="text-[12.5px] text-neutral-400 mt-0.5">
                      {[c.subject, c.term].filter(Boolean).join(' · ') || 'No details'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 w-16">
                    {c.grade !== '' && c.grade !== null && c.grade !== undefined ? (
                      <>
                        <p className="text-[14px] font-semibold text-neutral-900 dark:text-white">{c.grade}%</p>
                        <p className="text-[12px] text-neutral-400">{percentToLetter(c.grade)}</p>
                      </>
                    ) : (
                      <p className="text-[12.5px] text-neutral-400">In progress</p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <IconButton icon={Pencil} onClick={() => openEdit(c)} />
                    <IconButton icon={Trash2} onClick={() => removeItem('classes', c.id)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Class' : 'Add Class'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editingId ? 'Save Changes' : 'Add Class'}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Class name">
            <Input autoFocus value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="e.g. AP Chemistry, IB Biology HL, A-Level Physics" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Subject">
              <Input value={form.subject} onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))} placeholder="Science" />
            </Field>
            <Field label="Term">
              <Input value={form.term} onChange={(e) => setForm((prev) => ({ ...prev, term: e.target.value }))} placeholder="Fall 2026" />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Level" className="col-span-2">
              <Select value={form.weight} onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))}>
                <option value="regular">Regular</option>
                <option value="honors">Honors (+0.5)</option>
                <option value="ap">AP (+1.0)</option>
                <option value="ib">IB (+1.0)</option>
                <option value="a-level">A-Level (+1.0)</option>
              </Select>
            </Field>
            <Field label="Credits">
              <Input type="number" step="0.5" min="0" value={form.credits} onChange={(e) => setForm((prev) => ({ ...prev, credits: e.target.value }))} />
            </Field>
          </div>
          <Field label="Current grade (%)" hint="Leave blank if the class is still in progress and ungraded.">
            <Input type="number" min="0" max="100" value={form.grade} onChange={(e) => setForm((prev) => ({ ...prev, grade: e.target.value }))} placeholder="e.g. 94" />
          </Field>
        </form>
      </Modal>
    </div>
  )
}
