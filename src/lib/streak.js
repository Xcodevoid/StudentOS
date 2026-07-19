function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

// datesActive: array of 'YYYY-MM-DD' strings (deduped, unordered)
export function computeStreak(datesActive) {
  const set = new Set(datesActive)
  const today = new Date()
  const activeToday = set.has(todayKey(today))

  // Walk backwards from today (or yesterday, if today has no activity yet —
  // the streak isn't broken until a full day passes with nothing done)
  let cursor = new Date(today)
  if (!activeToday) cursor.setDate(cursor.getDate() - 1)

  let current = 0
  while (set.has(todayKey(cursor))) {
    current += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return { current, activeToday, atRisk: !activeToday && current > 0 }
}

export function recordToday(datesActive) {
  const key = todayKey()
  if (datesActive.includes(key)) return datesActive
  return [...datesActive, key]
}
