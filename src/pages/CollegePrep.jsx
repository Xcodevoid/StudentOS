import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Compass, Flag, Users, HeartHandshake, Briefcase, GraduationCap } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { Card, CardHeader } from '../components/ui/Card'
import { Button, IconButton } from '../components/ui/Button'
import { Field, Input, Select, Textarea } from '../components/ui/Form'
import { Modal } from '../components/ui/Modal'
import { Badge, EmptyState } from '../components/ui/Misc'
import { countdownLabel, formatDate, isOverdue, sortByDateAsc } from '../lib/dates'
import { DEFAULT_ACTIVITY_DIMENSIONS } from '../lib/northStar'
import { DimensionTagPicker } from '../components/northstar/DimensionTagPicker'

const ACTIVITY_TYPES = {
  activity: { label: 'Activity', icon: Users, tone: 'accent' },
  volunteering: { label: 'Volunteering', icon: HeartHandshake, tone: 'green' },
  internship: { label: 'Internship', icon: Briefcase, tone: 'purple' },
}

const DEADLINE_TYPES = {
  'early-action': { label: 'Early Action', tone: 'accent' },
  'early-decision': { label: 'Early Decision', tone: 'purple' },
  regular: { label: 'Regular Decision', tone: 'neutral' },
  scholarship: { label: 'Scholarship', tone: 'amber' },
  other: { label: 'Other', tone: 'neutral' },
}

const DEADLINE_STATUS = {
  'not-started': { label: 'Not started', tone: 'neutral' },
  'in-progress': { label: 'In progress', tone: 'amber' },
  submitted: { label: 'Submitted', tone: 'green' },
}

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
}
const emptyDeadline = { title: '', schoolName: '', date: '', type: 'regular', status: 'not-started', notes: '' }

export default function CollegePrep() {
  const [tab, setTab] = useState('timeline')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-neutral-900 dark:text-white">College Prep Timeline</h1>
        <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-1">Activities, volunteering, internships, and application deadlines.</p>
      </div>

      <div className="inline-flex p-1 rounded-full bg-black/[0.05] dark:bg-white/10">
        {[
          { id: 'timeline', label: 'Timeline', icon: Compass },
          { id: 'manage', label: 'Manage', icon: Flag },
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

      {tab === 'timeline' ? <TimelineView /> : <ManageView />}
    </div>
  )
}

function TimelineView() {
  const { data } = useStore()

  const events = useMemo(() => {
    const fromDeadlines = data.deadlines
      .filter((d) => d.date)
      .map((d) => ({ id: `dl-${d.id}`, date: d.date, kind: 'deadline', title: d.title, sub: d.schoolName, meta: DEADLINE_TYPES[d.type] }))
    const fromActivities = data.activities
      .filter((a) => a.startDate)
      .map((a) => ({ id: `ac-${a.id}`, date: a.startDate, kind: 'activity', title: a.title, sub: a.org, meta: ACTIVITY_TYPES[a.category] }))
    return sortByDateAsc([...fromDeadlines, ...fromActivities])
  }, [data.deadlines, data.activities])

  if (events.length === 0) {
    return (
      <Card className="p-5">
        <EmptyState icon={Compass} title="Your timeline is empty" description="Add activities and deadlines in the Manage tab to see them plotted here." />
      </Card>
    )
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="relative pl-6">
        <div className="absolute left-[7px] top-1 bottom-1 w-px bg-black/10 dark:bg-white/10" />
        <div className="space-y-6">
          {events.map((e) => {
            const overdue = isOverdue(e.date)
            return (
              <div key={e.id} className="relative">
                <div
                  className={`absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-neutral-900 ${
                    overdue ? 'bg-neutral-300 dark:bg-neutral-600' : e.kind === 'deadline' ? 'bg-red-500' : 'bg-accent-500'
                  }`}
                />
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-medium text-neutral-900 dark:text-white">{e.title}</p>
                      {e.meta && <Badge tone={e.meta.tone}>{e.meta.label}</Badge>}
                    </div>
                    <p className="text-[12.5px] text-neutral-400 mt-0.5">
                      {[e.sub, formatDate(e.date)].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  {!overdue && <Badge tone={e.kind === 'deadline' ? 'red' : 'neutral'}>{countdownLabel(e.date)}</Badge>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

function ManageView() {
  return (
    <div className="space-y-6">
      <DeadlinesCard />
      <ActivitiesCard />
    </div>
  )
}

function DeadlinesCard() {
  const { data, addItem, updateItem, removeItem } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyDeadline)
  const sorted = useMemo(() => sortByDateAsc(data.deadlines), [data.deadlines])

  function openAdd() {
    setForm(emptyDeadline)
    setEditingId(null)
    setModalOpen(true)
  }
  function openEdit(d) {
    setForm(d)
    setEditingId(d.id)
    setModalOpen(true)
  }
  function save(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    if (editingId) updateItem('deadlines', editingId, form)
    else addItem('deadlines', form)
    setModalOpen(false)
  }

  return (
    <Card className="p-5">
      <CardHeader
        title="Application Deadlines"
        subtitle="Colleges, scholarships, and program applications."
        action={<Button size="sm" icon={Plus} onClick={openAdd}>Add Deadline</Button>}
      />
      <div className="mt-4">
        {sorted.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No deadlines yet" description="Add a college or scholarship deadline to track it." />
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/10">
            {sorted.map((d) => (
              <div key={d.id} className="flex items-center gap-3 py-3 group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-medium text-neutral-900 dark:text-white truncate">{d.title}</p>
                    <Badge tone={DEADLINE_TYPES[d.type]?.tone}>{DEADLINE_TYPES[d.type]?.label}</Badge>
                    <Badge tone={DEADLINE_STATUS[d.status]?.tone}>{DEADLINE_STATUS[d.status]?.label}</Badge>
                  </div>
                  <p className="text-[12.5px] text-neutral-400 mt-0.5">
                    {[d.schoolName, d.date ? formatDate(d.date) : null].filter(Boolean).join(' · ')}
                  </p>
                </div>
                {d.date && !isOverdue(d.date) && <Badge tone="neutral">{countdownLabel(d.date)}</Badge>}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <IconButton icon={Pencil} onClick={() => openEdit(d)} />
                  <IconButton icon={Trash2} onClick={() => removeItem('deadlines', d.id)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Deadline' : 'Add Deadline'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editingId ? 'Save Changes' : 'Add Deadline'}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Title">
            <Input autoFocus value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. MIT — Early Action" />
          </Field>
          <Field label="School / Organization">
            <Input value={form.schoolName} onChange={(e) => setForm((prev) => ({ ...prev, schoolName: e.target.value }))} placeholder="e.g. MIT" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Deadline date">
              <Input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} />
            </Field>
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}>
                {Object.entries(DEADLINE_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
              {Object.entries(DEADLINE_STATUS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Notes (optional)">
            <Textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} rows={2} />
          </Field>
        </form>
      </Modal>
    </Card>
  )
}

function ActivitiesCard() {
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
    setForm({ ...a, dimensions: a.dimensions?.length ? a.dimensions : DEFAULT_ACTIVITY_DIMENSIONS[a.category] || [] })
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
          </Field>
          <Field label="Which parts of you does this grow?" hint="Tags it for your North Star map.">
            <DimensionTagPicker value={form.dimensions} onChange={(dimensions) => setForm((prev) => ({ ...prev, dimensions }))} />
          </Field>
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
