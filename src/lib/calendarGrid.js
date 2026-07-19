import { parseLocalDate } from './dates'

export function dateKey(d) {
  const x = d instanceof Date ? d : parseLocalDate(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

export function isSameDay(a, b) {
  return dateKey(a) === dateKey(b)
}

// Returns an array of 6 weeks (42 days), each a Date, starting on the Sunday
// on/before the 1st of the month and ending on the Saturday on/after the last day.
export function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1)
  const start = new Date(firstOfMonth)
  start.setDate(start.getDate() - start.getDay())

  const days = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d)
  }
  return days
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
