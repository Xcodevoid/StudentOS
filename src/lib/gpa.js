// Standard 4.0-scale conversion from percentage grade
const SCALE = [
  { min: 97, letter: 'A+', points: 4.0 },
  { min: 93, letter: 'A', points: 4.0 },
  { min: 90, letter: 'A-', points: 3.7 },
  { min: 87, letter: 'B+', points: 3.3 },
  { min: 83, letter: 'B', points: 3.0 },
  { min: 80, letter: 'B-', points: 2.7 },
  { min: 77, letter: 'C+', points: 2.3 },
  { min: 73, letter: 'C', points: 2.0 },
  { min: 70, letter: 'C-', points: 1.7 },
  { min: 67, letter: 'D+', points: 1.3 },
  { min: 65, letter: 'D', points: 1.0 },
  { min: -Infinity, letter: 'F', points: 0.0 },
]

export const WEIGHT_BONUS = {
  regular: 0,
  honors: 0.5,
  ap: 1.0,
  ib: 1.0,
  'a-level': 1.0,
}

export const WEIGHT_LABELS = {
  regular: 'Regular',
  honors: 'Honors',
  ap: 'AP',
  ib: 'IB',
  'a-level': 'A-Level',
}

export function percentToLetter(percent) {
  const p = Number(percent)
  const row = SCALE.find((r) => p >= r.min)
  return row ? row.letter : '—'
}

export function percentToPoints(percent) {
  const p = Number(percent)
  if (Number.isNaN(p)) return null
  const row = SCALE.find((r) => p >= r.min)
  return row ? row.points : 0
}

export function classGpaPoints(klass, weighted) {
  if (klass.grade === '' || klass.grade === null || klass.grade === undefined) return null
  const base = percentToPoints(klass.grade)
  if (base === null) return null
  if (!weighted) return base
  const bonus = WEIGHT_BONUS[klass.weight] ?? 0
  return Math.min(base + bonus, 5.0)
}

export function computeGPA(classes) {
  const graded = classes.filter((c) => c.grade !== '' && c.grade !== null && c.grade !== undefined)
  if (graded.length === 0) return { weighted: null, unweighted: null, count: 0 }

  let unweightedSum = 0
  let weightedSum = 0
  let creditSum = 0

  graded.forEach((c) => {
    const credits = Number(c.credits) || 1
    const base = percentToPoints(c.grade) ?? 0
    const bonus = WEIGHT_BONUS[c.weight] ?? 0
    unweightedSum += base * credits
    weightedSum += Math.min(base + bonus, 5.0) * credits
    creditSum += credits
  })

  return {
    weighted: creditSum ? +(weightedSum / creditSum).toFixed(3) : null,
    unweighted: creditSum ? +(unweightedSum / creditSum).toFixed(3) : null,
    count: graded.length,
  }
}
