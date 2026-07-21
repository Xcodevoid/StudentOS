import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Trophy, Star } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { useToast } from '../../context/ToastContext'
import { Card, CardHeader } from '../ui/Card'
import { Button, IconButton } from '../ui/Button'
import { Field, Input, Select, Textarea } from '../ui/Form'
import { Modal } from '../ui/Modal'
import { Badge, EmptyState, StatCard } from '../ui/Misc'
import { formatDate, sortByDateAsc } from '../../lib/dates'
import { RECOGNITION_LEVELS, AWARD_CATEGORIES, isDistinguished } from '../../lib/awards'

const emptyAward = { title: '', level: 'school', category: '', issuer: '', date: '', description: '' }

export function AwardsTab() {
  const { data, addItem, updateItem, removeItem, recordActivityToday } = useStore()
  const { push } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyAward)

  const sorted = useMemo(() => sortByDateAsc(data.awards).reverse(), [data.awards])
  const distinguishedCount = useMemo(() => data.awards.filter((a) => isDistinguished(a.level)).length, [data.awards])

  function openAdd() {
    setForm(emptyAward)
    setEditingId(null)
    setModalOpen(true)
  }
  function openEdit(a) {
    setForm({ ...emptyAward, ...a })
    setEditingId(a.id)
    setModalOpen(true)
  }
  function save(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    if (editingId) {
      updateItem('awards', editingId, form)
    } else {
      addItem('awards', form)
      recordActivityToday()
      if (data.awards.length === 0) {
        push('First honor logged 🎉', { tone: 'success', description: 'This is exactly the specific detail that makes a brag sheet or interview answer land.' })
      }
    }
    setModalOpen(false)
  }

  return (
    <Card className="p-5">
      <CardHeader
        title="Honors & Awards"
        subtitle="Recognition compounds — even a small school-level award shows a pattern colleges notice."
        action={<Button size="sm" icon={Plus} onClick={openAdd}>Add Award</Button>}
      />

      {data.awards.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Total Honors" value={data.awards.length} />
          <StatCard label="National / International" value={distinguishedCount} tone={distinguishedCount > 0 ? 'accent' : 'default'} />
          <StatCard label="Categories" value={new Set(data.awards.map((a) => a.category).filter(Boolean)).size} />
        </div>
      )}

      <div className="mt-4">
        {sorted.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No honors logged yet"
            description="Academic awards, competition placements, leadership recognition — log it the moment you earn it."
            action={<Button size="sm" icon={Plus} onClick={openAdd}>Add Award</Button>}
          />
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/10">
            {sorted.map((a) => {
              const L = RECOGNITION_LEVELS[a.level] || RECOGNITION_LEVELS.school
              return (
                <div key={a.id} className="flex items-start gap-3 py-3.5 group">
                  <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {isDistinguished(a.level) ? <Star size={16} className="text-amber-500" /> : <Trophy size={16} className="text-neutral-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-medium text-neutral-900 dark:text-white">{a.title}</p>
                      <Badge tone={L.tone}>{L.label}</Badge>
                      {a.category && <Badge tone="neutral">{a.category}</Badge>}
                    </div>
                    <p className="text-[12.5px] text-neutral-400 mt-0.5">
                      {[a.issuer, a.date ? formatDate(a.date) : null].filter(Boolean).join(' · ')}
                    </p>
                    {a.description && <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2">{a.description}</p>}
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <IconButton icon={Pencil} onClick={() => openEdit(a)} />
                    <IconButton icon={Trash2} onClick={() => removeItem('awards', a.id)} />
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
        title={editingId ? 'Edit Award' : 'Add Award'}
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editingId ? 'Save Changes' : 'Add Award'}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Honor title">
            <Input autoFocus value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. Regional Science Fair — 1st Place" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Level of recognition">
              <Select value={form.level} onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}>
                {Object.entries(RECOGNITION_LEVELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Category">
              <Select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}>
                <option value="">Not specified</option>
                {AWARD_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Issuing organization" hint="Optional">
              <Input value={form.issuer} onChange={(e) => setForm((prev) => ({ ...prev, issuer: e.target.value }))} placeholder="e.g. State Science Foundation" />
            </Field>
            <Field label="Date">
              <Input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} />
            </Field>
          </div>
          <Field label="Description" hint="Optional — a sentence of context is plenty">
            <Textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={2} />
          </Field>
        </form>
      </Modal>
    </Card>
  )
}
