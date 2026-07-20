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
      publicSlug: '',
      portfolioPublic: false,
    },
    classes: [],
    assignments: [],
    exams: [],
    studyTasks: [],
    projects: [],
    activities: [],
    opportunities: [],
    goals: [],
    tasks: [],
    studySessions: [],
    commitments: [],
    momentumSessions: [],
    distractions: [],
    habits: [],
    habitLogs: [],
    reflections: [],
    streak: { datesActive: [] },
    badges: { seen: [] },
    notifications: { remindersNotified: {} },
    northStar: {
      identity: '',
      goals: { community: '', leadership: '', impact: '', skills: '', curiosity: '', character: '' },
    },
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
      // Opportunities used to be called "deadlines" — carry existing local
      // data over under its new key rather than silently losing it.
      opportunities: parsed.opportunities || parsed.deadlines || [],
      profile: { ...base.profile, ...parsed.profile },
      streak: { ...base.streak, ...parsed.streak },
      badges: { ...base.badges, ...parsed.badges },
      notifications: { ...base.notifications, ...parsed.notifications },
      northStar: {
        ...base.northStar,
        ...parsed.northStar,
        goals: { ...base.northStar.goals, ...parsed.northStar?.goals },
      },
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
