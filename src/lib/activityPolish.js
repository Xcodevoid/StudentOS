// A free, deterministic writing coach for activity descriptions — no AI, no
// API key, no cost. It doesn't rewrite anything for the student; it just
// flags the same things a college counselor would flag by eye.

const WEAK_OPENERS = [
  'helped', 'help', 'was responsible for', 'responsible for', 'worked on', 'worked with', 'work on',
  'participated in', 'participate in', 'assisted with', 'assist with', 'involved in', 'in charge of',
  'did', 'took part in', 'was part of', 'part of', 'attended',
]

const FILLER_WORDS = ['very', 'really', 'a lot of', 'lots of', 'many things', 'stuff', 'basically', 'kind of', 'sort of']

const OUTCOME_WORDS = [
  'result', 'resulted', 'led to', 'leading to', 'increase', 'increased', 'decrease', 'decreased',
  'reduce', 'reduced', 'improve', 'improved', 'raise', 'raised', 'grow', 'grew', 'achieve', 'achieved',
  'win', 'won', 'award', 'recognized', 'impact', 'impacted', 'boost', 'boosted', 'launch', 'launched',
  'save', 'saved', 'generate', 'generated', 'earn', 'earned', 'ranked', 'placed',
]

export const ACTION_VERBS = {
  leadership: ['Led', 'Directed', 'Founded', 'Organized', 'Spearheaded', 'Coordinated', 'Mentored', 'Established'],
  impact: ['Achieved', 'Delivered', 'Increased', 'Reduced', 'Generated', 'Secured', 'Won', 'Grew'],
  skills: ['Built', 'Designed', 'Developed', 'Created', 'Engineered', 'Programmed', 'Produced'],
  community: ['Volunteered', 'Organized', 'Supported', 'Mentored', 'Tutored', 'Advocated', 'Served'],
  curiosity: ['Researched', 'Investigated', 'Analyzed', 'Explored', 'Studied', 'Presented'],
  character: ['Persisted', 'Overcame', 'Balanced', 'Sustained', 'Committed'],
  communicator: ['Presented', 'Communicated', 'Persuaded', 'Pitched', 'Explained', 'Authored'],
  analytical: ['Analyzed', 'Solved', 'Modeled', 'Diagnosed', 'Evaluated', 'Optimized'],
  creative: ['Designed', 'Composed', 'Illustrated', 'Crafted', 'Produced', 'Reimagined'],
  strategic: ['Planned', 'Strategized', 'Orchestrated', 'Structured', 'Streamlined'],
  collaborator: ['Collaborated', 'Partnered', 'Facilitated', 'Coordinated', 'United'],
  independent: ['Initiated', 'Launched', 'Pioneered', 'Self-taught', 'Drove'],
  competitive: ['Won', 'Ranked', 'Competed', 'Placed', 'Qualified'],
  innovator: ['Invented', 'Pioneered', 'Prototyped', 'Reimagined', 'Innovated'],
}

const DEFAULT_VERBS = ['Led', 'Built', 'Organized', 'Achieved', 'Created', 'Launched']

export function suggestedVerbs(dimensions = []) {
  const pool = dimensions.flatMap((d) => ACTION_VERBS[d] || [])
  const unique = [...new Set(pool)]
  return (unique.length > 0 ? unique : DEFAULT_VERBS).slice(0, 6)
}

export function analyzeDescription(text) {
  const trimmed = (text || '').trim()
  const lower = trimmed.toLowerCase()
  const startsWeak = WEAK_OPENERS.some((w) => lower.startsWith(w))

  const checks = [
    { id: 'verb', label: 'Starts with a strong action verb', pass: trimmed.length > 0 && !startsWeak },
    { id: 'number', label: 'Includes a number or metric', pass: /\d/.test(trimmed) },
    { id: 'outcome', label: 'States a result or impact', pass: OUTCOME_WORDS.some((w) => lower.includes(w)) },
    { id: 'filler', label: 'No filler words', pass: trimmed.length > 0 && !FILLER_WORDS.some((w) => lower.includes(w)) },
    { id: 'length', label: 'Detailed enough (40+ characters)', pass: trimmed.length >= 40 },
  ]

  return { checks, score: checks.filter((c) => c.pass).length, total: checks.length }
}
