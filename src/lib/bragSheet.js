// Assembles a recommendation "brag sheet" purely from data the student
// already entered elsewhere (Portfolio, Evidence Vault, North Star, College
// Path) — no new writing required to generate one. Deterministic, like
// Common App Export: same inputs always produce the same document.
import { formatDate } from './dates'
import { computeGPA } from './gpa'
import { WEIGHT_LABELS } from './gpa'

const AWARD_TYPES = ['award', 'certificate']
const HIGHLIGHT_LIMIT = 5
const CLASS_LIMIT = 4
const AWARD_LIMIT = 5

// Featured projects/activities first, then ones with real Impact Tracker
// framing (problem/action/impact/growth) filled in — those are exactly the
// specifics a recommender needs to write something concrete instead of
// generic. Recency breaks ties.
function topHighlights(data) {
  const projects = (data.projects || []).map((p) => ({ ...p, kind: 'project' }))
  const activities = (data.activities || []).map((a) => ({ ...a, kind: 'activity', date: a.startDate }))
  const scored = [...projects, ...activities].map((e) => ({
    ...e,
    score: (e.featured ? 100 : 0) + (e.problem || e.action || e.impactWho || e.growth ? 20 : 0),
  }))
  return scored.sort((a, b) => b.score - a.score || (b.date || '').localeCompare(a.date || '')).slice(0, HIGHLIGHT_LIMIT)
}

function notableClasses(classes) {
  return [...(classes || [])]
    .filter((c) => c.weight !== 'regular' || (Number(c.grade) || 0) >= 90)
    .sort((a, b) => (Number(b.grade) || 0) - (Number(a.grade) || 0))
    .slice(0, CLASS_LIMIT)
}

function topAwards(evidence) {
  const list = evidence || []
  const tagged = list.filter((e) => AWARD_TYPES.includes(e.type))
  const pool = tagged.length > 0 ? tagged : list
  return [...pool].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, AWARD_LIMIT)
}

export function buildBragSheet(data, { recommenderId = null } = {}) {
  const gpa = computeGPA(data.classes || [])
  const recommender = recommenderId ? (data.recommenders || []).find((r) => r.id === recommenderId) || null : null
  const applyingTo = (data.opportunities || [])
    .filter((o) => o.category === 'college-application')
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))

  return {
    profile: data.profile,
    gpa,
    identity: data.northStar?.identity || '',
    classes: notableClasses(data.classes),
    highlights: topHighlights(data),
    awards: topAwards(data.evidence),
    applyingTo,
    recommender,
  }
}

export function formatBragSheetText(sheet) {
  const { profile } = sheet
  const lines = []

  lines.push(`BRAG SHEET — ${profile.name || 'Student'}`)
  lines.push([profile.gradeLevel, profile.school].filter(Boolean).join(' · '))
  if (profile.intendedMajor) lines.push(`Intended major: ${profile.intendedMajor}`)
  if (sheet.gpa.weighted !== null) {
    lines.push(`GPA: ${sheet.gpa.weighted} weighted${sheet.gpa.unweighted !== null ? ` (${sheet.gpa.unweighted} unweighted)` : ''}`)
  }

  if (sheet.recommender) {
    lines.push('')
    lines.push(`Prepared for: ${sheet.recommender.name}${sheet.recommender.subject ? ` — ${sheet.recommender.subject}` : ''}`)
    if (sheet.recommender.notes) lines.push(`Context to remember: ${sheet.recommender.notes}`)
  }

  if (sheet.identity) {
    lines.push('')
    lines.push('WHO I AM')
    lines.push(sheet.identity)
  }

  if (sheet.classes.length > 0) {
    lines.push('')
    lines.push('NOTABLE COURSEWORK')
    sheet.classes.forEach((c) => {
      lines.push(`- ${c.name}${c.weight ? ` (${WEIGHT_LABELS[c.weight] || c.weight})` : ''}${c.grade ? ` — ${c.grade}` : ''}`)
    })
  }

  if (sheet.highlights.length > 0) {
    lines.push('')
    lines.push('KEY PROJECTS & ACTIVITIES')
    sheet.highlights.forEach((h) => {
      lines.push(`- ${h.title || 'Untitled'}${h.role ? ` — ${h.role}` : ''}`)
      if (h.problem) lines.push(`  Challenge: ${h.problem}`)
      if (h.action) lines.push(`  Action: ${h.action}`)
      if (h.impactWho) lines.push(`  Impact: ${h.impactWho}`)
    })
  }

  if (sheet.awards.length > 0) {
    lines.push('')
    lines.push('AWARDS & RECOGNITION')
    sheet.awards.forEach((a) => lines.push(`- ${a.title || 'Untitled'}${a.date ? ` (${formatDate(a.date)})` : ''}`))
  }

  if (sheet.applyingTo.length > 0) {
    lines.push('')
    lines.push('APPLYING TO')
    sheet.applyingTo.forEach((o) => {
      const round = o.applicationRound ? ` (${o.applicationRound.replace('-', ' ')})` : ''
      const due = o.date ? ` — due ${formatDate(o.date)}` : ''
      lines.push(`- ${o.schoolName || o.title}${round}${due}`)
    })
  }

  return lines.join('\n')
}
