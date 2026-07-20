// Standardized test configs and score math. Composite scoring rules follow
// how each test actually reports a total, so the numbers shown here match
// what a student sees on their real score report.
export const TEST_TYPES = {
  sat: {
    label: 'SAT',
    maxScore: 1600,
    compositeMode: 'sum',
    sections: [
      { key: 'readingWriting', label: 'Reading & Writing', max: 800 },
      { key: 'math', label: 'Math', max: 800 },
    ],
  },
  psat: {
    label: 'PSAT/NMSQT',
    maxScore: 1520,
    compositeMode: 'sum',
    sections: [
      { key: 'readingWriting', label: 'Reading & Writing', max: 760 },
      { key: 'math', label: 'Math', max: 760 },
    ],
  },
  act: {
    label: 'ACT',
    maxScore: 36,
    compositeMode: 'average',
    sections: [
      { key: 'english', label: 'English', max: 36 },
      { key: 'math', label: 'Math', max: 36 },
      { key: 'reading', label: 'Reading', max: 36 },
      { key: 'science', label: 'Science', max: 36 },
    ],
  },
  toefl: {
    label: 'TOEFL iBT',
    maxScore: 120,
    compositeMode: 'sum',
    sections: [
      { key: 'reading', label: 'Reading', max: 30 },
      { key: 'listening', label: 'Listening', max: 30 },
      { key: 'speaking', label: 'Speaking', max: 30 },
      { key: 'writing', label: 'Writing', max: 30 },
    ],
  },
  ielts: {
    label: 'IELTS',
    maxScore: 9,
    compositeMode: 'bandAverage',
    sections: [
      { key: 'listening', label: 'Listening', max: 9 },
      { key: 'reading', label: 'Reading', max: 9 },
      { key: 'writing', label: 'Writing', max: 9 },
      { key: 'speaking', label: 'Speaking', max: 9 },
    ],
  },
  duolingo: {
    label: 'Duolingo English Test',
    maxScore: 160,
    // Duolingo's overall score isn't a simple average of its sub-scores
    // (it's its own adaptive result) — enter it directly; sub-scores are
    // informational only.
    compositeMode: 'direct',
    sections: [
      { key: 'overall', label: 'Overall Score', max: 160 },
      { key: 'literacy', label: 'Literacy', max: 160, excludeFromComposite: true },
      { key: 'conversation', label: 'Conversation', max: 160, excludeFromComposite: true },
      { key: 'comprehension', label: 'Comprehension', max: 160, excludeFromComposite: true },
      { key: 'production', label: 'Production', max: 160, excludeFromComposite: true },
    ],
  },
}

export const TEST_TYPE_OPTIONS = Object.entries(TEST_TYPES).map(([value, t]) => ({ value, label: t.label }))

function compositeSections(type) {
  return type.sections.filter((s) => !s.excludeFromComposite)
}

export function computeComposite(testTypeKey, scores) {
  const type = TEST_TYPES[testTypeKey]
  if (!type || !scores) return null

  if (type.compositeMode === 'direct') {
    const v = Number(scores.overall)
    return Number.isFinite(v) ? v : null
  }

  const relevant = compositeSections(type)
  const values = relevant.map((s) => Number(scores[s.key])).filter((v) => Number.isFinite(v))
  if (values.length < relevant.length) return null

  const sum = values.reduce((a, b) => a + b, 0)
  if (type.compositeMode === 'sum') return sum
  if (type.compositeMode === 'average') return Math.round(sum / values.length)
  if (type.compositeMode === 'bandAverage') return Math.round((sum / values.length) * 2) / 2
  return null
}

// Highest composite from any single completed sitting — always meaningful,
// regardless of whether the test is superscorable.
export function bestSingleAttempt(entries, testTypeKey) {
  const composites = entries
    .filter((e) => e.testType === testTypeKey && e.status === 'completed')
    .map((e) => computeComposite(testTypeKey, e.scores))
    .filter((v) => v !== null)
  return composites.length > 0 ? Math.max(...composites) : null
}

// Many colleges superscore SAT/ACT/TOEFL — take the best individual section
// score across every sitting, then recombine. Only meaningful across 2+
// completed attempts, and not offered for band-scored or single-number tests.
export function superscore(entries, testTypeKey) {
  const type = TEST_TYPES[testTypeKey]
  if (!type || type.compositeMode === 'direct' || type.compositeMode === 'bandAverage') return null

  const completed = entries.filter((e) => e.testType === testTypeKey && e.status === 'completed')
  if (completed.length < 2) return null

  const relevant = compositeSections(type)
  const bestPerSection = {}
  relevant.forEach((s) => {
    const values = completed.map((e) => Number(e.scores[s.key])).filter((v) => Number.isFinite(v))
    if (values.length > 0) bestPerSection[s.key] = Math.max(...values)
  })
  if (Object.keys(bestPerSection).length < relevant.length) return null

  return computeComposite(testTypeKey, bestPerSection)
}

export function scoreGap(target, best) {
  if (target === '' || target === null || target === undefined || best === null) return null
  const t = Number(target)
  return Number.isFinite(t) ? +(t - best).toFixed(1) : null
}
