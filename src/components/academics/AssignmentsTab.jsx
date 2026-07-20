import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, ListChecks } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card, CardHeader } from '../ui/Card'
import { Button, IconButton } from '../ui/Button'
import { Field, Input, Select, Checkbox } from '../ui/Form'
import { Modal } from '../ui/Modal'
import { Badge, EmptyState } from '../ui/Misc'
import { formatDate, isOverdue, sortByDateAsc } from '../../lib/dates'

const emptyAssignment = { title: '', classId: '', dueDate: '', priority: 'medium', status: 'todo' }
const PRIORITY_TONE = { high: 'red', medium: 'amber', low: 'neutral' }

export function AssignmentsTab() {
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
