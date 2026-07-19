import { computeStreak } from './streak'
import { isoWeekKey } from './dates'
import { dateKey } from './calendarGrid'

export function todayKey() {
  return dateKey(new Date())
}

export function lastNDays(n) {
  const days = []
  for (let i = 0; i < n; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(dateKey(d))
  }
  return days
}

const SCORE_TIERS = [
  { min: 85, label: 'Excellent momentum' },
  { min: 65, label: 'Great week' },
  { min: 40, label: 'Building momentum' },
  { min: 0, label: "Let's rebuild together" },
]

export function computeMomentumScore(data) {
  const week7 = lastNDays(7)
  const components = {}

  const commitmentsThisWeek = data.commitments.filter((c) => week7.includes(c.date))
  if (commitmentsThisWeek.length > 0) {
    components.commitments = Math.round((commitmentsThisWeek.filter((c) => c.done).length / commitmentsThisWeek.length) * 100)
  }

  const sessionsThisWeek = data.momentumSessions.filter((s) => week7.includes(s.date))
  if (sessionsThisWeek.length > 0) {
    const completed = sessionsThisWeek.filter((s) => s.goalCompleted === true).length
    components.focus = Math.min(Math.round((completed / 7) * 100), 100)
  }

  const activeHabits = data.habits.filter((h) => !h.archived)
  if (activeHabits.length > 0) {
    const rates = activeHabits.map((h) => {
      const logged = data.habitLogs.filter((l) => l.habitId === h.id && week7.includes(l.date)).length
      return (logged / 7) * 100
    })
    components.habits = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
  }

  const weekKey = isoWeekKey()
  const goalsThisWeek = data.goals.filter((g) => g.week === weekKey)
  if (goalsThisWeek.length > 0) {
    components.goals = Math.round((goalsThisWeek.filter((g) => g.done).length / goalsThisWeek.length) * 100)
  }

  const values = Object.values(components)
  if (values.length === 0) {
    return { score: null, components, tier: null, commitmentsSummary: null }
  }

  const score = Math.round(values.reduce((a, b) => a + b, 0) / values.length)
  const tier = SCORE_TIERS.find((t) => score >= t.min).label
  const commitmentsSummary =
    commitmentsThisWeek.length > 0
      ? `${commitmentsThisWeek.filter((c) => c.done).length}/${commitmentsThisWeek.length} commitments completed this week.`
      : null

  return { score, components, tier, commitmentsSummary }
}

export function distractionInsight(distractions) {
  const week7 = lastNDays(7)
  const recent = distractions.filter((d) => week7.includes(d.date))
  if (recent.length === 0) return null

  const counts = {}
  recent.forEach((d) => {
    const key = (d.description || 'Something').trim().toLowerCase()
    counts[key] = (counts[key] || 0) + 1
  })
  const [topDesc, topCount] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]

  const buckets = { morning: 0, afternoon: 0, evening: 0, night: 0 }
  recent.forEach((d) => {
    if (!d.time) return
    const hour = parseInt(d.time.split(':')[0], 10)
    if (Number.isNaN(hour)) return
    if (hour >= 5 && hour < 12) buckets.morning++
    else if (hour >= 12 && hour < 17) buckets.afternoon++
    else if (hour >= 17 && hour < 21) buckets.evening++
    else buckets.night++
  })
  const [topBucketLabel, topBucketCount] = Object.entries(buckets).sort((a, b) => b[1] - a[1])[0]
  const totalMinutes = recent.reduce((sum, d) => sum + (Number(d.minutesLost) || 0), 0)
  const label = topDesc.charAt(0).toUpperCase() + topDesc.slice(1)
  const timePart = topBucketCount > 0 ? ` — mostly in the ${topBucketLabel}` : ''

  return {
    count: recent.length,
    totalMinutes,
    sentence: `Your biggest distraction this week is "${label}"${timePart}. That's ${topCount} time${topCount === 1 ? '' : 's'}, costing about ${totalMinutes} min.`,
  }
}

export function habitStats(habitLogs, habitId) {
  const dates = habitLogs.filter((l) => l.habitId === habitId).map((l) => l.date)
  const streak = computeStreak(dates)
  const last30 = lastNDays(30)
  const completedLast30 = dates.filter((d) => last30.includes(d)).length
  return {
    streak: streak.current,
    doneToday: dates.includes(todayKey()),
    completionRate: Math.round((completedLast30 / 30) * 100),
    dates,
  }
}
