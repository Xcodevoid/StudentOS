import {
  HeartHandshake, Users, Rocket, Code2, FlaskConical, ShieldCheck,
  Mic2, Brain, Palette, Compass, Handshake, Feather, Trophy, Lightbulb,
} from 'lucide-react'
import { computeStreak } from './streak'
import { lastNDays, todayKey } from './momentum'

// A bank of characteristics students can recognize in themselves — not a
// universal rubric everyone is scored against. The first 6 ids are kept
// stable from North Star's original 6 dimensions (only labels changed, to
// read less like admissions jargon) so every existing tagged project,
// activity, and piece of evidence keeps working with zero migration.
export const CHARACTERISTICS = [
  { id: 'community', label: 'Community-Minded', shortLabel: 'Community', icon: HeartHandshake, tone: 'green', tagline: 'Contribution to others, service, helping people' },
  { id: 'leadership', label: 'Leader', shortLabel: 'Leader', icon: Users, tone: 'accent', tagline: 'Taking initiative, leading teams, creating change' },
  { id: 'impact', label: 'Doer', shortLabel: 'Doer', icon: Rocket, tone: 'amber', tagline: 'Gets real things done, ships results' },
  { id: 'skills', label: 'Builder / Maker', shortLabel: 'Builder', icon: Code2, tone: 'purple', tagline: 'Builds and creates — technical or hands-on' },
  { id: 'curiosity', label: 'Curious', shortLabel: 'Curious', icon: FlaskConical, tone: 'accent', tagline: 'Learning beyond school, research, exploration' },
  { id: 'character', label: 'Resilient', shortLabel: 'Resilient', icon: ShieldCheck, tone: 'green', tagline: 'Discipline, persistence through setbacks' },
  { id: 'communicator', label: 'Communicator', shortLabel: 'Communicator', icon: Mic2, tone: 'amber', tagline: 'Expressing ideas clearly, presenting, persuading' },
  { id: 'analytical', label: 'Analytical Thinker', shortLabel: 'Analytical', icon: Brain, tone: 'purple', tagline: 'Logic, data, breaking down hard problems' },
  { id: 'creative', label: 'Creative', shortLabel: 'Creative', icon: Palette, tone: 'accent', tagline: 'Art, design, original expression' },
  { id: 'strategic', label: 'Strategic Planner', shortLabel: 'Strategic', icon: Compass, tone: 'green', tagline: 'Foresight, organizing complexity, planning ahead' },
  { id: 'collaborator', label: 'Collaborator', shortLabel: 'Collaborator', icon: Handshake, tone: 'amber', tagline: 'Teamwork, bringing people together' },
  { id: 'independent', label: 'Independent', shortLabel: 'Independent', icon: Feather, tone: 'purple', tagline: 'Self-directed, takes initiative alone' },
  { id: 'competitive', label: 'Competitive', shortLabel: 'Competitive', icon: Trophy, tone: 'accent', tagline: 'Driven by achievement, winning, personal bests' },
  { id: 'innovator', label: 'Innovator', shortLabel: 'Innovator', icon: Lightbulb, tone: 'green', tagline: 'New ideas, entrepreneurial thinking' },
]

export const CHARACTERISTIC_IDS = CHARACTERISTICS.map((c) => c.id)
export const CHARACTERISTIC_TONE = Object.fromEntries(CHARACTERISTICS.map((c) => [c.id, c.tone]))

// Sensible starting tags so logging an entry doesn't require thinking about
// North Star first — students can always adjust which characteristics it grows.
export const DEFAULT_PROJECT_DIMENSIONS = {
  project: ['skills', 'impact'],
  achievement: ['impact', 'competitive'],
  competition: ['leadership', 'competitive'],
  research: ['curiosity', 'analytical'],
  website: ['skills', 'creative'],
}

export const DEFAULT_ACTIVITY_DIMENSIONS = {
  activity: ['leadership', 'community'],
  volunteering: ['community'],
  internship: ['skills', 'leadership'],
}

// `asOf` lets Growth Analytics ask "what did North Star look like a month
// ago?" by re-anchoring every internal "today"/"last N days" window to a
// past date instead of the real live now. Defaults to real now, so a plain
// computeNorthStar(data) call behaves exactly as before.
export function computeNorthStar(data, asOf = new Date()) {
  const week7 = lastNDays(7, asOf)
  const month30 = lastNDays(30, asOf)

  const evidenceByDim = Object.fromEntries(CHARACTERISTIC_IDS.map((id) => [id, []]))
  const addEvidence = (dimId, entry) => {
    if (evidenceByDim[dimId]) evidenceByDim[dimId].push(entry)
  }

  ;(data.projects || []).forEach((p) => {
    const dims = p.dimensions?.length ? p.dimensions : DEFAULT_PROJECT_DIMENSIONS[p.type] || []
    dims.forEach((dimId) =>
      addEvidence(dimId, {
        id: `project-${p.id}-${dimId}`,
        title: p.title || 'Untitled project',
        date: p.date || '',
        source: 'Portfolio',
      })
    )
  })

  ;(data.activities || []).forEach((a) => {
    const dims = a.dimensions?.length ? a.dimensions : DEFAULT_ACTIVITY_DIMENSIONS[a.category] || []
    dims.forEach((dimId) =>
      addEvidence(dimId, {
        id: `activity-${a.id}-${dimId}`,
        title: a.title || 'Untitled activity',
        date: a.startDate || '',
        source: 'Portfolio',
      })
    )
  })

  ;(data.evidence || []).forEach((e) => {
    ;(e.dimensions || []).forEach((dimId) =>
      addEvidence(dimId, {
        id: `evidence-${e.id}-${dimId}`,
        title: e.title || 'Untitled evidence',
        date: e.date || '',
        source: 'Evidence Vault',
      })
    )
  })

  // Resilience draws on real daily-practice signals — discipline shown
  // through follow-through, not a separate self-rating.
  const activeHabits = (data.habits || []).filter((h) => !h.archived)
  let bestStreak = 0
  let bestHabitTitle = ''
  activeHabits.forEach((h) => {
    const dates = (data.habitLogs || []).filter((l) => l.habitId === h.id).map((l) => l.date)
    const streak = computeStreak(dates, asOf).current
    if (streak > bestStreak) {
      bestStreak = streak
      bestHabitTitle = h.title
    }
  })
  if (bestStreak >= 3) {
    addEvidence('character', {
      id: 'character-habit-streak',
      title: `${bestStreak}-day streak on "${bestHabitTitle}"`,
      date: todayKey(asOf),
      source: 'Habits',
    })
  }

  const recentReflections = (data.reflections || []).filter((r) => month30.includes(r.date))
  if (recentReflections.length > 0) {
    addEvidence('character', {
      id: 'character-reflections',
      title: `${recentReflections.length} nightly reflection${recentReflections.length === 1 ? '' : 's'} this month`,
      date: [...recentReflections].sort((a, b) => b.date.localeCompare(a.date))[0]?.date || todayKey(asOf),
      source: 'Reflection',
    })
  }

  const recentCommitments = (data.commitments || []).filter((c) => month30.includes(c.date))
  if (recentCommitments.length >= 3) {
    const rate = recentCommitments.filter((c) => c.done).length / recentCommitments.length
    addEvidence('character', {
      id: 'character-follow-through',
      title: `${Math.round(rate * 100)}% of daily missions completed this month`,
      date: todayKey(asOf),
      source: 'Daily Mission',
    })
  }

  const dimensions = CHARACTERISTICS.map((dim) => {
    const evidence = evidenceByDim[dim.id].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    const recentlyActive = evidence.some((e) => e.date && week7.includes(e.date))
    return {
      ...dim,
      evidence,
      evidenceCount: evidence.length,
      recentlyActive,
    }
  })

  return { dimensions }
}

// Reconstructs "what North Star looked like as of a past date" — used by
// Growth Analytics to diff against the live evidence counts. Entries with no
// date (or a date after the cutoff) are excluded, since we can't know they
// existed yet; entries with no date at all simply never count toward a
// historical snapshot (they still count in the live computeNorthStar(data)
// call, which doesn't filter anything).
//
// Known limitation: dimension tags and fields reflect their *current*
// values, not what they were as of cutoffDateStr — nothing in this data
// model is versioned, so retagging a project today reshapes its
// contribution to past snapshots too. Acceptable for a "your growth this
// month" trend line, not for precise historical audit.
export function computeNorthStarAsOf(data, cutoffDateStr) {
  const filtered = {
    ...data,
    projects: (data.projects || []).filter((p) => p.date && p.date <= cutoffDateStr),
    activities: (data.activities || []).filter((a) => a.startDate && a.startDate <= cutoffDateStr),
    habitLogs: (data.habitLogs || []).filter((l) => l.date && l.date <= cutoffDateStr),
    reflections: (data.reflections || []).filter((r) => r.date && r.date <= cutoffDateStr),
    commitments: (data.commitments || []).filter((c) => c.date && c.date <= cutoffDateStr),
    evidence: (data.evidence || []).filter((e) => e.date && e.date <= cutoffDateStr),
  }
  return computeNorthStar(filtered, new Date(cutoffDateStr))
}

// Shared by Growth Analytics and the Dashboard's growth teaser — "what
// changed in the last N days" per characteristic, plus the two headline
// callouts. `chosenIds` scopes everything to the characteristics a student
// has actually picked to track (defaults to all, for callers that don't care).
export function computeGrowthSummary(data, chosenIds = null, days = 30) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  const now = computeNorthStar(data)
  const then = computeNorthStarAsOf(data, todayKey(cutoff))
  const ids = chosenIds && chosenIds.length > 0 ? chosenIds : CHARACTERISTIC_IDS

  const deltas = now.dimensions
    .filter((dim) => ids.includes(dim.id))
    .map((dim) => {
      const thenDim = then.dimensions.find((d) => d.id === dim.id)
      const delta = dim.evidenceCount - (thenDim?.evidenceCount ?? 0)
      return { ...dim, delta }
    })

  const withGrowth = deltas.filter((d) => d.delta > 0)
  const mostDeveloped = withGrowth.length > 0 ? withGrowth.reduce((a, b) => (b.delta > a.delta ? b : a)) : null

  // A characteristic with no evidence at all is automatically the biggest
  // opportunity — it hasn't been started, which outranks "started but low."
  const untouched = deltas.find((d) => d.evidenceCount === 0)
  const lowestCount = [...deltas].sort((a, b) => a.evidenceCount - b.evidenceCount)[0]
  const growthOpportunity = untouched || lowestCount || null

  return { deltas, mostDeveloped, growthOpportunity }
}
