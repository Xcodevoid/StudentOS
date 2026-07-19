import { Rocket, BookOpen, Award, GraduationCap, Flag, Flame, Trophy, Timer, ListChecks, Zap, Repeat, Moon } from 'lucide-react'
import { computeStreak } from './streak'

export const BADGES = [
  {
    id: 'first-class',
    label: 'First Step',
    description: 'Added your first class',
    icon: BookOpen,
    check: (data) => data.classes.length >= 1,
  },
  {
    id: 'portfolio-starter',
    label: 'Portfolio Starter',
    description: 'Logged your first portfolio entry',
    icon: Rocket,
    check: (data) => data.projects.length >= 1,
  },
  {
    id: 'honor-roll',
    label: 'Honor Roll',
    description: 'Scored a 90%+ in a class',
    icon: Award,
    check: (data) => data.classes.some((c) => Number(c.grade) >= 90),
  },
  {
    id: 'advanced-scholar',
    label: 'Advanced Scholar',
    description: 'Tracking 3+ AP, IB, or A-Level classes',
    icon: GraduationCap,
    check: (data) => data.classes.filter((c) => c.weight === 'ap' || c.weight === 'ib' || c.weight === 'a-level').length >= 3,
  },
  {
    id: 'exam-ready',
    label: 'Exam Ready',
    description: 'Finished a full study checklist for an exam',
    icon: ListChecks,
    check: (data) =>
      data.exams.some((e) => {
        const topics = data.studyTasks.filter((t) => t.examId === e.id)
        return topics.length > 0 && topics.every((t) => t.done)
      }),
  },
  {
    id: 'on-track',
    label: 'On Track',
    description: 'Added your first college deadline',
    icon: Flag,
    check: (data) => data.deadlines.length >= 1,
  },
  {
    id: 'focused',
    label: 'Focused',
    description: 'Completed 5 study sessions',
    icon: Timer,
    check: (data) => (data.studySessions?.length || 0) >= 5,
  },
  {
    id: 'week-warrior',
    label: 'Week Warrior',
    description: 'Kept a 7-day streak going',
    icon: Flame,
    check: (_data, streak) => streak.current >= 7,
  },
  {
    id: 'marathoner',
    label: 'Marathoner',
    description: 'Kept a 30-day streak going',
    icon: Trophy,
    check: (_data, streak) => streak.current >= 30,
  },
  {
    id: 'first-mission',
    label: 'Mission Set',
    description: 'Set your first daily commitment',
    icon: Zap,
    check: (data) => data.commitments.length >= 1,
  },
  {
    id: 'deep-work',
    label: 'Deep Work',
    description: 'Completed 5 focus sessions with your goal met',
    icon: Timer,
    check: (data) => data.momentumSessions.filter((s) => s.goalCompleted === true).length >= 5,
  },
  {
    id: 'habit-former',
    label: 'Habit Former',
    description: 'Kept a habit going for 7 days straight',
    icon: Repeat,
    check: (data) => {
      const byHabit = {}
      data.habitLogs.forEach((l) => {
        byHabit[l.habitId] = byHabit[l.habitId] || []
        byHabit[l.habitId].push(l.date)
      })
      return Object.values(byHabit).some((dates) => computeStreak(dates).current >= 7)
    },
  },
  {
    id: 'self-aware',
    label: 'Self-Aware',
    description: 'Wrote 3 nightly reflections',
    icon: Moon,
    check: (data) => data.reflections.length >= 3,
  },
]

export function computeBadges(data, streak) {
  return BADGES.map((b) => ({ ...b, unlocked: b.check(data, streak) }))
}
