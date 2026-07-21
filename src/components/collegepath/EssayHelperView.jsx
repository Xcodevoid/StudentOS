import { useMemo, useState } from 'react'
import { ChevronDown, Sparkles, FileText, Pencil, Trash2, PenSquare } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card, CardHeader } from '../ui/Card'
import { Button, IconButton } from '../ui/Button'
import { Field, Input, Select, Textarea } from '../ui/Form'
import { Modal } from '../ui/Modal'
import { EmptyState, ProgressBar } from '../ui/Misc'
import { PROMPT_TYPES, matchStoriesToPrompt, analyzeEssayDraft } from '../../lib/essayHelper'
import { formatChapterText } from '../../lib/storyBuilder'

const emptyEssay = { promptId: '', customPrompt: '', title: '', wordLimit: 650, linkedEntryId: '', linkedEntryKind: '', draft: '' }

export default function EssayHelperView() {
  const { data, addItem, updateItem, removeItem } = useStore()
  const [expandedPrompt, setExpandedPrompt] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyEssay)

  function startFromMatch(promptType, match) {
    setForm({
      ...emptyEssay,
      promptId: promptType.id,
      title: promptType.label,
      linkedEntryId: match ? match.chapter.id : '',
      linkedEntryKind: match ? match.chapter.kind : '',
      draft: match ? formatChapterText(match.chapter) : '',
    })
    setEditingId(null)
    setModalOpen(true)
  }

  function openEdit(essay) {
    setForm({ ...emptyEssay, ...essay })
    setEditingId(essay.id)
    setModalOpen(true)
  }

  function save(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    const payload = { ...form, wordLimit: form.wordLimit === '' ? '' : Number(form.wordLimit) }
    if (editingId) updateItem('essays', editingId, payload)
    else addItem('essays', payload)
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <CardHeader
          title="Find Your Story"
          subtitle="Every prompt below is matched against your Portfolio's Challenge → Action → Impact framing — not a blank page."
        />
        <div className="mt-4 space-y-2">
          {['Common App', 'Supplemental'].map((group) => (
            <div key={group}>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-400 mt-3 mb-1.5">{group}</p>
              {PROMPT_TYPES.filter((p) => p.group === group).map((p) => {
                const isOpen = expandedPrompt === p.id
                const matches = isOpen ? matchStoriesToPrompt(p, data) : []
                return (
                  <div key={p.id} className="border-t border-black/5 dark:border-white/10 first:border-t-0 py-3">
                    <button className="w-full flex items-center justify-between gap-3 text-left" onClick={() => setExpandedPrompt(isOpen ? null : p.id)}>
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-neutral-900 dark:text-white">{p.label}</p>
                        <p className="text-[12.5px] text-neutral-400 mt-0.5 line-clamp-1">{p.prompt}</p>
                      </div>
                      <ChevronDown size={16} className={`text-neutral-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="mt-3 pl-1">
                        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mb-3">{p.prompt}</p>
                        <p className="text-[12px] text-neutral-400 italic mb-3">{p.structureHint}</p>
                        {matches.length === 0 ? (
                          <EmptyState
                            icon={Sparkles}
                            title="No strong match yet"
                            description="Add Challenge/Action/Impact framing to a project or activity in Portfolio to see matches here."
                            action={<Button size="sm" icon={PenSquare} onClick={() => startFromMatch(p, null)}>Start from scratch</Button>}
                          />
                        ) : (
                          <div className="space-y-2">
                            {matches.map((m) => (
                              <div key={m.chapter.id} className="flex items-center gap-3 bg-black/[0.02] dark:bg-white/5 rounded-xl p-3">
                                <div className="min-w-0 flex-1">
                                  <p className="text-[13.5px] font-medium text-neutral-900 dark:text-white truncate">{m.chapter.title}</p>
                                  <p className="text-[12px] text-neutral-400 mt-0.5">{m.reason}</p>
                                </div>
                                <Button size="sm" variant="secondary" onClick={() => startFromMatch(p, m)}>Use this</Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <CardHeader title="My Essays" subtitle="Drafts, checked against the same things a counselor would flag by eye." />
        <div className="mt-4">
          {data.essays.length === 0 ? (
            <EmptyState icon={FileText} title="No essays started" description="Pick a matched story above, or start one from scratch." />
          ) : (
            <div className="divide-y divide-black/5 dark:divide-white/10">
              {data.essays.map((essay) => {
                const promptType = PROMPT_TYPES.find((p) => p.id === essay.promptId)
                const wc = (essay.draft || '').trim() ? essay.draft.trim().split(/\s+/).length : 0
                return (
                  <div key={essay.id} className="flex items-center gap-3 py-3 group">
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-neutral-900 dark:text-white truncate">{essay.title}</p>
                      <p className="text-[12px] text-neutral-400 mt-0.5">
                        {[promptType?.label, `${wc}${essay.wordLimit ? ` / ${essay.wordLimit}` : ''} words`].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <IconButton icon={Pencil} onClick={() => openEdit(essay)} />
                      <IconButton icon={Trash2} onClick={() => removeItem('essays', essay.id)} />
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
        title={editingId ? 'Edit Essay' : 'New Essay'}
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editingId ? 'Save Changes' : 'Create Essay'}</Button>
          </>
        }
      >
        <EssayForm form={form} setForm={setForm} onSubmit={save} />
      </Modal>
    </div>
  )
}

function EssayForm({ form, setForm, onSubmit }) {
  const analysis = useMemo(() => analyzeEssayDraft(form.draft, Number(form.wordLimit) || null), [form.draft, form.wordLimit])

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Title">
        <Input autoFocus value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. Common App — Personal Growth" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Prompt">
          <Select value={form.promptId} onChange={(e) => setForm((prev) => ({ ...prev, promptId: e.target.value }))}>
            <option value="">Custom / none</option>
            {PROMPT_TYPES.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Word limit">
          <Input type="number" min="0" value={form.wordLimit} onChange={(e) => setForm((prev) => ({ ...prev, wordLimit: e.target.value }))} placeholder="650" />
        </Field>
      </div>
      <Field label="Draft" hint={`${(form.draft || '').trim() ? form.draft.trim().split(/\s+/).length : 0} words`}>
        <Textarea rows={10} value={form.draft} onChange={(e) => setForm((prev) => ({ ...prev, draft: e.target.value }))} placeholder="Start writing — or edit the story outline that's already here." />
      </Field>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <ProgressBar value={analysis.score} max={analysis.total} tone={analysis.score === analysis.total ? 'green' : 'accent'} className="flex-1" />
          <span className="text-[12px] text-neutral-400 flex-shrink-0">{analysis.score}/{analysis.total}</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-1.5">
          {analysis.checks.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.pass ? 'bg-green-500' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
              <span className={`text-[12px] ${c.pass ? 'text-neutral-500' : 'text-neutral-400'}`}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </form>
  )
}
