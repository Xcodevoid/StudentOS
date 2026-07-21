// A personalized interview question bank built the same way as Essay Help:
// every question is matched against the student's own Story Builder
// chapters, so practice starts from a real memory instead of "think of a
// time you..." panic. Gaps are surfaced explicitly rather than papered over.
import { buildStoryChapters } from './storyBuilder'

export const QUESTION_BANK = [
  { id: 'q-leadership-1', category: 'Leadership', text: 'Tell me about a time you led a team through something difficult.', focusDimensions: ['leadership', 'strategic'] },
  { id: 'q-leadership-2', category: 'Leadership', text: 'Describe a time you had to motivate people who weren\'t as invested as you were.', focusDimensions: ['leadership', 'communicator'] },
  { id: 'q-challenge-1', category: 'Challenge & Resilience', text: 'Tell me about a time you failed at something. What did you do next?', focusDimensions: ['character', 'analytical'] },
  { id: 'q-challenge-2', category: 'Challenge & Resilience', text: 'Describe the most difficult decision you\'ve had to make.', focusDimensions: ['character', 'strategic'] },
  { id: 'q-team-1', category: 'Teamwork & Collaboration', text: 'Tell me about a time you disagreed with a teammate. How did you resolve it?', focusDimensions: ['collaborator', 'communicator'] },
  { id: 'q-team-2', category: 'Teamwork & Collaboration', text: 'Describe a project where your contribution mattered even though you weren\'t the leader.', focusDimensions: ['collaborator', 'impact'] },
  { id: 'q-community-1', category: 'Community & Background', text: 'Tell me about a community that has shaped who you are.', focusDimensions: ['community', 'character'] },
  { id: 'q-community-2', category: 'Community & Background', text: 'Describe a time you helped someone who was struggling.', focusDimensions: ['community', 'collaborator'] },
  { id: 'q-curiosity-1', category: 'Academic Curiosity', text: 'What\'s something you\'ve taught yourself outside of class?', focusDimensions: ['curiosity', 'independent'] },
  { id: 'q-curiosity-2', category: 'Academic Curiosity', text: 'Tell me about a topic you could talk about for an hour without notes.', focusDimensions: ['curiosity', 'analytical'] },
  { id: 'q-fit-1', category: 'Why This School / Fit', text: 'Why does this program specifically fit what you want to do?', focusDimensions: ['strategic', 'curiosity'] },
  { id: 'q-general-1', category: 'General', text: 'Tell me about yourself.', focusDimensions: [] },
  { id: 'q-general-2', category: 'General', text: 'What are you most proud of?', focusDimensions: ['impact'] },
]

export const QUESTION_CATEGORIES = [...new Set(QUESTION_BANK.map((q) => q.category))]

export function matchStoryToQuestion(question, data) {
  const chapters = buildStoryChapters(data)
  const scored = chapters
    .map((chapter) => {
      const overlap = (chapter.dimensions || []).filter((d) => question.focusDimensions.includes(d))
      const framingStrength = [chapter.problem, chapter.action, chapter.impactWho, chapter.growth].filter((x) => (x || '').trim()).length
      return { chapter, score: overlap.length * 3 + framingStrength }
    })
    .sort((a, b) => b.score - a.score)

  if (question.focusDimensions.length === 0) return chapters.length > 0 ? { chapter: chapters[chapters.length - 1], score: 1 } : null
  const best = scored[0]
  return best && best.score > 0 ? best : null
}

const SITUATION_CUES = ['when', 'during', 'while', 'at the time', 'as a', 'in my', 'our team', 'my role']
const ACTION_CUES = [
  'i led', 'i built', 'i organized', 'i decided', 'i created', 'i started', 'i reached out', 'i asked',
  'i designed', 'i planned', 'i coordinated', 'i talked to', 'i researched', 'i changed', 'i took',
]
const RESULT_CUES = [
  'as a result', 'because of this', 'in the end', 'ended up', 'we won', 'we finished', 'improved', 'increased',
  'reduced', 'the team', 'learned', 'now i', 'since then', 'went on to',
]

export function analyzeStarAnswer(text) {
  const trimmed = (text || '').trim()
  const lower = trimmed.toLowerCase()

  const checks = [
    { id: 'situation', label: 'Sets up the situation (when/where/who)', pass: SITUATION_CUES.some((c) => lower.includes(c)) },
    { id: 'action', label: "Describes what YOU specifically did", pass: ACTION_CUES.some((c) => lower.includes(c)) || /\bi \w+ed\b/.test(lower) },
    { id: 'result', label: 'States a concrete result or outcome', pass: RESULT_CUES.some((c) => lower.includes(c)) || /\d/.test(trimmed) },
    { id: 'length', label: 'Detailed enough to be memorable (40+ words)', pass: trimmed.split(/\s+/).filter(Boolean).length >= 40 },
  ]

  return { checks, score: checks.filter((c) => c.pass).length, total: checks.length }
}

export function coverageByCategory(data, practice) {
  return QUESTION_CATEGORIES.map((category) => {
    const questions = QUESTION_BANK.filter((q) => q.category === category)
    const withStory = questions.filter((q) => matchStoryToQuestion(q, data) !== null).length
    const practiced = questions.filter((q) => practice.some((p) => p.questionId === q.id)).length
    return { category, total: questions.length, withStory, practiced }
  })
}
