import { useState } from 'react'
import { Plus, Pencil, Trash2, Star, Code2, Award, Trophy, FlaskConical, Globe, Folder } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card, CardHeader } from '../ui/Card'
import { Button, IconButton } from '../ui/Button'
import { Field, Input, Select, Textarea, Checkbox } from '../ui/Form'
import { Modal } from '../ui/Modal'
import { Badge, EmptyState } from '../ui/Misc'
import { formatDate } from '../../lib/dates'
import { DEFAULT_PROJECT_DIMENSIONS } from '../../lib/northStar'
import { DimensionTagPicker } from '../northstar/DimensionTagPicker'
import { ImpactFraming } from '../collegeprep/ImpactFraming'

export const TYPES = {
  project: { label: 'Project', icon: Code2, tone: 'accent' },
  achievement: { label: 'Achievement', icon: Award, tone: 'amber' },
  competition: { label: 'Competition', icon: Trophy, tone: 'purple' },
  research: { label: 'Research', icon: FlaskConical, tone: 'green' },
  website: { label: 'Website', icon: Globe, tone: 'neutral' },
}

const emptyProject = {
  title: '',
  type: 'project',
  role: '',
  date: '',
  description: '',
  link: '',
  tags: '',
  featured: false,
  dimensions: DEFAULT_PROJECT_DIMENSIONS.project,
  problem: '',
  action: '',
  impactWho: '',
  growth: '',
}

export function ProjectsTab() {
  const { data, addItem, updateItem, removeItem } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyProject)

  function openAdd() {
    setForm(emptyProject)
    setEditingId(null)
    setModalOpen(true)
  }
  function openEdit(p) {
    setForm({
      ...emptyProject,
      ...p,
      tags: (p.tags || []).join(', '),
      dimensions: p.dimensions?.length ? p.dimensions : DEFAULT_PROJECT_DIMENSIONS[p.type] || [],
    })
    setEditingId(p.id)
    setModalOpen(true)
  }
  function save(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    }
    if (editingId) updateItem('projects', editingId, payload)
    else addItem('projects', payload)
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <CardHeader
          title="Your Entries"
          subtitle="Projects, achievements, competitions, research, and websites."
          action={
            <Button size="sm" icon={Plus} onClick={openAdd}>
              Add Entry
            </Button>
          }
        />
        <div className="mt-4">
          {data.projects.length === 0 ? (
            <EmptyState
              icon={Folder}
              title="Your portfolio is empty"
              description="Add a project, award, or competition — it'll appear on your generated portfolio page instantly."
              action={<Button size="sm" icon={Plus} onClick={openAdd}>Add Entry</Button>}
            />
          ) : (
            <div className="divide-y divide-black/5 dark:divide-white/10">
              {data.projects.map((p) => {
                const T = TYPES[p.type] || TYPES.project
                return (
                  <div key={p.id} className="flex items-start gap-3 py-4 group">
                    <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <T.icon size={16} className="text-neutral-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[14px] font-medium text-neutral-900 dark:text-white">{p.title}</p>
                        <Badge tone={T.tone}>{T.label}</Badge>
                        {p.featured && <Star size={13} className="text-amber-400 fill-amber-400" />}
                      </div>
                      <p className="text-[12.5px] text-neutral-400 mt-0.5">
                        {[p.role, p.date ? formatDate(p.date) : null].filter(Boolean).join(' · ')}
                      </p>
                      {p.description && <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2">{p.description}</p>}
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <IconButton icon={Pencil} onClick={() => openEdit(p)} />
                      <IconButton icon={Trash2} onClick={() => removeItem('projects', p.id)} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Entry' : 'Add Entry'}
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editingId ? 'Save Changes' : 'Add Entry'}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Title">
            <Input autoFocus value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. AI College Advisor App" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}>
                {Object.entries(TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Date">
              <Input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} />
            </Field>
          </div>
          <Field label="Your role">
            <Input value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))} placeholder="e.g. Founder & Lead Developer" />
          </Field>
          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="What did you build or achieve? What impact did it have?" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Link (optional)">
              <Input value={form.link} onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))} placeholder="https://…" />
            </Field>
            <Field label="Tags" hint="Comma separated">
              <Input value={form.tags} onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))} placeholder="React, Machine Learning" />
            </Field>
          </div>
          <Field label="Which parts of you does this grow?" hint="Tags it for your North Star map.">
            <DimensionTagPicker value={form.dimensions} onChange={(dimensions) => setForm((prev) => ({ ...prev, dimensions }))} />
          </Field>
          <ImpactFraming
            value={{ problem: form.problem, action: form.action, impactWho: form.impactWho, growth: form.growth }}
            onChange={(fields) => setForm((prev) => ({ ...prev, ...fields }))}
          />
          <label className="flex items-center gap-2 text-[13.5px] text-neutral-600 dark:text-neutral-300 cursor-pointer w-fit">
            <Checkbox checked={form.featured} onChange={() => setForm((prev) => ({ ...prev, featured: !form.featured }))} />
            Feature at the top of my portfolio
          </label>
        </form>
      </Modal>
    </div>
  )
}
