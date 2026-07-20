import { daysUntil, isOverdue, isToday } from './dates'

// Builds a single sorted "what needs attention" list from assignments, exams,
// and deadlines. Used by both the notification bell and the background
// reminder engine so the two never disagree about what's due.
export function getReminderItems(data) {
  const items = []

  data.assignments
    .filter((a) => a.status !== 'done' && a.dueDate)
    .forEach((a) => items.push({ id: a.id, kind: 'assignment', title: a.title, date: a.dueDate, path: '/academics' }))

  data.exams
    .filter((e) => e.date)
    .forEach((e) => items.push({ id: e.id, kind: 'exam', title: e.name, date: e.date, path: '/exams' }))

  data.opportunities
    .filter((d) => d.status !== 'submitted' && d.date)
    .forEach((d) => items.push({ id: d.id, kind: 'deadline', title: d.title, date: d.date, path: '/college-prep' }))

  return items.sort((a, b) => new Date(a.date) - new Date(b.date))
}

export function bucketReminders(items) {
  const overdue = items.filter((i) => isOverdue(i.date))
  const today = items.filter((i) => isToday(i.date))
  const upcoming = items.filter((i) => {
    const d = daysUntil(i.date)
    return d > 0 && d <= 7
  })
  return { overdue, today, upcoming }
}

export const KIND_LABEL = { assignment: 'Assignment', exam: 'Exam', deadline: 'Opportunity' }

export const EXAM_MILESTONES = [30, 14, 7, 3, 1, 0]
