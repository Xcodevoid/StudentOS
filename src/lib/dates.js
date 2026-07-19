export function startOfDay(d = new Date()) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

// "YYYY-MM-DD" strings (from <input type="date">) must be read as a local
// calendar date, not UTC — new Date("YYYY-MM-DD") parses as UTC midnight,
// which lands on the previous day in any timezone behind UTC.
export function parseLocalDate(dateStr) {
  if (!dateStr) return null
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(dateStr)
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  const target = startOfDay(parseLocalDate(dateStr))
  const today = startOfDay()
  return Math.round((target - today) / 86400000)
}

export function isToday(dateStr) {
  return daysUntil(dateStr) === 0
}

export function isOverdue(dateStr) {
  const d = daysUntil(dateStr)
  return d !== null && d < 0
}

export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return ''
  const d = parseLocalDate(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', ...opts })
}

export function formatDateShort(dateStr) {
  return formatDate(dateStr, { year: undefined })
}

export function countdownLabel(dateStr) {
  const n = daysUntil(dateStr)
  if (n === null) return ''
  if (n === 0) return 'Today'
  if (n === 1) return 'Tomorrow'
  if (n === -1) return 'Yesterday'
  if (n < 0) return `${Math.abs(n)}d overdue`
  return `${n}d`
}

// ISO week key like "2026-W29", used to group weekly goals
export function isoWeekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

export function currentWeekRangeLabel(d = new Date()) {
  const day = d.getDay() === 0 ? 7 : d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - day + 1)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

export function sortByDateAsc(arr, key = 'date') {
  return [...arr].sort((a, b) => (parseLocalDate(a[key]) || 0) - (parseLocalDate(b[key]) || 0))
}
