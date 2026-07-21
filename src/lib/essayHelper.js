// Essay brainstorming that starts from the student's own tracked life, not a
// blank page. Every prompt type is matched against Story Builder chapters —
// the same Challenge/Action/Impact/Growth framing already captured in
// Portfolio — so the student sees which real moment of theirs actually
// answers which prompt, with a concrete reason. Nothing here is AI-generated;
// matching and the draft checklist are both deterministic, like the rest of
// the app's writing tools (Activity Polisher, Brag Sheet).
import { buildStoryChapters } from './storyBuilder'
import { CHARACTERISTICS } from './northStar'

const DIM_LABEL = Object.fromEntries(CHARACTERISTICS.map((d) => [d.id, d.label]))

export const PROMPT_TYPES = [
  {
    id: 'ca1',
    group: 'Common App',
    label: 'Background, Identity, Interest, or Talent',
    prompt: "Share a background, identity, interest, or talent so meaningful your application would be incomplete without it.",
    focusDimensions: ['creative', 'independent', 'curiosity', 'character'],
    structureHint: 'Open inside the thing itself, not an explanation of it. End on why it\'s load-bearing to who you are now.',
  },
  {
    id: 'ca2',
    group: 'Common App',
    label: 'Obstacle or Challenge',
    prompt: 'Recount a time you faced a challenge, setback, or failure. How did it affect you, and what did you learn?',
    focusDimensions: ['character', 'strategic', 'analytical'],
    structureHint: 'Spend real space on the low point before the recovery — the growth only lands if the struggle was genuine.',
  },
  {
    id: 'ca3',
    group: 'Common App',
    label: 'Questioned a Belief',
    prompt: 'Reflect on a time you questioned or challenged a belief or idea. What prompted your thinking? What was the outcome?',
    focusDimensions: ['analytical', 'independent', 'communicator'],
    structureHint: 'Name the specific belief and the specific trigger — vague "I learned to keep an open mind" endings are the failure mode here.',
  },
  {
    id: 'ca4',
    group: 'Common App',
    label: 'Problem You\'d Solve',
    prompt: 'Reflect on something that someone did for you that made you happy or thankful in a surprising way, or describe a problem you\'d like to solve.',
    focusDimensions: ['curiosity', 'analytical', 'innovator'],
    structureHint: 'Show you\'ve actually engaged with the problem (research, a prototype, a failed attempt) — not just that you find it interesting.',
  },
  {
    id: 'ca5',
    group: 'Common App',
    label: 'Personal Growth',
    prompt: 'Discuss an accomplishment, event, or realization that sparked a period of personal growth and a new understanding of yourself or others.',
    focusDimensions: ['character', 'impact', 'community'],
    structureHint: 'The "before" self needs to be as clear as the "after" — the gap between them is the whole essay.',
  },
  {
    id: 'ca6',
    group: 'Common App',
    label: 'A Topic That Captivates You',
    prompt: 'Describe a topic, idea, or concept you find so engaging it makes you lose all track of time. Why does it captivate you?',
    focusDimensions: ['curiosity', 'analytical', 'innovator', 'creative'],
    structureHint: 'Get specific fast — the sub-question inside the topic that actually hooked you, not the topic\'s Wikipedia summary.',
  },
  {
    id: 'ca7',
    group: 'Common App',
    label: 'Topic of Your Choice',
    prompt: 'Share an essay on any topic of your choice — it can be one you\'ve already written, one that responds to a different prompt, or one of your own design.',
    focusDimensions: [],
    structureHint: 'Use this when a story genuinely doesn\'t fit prompts 1-6 cleanly — don\'t force a strong story into the wrong box.',
  },
  {
    id: 'why-school',
    group: 'Supplemental',
    label: 'Why This School',
    prompt: 'Why are you applying to this specific college or university?',
    focusDimensions: ['strategic', 'curiosity'],
    structureHint: 'Name specific programs, professors, or resources, and tie each one back to a real thing you\'ve already done — this is where a matched story becomes proof, not decoration.',
  },
  {
    id: 'extracurricular',
    group: 'Supplemental',
    label: 'Extracurricular Elaboration',
    prompt: 'Briefly elaborate on one of your extracurricular activities.',
    focusDimensions: ['leadership', 'impact', 'collaborator'],
    structureHint: 'One activity, one specific moment inside it — resist summarizing the whole role.',
  },
  {
    id: 'community',
    group: 'Supplemental',
    label: 'Community & Diversity',
    prompt: 'Describe a community you belong to and the role you\'ve played within it.',
    focusDimensions: ['community', 'collaborator', 'character'],
    structureHint: 'Define the community narrowly and specifically — "my robotics team" beats "my community" every time.',
  },
]

function chapterHasStrongFraming(chapter) {
  const filled = [chapter.problem, chapter.action, chapter.impactWho, chapter.growth].filter((x) => (x || '').trim().length > 0).length
  return filled
}

export function matchStoriesToPrompt(promptType, data) {
  const chapters = buildStoryChapters(data)
  return chapters
    .map((chapter) => {
      const overlap = (chapter.dimensions || []).filter((d) => promptType.focusDimensions.includes(d))
      const framingStrength = chapterHasStrongFraming(chapter)
      const score = overlap.length * 3 + framingStrength + Math.min(chapter.evidenceCount, 2)
      const reasonParts = []
      if (overlap.length > 0) reasonParts.push(`shows ${overlap.map((d) => DIM_LABEL[d]).join(' & ')}`)
      if (framingStrength >= 3) reasonParts.push('has a full challenge → action → impact arc tracked')
      else if (framingStrength > 0) reasonParts.push('has some framing tracked')
      if (chapter.evidenceCount > 0) reasonParts.push(`${chapter.evidenceCount} piece${chapter.evidenceCount === 1 ? '' : 's'} of evidence attached`)
      return { chapter, score, reason: reasonParts.join(' · ') || 'Logged, but add challenge/action/impact framing in Portfolio to strengthen this match.' }
    })
    .filter((m) => m.score > 0 || promptType.focusDimensions.length === 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

const CLICHE_OPENERS = [
  'ever since i was young', 'ever since i was a child', 'growing up i', 'growing up, i', 'from a young age',
  'as i look back', "webster's dictionary defines", 'the dictionary defines', 'according to the dictionary',
  'ever since i can remember', 'little did i know',
]

const REFLECTION_CUES = [
  'realized', "i've realized", 'i learned', 'taught me', 'understood', 'changed how i', 'changed the way i',
  'since then', 'now i', 'looking back', 'i now', 'i still', "that's when i", 'made me',
]

const FILLER_PHRASES = ['in conclusion', 'in this essay', 'i will discuss', 'i will talk about', 'this essay is about']

export function analyzeEssayDraft(text, wordLimit) {
  const trimmed = (text || '').trim()
  const lower = trimmed.toLowerCase()
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0
  const openingWindow = lower.slice(0, 120)
  const closingWindow = lower.slice(-200)

  const checks = [
    { id: 'opener', label: "Doesn't open with a cliché", pass: trimmed.length > 0 && !CLICHE_OPENERS.some((c) => openingWindow.includes(c)) },
    { id: 'specific', label: 'Includes a specific, concrete detail', pass: /\d/.test(trimmed) || /"[^"]+"/.test(trimmed) },
    { id: 'reflection', label: 'Reflects on meaning near the end', pass: REFLECTION_CUES.some((c) => closingWindow.includes(c)) },
    { id: 'length', label: wordLimit ? `Close to the ${wordLimit}-word limit` : 'Substantial enough (150+ words)', pass: wordLimit ? wordCount >= wordLimit * 0.6 && wordCount <= wordLimit * 1.05 : wordCount >= 150 },
    { id: 'filler', label: 'No throat-clearing filler', pass: trimmed.length > 0 && !FILLER_PHRASES.some((f) => lower.includes(f)) },
  ]

  return { checks, score: checks.filter((c) => c.pass).length, total: checks.length, wordCount }
}
