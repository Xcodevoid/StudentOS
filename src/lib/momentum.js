import { computeStreak } from './streak'
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
