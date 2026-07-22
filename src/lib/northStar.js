import {
  HeartHandshake, Users, Rocket, Code2, FlaskConical, ShieldCheck,
  Mic2, Brain, Palette, Compass, Handshake, Feather, Trophy, Lightbulb,
  Ear, CalendarCheck, Drama,
} from 'lucide-react'
import { computeStreak } from './streak'
import { lastNDays, todayKey } from './momentum'

// Five broad categories a trait belongs to — gives the trait bank real
// structure instead of one flat list. Colors are a validated categorical
// palette (dataviz skill: adjacent-pair CVD ΔE >= 8, normal-vision ΔE >= 15,
// in both light and dark) — assigned in this fixed order, never cycled or
// re-derived from rank or score.
export const CATEGORIES = [
  { id: 'mind', label: 'Mind', light: '#2a78d6', dark: '#3987e5' },
  { id: 'hands', label: 'Hands', light: '#eb6834', dark: '#d95926' },
  { id: 'drive', label: 'Drive', light: '#1baf7a', dark: '#199e70' },
  { id: 'heart', label: 'Heart', light: '#eda100', dark: '#c98500' },
  { id: 'voice', label: 'Voice', light: '#e87ba4', dark: '#d55181' },
]
export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

// The 8 major/career clusters a trait can point toward — reused by the
// Strengths Assessment to derive "directions worth exploring" from whichever
// traits score highest, instead of asking separate scenario questions.
export const DIRECTIONS = [
  { id: 'engineering-cs', label: 'Engineering & Computer Science', description: 'Building and reasoning about systems — software, hardware, or both.' },
  { id: 'sciences', label: 'Natural Sciences & Research', description: 'Understanding how things work, through evidence and experimentation.' },
  { id: 'business', label: 'Business & Entrepreneurship', description: 'Making things happen — organizations, ventures, getting results.' },
  { id: 'design', label: 'Design & Creative Arts', description: 'Making things that look, feel, or sound the way they should.' },
  { id: 'humanities', label: 'Humanities & Writing', description: 'Ideas, language, and argument — understanding people through words.' },
  { id: 'social-science', label: 'Social Sciences & Public Policy', description: 'Understanding and improving how people and communities work.' },
  { id: 'health', label: 'Health & Medicine', description: 'The science and practice of caring for people\'s wellbeing.' },
  { id: 'education', label: 'Education & Community Work', description: 'Helping others learn, grow, and get access to what they need.' },
]
export const DIRECTION_LABEL = Object.fromEntries(DIRECTIONS.map((d) => [d.id, d.label]))

// A bank of characteristics students can recognize in themselves — not a
// universal rubric everyone is scored against. The first 14 ids are kept
// stable from North Star's earlier flat 14-trait bank (Essay Help keys off
// these ids) so every existing tagged project, activity, piece of evidence,
// and essay prompt keeps working with zero migration. `statement` is the
// first-person self-rating prompt used by the Strengths Assessment;
// `primaryDirection` is which of the 8 DIRECTIONS this trait counts toward.
export const CHARACTERISTICS = [
  // Mind — analytical, intellectual
  { id: 'analytical', label: 'Analytical Thinker', shortLabel: 'Analytical', icon: Brain, category: 'mind', primaryDirection: 'engineering-cs', tagline: 'Logic, data, breaking down hard problems', statement: 'I break hard problems into steps before diving in.' },
  { id: 'curiosity', label: 'Curious', shortLabel: 'Curious', icon: FlaskConical, category: 'mind', primaryDirection: 'sciences', tagline: 'Learning beyond school, research, exploration', statement: "I dig into things I don't understand just because I want to know." },
  { id: 'strategic', label: 'Strategic Planner', shortLabel: 'Strategic', icon: Compass, category: 'mind', primaryDirection: 'business', tagline: 'Foresight, organizing complexity, planning ahead', statement: 'I like planning several steps ahead, not just the next one.' },
  { id: 'independent', label: 'Independent', shortLabel: 'Independent', icon: Feather, category: 'mind', primaryDirection: 'sciences', tagline: 'Self-directed, takes initiative alone', statement: "I'd rather figure something out myself than wait for direction." },

  // Heart — relational, people-oriented
  { id: 'community', label: 'Community-Minded', shortLabel: 'Community', icon: HeartHandshake, category: 'heart', primaryDirection: 'social-science', tagline: 'Contribution to others, service, helping people', statement: 'I go out of my way to help people who need it.' },
  { id: 'collaborator', label: 'Collaborator', shortLabel: 'Collaborator', icon: Handshake, category: 'heart', primaryDirection: 'social-science', tagline: 'Teamwork, bringing people together', statement: "I work best when I'm building something together with others." },
  { id: 'empathetic', label: 'Empathetic', shortLabel: 'Empathetic', icon: Ear, category: 'heart', primaryDirection: 'education', tagline: "Reads people's feelings, listens before reacting", statement: 'I notice how people are feeling before they say it.' },

  // Hands — making, execution
  { id: 'skills', label: 'Builder / Maker', shortLabel: 'Builder', icon: Code2, category: 'hands', primaryDirection: 'engineering-cs', tagline: 'Builds and creates — technical or hands-on', statement: 'I like building or making things, technical or hands-on.' },
  { id: 'impact', label: 'Doer', shortLabel: 'Doer', icon: Rocket, category: 'hands', primaryDirection: 'business', tagline: 'Gets real things done, ships results', statement: 'I care more about getting real results than talking about ideas.' },
  { id: 'innovator', label: 'Innovator', shortLabel: 'Innovator', icon: Lightbulb, category: 'hands', primaryDirection: 'design', tagline: 'New ideas, entrepreneurial thinking', statement: "I'm usually the one suggesting a different way to do things." },

  // Drive — ambition, grit
  { id: 'leadership', label: 'Leader', shortLabel: 'Leader', icon: Users, category: 'drive', primaryDirection: 'business', tagline: 'Taking initiative, leading teams, creating change', statement: 'I take the lead when a team needs direction.' },
  { id: 'competitive', label: 'Competitive', shortLabel: 'Competitive', icon: Trophy, category: 'drive', primaryDirection: 'business', tagline: 'Driven by achievement, winning, personal bests', statement: "I want to win, not just participate." },
  { id: 'character', label: 'Resilient', shortLabel: 'Resilient', icon: ShieldCheck, category: 'drive', primaryDirection: 'health', tagline: 'Persistence through setbacks', statement: "I keep going even when something gets hard or doesn't work out." },
  { id: 'disciplined', label: 'Disciplined', shortLabel: 'Disciplined', icon: CalendarCheck, category: 'drive', primaryDirection: 'health', tagline: 'Consistent daily follow-through', statement: "I show up and do the work even on days I don't feel like it." },

  // Voice — expression, communication
  { id: 'creative', label: 'Creative', shortLabel: 'Creative', icon: Palette, category: 'voice', primaryDirection: 'design', tagline: 'Art, design, original expression', statement: 'I\'d rather make something original than follow a template.' },
  { id: 'communicator', label: 'Communicator', shortLabel: 'Communicator', icon: Mic2, category: 'voice', primaryDirection: 'humanities', tagline: 'Expressing ideas clearly, presenting, persuading', statement: "I'm good at explaining ideas so people actually get them." },
  { id: 'performer', label: 'Performer', shortLabel: 'Performer', icon: Drama, category: 'voice', primaryDirection: 'design', tagline: 'Expressive, comfortable in front of people', statement: 'I feel comfortable being watched — performing, presenting, being on stage.' },
]

export const CHARACTERISTIC_IDS = CHARACTERISTICS.map((c) => c.id)

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

  // Resilience draws on real daily-practice signals — bouncing back shown
  // through habit streaks and honest reflection, not a separate self-rating.
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

  // Discipline draws on consistent daily follow-through specifically —
  // separated from Resilience so "bounces back from setbacks" and "shows up
  // every day" aren't blurred into one trait.
  const recentCommitments = (data.commitments || []).filter((c) => month30.includes(c.date))
  if (recentCommitments.length >= 3) {
    const rate = recentCommitments.filter((c) => c.done).length / recentCommitments.length
    addEvidence('disciplined', {
      id: 'disciplined-follow-through',
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
