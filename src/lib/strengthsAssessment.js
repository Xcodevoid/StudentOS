// A deterministic self-assessment — no AI — that produces a real ranked
// score for every trait in the CHARACTERISTICS bank, instead of tallying a
// handful of scenario picks. The student rates agreement with each trait's
// `statement` on a 1-5 scale; scoring is pure normalization + summing, same
// inputs always produce the same result.
import { CHARACTERISTICS, DIRECTIONS, DIRECTION_LABEL } from './northStar'

export const RATING_SCALE = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
]

const TOP_ADVANTAGE_COUNT = 5
const TOP_DIRECTION_COUNT = 3

export function isComplete(ratings) {
  return CHARACTERISTICS.every((c) => ratings[c.id] !== undefined)
}

// ratings: { [characteristicId]: 1-5 }
export function scoreAssessment(ratings) {
  const traitScores = {}
  CHARACTERISTICS.forEach((c) => {
    const rating = ratings[c.id]
    traitScores[c.id] = Number.isFinite(rating) ? Math.round(((rating - 1) / 4) * 100) : 0
  })

  const topAdvantages = [...CHARACTERISTICS]
    .sort((a, b) => traitScores[b.id] - traitScores[a.id])
    .slice(0, TOP_ADVANTAGE_COUNT)
    .map((c) => c.id)

  const directionScores = {}
  CHARACTERISTICS.forEach((c) => {
    directionScores[c.primaryDirection] = (directionScores[c.primaryDirection] || 0) + traitScores[c.id]
  })
  const directions = DIRECTIONS
    .map((d) => ({ id: d.id, label: DIRECTION_LABEL[d.id], score: directionScores[d.id] || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_DIRECTION_COUNT)
    .map(({ id, label }) => ({ id, label }))

  return { traitScores, topAdvantages, directions }
}
