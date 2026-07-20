import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card, CardHeader } from '../ui/Card'
import { Button, IconButton } from '../ui/Button'
import { Field, Input, Select, Textarea } from '../ui/Form'
import { Modal } from '../ui/Modal'
import { Badge, EmptyState } from '../ui/Misc'
import { formatDate, sortByDateAsc } from '../../lib/dates'
import { DEFAULT_ACTIVITY_DIMENSIONS } from '../../lib/northStar'
import { ACTIVITY_TYPES } from '../../lib/activityTypes'
import { DimensionTagPicker } from '../northstar/DimensionTagPicker'
import { PolishChecklist } from '../collegeprep/PolishChecklist'
import { ImpactFraming } from '../collegeprep/ImpactFraming'

const emptyActivity = {
  title: '',
  category: 'activity',
  org: '',
  hoursPerWeek: '',
  weeksPerYear: '',
  startDate: '',
  endDate: '',
  description: '',
  dimensions: DEFAULT_ACTIVITY_DIMENSIONS.activity,
  problem: '',
  action: '',
  impactWho: '',
  growth: '',
}

export function ActivitiesTab() {
  const { data, addItem, updateItem, removeItem } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyActivity)
  const sorted = useMemo(() => sortByDateAsc(data.activities, 'startDate').reverse(), [data.activities])

  function openAdd() {
    setForm(emptyActivity)
    setEditingId(null)
    setModalOpen(true)
  }
  function openEdit(a) {
    setForm({ ...emptyActivity, ...a, dimensions: a.dimensions?.length ? a.dimensions : DEFAULT_ACTIVITY_DIMENSIONS[a.category] || [] })
    setEditingId(a.id)
    setModalOpen(true)
  }
  function save(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    const payload = { ...form, hoursPerWeek: Number(form.hoursPerWeek) || 0, weeksPerYear: Number(form.weeksPerYear) || 0 }
    if (editingId) updateItem('activities', editingId, payload)
    else addItem('activities', payload)
    setModalOpen(false)
  }

  return (
    <Card className="p-5">
      <CardHeader
        title="Activities & Experience"
        subtitle="Extracurriculars, volunteering, and internships."
        action={<Button size="sm" icon={Plus} onClick={openAdd}>Add Activity</Button>}
      />
      <div className="mt-4">
        {sorted.length === 0 ? (
          <EmptyState icon={Users} title="No activities yet" description="Add an extracurricular, volunteering role, or internship." />
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/10">
            {sorted.map((a) => {
              const T = ACTIVITY_TYPES[a.category] || ACTIVITY_TYPES.activity
              return (
                <div key={a.id} className="flex items-start gap-3 py-3.5 group">
                  <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <T.icon size={16} className="text-neutral-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-medium text-neutral-900 dark:text-white">{a.title}</p>
                      <Badge tone={T.tone}>{T.label}</Badge>
                    </div>
                    <p className="text-[12.5px] text-neutral-400 mt-0.5">
                      {[a.org, a.hoursPerWeek ? `${a.hoursPerWeek} hrs/wk` : null, formatRange(a.startDate, a.endDate)].filter(Boolean).join(' · ')}
                    </p>
                    {a.description && <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2">{a.description}</p>}
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <IconButton icon={Pencil} onClick={() => openEdit(a)} />
                    <IconButton icon={Trash2} onClick={() => removeItem('activities', a.id)} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Activity' : 'Add Activity'}
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editingId ? 'Save Changes' : 'Add Activity'}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Title">
            <Input autoFocus value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. Robotics Club — Team Captain" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}>
                {Object.entries(ACTIVITY_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Organization">
              <Input value={form.org} onChange={(e) => setForm((prev) => ({ ...prev, org: e.target.value }))} placeholder="e.g. Lincoln High School" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Hours / week">
              <Input type="number" min="0" value={form.hoursPerWeek} onChange={(e) => setForm((prev) => ({ ...prev, hoursPerWeek: e.target.value }))} />
            </Field>
            <Field label="Weeks / year">
              <Input type="number" min="0" max="52" value={form.weeksPerYear} onChange={(e) => setForm((prev) => ({ ...prev, weeksPerYear: e.target.value }))} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date">
              <Input type="date" value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))} />
            </Field>
            <Field label="End date (optional)">
              <Input type="date" value={form.endDate} onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))} />
            </Field>
          </div>
          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="What did you do? What was your impact?" />
            <PolishChecklist text={form.description} dimensions={form.dimensions} />
          </Field>
          <Field label="Which parts of you does this grow?" hint="Tags it for your North Star map.">
            <DimensionTagPicker value={form.dimensions} onChange={(dimensions) => setForm((prev) => ({ ...prev, dimensions }))} />
          </Field>
          <ImpactFraming
            value={{ problem: form.problem, action: form.action, impactWho: form.impactWho, growth: form.growth }}
            onChange={(fields) => setForm((prev) => ({ ...prev, ...fields }))}
          />
        </form>
      </Modal>
    </Card>
  )
}

function formatRange(start, end) {
  if (!start) return ''
  if (!end) return `${formatDate(start)} – Present`
  return `${formatDate(start)} – ${formatDate(end)}`
}
