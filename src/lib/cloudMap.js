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
  opportunities: 'deadlines',
  goals: 'goals',
  tasks: 'tasks',
  studySessions: 'study_sessions',
  commitments: 'commitments',
  momentumSessions: 'momentum_sessions',
  distractions: 'distractions',
  habits: 'habits',
  habitLogs: 'habit_logs',
  reflections: 'reflections',
  evidence: 'evidence',
}

// entity -> { appKey: dbColumn }
const IMPACT_TRACKER_FIELDS = { action: 'action_taken', impactWho: 'impact_who', growth: 'growth_reflection' }

const FIELD_MAP = {
  assignments: { classId: 'class_id', dueDate: 'due_date' },
  exams: { examType: 'exam_type' },
  studyTasks: { examId: 'exam_id' },
  projects: { ...IMPACT_TRACKER_FIELDS },
  activities: {
    hoursPerWeek: 'hours_per_week',
    weeksPerYear: 'weeks_per_year',
    startDate: 'start_date',
    endDate: 'end_date',
    commonAppType: 'common_app_type',
    commonAppPosition: 'common_app_position',
    commonAppSummary: 'common_app_summary',
    ...IMPACT_TRACKER_FIELDS,
  },
  opportunities: { schoolName: 'school_name', applicationRound: 'application_round' },
  tasks: { dueDate: 'due_date' },
  studySessions: { examId: 'exam_id' },
  commitments: { estimatedMinutes: 'estimated_minutes' },
  momentumSessions: { commitmentId: 'commitment_id', taskLabel: 'task_label', plannedMinutes: 'planned_minutes', actualMinutes: 'actual_minutes', goalCompleted: 'goal_completed', focusRating: 'focus_rating' },
  distractions: { minutesLost: 'minutes_lost' },
  habitLogs: { habitId: 'habit_id' },
  evidence: { linkedProjectId: 'linked_project_id', linkedActivityId: 'linked_activity_id', storagePath: 'storage_path' },
}

// Fields that are numeric / date / uuid-FK columns, where an empty string
// from a form must become SQL null (numeric/date/uuid can't hold ''). Every
// field NOT listed here is a plain text column declared NOT NULL DEFAULT '',
// so an empty string is its correct, intended value and must be left alone —
// nulling it would violate the NOT NULL constraint and silently fail to save.
const NULLABLE_FIELDS = {
  classes: ['grade'],
  assignments: ['classId', 'dueDate'],
  exams: ['date'],
  studyTasks: ['examId'],
  projects: ['date'],
  activities: ['startDate', 'endDate', 'hoursPerWeek', 'weeksPerYear'],
  opportunities: ['date'],
  tasks: ['dueDate'],
  studySessions: ['examId', 'date'],
  commitments: ['estimatedMinutes', 'date'],
  momentumSessions: ['commitmentId', 'date', 'goalCompleted', 'focusRating'],
  distractions: ['date'],
  habitLogs: ['date'],
  reflections: ['date'],
  evidence: ['date', 'linkedProjectId', 'linkedActivityId', 'storagePath'],
}

// Nullable fields where null has a distinct tri-state meaning from '' (right
// now just booleans) — these should stay `null` when read back, not become ''.
const PRESERVE_NULL_ON_READ = {
  momentumSessions: ['goalCompleted'],
}

function invert(map) {
  return Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]))
}

export function toDb(entity, item, userId) {
  const map = FIELD_MAP[entity] || {}
  const nullable = NULLABLE_FIELDS[entity] || []
  const row = { user_id: userId }
  for (const [key, value] of Object.entries(item)) {
    if (key === 'id') {
      row.id = value
      continue
    }
    row[map[key] || key] = value === '' && nullable.includes(key) ? null : value
  }
  return row
}

export function fromDb(entity, row) {
  const map = invert(FIELD_MAP[entity] || {})
  const preserveNull = PRESERVE_NULL_ON_READ[entity] || []
  const item = {}
  for (const [key, value] of Object.entries(row)) {
    if (key === 'user_id' || key === 'created_at') continue
    const appKey = map[key] || key
    item[appKey] = value === null && !preserveNull.includes(appKey) ? '' : value
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
    public_slug: profile.publicSlug || null,
    portfolio_public: profile.portfolioPublic,
    streak_dates: extras.streakDates,
    badges_seen: extras.badgesSeen,
    reminders_notified: extras.remindersNotified,
    north_star: extras.northStar,
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
      publicSlug: row.public_slug || '',
      portfolioPublic: row.portfolio_public ?? false,
    },
    streak: { datesActive: row.streak_dates || [] },
    badges: { seen: row.badges_seen || [] },
    notifications: { remindersNotified: row.reminders_notified || {} },
    northStar: {
      identity: row.north_star?.identity || '',
      goals: {
        community: '', leadership: '', impact: '', skills: '', curiosity: '', character: '',
        ...row.north_star?.goals,
      },
    },
  }
}
