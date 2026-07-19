import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, BookOpen, ListChecks } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { Card, CardHeader } from '../components/ui/Card'
import { Button, IconButton } from '../components/ui/Button'
import { Field, Input, Select, Checkbox } from '../components/ui/Form'
import { Modal } from '../components/ui/Modal'
import { Badge, EmptyState, StatCard } from '../components/ui/Misc'
import { computeGPA, percentToLetter, WEIGHT_LABELS } from '../lib/gpa'
import { formatDate, isOverdue, sortByDateAsc } from '../lib/dates'

const emptyClass = { name: '', subject: '', term: '', credits: 1, weight: 'regular', grade: '' }
const emptyAssignment = { title: '', classId: '', dueDate: '', priority: 'medium', status: 'todo' }

export default function Academics() {
  const [tab, setTab] = useState('classes')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-neutral-900 dark:text-white">Academic Tracker</h1>
        <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-1">Classes, grades, GPA, and assignments.</p>
      </div>

      <div className="inline-flex p-1 rounded-full bg-black/[0.05] dark:bg-white/10">
        {[
          { id: 'classes', label: 'Classes & GPA', icon: BookOpen },
          { id: 'assignments', label: 'Assignments', icon: ListChecks },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13.5px] font-medium transition-colors ${
              tab === t.id ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500'
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'classes' ? <ClassesTab /> : <AssignmentsTab />}
    </div>
  )
}

function ClassesTab() {
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

const PRIORITY_TONE = { high: 'red', medium: 'amber', low: 'neutral' }

function AssignmentsTab() {
  const { data, addItem, updateItem, removeItem } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyAssignment)
  const [hideDone, setHideDone] = useState(false)

  const sorted = useMemo(() => {
    let list = data.assignments
    if (hideDone) list = list.filter((a) => a.status !== 'done')
    return sortByDateAsc(list, 'dueDate')
  }, [data.assignments, hideDone])

  function openAdd() {
    setForm(emptyAssignment)
    setEditingId(null)
    setModalOpen(true)
  }
  function openEdit(a) {
    setForm({ ...a, classId: a.classId || '' })
    setEditingId(a.id)
    setModalOpen(true)
  }
  function save(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    const payload = { ...form, classId: form.classId || null }
    if (editingId) updateItem('assignments', editingId, payload)
    else addItem('assignments', payload)
    setModalOpen(false)
  }
  function className(classId) {
    return data.classes.find((c) => c.id === classId)?.name
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <CardHeader
          title="Assignments"
          subtitle="Track homework, essays, labs, and projects across every class."
          action={
            <Button size="sm" icon={Plus} onClick={openAdd}>
              Add Assignment
            </Button>
          }
        />
        <label className="flex items-center gap-2 mt-4 text-[13px] text-neutral-500 w-fit cursor-pointer">
          <Checkbox checked={hideDone} onChange={() => setHideDone((v) => !v)} />
          Hide completed
        </label>
        <div className="mt-3">
          {sorted.length === 0 ? (
            <EmptyState icon={ListChecks} title="No assignments" description="Add your first assignment to track its due date." action={<Button size="sm" icon={Plus} onClick={openAdd}>Add Assignment</Button>} />
          ) : (
            <div className="divide-y divide-black/5 dark:divide-white/10">
              {sorted.map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-3 group">
                  <Checkbox checked={a.status === 'done'} onChange={() => updateItem('assignments', a.id, { status: a.status === 'done' ? 'todo' : 'done' })} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-[14px] font-medium truncate ${a.status === 'done' ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-white'}`}>
                      {a.title}
                    </p>
                    <p className="text-[12.5px] text-neutral-400 mt-0.5">
                      {[className(a.classId), a.dueDate ? formatDate(a.dueDate) : null].filter(Boolean).join(' · ') || 'No due date'}
                    </p>
                  </div>
                  {a.status !== 'done' && isOverdue(a.dueDate) && <Badge tone="red">Overdue</Badge>}
                  {a.status !== 'done' && <Badge tone={PRIORITY_TONE[a.priority]}>{a.priority}</Badge>}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <IconButton icon={Pencil} onClick={() => openEdit(a)} />
                    <IconButton icon={Trash2} onClick={() => removeItem('assignments', a.id)} />
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
        title={editingId ? 'Edit Assignment' : 'Add Assignment'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editingId ? 'Save Changes' : 'Add Assignment'}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Title">
            <Input autoFocus value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. Lab report" />
          </Field>
          <Field label="Class (optional)">
            <Select value={form.classId} onChange={(e) => setForm((prev) => ({ ...prev, classId: e.target.value }))}>
              <option value="">No class</option>
              {data.classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Due date">
              <Input type="date" value={form.dueDate} onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))} />
            </Field>
            <Field label="Priority">
              <Select value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  )
}
