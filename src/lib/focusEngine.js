import { daysUntil, isOverdue, formatDate } from './dates'
import { TEST_TYPES, bestSectionScores, focusSection } from './standardizedTests'

// Cross-module "what actually needs action" — unlike lib/reminders.js (which
// answers "what's due soon"), this answers "what's the biggest gap, and what
// should be done about it." Each signal carries its own reason so the UI
// never has to re-derive it.
function testPrepSignals(data) {
  const byType = {}
  data.testEntries.forEach((e) => {
    if (!byType[e.testType]) byType[e.testType] = []
    byType[e.testType].push(e)
  })

  return Object.keys(byType).flatMap((testType) => {
    const type = TEST_TYPES[testType]
    const targets = data.testPrep.targets[testType]
    if (!type || !targets) return []

    const best = bestSectionScores(byType[testType], testType)
    const focus = focusSection(testType, targets, best)
    if (!focus) return []

    const nextSitting = byType[testType]
      .filter((e) => e.status === 'planned' && e.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0]

    return [{
      id: `testprep-${testType}`,
      domain: 'test-prep',
      title: `${type.label}: ${focus.label}`,
      detail: `${focus.best}/${focus.target} — ${focus.gap} point${focus.gap === 1 ? '' : 's'} to go`,
      date: nextSitting?.date || null,
      path: '/college-path?tab=testprep',
    }]
  })
}

function recommenderSignals(data) {
  return data.recommenders
    .filter((r) => r.deadline && !['confirmed', 'submitted', 'thanked'].includes(r.status))
    .map((r) => ({
      id: `recommender-${r.id}`,
      domain: 'recommenders',
      title: r.status === 'asked' ? `Follow up with ${r.name}` : `Ask ${r.name}`,
      detail: `Letter due ${formatDate(r.deadline)}`,
      date: r.deadline,
      path: '/college-path?tab=bragsheet',
    }))
}

function opportunitySignals(data) {
  return data.opportunities
    .filter((o) => o.status !== 'submitted' && o.date && (o.checklist || []).some((c) => !c.done))
    .map((o) => {
      const remaining = o.checklist.filter((c) => !c.done).length
      return {
        id: `opportunity-${o.id}`,
        domain: 'opportunities',
        title: o.title,
        detail: `${remaining} checklist item${remaining === 1 ? '' : 's'} left, due ${formatDate(o.date)}`,
        date: o.date,
        path: '/college-path?tab=opportunities',
      }
    })
}

export function computeFocusSignals(data) {
  const signals = [...testPrepSignals(data), ...recommenderSignals(data), ...opportunitySignals(data)]

  return signals.sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    const aOverdue = isOverdue(a.date)
    const bOverdue = isOverdue(b.date)
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1
    return daysUntil(a.date) - daysUntil(b.date)
  })
}
