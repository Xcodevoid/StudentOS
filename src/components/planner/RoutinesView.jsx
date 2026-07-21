import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Repeat } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Card, CardHeader } from '../ui/Card'
import { Button, IconButton } from '../ui/Button'
import { Field, Input, Select } from '../ui/Form'
import { Modal } from '../ui/Modal'
import { Badge, EmptyState } from '../ui/Misc'
import { CATEGORIES, WEEKDAYS, formatTimeLabel } from '../../lib/planner'
import { DaysPicker, EVERY_DAY, WEEKDAYS_ONLY } from './DaysPicker'

const emptyRoutine = { label: '', category: 'sleep', startTime: '22:30', endTime: '06:30', days: EVERY_DAY, recurring: true }

const PRESETS = [
  { label: 'Sleep', category: 'sleep', startTime: '22:30', endTime: '06:30', days: EVERY_DAY },
  { label: 'Breakfast', category: 'meal', startTime: '07:00', endTime: '07:30', days: EVERY_DAY },
  { label: 'Lunch', category: 'meal', startTime: '12:00', endTime: '12:30', days: WEEKDAYS_ONLY },
  { label: 'Dinner', category: 'meal', startTime: '18:00', endTime: '18:30', days: EVERY_DAY },
  { label: 'Morning routine', category: 'hygiene', startTime: '06:30', endTime: '07:00', days: EVERY_DAY },
  { label: 'Get ready for bed', category: 'hygiene', startTime: '22:00', endTime: '22:30', days: EVERY_DAY },
]

export function RoutinesView() {
  const { data, addItem, updateItem, removeItem } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyRoutine)

  const routines = useMemo(
    () => [...data.plannerBlocks.filter((b) => b.recurring)].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [data.plannerBlocks]
  )
  const existingLabels = useMemo(() => new Set(routines.map((r) => r.label)), [routines])

  function openAdd(preset) {
    setForm(preset ? { ...emptyRoutine, ...preset } : emptyRoutine)
    setEditingId(null)
    setModalOpen(true)
  }
  function openEdit(r) {
    setForm({ ...emptyRoutine, ...r })
    setEditingId(r.id)
    setModalOpen(true)
  }
  function save(e) {
    e.preventDefault()
    if (!form.label.trim() || form.days.length === 0) return
    const payload = { ...form, recurring: true, date: '' }
    if (editingId) updateItem('plannerBlocks', editingId, payload)
    else addItem('plannerBlocks', payload)
    setModalOpen(false)
  }

  return (
    <Card className="p-5">
      <CardHeader
        title="Weekly Routine"
        subtitle="The fixed skeleton of your week — sleep, meals, and anything else that happens the same time every day."
        action={<Button size="sm" icon={Plus} onClick={() => openAdd()}>Add Routine</Button>}
      />

      {PRESETS.some((p) => !existingLabels.has(p.label)) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.filter((p) => !existingLabels.has(p.label)).map((p) => (
            <button
              key={p.label}
              onClick={() => openAdd(p)}
              className="px-3 py-1.5 rounded-full text-[12.5px] font-medium bg-black/[0.05] dark:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.08] dark:hover:bg-white/15"
            >
              + {p.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4">
        {routines.length === 0 ? (
          <EmptyState icon={Repeat} title="No routine set yet" description="Start with the presets above, or add your own — this is what Auto-Arrange builds around." />
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/10">
            {routines.map((r) => {
              const C = CATEGORIES[r.category] || CATEGORIES.custom
              const allDays = r.days.length === 7
              const weekdaysOnly = r.days.length === 5 && WEEKDAYS_ONLY.every((d) => r.days.includes(d))
              return (
                <div key={r.id} className="flex items-center gap-3 py-3 group">
                  <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                    <C.icon size={16} className="text-neutral-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-medium text-neutral-900 dark:text-white">{r.label}</p>
                      <Badge tone={C.tone}>{C.label}</Badge>
                    </div>
                    <p className="text-[12.5px] text-neutral-400 mt-0.5">
                      {formatTimeLabel(r.startTime)} – {formatTimeLabel(r.endTime)} · {allDays ? 'Every day' : weekdaysOnly ? 'Weekdays' : r.days.map((d) => WEEKDAYS[d]).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <IconButton icon={Pencil} onClick={() => openEdit(r)} />
                    <IconButton icon={Trash2} onClick={() => removeItem('plannerBlocks', r.id)} />
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
        title={editingId ? 'Edit Routine' : 'Add Routine'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editingId ? 'Save Changes' : 'Add Routine'}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Label">
            <Input autoFocus value={form.label} onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))} placeholder="e.g. Sleep" />
          </Field>
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}>
              {Object.entries(CATEGORIES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start time">
              <Input type="time" value={form.startTime} onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))} />
            </Field>
            <Field label="End time">
              <Input type="time" value={form.endTime} onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))} />
            </Field>
          </div>
          <Field label="Which days?">
            <DaysPicker value={form.days} onChange={(days) => setForm((prev) => ({ ...prev, days }))} />
          </Field>
        </form>
      </Modal>
    </Card>
  )
}
