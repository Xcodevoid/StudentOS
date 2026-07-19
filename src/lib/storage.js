export const STORAGE_KEY = 'studentos.data.v1'

export function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function defaultData() {
  return {
    version: 1,
    profile: {
      name: '',
      gradeLevel: '11th Grade',
      school: '',
      bio: '',
      gpaScale: 4.0,
      onboarded: false,
      notificationsEnabled: false,
    },
    classes: [],
    assignments: [],
    exams: [],
    studyTasks: [],
    projects: [],
    activities: [],
    deadlines: [],
    goals: [],
    tasks: [],
    studySessions: [],
    streak: { datesActive: [] },
    badges: { seen: [] },
    notifications: { remindersNotified: {} },
  }
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData()
    const parsed = JSON.parse(raw)
    const base = defaultData()
    return {
      ...base,
      ...parsed,
      profile: { ...base.profile, ...parsed.profile },
      streak: { ...base.streak, ...parsed.streak },
      badges: { ...base.badges, ...parsed.badges },
      notifications: { ...base.notifications, ...parsed.notifications },
    }
  } catch {
    return defaultData()
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // storage unavailable (private mode / quota) — fail silently, in-memory state still works
  }
}
