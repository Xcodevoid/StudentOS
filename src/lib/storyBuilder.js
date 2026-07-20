// Organizes Portfolio projects and activities that have Impact Tracker
// framing into a chronological narrative: Beginning / Challenge / Action /
// Impact / Growth. Purely a deterministic reorganization of data the student
// already entered — nothing here is generated or guessed.
import { formatDate } from './dates'
import { CHARACTERISTICS } from './northStar'

const DIM_LABEL = Object.fromEntries(CHARACTERISTICS.map((d) => [d.id, d.label]))

function hasFraming(entry) {
  return Boolean((entry.problem || '').trim() || (entry.action || '').trim() || (entry.impactWho || '').trim() || (entry.growth || '').trim())
}

function deriveBeginning(entry) {
  const when = entry.date ? formatDate(entry.date, { month: 'long', day: undefined }) : null
  const context = entry.kind === 'project' ? entry.role : entry.org
  const pieces = []
  if (when) pieces.push(`Starting in ${when}`)
  if (context) pieces.push(entry.kind === 'project' ? `as ${context}` : `at ${context}`)
  return pieces.length > 0 ? `${pieces.join(', ')}.` : 'Where this began.'
}

function normalize(data) {
  const fromProjects = (data.projects || []).map((p) => ({
    id: p.id,
    kind: 'project',
    source: 'Project',
    title: p.title || 'Untitled project',
    date: p.date || '',
    org: '',
    role: p.role || '',
    problem: p.problem || '',
    action: p.action || '',
    impactWho: p.impactWho || '',
    growth: p.growth || '',
    dimensions: p.dimensions || [],
  }))
  const fromActivities = (data.activities || []).map((a) => ({
    id: a.id,
    kind: 'activity',
    source: 'Activity',
    title: a.title || 'Untitled activity',
    date: a.startDate || '',
    org: a.org || '',
    role: '',
    problem: a.problem || '',
    action: a.action || '',
    impactWho: a.impactWho || '',
    growth: a.growth || '',
    dimensions: a.dimensions || [],
  }))
  return [...fromProjects, ...fromActivities]
}

export function buildStoryChapters(data) {
  const evidence = data.evidence || []
  return normalize(data)
    .filter(hasFraming)
    .map((entry) => ({
      ...entry,
      beginning: deriveBeginning(entry),
      evidenceCount: evidence.filter((e) =>
        entry.kind === 'project' ? e.linkedProjectId === entry.id : e.linkedActivityId === entry.id
      ).length,
    }))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
}

export function countUnframed(data) {
  return normalize(data).filter((entry) => !hasFraming(entry)).length
}

export function storyStats(chapters) {
  if (chapters.length === 0) return null
  const dimCounts = {}
  chapters.forEach((c) => c.dimensions.forEach((d) => { dimCounts[d] = (dimCounts[d] || 0) + 1 }))
  const topDimId = Object.entries(dimCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
  const dated = chapters.filter((c) => c.date)
  return {
    count: chapters.length,
    span: dated.length > 0 ? `${formatDate(dated[0].date)} – ${formatDate(dated[dated.length - 1].date)}` : null,
    topDimension: topDimId ? DIM_LABEL[topDimId] : null,
  }
}

export function formatChapterText(chapter) {
  return [
    chapter.title,
    chapter.beginning,
    chapter.problem && `Challenge: ${chapter.problem}`,
    chapter.action && `Action: ${chapter.action}`,
    chapter.impactWho && `Impact: ${chapter.impactWho}`,
    chapter.growth && `Growth: ${chapter.growth}`,
  ]
    .filter(Boolean)
    .join('\n')
}

export function formatFullStory(chapters, identity) {
  const intro = identity ? `${identity}\n\n` : ''
  return intro + chapters.map(formatChapterText).join('\n\n')
}
