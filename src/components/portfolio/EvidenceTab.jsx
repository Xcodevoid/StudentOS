import { useMemo, useState } from 'react'
import {
  Plus, Pencil, Trash2, Award, Image as ImageIcon, Link as LinkIcon, FileText, Trophy, Presentation, Camera, ExternalLink, FolderOpen,
} from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Card, CardHeader } from '../ui/Card'
import { Button, IconButton } from '../ui/Button'
import { Field, Input, Select, Textarea } from '../ui/Form'
import { Modal } from '../ui/Modal'
import { Badge, EmptyState } from '../ui/Misc'
import { DimensionTagPicker } from '../northstar/DimensionTagPicker'
import { DIMENSIONS } from '../../lib/northStar'
import { formatDate } from '../../lib/dates'
import { todayKey } from '../../lib/momentum'
import { uploadEvidenceFile, getEvidenceSignedUrl, deleteEvidenceFile } from '../../lib/evidenceStorage'

const EVIDENCE_TYPES = {
  certificate: { label: 'Certificate', icon: Award, needsFile: true },
  screenshot: { label: 'Screenshot', icon: ImageIcon, needsFile: true },
  link: { label: 'Link', icon: LinkIcon, needsFile: false },
  note: { label: 'Note', icon: FileText, needsFile: false },
  award: { label: 'Award', icon: Trophy, needsFile: true },
  presentation: { label: 'Presentation', icon: Presentation, needsFile: true },
  photo: { label: 'Photo', icon: Camera, needsFile: true },
}

const DIM_BY_ID = Object.fromEntries(DIMENSIONS.map((d) => [d.id, d]))

const emptyEvidence = {
  title: '',
  type: 'note',
  url: '',
  storagePath: '',
  linkedProjectId: '',
  linkedActivityId: '',
  dimensions: [],
  date: todayKey(),
  notes: '',
}

export function EvidenceTab() {
  const { data, addItem, updateItem, removeItem, mode } = useStore()
  const { user } = useAuth()
  const { push } = useToast()
  const cloudActive = mode === 'cloud'

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyEvidence)
  const [pendingFile, setPendingFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const sorted = useMemo(() => [...data.evidence].sort((a, b) => (b.date || '').localeCompare(a.date || '')), [data.evidence])

  function openAdd() {
    setForm(emptyEvidence)
    setPendingFile(null)
    setEditingId(null)
    setModalOpen(true)
  }
  function openEdit(item) {
    setForm({ ...emptyEvidence, ...item })
    setPendingFile(null)
    setEditingId(item.id)
    setModalOpen(true)
  }

  async function save(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      let storagePath = form.storagePath
      if (pendingFile && cloudActive) {
        storagePath = await uploadEvidenceFile(user.id, pendingFile)
      }
      const payload = { ...form, storagePath }
      if (editingId) updateItem('evidence', editingId, payload)
      else addItem('evidence', payload)
      setModalOpen(false)
    } catch (err) {
      push('Could not save evidence', { description: err.message || 'Try again in a moment.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(item) {
    if (item.storagePath) await deleteEvidenceFile(item.storagePath)
    removeItem('evidence', item.id)
  }

  async function handleView(item) {
    if (item.storagePath) {
      try {
        const url = await getEvidenceSignedUrl(item.storagePath)
        if (url) window.open(url, '_blank', 'noreferrer')
      } catch {
        push('Could not open file', { description: 'Try again in a moment.' })
      }
    } else if (item.url) {
      window.open(item.url, '_blank', 'noreferrer')
    }
  }

  const T = EVIDENCE_TYPES[form.type] || EVIDENCE_TYPES.note
  const showFileInput = T.needsFile && cloudActive
  const showUrlInput = !T.needsFile || !cloudActive

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <CardHeader
          title="Your Evidence"
          subtitle={cloudActive ? 'Files and links both work here.' : 'Links and notes work now — sign in to attach files.'}
          action={<Button size="sm" icon={Plus} onClick={openAdd}>Add Evidence</Button>}
        />
        <div className="mt-4">
          {sorted.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="Nothing saved yet"
              description="Log a certificate, a link, or a quick note the moment you earn it — future you won't remember the details."
              action={<Button size="sm" icon={Plus} onClick={openAdd}>Add Evidence</Button>}
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {sorted.map((item) => {
                const IT = EVIDENCE_TYPES[item.type] || EVIDENCE_TYPES.note
                const linkedProject = data.projects.find((p) => p.id === item.linkedProjectId)
                const linkedActivity = data.activities.find((a) => a.id === item.linkedActivityId)
                return (
                  <div key={item.id} className="rounded-2xl border border-black/5 dark:border-white/10 p-4 group">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                        <IT.icon size={16} className="text-neutral-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[14px] font-medium text-neutral-900 dark:text-white truncate">{item.title}</p>
                          <Badge>{IT.label}</Badge>
                        </div>
                        <p className="text-[12px] text-neutral-400 mt-0.5">
                          {[item.date ? formatDate(item.date) : null, linkedProject?.title, linkedActivity?.title].filter(Boolean).join(' · ')}
                        </p>
                        {item.notes && <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2">{item.notes}</p>}
                        {item.dimensions?.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap mt-2">
                            {item.dimensions.map((dimId) => (
                              <Badge key={dimId} tone="accent">{DIM_BY_ID[dimId]?.shortLabel || dimId}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <IconButton icon={Pencil} onClick={() => openEdit(item)} />
                        <IconButton icon={Trash2} onClick={() => handleRemove(item)} />
                      </div>
                    </div>
                    {(item.storagePath || item.url) && (
                      <button
                        onClick={() => handleView(item)}
                        className="inline-flex items-center gap-1 text-[12px] text-accent-600 dark:text-accent-400 hover:underline mt-2.5"
                      >
                        <ExternalLink size={11} /> {item.storagePath ? 'View file' : 'Open link'}
                      </button>
                    )}
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
        title={editingId ? 'Edit Evidence' : 'Add Evidence'}
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Evidence'}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Title">
            <Input autoFocus value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. Regional Science Fair Certificate" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}>
                {Object.entries(EVIDENCE_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Date">
              <Input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} />
            </Field>
          </div>

          {showFileInput && (
            <Field label="File" hint={pendingFile ? pendingFile.name : form.storagePath ? 'A file is already attached — choose a new one to replace it.' : 'Image or PDF.'}>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setPendingFile(e.target.files?.[0] || null)}
                className="block w-full text-[13.5px] text-neutral-500 dark:text-neutral-400 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-[13px] file:font-medium file:bg-black/[0.05] file:text-neutral-700 dark:file:bg-white/10 dark:file:text-neutral-200"
              />
            </Field>
          )}
          {showUrlInput && (
            <Field label="Link (optional)" hint={T.needsFile && !cloudActive ? "Sign in to attach a file directly — for now, paste a link to where it's hosted." : undefined}>
              <Input value={form.url} onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))} placeholder="https://…" />
            </Field>
          )}

          <Field label="Notes (optional)">
            <Textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} rows={2} placeholder="What is this proof of? Any context worth remembering." />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Link to a project (optional)">
              <Select value={form.linkedProjectId} onChange={(e) => setForm((prev) => ({ ...prev, linkedProjectId: e.target.value }))}>
                <option value="">None</option>
                {data.projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </Select>
            </Field>
            <Field label="Link to an activity (optional)">
              <Select value={form.linkedActivityId} onChange={(e) => setForm((prev) => ({ ...prev, linkedActivityId: e.target.value }))}>
                <option value="">None</option>
                {data.activities.map((a) => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Which parts of you does this grow?" hint="Tags it for your North Star map.">
            <DimensionTagPicker value={form.dimensions} onChange={(dimensions) => setForm((prev) => ({ ...prev, dimensions }))} />
          </Field>
        </form>
      </Modal>
    </div>
  )
}
