import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Sparkles, Eye, Printer, ExternalLink, Star, Code2, Award, Trophy, FlaskConical, Globe, Folder } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { Card, CardHeader } from '../components/ui/Card'
import { Button, IconButton } from '../components/ui/Button'
import { Field, Input, Select, Textarea, Checkbox } from '../components/ui/Form'
import { Modal } from '../components/ui/Modal'
import { Badge, EmptyState } from '../components/ui/Misc'
import { formatDate } from '../lib/dates'
import { DEFAULT_PROJECT_DIMENSIONS } from '../lib/northStar'
import { DimensionTagPicker } from '../components/northstar/DimensionTagPicker'
import { ImpactFraming } from '../components/collegeprep/ImpactFraming'

const TYPES = {
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

export default function Portfolio() {
  const [view, setView] = useState('manage')

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-neutral-900 dark:text-white">Project Portfolio</h1>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-1">Log your work once — get a shareable portfolio for free.</p>
        </div>
        <div className="inline-flex p-1 rounded-full bg-black/[0.05] dark:bg-white/10 flex-shrink-0">
          {[
            { id: 'manage', label: 'Manage', icon: Sparkles },
            { id: 'preview', label: 'Preview', icon: Eye },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13.5px] font-medium transition-colors ${
                view === t.id ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500'
              }`}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'manage' ? <ManageView /> : <PreviewView />}
    </div>
  )
}

function ManageView() {
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

function PreviewView() {
  const { data } = useStore()
  const sorted = useMemo(() => {
    const list = [...data.projects]
    list.sort((a, b) => (b.featured - a.featured) || (new Date(b.date || 0) - new Date(a.date || 0)))
    return list
  }, [data.projects])

  if (data.projects.length === 0) {
    return (
      <Card className="p-5">
        <EmptyState icon={Eye} title="Nothing to preview yet" description="Add entries in the Manage tab and they'll appear here as a shareable portfolio." />
      </Card>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-3 no-print">
        <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
          Print / Save as PDF
        </Button>
      </div>
      <Card className="p-6 sm:p-10" id="portfolio-print">
        <div className="text-center border-b border-black/5 dark:border-white/10 pb-6 mb-6">
          <h2 className="text-[28px] font-semibold tracking-tight text-neutral-900 dark:text-white">{data.profile.name || 'Your Name'}</h2>
          <p className="text-[13.5px] text-neutral-400 mt-1">
            {[data.profile.gradeLevel, data.profile.school].filter(Boolean).join(' · ')}
          </p>
          {data.profile.bio && <p className="text-[14px] text-neutral-600 dark:text-neutral-300 mt-3 max-w-xl mx-auto leading-relaxed">{data.profile.bio}</p>}
        </div>

        <div className="space-y-5">
          {sorted.map((p) => {
            const T = TYPES[p.type] || TYPES.project
            return (
              <div key={p.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                  <T.icon size={17} className="text-neutral-500" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white">{p.title}</h3>
                    <span className="text-[12px] text-neutral-400 flex-shrink-0">{p.date ? formatDate(p.date) : ''}</span>
                  </div>
                  <p className="text-[12.5px] text-neutral-400 mt-0.5">
                    {[T.label, p.role].filter(Boolean).join(' · ')}
                  </p>
                  {p.description && <p className="text-[13.5px] text-neutral-600 dark:text-neutral-300 mt-1.5 leading-relaxed">{p.description}</p>}
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    {(p.tags || []).map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12px] text-accent-600 dark:text-accent-400 hover:underline">
                        <ExternalLink size={11} /> View
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
