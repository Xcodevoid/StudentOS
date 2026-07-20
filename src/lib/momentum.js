import { computeStreak } from './streak'
import { isoWeekKey } from './dates'
import { dateKey } from './calendarGrid'

export function todayKey(ref = new Date()) {
  return dateKey(ref)
}

// `ref` lets callers compute "the last N days as of some past date" instead
// of always the real, live today — used by Growth Analytics to recompute a
// historical North Star snapshot. Defaults to real today, so every existing
// call site behaves exactly as before.
export function lastNDays(n, ref = new Date()) {
  const days = []
  for (let i = 0; i < n; i++) {
    const d = new Date(ref)
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

  // Commitments and focus sessions are daily constructs, so — like habits
  // below — they're scored as a per-day rate averaged over the last 7 days,
  // not a raw rate over however many you happened to log. Otherwise a
  // single task set and finished today reads as "100% — Excellent
  // momentum," while doing the same thing every day for a week scores no
  // higher; the two shouldn't be indistinguishable.
  const commitmentsThisWeek = data.commitments.filter((c) => week7.includes(c.date))
  if (commitmentsThisWeek.length > 0) {
    const dailyRates = week7.map((day) => {
      const dayCommitments = commitmentsThisWeek.filter((c) => c.date === day)
      if (dayCommitments.length === 0) return 0
      return dayCommitments.filter((c) => c.done).length / dayCommitments.length
    })
    components.commitments = Math.round((dailyRates.reduce((a, b) => a + b, 0) / 7) * 100)
  }

  const sessionsThisWeek = data.momentumSessions.filter((s) => week7.includes(s.date))
  if (sessionsThisWeek.length > 0) {
    // Distinct days with a completed session — not raw session count, so
    // batching several sessions in one sitting can't substitute for
    // showing up on separate days.
    const successfulDays = new Set(sessionsThisWeek.filter((s) => s.goalCompleted === true).map((s) => s.date))
    components.focus = Math.round((successfulDays.size / 7) * 100)
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
