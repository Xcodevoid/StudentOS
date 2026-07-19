import { useMemo, useState } from 'react'
import { Plus, Trash2, ChevronDown, GraduationCap, ListTodo, Timer, Pause, Play, Square } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useTimer } from '../context/TimerContext'
import { Card, CardHeader } from '../components/ui/Card'
import { Button, IconButton } from '../components/ui/Button'
import { Field, Input, Select, Checkbox } from '../components/ui/Form'
import { Modal } from '../components/ui/Modal'
import { Badge, EmptyState, ProgressBar } from '../components/ui/Misc'
import { countdownLabel, formatDate, isOverdue, sortByDateAsc } from '../lib/dates'
import { EXAM_TYPES, EXAM_TYPE_OPTIONS, SUBJECTS_BY_TYPE } from '../lib/examTypes'

const DURATIONS = [15, 25, 45, 60]

function fmtClock(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function FocusTimerCard({ exams }) {
  const { status, remaining, total, label, start, pause, resume, stop } = useTimer()
  const [minutes, setMinutes] = useState(25)
  const [examId, setExamId] = useState('')

  return (
    <Card className="p-5">
      <CardHeader title="Focus Timer" subtitle="Study sessions count toward your streak and weekly total." />
      {status === 'idle' ? (
        <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-end">
          <Field label="Duration" className="flex-shrink-0">
            <div className="flex gap-1.5">
              {DURATIONS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMinutes(m)}
                  className={`px-3 py-2 rounded-xl text-[13.5px] font-medium transition-colors ${
                    minutes === m ? 'bg-accent-500 text-white' : 'bg-black/[0.05] text-neutral-600 dark:bg-white/10 dark:text-neutral-300'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </Field>
          <Field label="Studying for" className="flex-1 min-w-0">
            <Select value={examId} onChange={(e) => setExamId(e.target.value)}>
              <option value="">General studying</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </Select>
          </Field>
          <Button
            icon={Timer}
            onClick={() => start(minutes, { examId: examId || null, label: examId ? exams.find((e) => e.id === examId)?.name : 'General studying' })}
            className="flex-shrink-0"
          >
            Start Session
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-4">
          <p className="text-[32px] font-semibold tabular-nums text-neutral-900 dark:text-white flex-shrink-0">{fmtClock(remaining)}</p>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-medium text-neutral-700 dark:text-neutral-200 truncate">{label}</p>
            <ProgressBar value={total - remaining} max={total} className="mt-2" />
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {status === 'running' ? (
              <Button variant="secondary" size="sm" icon={Pause} onClick={pause}>Pause</Button>
            ) : (
              <Button variant="secondary" size="sm" icon={Play} onClick={resume}>Resume</Button>
            )}
            <Button variant="ghost" size="sm" icon={Square} onClick={stop}>Stop</Button>
          </div>
        </div>
      )}
    </Card>
  )
}

const emptyExam = { name: '', date: '', examType: 'ap' }

const FILTER_OPTIONS = [{ value: 'all', label: 'All' }, ...EXAM_TYPE_OPTIONS]

export default function Exams() {
  const { data, addItem, updateItem, removeItem, recordActivityToday } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyExam)
  const [expanded, setExpanded] = useState(null)
  const [topicInput, setTopicInput] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const sortedExams = useMemo(() => sortByDateAsc(data.exams), [data.exams])
  const visibleExams = useMemo(
    () => (typeFilter === 'all' ? sortedExams : sortedExams.filter((e) => (e.examType || 'other') === typeFilter)),
    [sortedExams, typeFilter]
  )

  function openAdd() {
    setForm(emptyExam)
    setModalOpen(true)
  }
  function save(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.date) return
    addItem('exams', form)
    setModalOpen(false)
  }
  function removeExam(id) {
    removeItem('exams', id)
    data.studyTasks.filter((t) => t.examId === id).forEach((t) => removeItem('studyTasks', t.id))
  }
  function addTopic(examId) {
    if (!topicInput.trim()) return
    addItem('studyTasks', { examId, topic: topicInput.trim(), done: false })
    setTopicInput('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-neutral-900 dark:text-white">Exam Planner</h1>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-1">Countdowns, study schedules, and topic checklists — for AP, IB, A-Level, and beyond.</p>
        </div>
        <Button size="sm" icon={Plus} onClick={openAdd} className="flex-shrink-0">
          Add Exam
        </Button>
      </div>

      <FocusTimerCard exams={sortedExams} />

      {sortedExams.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={GraduationCap}
            title="No exams yet"
            description="Add an AP, IB, or A-Level exam to start a countdown and build a study checklist."
            action={<Button size="sm" icon={Plus} onClick={openAdd}>Add Exam</Button>}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="inline-flex flex-wrap gap-1 p-1 rounded-full bg-black/[0.05] dark:bg-white/10">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`px-3 py-1 rounded-full text-[13px] font-medium transition-colors ${
                  typeFilter === f.value ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {visibleExams.map((exam) => {
            const topics = data.studyTasks.filter((t) => t.examId === exam.id)
            const done = topics.filter((t) => t.done).length
            const isOpen = expanded === exam.id
            const overdue = isOverdue(exam.date)
            return (
              <Card key={exam.id} className="overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 p-5 text-left"
                  onClick={() => setExpanded(isOpen ? null : exam.id)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[15px] font-semibold text-neutral-900 dark:text-white truncate">{exam.name}</p>
                      <Badge tone={EXAM_TYPES[exam.examType || 'other'].tone}>{EXAM_TYPES[exam.examType || 'other'].label}</Badge>
                    </div>
                    <p className="text-[12.5px] text-neutral-400 mt-0.5">{formatDate(exam.date)}</p>
                    {topics.length > 0 && (
                      <div className="flex items-center gap-2 mt-2 max-w-xs">
                        <ProgressBar value={done} max={topics.length} tone="green" />
                        <span className="text-[11.5px] text-neutral-400 flex-shrink-0">{done}/{topics.length}</span>
                      </div>
                    )}
                  </div>
                  <Badge tone={overdue ? 'neutral' : countdownLabel(exam.date) === 'Today' ? 'red' : 'accent'}>{countdownLabel(exam.date)}</Badge>
                  <ChevronDown size={18} className={`text-neutral-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-black/5 dark:border-white/10 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wide">Study Checklist</p>
                      <IconButton icon={Trash2} onClick={() => removeExam(exam.id)} />
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        addTopic(exam.id)
                      }}
                      className="flex gap-2 mb-3"
                    >
                      <Input
                        value={topicInput}
                        onChange={(e) => setTopicInput(e.target.value)}
                        placeholder="Add a topic to review…"
                      />
                      <Button type="submit" size="md" icon={Plus} aria-label="Add topic" />
                    </form>
                    {topics.length === 0 ? (
                      <EmptyState icon={ListTodo} title="No topics yet" description="Break the exam into review topics to track your prep." />
                    ) : (
                      <div className="space-y-1">
                        {topics.map((t) => (
                          <div key={t.id} className="flex items-center gap-3 py-1.5 group">
                            <Checkbox
                              checked={t.done}
                              onChange={() => {
                                if (!t.done) recordActivityToday()
                                updateItem('studyTasks', t.id, { done: !t.done })
                              }}
                            />
                            <span className={`flex-1 text-[14px] ${t.done ? 'line-through text-neutral-400' : 'text-neutral-800 dark:text-neutral-100'}`}>
                              {t.topic}
                            </span>
                            <button
                              onClick={() => removeItem('studyTasks', t.id)}
                              className="opacity-0 group-hover:opacity-100 text-[12px] text-neutral-400 hover:text-red-500 transition-opacity"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Exam"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>Add Exam</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Exam type">
            <div className="flex gap-1.5 flex-wrap">
              {EXAM_TYPE_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, examType: t.value }))}
                  className={`px-3 py-2 rounded-xl text-[13.5px] font-medium transition-colors ${
                    form.examType === t.value ? 'bg-accent-500 text-white' : 'bg-black/[0.05] text-neutral-600 dark:bg-white/10 dark:text-neutral-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Exam name">
            <Input
              autoFocus
              list="exam-subjects"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={SUBJECTS_BY_TYPE[form.examType]?.[5] || 'e.g. Chemistry'}
            />
            <datalist id="exam-subjects">
              {(SUBJECTS_BY_TYPE[form.examType] || []).map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
          <Field label="Exam date">
            <Input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} />
          </Field>
        </form>
      </Modal>
    </div>
  )
}
