// A short, deterministic diagnostic — no AI — that sorts STEM vs. non-STEM
// affinity and surfaces specific majors within the winning side, the same
// tallying approach as the Growth Journey Discovery Quiz but purpose-built
// for "what should I actually study." Results then drive university
// matching in UniversitiesView via each school's `majors` tags.

export const MAJORS = [
  { id: 'cs', label: 'Computer Science', category: 'stem', description: 'Software, algorithms, and how computers actually work.' },
  { id: 'data-science', label: 'Data Science & Statistics', category: 'stem', description: 'Finding the signal in numbers — statistics, machine learning, data.' },
  { id: 'mech-eng', label: 'Mechanical Engineering', category: 'stem', description: 'Designing and building physical things that move.' },
  { id: 'elec-eng', label: 'Electrical Engineering', category: 'stem', description: 'Circuits, signals, hardware, and the systems underneath everything electronic.' },
  { id: 'biomed-eng', label: 'Biomedical Engineering', category: 'stem', description: 'Engineering applied to medicine — devices, diagnostics, prosthetics.' },
  { id: 'physics', label: 'Physics', category: 'stem', description: 'The rules the universe actually runs on.' },
  { id: 'math', label: 'Mathematics', category: 'stem', description: 'Proof, structure, and abstraction for its own sake.' },
  { id: 'biology', label: 'Biology & Life Sciences', category: 'stem', description: 'How living systems work, from cells to ecosystems.' },
  { id: 'environmental-science', label: 'Environmental Science', category: 'stem', description: 'Understanding and fixing humanity\'s relationship with the planet.' },
  { id: 'economics', label: 'Economics', category: 'nonstem', description: 'How people, markets, and incentives actually behave.' },
  { id: 'psychology', label: 'Psychology', category: 'nonstem', description: 'Why people think, feel, and act the way they do.' },
  { id: 'poli-sci', label: 'Political Science & International Relations', category: 'nonstem', description: 'Power, government, and how the world is actually run.' },
  { id: 'business', label: 'Business & Entrepreneurship', category: 'nonstem', description: 'Building and running organizations that make things happen.' },
  { id: 'english', label: 'English & Literature', category: 'nonstem', description: 'Language, story, and argument at the sentence level.' },
  { id: 'history', label: 'History', category: 'nonstem', description: 'Understanding the present by taking the past seriously.' },
  { id: 'philosophy', label: 'Philosophy', category: 'nonstem', description: 'Rigorous argument about the questions that don\'t have easy answers.' },
  { id: 'communications', label: 'Communications & Media', category: 'nonstem', description: 'Telling stories and shaping messages that actually land.' },
  { id: 'art-design', label: 'Art & Design', category: 'nonstem', description: 'Making things that look, feel, or communicate the way they should.' },
]

export const MAJOR_BY_ID = Object.fromEntries(MAJORS.map((m) => [m.id, m]))

export const QUESTIONS = [
  {
    id: 'q1',
    text: 'A free Saturday afternoon — what sounds best?',
    options: [
      { text: 'Debugging code until it finally works', major: 'cs' },
      { text: 'Getting lost in a documentary about how the universe works', major: 'physics' },
      { text: 'Sketching, painting, or designing something', major: 'art-design' },
      { text: 'Reading a novel that makes you forget the time', major: 'english' },
    ],
  },
  {
    id: 'q2',
    text: "Which class would you take even if it weren't required?",
    options: [
      { text: 'A robotics or circuits elective', major: 'elec-eng' },
      { text: 'A statistics or applied data class', major: 'data-science' },
      { text: 'A philosophy or ethics seminar', major: 'philosophy' },
      { text: 'A political science or government class', major: 'poli-sci' },
    ],
  },
  {
    id: 'q3',
    text: "In a group project, you're usually the one who…",
    options: [
      { text: 'Builds the physical prototype', major: 'mech-eng' },
      { text: 'Designs the experiment to actually test the idea', major: 'biology' },
      { text: 'Writes the pitch that sells the idea', major: 'communications' },
      { text: 'Manages the budget and the timeline', major: 'business' },
    ],
  },
  {
    id: 'q4',
    text: "A problem you'd genuinely want to spend a career on:",
    options: [
      { text: 'Making healthcare technology actually work better', major: 'biomed-eng' },
      { text: 'Reversing environmental damage', major: 'environmental-science' },
      { text: 'Reducing poverty or inequality', major: 'economics' },
      { text: 'Making sense of why history keeps repeating itself', major: 'history' },
    ],
  },
  {
    id: 'q5',
    text: 'Which compliment would mean the most?',
    options: [
      { text: 'You could explain a proof so anyone gets it.', major: 'math' },
      { text: 'You really understand how people think.', major: 'psychology' },
      { text: 'You always know how to get a venture off the ground.', major: 'business' },
      { text: "You've got a real eye — that looks great.", major: 'art-design' },
    ],
  },
  {
    id: 'q6',
    text: 'Pick a book you\'d actually want to read for fun:',
    options: [
      { text: 'A deep dive into a scientific breakthrough', major: 'biology' },
      { text: 'A biography of a world leader', major: 'poli-sci' },
      { text: 'A story collection or literary novel', major: 'english' },
      { text: 'A book about how markets and money actually work', major: 'economics' },
    ],
  },
  {
    id: 'q7',
    text: 'Your proudest moment this year probably involved…',
    options: [
      { text: 'Building, fixing, or shipping something yourself', major: 'cs' },
      { text: 'Winning an argument or debate with a genuinely strong case', major: 'philosophy' },
      { text: 'Helping someone understand something that used to confuse them', major: 'communications' },
      { text: 'Running data that actually changed a decision', major: 'data-science' },
    ],
  },
  {
    id: 'q8',
    text: 'Which lab or project sounds most fun?',
    options: [
      { text: 'Building a circuit board from scratch', major: 'elec-eng' },
      { text: 'Analyzing water or soil samples in the field', major: 'environmental-science' },
      { text: 'Running a psychology experiment on decision-making', major: 'psychology' },
      { text: 'Designing a poster, logo, or short film', major: 'art-design' },
    ],
  },
  {
    id: 'q9',
    text: 'What kind of recognition would feel best?',
    options: [
      { text: 'Being known as genuinely knowledgeable in a technical field', major: 'physics' },
      { text: 'Being known for original, entrepreneurial ideas', major: 'business' },
      { text: 'Being known for how you write or speak', major: 'english' },
      { text: 'Being known as someone who actually understands how governments work', major: 'poli-sci' },
    ],
  },
  {
    id: 'q10',
    text: 'Pick a problem set you\'d rather spend a weekend on:',
    options: [
      { text: 'Designing a mechanical system that has to survive real-world stress', major: 'mech-eng' },
      { text: 'A math competition proof', major: 'math' },
      { text: 'A biomedical case study', major: 'biomed-eng' },
      { text: 'A historical argument that needs primary-source evidence', major: 'history' },
    ],
  },
]

// answers: { [questionId]: optionIndex }
export function scoreMajorQuiz(answers) {
  const counts = {}
  QUESTIONS.forEach((q) => {
    const option = q.options[answers[q.id]]
    if (!option) return
    counts[option.major] = (counts[option.major] || 0) + 1
  })

  let stemScore = 0
  let nonstemScore = 0
  Object.entries(counts).forEach(([majorId, count]) => {
    if (MAJOR_BY_ID[majorId]?.category === 'stem') stemScore += count
    else nonstemScore += count
  })

  const total = stemScore + nonstemScore || 1
  const stemPct = Math.round((stemScore / total) * 100)

  const topMajors = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id)

  let lean = 'Balanced'
  if (stemPct >= 70) lean = 'Strongly STEM'
  else if (stemPct >= 55) lean = 'Leaning STEM'
  else if (stemPct <= 30) lean = 'Strongly Non-STEM'
  else if (stemPct <= 45) lean = 'Leaning Non-STEM'

  return { stemPct, nonstemPct: 100 - stemPct, lean, topMajors }
}

export function isComplete(answers) {
  return QUESTIONS.every((q) => answers[q.id] !== undefined)
}
