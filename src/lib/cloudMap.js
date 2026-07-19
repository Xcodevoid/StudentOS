// Maps between the app's in-memory data shape (camelCase, matches the
// original localStorage schema so every page component is untouched) and
// Supabase's snake_case columns. Only fields that actually differ need an
// entry — everything else passes through unchanged.

export const TABLES = {
  classes: 'classes',
  assignments: 'assignments',
  exams: 'exams',
  studyTasks: 'study_tasks',
  projects: 'projects',
  activities: 'activities',
  deadlines: 'deadlines',
  goals: 'goals',
  tasks: 'tasks',
  studySessions: 'study_sessions',
}

// entity -> { appKey: dbColumn }
const FIELD_MAP = {
  assignments: { classId: 'class_id', dueDate: 'due_date' },
  exams: { examType: 'exam_type' },
  studyTasks: { examId: 'exam_id' },
  activities: { hoursPerWeek: 'hours_per_week', weeksPerYear: 'weeks_per_year', startDate: 'start_date', endDate: 'end_date' },
  deadlines: { schoolName: 'school_name' },
  tasks: { dueDate: 'due_date' },
  studySessions: { examId: 'exam_id' },
}

function invert(map) {
  return Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]))
}

export function toDb(entity, item, userId) {
  const map = FIELD_MAP[entity] || {}
  const row = { user_id: userId }
  for (const [key, value] of Object.entries(item)) {
    if (key === 'id') {
      row.id = value
      continue
    }
    row[map[key] || key] = value === '' ? null : value
  }
  return row
}

export function fromDb(entity, row) {
  const map = invert(FIELD_MAP[entity] || {})
  const item = {}
  for (const [key, value] of Object.entries(row)) {
    if (key === 'user_id' || key === 'created_at') continue
    item[map[key] || key] = value === null ? '' : value
  }
  return item
}

// profile lives in a singleton `profiles` row plus streak/badges/notifications jsonb columns
export function profileToDb(profile, extras, userId) {
  return {
    id: userId,
    name: profile.name,
    grade_level: profile.gradeLevel,
    school: profile.school,
    bio: profile.bio,
    gpa_scale: profile.gpaScale,
    onboarded: profile.onboarded,
    notifications_enabled: profile.notificationsEnabled,
    streak_dates: extras.streakDates,
    badges_seen: extras.badgesSeen,
    reminders_notified: extras.remindersNotified,
    updated_at: new Date().toISOString(),
  }
}

export function profileFromDb(row) {
  return {
    profile: {
      name: row.name || '',
      gradeLevel: row.grade_level || '11th Grade',
      school: row.school || '',
      bio: row.bio || '',
      gpaScale: row.gpa_scale ?? 4.0,
      onboarded: row.onboarded ?? false,
      notificationsEnabled: row.notifications_enabled ?? false,
    },
    streak: { datesActive: row.streak_dates || [] },
    badges: { seen: row.badges_seen || [] },
    notifications: { remindersNotified: row.reminders_notified || {} },
  }
}
