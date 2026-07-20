import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Pencil, Trash2, Compass, Flag, GraduationCap, FileText, Copy, Printer, FileHeart, Gauge, Landmark } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useToast } from '../context/ToastContext'
import { Card, CardHeader } from '../components/ui/Card'
import { Button, IconButton } from '../components/ui/Button'
import { Field, Input, Select, Textarea } from '../components/ui/Form'
import { Modal } from '../components/ui/Modal'
import { Badge, EmptyState } from '../components/ui/Misc'
import { countdownLabel, formatDate, isOverdue, sortByDateAsc } from '../lib/dates'
import { CATEGORY_TYPES, APPLICATION_ROUNDS, OPPORTUNITY_STATUS } from '../lib/opportunities'
import { ACTIVITY_TYPES } from '../lib/activityTypes'
import { PolishChecklist } from '../components/collegeprep/PolishChecklist'
import { OpportunityChecklist } from '../components/collegeprep/OpportunityChecklist'
import RecommendersCard from '../components/collegepath/RecommendersCard'
import BragSheetView from '../components/collegepath/BragSheetView'
import TestPrepView from '../components/collegepath/TestPrepView'
import UniversitiesView from '../components/collegepath/UniversitiesView'
import {
  COMMON_APP_CATEGORIES,
  DEFAULT_COMMON_APP_TYPE,
  POSITION_MAX,
  SUMMARY_MAX,
  MAX_RANKED_ACTIVITIES,
  guessPosition,
  defaultSummary,
  formatActivityBlock,
  formatAllActivities,
  sortByImportance,
} from '../lib/commonApp'

const emptyOpportunity = {
  title: '',
  schoolName: '',
  date: '',
  category: 'college-application',
  applicationRound: '',
  status: 'not-started',
  notes: '',
  checklist: [],
}

const TABS = [
  { id: 'timeline', label: 'Timeline', icon: Compass },
  { id: 'opportunities', label: 'Opportunities', icon: Flag },
  { id: 'universities', label: 'Universities', icon: Landmark },
  { id: 'export', label: 'Common App Export', icon: FileText },
  { id: 'bragsheet', label: 'Brag Sheet', icon: FileHeart },
  { id: 'testprep', label: 'Test Prep', icon: Gauge },
]

export default function CollegePath() {
  const [searchParams] = useSearchParams()
  const requested = searchParams.get('tab')
  const [tab, setTab] = useState(TABS.some((t) => t.id === requested) ? requested : 'timeline')

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h1 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-neutral-900 dark:text-white">College Path</h1>
        <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-1">
          Every opportunity worth chasing — competitions, research, scholarships, summer programs, college applications.
        </p>
      </div>

      <div className="inline-flex p-1 rounded-full bg-black/[0.05] dark:bg-white/10 print:hidden">
        {TABS.map((t) => (
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

      {tab === 'timeline' && <TimelineView />}
      {tab === 'opportunities' && <OpportunitiesCard />}
      {tab === 'universities' && <UniversitiesView />}
      {tab === 'export' && <CommonAppExportView />}
      {tab === 'bragsheet' && (
        <div className="space-y-6">
          <RecommendersCard />
          <BragSheetView />
        </div>
      )}
      {tab === 'testprep' && <TestPrepView />}
    </div>
  )
}

function TimelineView() {
  const { data } = useStore()

  const events = useMemo(() => {
    const fromOpportunities = data.opportunities
      .filter((d) => d.date)
      .map((d) => ({ id: `dl-${d.id}`, date: d.date, kind: 'deadline', title: d.title, sub: d.schoolName, meta: CATEGORY_TYPES[d.category] }))
    const fromActivities = data.activities
      .filter((a) => a.startDate)
      .map((a) => ({ id: `ac-${a.id}`, date: a.startDate, kind: 'activity', title: a.title, sub: a.org, meta: ACTIVITY_TYPES[a.category] }))
    return sortByDateAsc([...fromOpportunities, ...fromActivities])
  }, [data.opportunities, data.activities])

  if (events.length === 0) {
    return (
      <Card className="p-5">
        <EmptyState icon={Compass} title="Your timeline is empty" description="Add opportunities here, or activities in Portfolio, to see them plotted here." />
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

function OpportunitiesCard() {
  const { data, addItem, updateItem, removeItem } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyOpportunity)
  const sorted = useMemo(() => sortByDateAsc(data.opportunities), [data.opportunities])

  function openAdd() {
    setForm(emptyOpportunity)
    setEditingId(null)
    setModalOpen(true)
  }
  function openEdit(d) {
    setForm({ ...emptyOpportunity, ...d })
    setEditingId(d.id)
    setModalOpen(true)
  }
  function save(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    if (editingId) updateItem('opportunities', editingId, form)
    else addItem('opportunities', form)
    setModalOpen(false)
  }

  return (
    <Card className="p-5">
      <CardHeader
        title="Opportunities"
        subtitle="College applications, competitions, research, scholarships, and summer programs."
        action={<Button size="sm" icon={Plus} onClick={openAdd}>Add Opportunity</Button>}
      />
      <div className="mt-4">
        {sorted.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No opportunities yet" description="Add a college application, competition, or program to track it." />
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/10">
            {sorted.map((d) => {
              const C = CATEGORY_TYPES[d.category] || CATEGORY_TYPES['college-application']
              const doneCount = (d.checklist || []).filter((c) => c.done).length
              return (
                <div key={d.id} className="flex items-center gap-3 py-3 group">
                  <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                    <C.icon size={16} className="text-neutral-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-medium text-neutral-900 dark:text-white truncate">{d.title}</p>
                      <Badge tone={C.tone}>{C.label}</Badge>
                      {d.applicationRound && <Badge tone={APPLICATION_ROUNDS[d.applicationRound]?.tone}>{APPLICATION_ROUNDS[d.applicationRound]?.label}</Badge>}
                      <Badge tone={OPPORTUNITY_STATUS[d.status]?.tone}>{OPPORTUNITY_STATUS[d.status]?.label}</Badge>
                    </div>
                    <p className="text-[12.5px] text-neutral-400 mt-0.5">
                      {[d.schoolName, d.date ? formatDate(d.date) : null, (d.checklist || []).length > 0 ? `${doneCount}/${d.checklist.length} prep steps` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  {d.date && !isOverdue(d.date) && <Badge tone="neutral">{countdownLabel(d.date)}</Badge>}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <IconButton icon={Pencil} onClick={() => openEdit(d)} />
                    <IconButton icon={Trash2} onClick={() => removeItem('opportunities', d.id)} />
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
        title={editingId ? 'Edit Opportunity' : 'Add Opportunity'}
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editingId ? 'Save Changes' : 'Add Opportunity'}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Title">
            <Input autoFocus value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. MIT — Early Action" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}>
                {Object.entries(CATEGORY_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="School / Organization">
              <Input value={form.schoolName} onChange={(e) => setForm((prev) => ({ ...prev, schoolName: e.target.value }))} placeholder="e.g. MIT" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Deadline date">
              <Input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} />
            </Field>
            {form.category === 'college-application' ? (
              <Field label="Application round">
                <Select value={form.applicationRound} onChange={(e) => setForm((prev) => ({ ...prev, applicationRound: e.target.value }))}>
                  {Object.entries(APPLICATION_ROUNDS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </Select>
              </Field>
            ) : (
              <Field label="Status">
                <Select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                  {Object.entries(OPPORTUNITY_STATUS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </Select>
              </Field>
            )}
          </div>
          {form.category === 'college-application' && (
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                {Object.entries(OPPORTUNITY_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Notes (optional)">
            <Textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} rows={2} />
          </Field>
          <Field label="Preparation checklist" hint="Essay drafted, recommender asked, transcript sent — whatever getting ready looks like here.">
            <OpportunityChecklist value={form.checklist} onChange={(checklist) => setForm((prev) => ({ ...prev, checklist }))} />
          </Field>
        </form>
      </Modal>
    </Card>
  )
}

function CommonAppExportView() {
  const { data } = useStore()
  const { push } = useToast()
  const sorted = useMemo(() => sortByImportance(data.activities), [data.activities])
  const overLimit = sorted.length > MAX_RANKED_ACTIVITIES

  function copyAll() {
    navigator.clipboard.writeText(formatAllActivities(sorted))
    push('Copied all activities', { description: 'Paste them into the Common App as you go.' })
  }

  if (sorted.length === 0) {
    return (
      <Card className="p-5">
        <EmptyState
          icon={FileText}
          title="No activities to export yet"
          description="Add activities in Portfolio and they'll show up here, ready to paste into the Common App."
        />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <CardHeader
          title="Common App Activities"
          subtitle={`${sorted.length} logged, sorted by time commitment — Common App only accepts ${MAX_RANKED_ACTIVITIES}, ranked by importance to you.`}
          action={
            <div className="flex items-center gap-2 no-print">
              <Button size="sm" variant="secondary" icon={Printer} onClick={() => window.print()}>
                Print
              </Button>
              <Button size="sm" icon={Copy} onClick={copyAll}>
                Copy all
              </Button>
            </div>
          }
        />
        {overLimit && (
          <p className="mt-3 text-[12.5px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-lg px-3 py-2">
            You have {sorted.length} activities logged — pick your strongest {MAX_RANKED_ACTIVITIES} for the actual application.
          </p>
        )}
        <p className="mt-3 text-[12px] text-neutral-400">
          Categories follow Common App's typical list — double check against this year's application.
        </p>
      </Card>

      <div className="space-y-3">
        {sorted.map((a, i) => (
          <ExportRow key={a.id} activity={a} rank={i + 1} overLimit={i >= MAX_RANKED_ACTIVITIES} />
        ))}
      </div>
    </div>
  )
}

function ExportRow({ activity, rank, overLimit }) {
  const { updateItem } = useStore()
  const { push } = useToast()
  const [type, setType] = useState(activity.commonAppType || DEFAULT_COMMON_APP_TYPE[activity.category] || 'Other Club/Activity')
  const [position, setPosition] = useState(activity.commonAppPosition || guessPosition(activity.title))
  const [summary, setSummary] = useState(defaultSummary(activity))

  function commitType(value) {
    setType(value)
    updateItem('activities', activity.id, { commonAppType: value })
  }
  function commitPosition() {
    if (position !== activity.commonAppPosition) updateItem('activities', activity.id, { commonAppPosition: position })
  }
  function commitSummary() {
    if (summary !== activity.commonAppSummary) updateItem('activities', activity.id, { commonAppSummary: summary })
  }
  function copyRow() {
    navigator.clipboard.writeText(formatActivityBlock({ ...activity, commonAppType: type, commonAppPosition: position, commonAppSummary: summary }))
    push('Copied to clipboard')
  }

  return (
    <Card className={`p-5 ${overLimit ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge>#{rank}</Badge>
            <p className="text-[14.5px] font-semibold text-neutral-900 dark:text-white">{activity.title}</p>
          </div>
          <p className="text-[12.5px] text-neutral-400 mt-0.5">
            {[activity.org, activity.hoursPerWeek ? `${activity.hoursPerWeek} hrs/wk` : null, activity.weeksPerYear ? `${activity.weeksPerYear} wks/yr` : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <IconButton icon={Copy} onClick={copyRow} className="flex-shrink-0 no-print" />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <Field label="Common App category">
          <Select value={type} onChange={(e) => commitType(e.target.value)}>
            {COMMON_APP_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Position / leadership" hint={`${position.length}/${POSITION_MAX} characters`}>
          <Input
            value={position}
            maxLength={POSITION_MAX}
            onChange={(e) => setPosition(e.target.value)}
            onBlur={commitPosition}
            placeholder="e.g. Team Captain"
          />
        </Field>
      </div>
      <Field label="Description" hint={`${summary.length}/${SUMMARY_MAX} characters`} className="mt-3">
        <Textarea
          value={summary}
          maxLength={SUMMARY_MAX}
          rows={2}
          onChange={(e) => setSummary(e.target.value)}
          onBlur={commitSummary}
          placeholder="What did you accomplish? What recognition did you receive?"
        />
        <PolishChecklist text={summary} dimensions={activity.dimensions} />
      </Field>
    </Card>
  )
}
