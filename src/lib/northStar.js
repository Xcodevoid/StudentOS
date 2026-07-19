import { HeartHandshake, Users, Rocket, Code2, FlaskConical, ShieldCheck } from 'lucide-react'
import { computeStreak } from './streak'
import { lastNDays, todayKey } from './momentum'

export const DIMENSIONS = [
  {
    id: 'community',
    label: 'Community',
    shortLabel: 'Community',
    icon: HeartHandshake,
    tagline: 'Contribution to others, service, helping people',
  },
  {
    id: 'leadership',
    label: 'Leadership',
    shortLabel: 'Leadership',
    icon: Users,
    tagline: 'Taking initiative, leading teams, creating change',
  },
  {
    id: 'impact',
    label: 'Impact',
    shortLabel: 'Impact',
    icon: Rocket,
    tagline: 'Measurable results, projects, achievements',
  },
  {
    id: 'skills',
    label: 'Skills',
    shortLabel: 'Skills',
    icon: Code2,
    tagline: 'Technical skills, communication, creativity',
  },
  {
    id: 'curiosity',
    label: 'Intellectual Curiosity',
    shortLabel: 'Curiosity',
    icon: FlaskConical,
    tagline: 'Learning beyond school, research, exploration',
  },
  {
    id: 'character',
    label: 'Character',
    shortLabel: 'Character',
    icon: ShieldCheck,
    tagline: 'Discipline, resilience, growth mindset',
  },
]

export const DIMENSION_IDS = DIMENSIONS.map((d) => d.id)

// Sensible starting tags so logging an entry doesn't require thinking about
// North Star first — students can always adjust which dimensions it grows.
export const DEFAULT_PROJECT_DIMENSIONS = {
  project: ['skills', 'impact'],
  achievement: ['impact'],
  competition: ['leadership', 'impact'],
  research: ['curiosity', 'skills'],
  website: ['skills'],
}

export const DEFAULT_ACTIVITY_DIMENSIONS = {
  activity: ['leadership', 'community'],
  volunteering: ['community'],
  internship: ['skills', 'leadership'],
}

const TIERS = [
  { min: 75, label: 'Exceptional' },
  { min: 50, label: 'Strong' },
  { min: 25, label: 'Developing' },
  { min: 1, label: 'Emerging' },
]

function tierFor(score) {
  return (TIERS.find((t) => score >= t.min) || { label: 'Emerging' }).label
}

// Maps a dimension's score to the app's existing tone vocabulary (Badge /
// ProgressRing). No red — this is a growth journey, not a pass/fail signal.
export function tierTone(score) {
  if (score === null || score === undefined) return 'neutral'
  if (score >= 75) return 'purple'
  if (score >= 50) return 'green'
  if (score >= 25) return 'amber'
  return 'accent'
}

export function computeNorthStar(data) {
  const week7 = lastNDays(7)
  const month30 = lastNDays(30)

  const evidenceByDim = Object.fromEntries(DIMENSION_IDS.map((id) => [id, []]))
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
        weight: 22,
        source: 'Portfolio',
      })
    )
  })

  ;(data.activities || []).forEach((a) => {
    const dims = a.dimensions?.length ? a.dimensions : DEFAULT_ACTIVITY_DIMENSIONS[a.category] || []
    const sustained = Number(a.hoursPerWeek) >= 3 ? 6 : 0
    dims.forEach((dimId) =>
      addEvidence(dimId, {
        id: `activity-${a.id}-${dimId}`,
        title: a.title || 'Untitled activity',
        date: a.startDate || '',
        weight: 18 + sustained,
        source: 'College Prep',
      })
    )
  })

  // Character draws on real Momentum signals — discipline and resilience
  // shown through daily follow-through, not a separate self-rating.
  const activeHabits = (data.habits || []).filter((h) => !h.archived)
  let bestStreak = 0
  let bestHabitTitle = ''
  activeHabits.forEach((h) => {
    const dates = (data.habitLogs || []).filter((l) => l.habitId === h.id).map((l) => l.date)
    const streak = computeStreak(dates).current
    if (streak > bestStreak) {
      bestStreak = streak
      bestHabitTitle = h.title
    }
  })
  if (bestStreak >= 3) {
    addEvidence('character', {
      id: 'character-habit-streak',
      title: `${bestStreak}-day streak on "${bestHabitTitle}"`,
      date: todayKey(),
      weight: Math.min(30, Math.round(bestStreak * 1.5)),
      source: 'Momentum',
    })
  }

  const recentReflections = (data.reflections || []).filter((r) => month30.includes(r.date))
  if (recentReflections.length > 0) {
    addEvidence('character', {
      id: 'character-reflections',
      title: `${recentReflections.length} nightly reflection${recentReflections.length === 1 ? '' : 's'} this month`,
      date: [...recentReflections].sort((a, b) => b.date.localeCompare(a.date))[0]?.date || todayKey(),
      weight: Math.min(20, recentReflections.length * 5),
      source: 'Momentum',
    })
  }

  const recentCommitments = (data.commitments || []).filter((c) => month30.includes(c.date))
  if (recentCommitments.length >= 3) {
    const rate = recentCommitments.filter((c) => c.done).length / recentCommitments.length
    addEvidence('character', {
      id: 'character-follow-through',
      title: `${Math.round(rate * 100)}% of daily missions completed this month`,
      date: todayKey(),
      weight: Math.min(20, Math.round(rate * 20)),
      source: 'Momentum',
    })
  }

  const dimensions = DIMENSIONS.map((dim) => {
    const evidence = evidenceByDim[dim.id].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    const rawScore = evidence.reduce((sum, e) => sum + e.weight, 0)
    const hasEvidence = evidence.length > 0
    const score = hasEvidence ? Math.max(0, Math.min(100, Math.round(rawScore))) : null
    const recentlyActive = evidence.some((e) => e.date && week7.includes(e.date))
    return {
      ...dim,
      score,
      tier: hasEvidence ? tierFor(score) : null,
      evidence,
      recentlyActive,
    }
  })

  const scored = dimensions.filter((d) => d.score !== null)
  const overallScore = scored.length > 0 ? Math.round(scored.reduce((sum, d) => sum + d.score, 0) / scored.length) : null

  return {
    dimensions,
    overallScore,
    overallTier: overallScore !== null ? tierFor(overallScore) : null,
  }
}
