// Level of Recognition mirrors the Common App Honors section exactly (School
// / State-Regional / National / International) rather than an invented
// scale — so what a student fills in here maps directly onto the real
// application later. Shared with Activities' `scope` field for volunteering,
// since colleges care about scope of impact there too.
export const RECOGNITION_LEVELS = {
  school: { label: 'School', tone: 'neutral', weight: 1 },
  'state-regional': { label: 'State / Regional', tone: 'accent', weight: 2 },
  national: { label: 'National', tone: 'purple', weight: 3 },
  international: { label: 'International', tone: 'amber', weight: 4 },
}

export const AWARD_CATEGORIES = [
  'Academic', 'Arts', 'Athletics', 'Leadership', 'Community Service', 'STEM', 'Other',
]

export function isDistinguished(level) {
  return level === 'national' || level === 'international'
}
