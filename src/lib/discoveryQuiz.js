// A short, deterministic questionnaire — no AI — that suggests characteristics
// to track and a major/career direction worth exploring. Pure tallying: each
// answer tags one characteristic id (from lib/northStar's CHARACTERISTICS
// bank) and one direction cluster id, and scoring just counts frequency.
// Same inputs always produce the same result, and it's fully replayable.

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

const DIRECTION_LABEL = Object.fromEntries(DIRECTIONS.map((d) => [d.id, d.label]))

export const QUESTIONS = [
  {
    id: 'q1',
    text: 'A free Saturday afternoon — what sounds best?',
    options: [
      { text: 'Debugging or tinkering with something until it finally works', characteristic: 'skills', direction: 'engineering-cs' },
      { text: 'Getting lost in a documentary or research deep-dive', characteristic: 'curiosity', direction: 'sciences' },
      { text: 'Organizing a hangout or event for a group of people', characteristic: 'leadership', direction: 'business' },
      { text: 'Making something — art, music, writing, or video', characteristic: 'creative', direction: 'design' },
    ],
  },
  {
    id: 'q2',
    text: "In a group project, you're usually the one who…",
    options: [
      { text: 'Wants to test the idea properly before trusting it', characteristic: 'analytical', direction: 'sciences' },
      { text: 'Keeps everyone organized and on schedule', characteristic: 'strategic', direction: 'business' },
      { text: 'Cares most about how it actually looks and feels', characteristic: 'creative', direction: 'design' },
      { text: "Makes sure everyone's voice gets heard", characteristic: 'collaborator', direction: 'social-science' },
    ],
  },
  {
    id: 'q3',
    text: 'Which compliment would mean the most to you?',
    options: [
      { text: 'You always know how to get a deal done.', characteristic: 'impact', direction: 'business' },
      { text: "That's such a creative solution.", characteristic: 'creative', direction: 'design' },
      { text: 'You always know how to bring people together.', characteristic: 'community', direction: 'social-science' },
      { text: 'You never give up, no matter how hard it gets.', characteristic: 'character', direction: 'health' },
    ],
  },
  {
    id: 'q4',
    text: "Pick a problem you'd rather spend a weekend on:",
    options: [
      { text: 'A design or aesthetic challenge — a poster, a product, a space', characteristic: 'creative', direction: 'design' },
      { text: 'A local community issue, like housing or the environment', characteristic: 'community', direction: 'social-science' },
      { text: 'Understanding why a treatment or habit actually works', characteristic: 'curiosity', direction: 'health' },
      { text: 'Explaining a hard idea so a younger student finally gets it', characteristic: 'communicator', direction: 'education' },
    ],
  },
  {
    id: 'q5',
    text: 'When you disagree with someone, you usually…',
    options: [
      { text: 'Try to understand their side first', characteristic: 'community', direction: 'social-science' },
      { text: 'Push through the disagreement instead of avoiding it', characteristic: 'character', direction: 'health' },
      { text: 'Look for a compromise everyone can live with', characteristic: 'collaborator', direction: 'education' },
      { text: 'Make a case with the best argument or story', characteristic: 'communicator', direction: 'humanities' },
    ],
  },
  {
    id: 'q6',
    text: 'Your proudest moment this year probably involved…',
    options: [
      { text: 'Pushing your body or mind past what you thought you could do', characteristic: 'character', direction: 'health' },
      { text: 'Helping someone learn or grow', characteristic: 'community', direction: 'education' },
      { text: 'Writing or saying something that really landed', characteristic: 'communicator', direction: 'humanities' },
      { text: 'Building, fixing, or shipping something yourself', characteristic: 'skills', direction: 'engineering-cs' },
    ],
  },
  {
    id: 'q7',
    text: "Pick a class you'd take even if it weren't required:",
    options: [
      { text: 'Education, psychology, or how people learn', characteristic: 'community', direction: 'education' },
      { text: 'Literature, philosophy, or history', characteristic: 'curiosity', direction: 'humanities' },
      { text: 'Computer science or engineering', characteristic: 'analytical', direction: 'engineering-cs' },
      { text: 'A biology, chemistry, or physics research seminar', characteristic: 'curiosity', direction: 'sciences' },
    ],
  },
  {
    id: 'q8',
    text: 'What kind of recognition would feel best?',
    options: [
      { text: 'Being known for how you write or speak', characteristic: 'communicator', direction: 'humanities' },
      { text: 'Being known as the person who gets things done', characteristic: 'impact', direction: 'engineering-cs' },
      { text: 'Being known as genuinely knowledgeable in your field', characteristic: 'analytical', direction: 'sciences' },
      { text: 'Being known for original, entrepreneurial ideas', characteristic: 'innovator', direction: 'business' },
    ],
  },
]

const CHARACTERISTIC_RESULT_COUNT = 5
const DIRECTION_RESULT_COUNT = 3

// answers: { [questionId]: optionIndex }
export function scoreQuiz(answers) {
  const charCounts = {}
  const dirCounts = {}

  QUESTIONS.forEach((q) => {
    const optionIndex = answers[q.id]
    const option = q.options[optionIndex]
    if (!option) return
    charCounts[option.characteristic] = (charCounts[option.characteristic] || 0) + 1
    dirCounts[option.direction] = (dirCounts[option.direction] || 0) + 1
  })

  const characteristics = Object.entries(charCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, CHARACTERISTIC_RESULT_COUNT)
    .map(([id]) => id)

  const directions = Object.entries(dirCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, DIRECTION_RESULT_COUNT)
    .map(([id]) => ({ id, label: DIRECTION_LABEL[id] }))

  return { characteristics, directions }
}

export function isComplete(answers) {
  return QUESTIONS.every((q) => answers[q.id] !== undefined)
}
