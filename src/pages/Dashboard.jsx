import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Plus, Sparkles, Target, GraduationCap, Rocket, Flame, Zap, Star } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Checkbox, Input } from '../components/ui/Form'
import { Badge, ProgressBar, EmptyState, StatCard, SectionTitle } from '../components/ui/Misc'
import { ProgressRing } from '../components/ui/ProgressRing'
import { RadarChart } from '../components/northstar/RadarChart'
import { computeGPA } from '../lib/gpa'
import { countdownLabel, formatDate, isOverdue, isToday, isoWeekKey, currentWeekRangeLabel, sortByDateAsc, parseLocalDate } from '../lib/dates'
import { seedDemoData } from '../lib/seed'
import { computeStreak } from '../lib/streak'
import { EXAM_TYPES } from '../lib/examTypes'
import { computeMomentumScore, todayKey } from '../lib/momentum'
import { computeNorthStar, tierTone } from '../lib/northStar'

export default function Dashboard() {
  const { data, addItem, toggleItem, updateItem, removeItem, setProfile, replaceAll, recordActivityToday } = useStore()
  const [quickTask, setQuickTask] = useState('')
  const [quickGoal, setQuickGoal] = useState('')
  const [nameInput, setNameInput] = useState('')

  const gpa = useMemo(() => computeGPA(data.classes), [data.classes])
  const streak = useMemo(() => computeStreak(data.streak.datesActive), [data.streak.datesActive])

  const momentum = useMemo(() => computeMomentumScore(data), [data])
  const northStar = useMemo(() => computeNorthStar(data), [data])
  const todaysMission = useMemo(() => data.commitments.filter((c) => c.date === todayKey()), [data.commitments])

  const minutesStudiedThisWeek = useMemo(() => {
    const weekKey = isoWeekKey()
    return data.studySessions
      .filter((s) => isoWeekKey(parseLocalDate(s.date)) === weekKey)
      .reduce((sum, s) => sum + s.minutes, 0)
  }, [data.studySessions])

  const todayTasks = useMemo(() => {
    const fromAssignments = data.assignments
      .filter((a) => a.status !== 'done' && (isToday(a.dueDate) || isOverdue(a.dueDate)))
      .map((a) => ({ id: a.id, entity: 'assignments', title: a.title, dueDate: a.dueDate, done: a.status === 'done' }))
    const fromTasks = data.tasks
      .filter((t) => !t.done && (isToday(t.dueDate) || isOverdue(t.dueDate) || !t.dueDate))
      .map((t) => ({ id: t.id, entity: 'tasks', title: t.title, dueDate: t.dueDate, done: t.done }))
    return sortByDateAsc([...fromAssignments, ...fromTasks], 'dueDate')
  }, [data.assignments, data.tasks])

  const upcomingExams = useMemo(() => sortByDateAsc(data.exams.filter((e) => !isOverdue(e.date))).slice(0, 4), [data.exams])

  const weekKey = isoWeekKey()
  const weekGoals = useMemo(() => data.goals.filter((g) => g.week === weekKey), [data.goals, weekKey])

  const assignmentProgress = useMemo(() => {
    const total = data.assignments.length
    const done = data.assignments.filter((a) => a.status === 'done').length
    return { total, done }
  }, [data.assignments])

  const isFirstRun = !data.profile.onboarded && data.classes.length === 0 && data.projects.length === 0

  function handleQuickTask(e) {
    e.preventDefault()
    if (!quickTask.trim()) return
    addItem('tasks', { title: quickTask.trim(), dueDate: new Date().toISOString().slice(0, 10), done: false })
    setQuickTask('')
  }

  function handleQuickGoal(e) {
    e.preventDefault()
    if (!quickGoal.trim()) return
    addItem('goals', { text: quickGoal.trim(), done: false, week: weekKey })
    setQuickGoal('')
  }

  if (isFirstRun) {
    return (
      <div className="max-w-lg mx-auto mt-6 sm:mt-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-accent-500/20">
          <Rocket size={26} className="text-white" strokeWidth={2} />
        </div>
        <h1 className="text-[26px] font-semibold tracking-tight text-neutral-900 dark:text-white">Welcome to StudentOS</h1>
        <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
          Your grades, exams, projects, and college prep — in one place, saved only on this device.
        </p>
        <Card className="mt-7 p-5 text-left">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setProfile({ name: nameInput.trim() || 'Student', onboarded: true })
            }}
            className="space-y-3"
          >
            <label className="block text-[13px] font-medium text-neutral-600 dark:text-neutral-300">What's your name?</label>
            <Input autoFocus value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="e.g. Jamie Chen" />
            <Button type="submit" className="w-full" size="lg">
              Start with a blank workspace
            </Button>
          </form>
          <div className="flex items-center gap-3 my-4">
            <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
            <span className="text-[12px] text-neutral-400">or</span>
            <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
          </div>
          <Button variant="secondary" className="w-full" size="lg" icon={Sparkles} onClick={() => replaceAll(seedDemoData())}>
            Explore with sample data
          </Button>
        </Card>
        <p className="text-[12px] text-neutral-400 mt-5">Nothing leaves your browser. No account, no server, no ads.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-neutral-900 dark:text-white">
            {greeting()}, {data.profile.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {streak.current > 0 && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold ${
              streak.atRisk ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' : 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400'
            }`}
            title={streak.atRisk ? 'Complete something today to keep your streak alive' : 'Consecutive days active'}
          >
            <Flame size={15} strokeWidth={2.25} fill="currentColor" />
            {streak.current} day{streak.current === 1 ? '' : 's'}{streak.atRisk ? ' — keep it going!' : ''}
          </div>
        )}
      </div>

      {/* Momentum */}
      <Link to="/momentum" className="block">
        <Card hover className="p-5 flex items-center gap-4 sm:gap-5">
          <ProgressRing
            value={momentum.score ?? 0}
            size={64}
            strokeWidth={6}
            tone={momentum.score === null ? 'accent' : momentum.score >= 65 ? 'green' : momentum.score >= 40 ? 'amber' : 'red'}
          >
            <span className="text-[16px] font-semibold text-neutral-900 dark:text-white">{momentum.score ?? <Zap size={18} className="text-accent-500" />}</span>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-neutral-900 dark:text-white">Momentum</p>
            <p className="text-[13px] text-neutral-500 dark:text-neutral-400 truncate">
              {momentum.tier || "Set today's mission to get your first score"}
            </p>
            <p className="text-[12px] text-neutral-400 mt-0.5">
              {todaysMission.length > 0
                ? `${todaysMission.filter((c) => c.done).length}/${todaysMission.length} today's mission done`
                : 'No mission set for today'}
            </p>
          </div>
          <Button variant="secondary" size="sm" className="flex-shrink-0">Open</Button>
        </Card>
      </Link>

      {/* North Star */}
      <Link to="/north-star" className="block">
        <Card hover className="p-5 flex items-center gap-4 sm:gap-5">
          <RadarChart dimensions={northStar.dimensions} tone={tierTone(northStar.overallScore)} size={64} showLabels={false} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-semibold text-neutral-900 dark:text-white">North Star</p>
              {northStar.overallScore !== null ? (
                <span className="text-[13px] font-semibold text-accent-600 dark:text-accent-400">{northStar.overallScore}</span>
              ) : (
                <Star size={14} className="text-accent-500" />
              )}
            </div>
            <p className="text-[13px] text-neutral-500 dark:text-neutral-400 truncate">
              {northStar.overallTier || 'Tag a project or activity to start your growth map'}
            </p>
            <p className="text-[12px] text-neutral-400 mt-0.5">Your holistic identity — beyond grades</p>
          </div>
          <Button variant="secondary" size="sm" className="flex-shrink-0">Open</Button>
        </Card>
      </Link>

      {/* Progress overview */}
      <div>
        <SectionTitle>Progress Overview</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Weighted GPA" value={gpa.weighted ?? '—'} sub={gpa.unweighted ? `${gpa.unweighted} unweighted` : 'No grades yet'} tone="accent" />
          <StatCard label="Assignments Done" value={`${assignmentProgress.done}/${assignmentProgress.total}`} sub="This term" />
          <StatCard label="Portfolio Items" value={data.projects.length} sub="Projects & achievements" />
          <StatCard label="Opportunities Ahead" value={data.opportunities.filter((d) => !isOverdue(d.date)).length} sub="College prep" />
          <StatCard label="Day Streak" value={streak.current} sub={streak.current > 0 ? 'Keep it up' : 'Complete a task today'} />
          <StatCard label="Studied This Week" value={minutesStudiedThisWeek > 0 ? `${minutesStudiedThisWeek}m` : '—'} sub="Focus sessions" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's tasks */}
        <Card className="lg:col-span-2 p-5">
          <CardHeader title="Today's Tasks" subtitle="Due today or overdue" />
          <form onSubmit={handleQuickTask} className="flex gap-2 mt-4">
            <Input value={quickTask} onChange={(e) => setQuickTask(e.target.value)} placeholder="Quick add a task…" />
            <Button type="submit" size="md" icon={Plus} aria-label="Add task" />
          </form>
          <div className="mt-4 space-y-1">
            {todayTasks.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="Nothing due today" description="Enjoy the clear runway." />
            ) : (
              todayTasks.map((t) => (
                <div key={`${t.entity}-${t.id}`} className="flex items-center gap-3 py-2.5 px-1 group">
                  <Checkbox
                    checked={t.done}
                    onChange={() => {
                      if (!t.done) recordActivityToday()
                      if (t.entity === 'assignments') updateItem('assignments', t.id, { status: t.done ? 'todo' : 'done' })
                      else toggleItem('tasks', t.id)
                    }}
                  />
                  <span className="flex-1 text-[14px] text-neutral-800 dark:text-neutral-100">{t.title}</span>
                  {isOverdue(t.dueDate) && <Badge tone="red">Overdue</Badge>}
                  {t.entity === 'tasks' && (
                    <button
                      onClick={() => removeItem('tasks', t.id)}
                      className="opacity-0 group-hover:opacity-100 text-[12px] text-neutral-400 hover:text-red-500 transition-opacity"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming exams */}
        <Card className="p-5">
          <CardHeader title="Upcoming Exams" subtitle="AP, IB & A-Level countdown" />
          <div className="mt-4 space-y-3">
            {upcomingExams.length === 0 ? (
              <EmptyState icon={GraduationCap} title="No exams scheduled" description="Add an exam in the Exam Planner." />
            ) : (
              upcomingExams.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[13.5px] font-medium text-neutral-800 dark:text-neutral-100 truncate">{e.name}</p>
                      <Badge tone={EXAM_TYPES[e.examType || 'other'].tone}>{EXAM_TYPES[e.examType || 'other'].label}</Badge>
                    </div>
                    <p className="text-[12px] text-neutral-400">{formatDate(e.date)}</p>
                  </div>
                  <Badge tone={isToday(e.date) ? 'red' : 'accent'}>{countdownLabel(e.date)}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Weekly goals */}
      <Card className="p-5">
        <CardHeader title="Weekly Goals" subtitle={currentWeekRangeLabel()} action={<Target size={18} className="text-neutral-300" />} />
        <form onSubmit={handleQuickGoal} className="flex gap-2 mt-4">
          <Input value={quickGoal} onChange={(e) => setQuickGoal(e.target.value)} placeholder="What do you want to accomplish this week?" />
          <Button type="submit" size="md" icon={Plus} aria-label="Add goal" />
        </form>
        <div className="mt-4">
          {weekGoals.length === 0 ? (
            <EmptyState icon={Target} title="No goals set for this week" description="Set 2–3 goals to stay focused." />
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <ProgressBar value={weekGoals.filter((g) => g.done).length} max={weekGoals.length} tone="green" className="flex-1" />
                <span className="text-[12px] text-neutral-400 flex-shrink-0">
                  {weekGoals.filter((g) => g.done).length}/{weekGoals.length}
                </span>
              </div>
              <div className="space-y-1">
                {weekGoals.map((g) => (
                  <div key={g.id} className="flex items-center gap-3 py-2 px-1 group">
                    <Checkbox
                      checked={g.done}
                      onChange={() => {
                        if (!g.done) recordActivityToday()
                        toggleItem('goals', g.id)
                      }}
                    />
                    <span className={`flex-1 text-[14px] ${g.done ? 'line-through text-neutral-400' : 'text-neutral-800 dark:text-neutral-100'}`}>
                      {g.text}
                    </span>
                    <button
                      onClick={() => removeItem('goals', g.id)}
                      className="opacity-0 group-hover:opacity-100 text-[12px] text-neutral-400 hover:text-red-500 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>

    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
