import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, UserCheck } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card, CardHeader } from '../ui/Card'
import { Button, IconButton } from '../ui/Button'
import { Field, Input, Select, Textarea } from '../ui/Form'
import { Modal } from '../ui/Modal'
import { Badge, EmptyState } from '../ui/Misc'
import { formatDate, sortByDateAsc } from '../../lib/dates'
import { RECOMMENDER_STATUS } from '../../lib/recommenders'

const emptyRecommender = { name: '', subject: '', status: 'not-asked', deadline: '', notes: '' }

export default function RecommendersCard() {
  const { data, addItem, updateItem, removeItem } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyRecommender)

  const sorted = useMemo(() => sortByDateAsc(data.recommenders, 'deadline'), [data.recommenders])

  function openAdd() {
    setForm(emptyRecommender)
    setEditingId(null)
    setModalOpen(true)
  }
  function openEdit(r) {
    setForm({ ...emptyRecommender, ...r })
    setEditingId(r.id)
    setModalOpen(true)
  }
  function save(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editingId) updateItem('recommenders', editingId, form)
    else addItem('recommenders', form)
    setModalOpen(false)
  }

  return (
    <Card className="p-5 print:hidden">
      <CardHeader
        title="Recommenders"
        subtitle="Who's writing you a letter, and where things stand."
        action={<Button size="sm" icon={Plus} onClick={openAdd}>Add Recommender</Button>}
      />
      <div className="mt-4">
        {sorted.length === 0 ? (
          <EmptyState icon={UserCheck} title="No recommenders yet" description="Add the teachers or counselors writing your letters to track status and prep a brag sheet for each." />
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/10">
            {sorted.map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-3 group">
                <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                  <UserCheck size={16} className="text-neutral-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-medium text-neutral-900 dark:text-white truncate">{r.name}</p>
                    <Badge tone={RECOMMENDER_STATUS[r.status]?.tone}>{RECOMMENDER_STATUS[r.status]?.label}</Badge>
                  </div>
                  <p className="text-[12.5px] text-neutral-400 mt-0.5">
                    {[r.subject, r.deadline ? `Due ${formatDate(r.deadline)}` : null].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <IconButton icon={Pencil} onClick={() => openEdit(r)} />
                  <IconButton icon={Trash2} onClick={() => removeItem('recommenders', r.id)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Recommender' : 'Add Recommender'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editingId ? 'Save Changes' : 'Add Recommender'}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Name">
            <Input autoFocus value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="e.g. Ms. Rodriguez" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Subject / relationship">
              <Input value={form.subject} onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))} placeholder="e.g. AP Biology teacher" />
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                {Object.entries(RECOMMENDER_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Deadline" hint="Optional">
            <Input type="date" value={form.deadline} onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))} />
          </Field>
          <Field label="Context to remember" hint="Specific moments this recommender might not think to mention on their own.">
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="e.g. Stayed until 11pm before regionals debugging the robot's arm."
            />
          </Field>
        </form>
      </Modal>
    </Card>
  )
}
