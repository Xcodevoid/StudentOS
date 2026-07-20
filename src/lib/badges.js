import { Moon, Timer, ShieldCheck } from 'lucide-react'
import { todayKey } from './momentum'
import { computeStreak } from './streak'

// Three small, honest daily wins — not points, not a score to game. Each one
// maps to a real thing a student did today, and streaks reuse the same
// backward-walk logic as the day-streak flame, so "3 days running" always
// means the same thing across the app.
export const BADGE_TYPES = [
  { id: 'reflection', label: 'Reflection', icon: Moon, tone: 'purple', description: "Tonight's reflection" },
  { id: 'study', label: 'Study', icon: Timer, tone: 'accent', description: 'A focus session or study block' },
  { id: 'aware', label: 'Awareness', icon: ShieldCheck, tone: 'amber', description: "Today's focus check-in" },
]

function uniqueDates(entries) {
  return [...new Set(entries.map((e) => e.date).filter(Boolean))]
}

// Study covers both the general Focus Sessions (momentumSessions) and the
// exam-specific study timer (studySessions) — different entry points,
// same underlying win: you sat down and worked.
function studyDates(data) {
  return uniqueDates([...data.momentumSessions, ...data.studySessions])
}

function reflectionDates(data) {
  return uniqueDates(data.reflections)
}

// Only entries with an explicit stayedFocused boolean are check-ins — older
// detailed distraction logs (pre-check-in) don't count toward this badge.
function awareDates(data) {
  return uniqueDates(data.distractions.filter((d) => typeof d.stayedFocused === 'boolean'))
}

const DATE_SOURCES = { reflection: reflectionDates, study: studyDates, aware: awareDates }

export function computeDailyBadges(data, ref = new Date()) {
  const today = todayKey(ref)
  return BADGE_TYPES.map((badge) => {
    const dates = DATE_SOURCES[badge.id](data)
    return {
      ...badge,
      earnedToday: dates.includes(today),
      streak: computeStreak(dates, ref).current,
    }
  })
}
