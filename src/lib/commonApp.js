// Common App's Activities section categories (recent application cycles).
// The exact wording can shift year to year — the UI carries a small disclaimer.
export const COMMON_APP_CATEGORIES = [
  'Academic', 'Art', 'Athletics: Club', 'Athletics: JV/Varsity', 'Career Oriented',
  'Community Service (Volunteer)', 'Computer/Technology', 'Cultural', 'Dance', 'Debate/Speech',
  'Environmental', 'Family Responsibility', 'Foreign Exchange', 'Foreign Language', 'Internship',
  'Journalism/Publication', 'Junior R.O.T.C.', 'LGBT', 'Music: Instrumental', 'Music: Vocal',
  'Religious', 'Research', 'Robotics', 'School Spirit', 'Science/Math', 'Social Justice',
  'Student Govt./Politics', 'Theater/Drama', 'Work (Paid)', 'Other Club/Activity',
]

// A starting guess so the export view isn't a blank form — always editable.
export const DEFAULT_COMMON_APP_TYPE = {
  activity: 'Other Club/Activity',
  volunteering: 'Community Service (Volunteer)',
  internship: 'Internship',
}

export const POSITION_MAX = 50
export const SUMMARY_MAX = 150
export const MAX_RANKED_ACTIVITIES = 10

// "Robotics Club — Team Captain" -> "Team Captain". Only a starting guess;
// the field stays freely editable.
export function guessPosition(title) {
  const match = (title || '').split(/\s+[—–-]\s+/)
  return match.length > 1 ? match[match.length - 1].trim().slice(0, POSITION_MAX) : ''
}

export function defaultSummary(activity) {
  const base = (activity.commonAppSummary || activity.description || '').trim()
  return base.slice(0, SUMMARY_MAX)
}

export function formatActivityBlock(activity) {
  const type = activity.commonAppType || DEFAULT_COMMON_APP_TYPE[activity.category] || 'Other Club/Activity'
  const position = activity.commonAppPosition || guessPosition(activity.title)
  const summary = defaultSummary(activity)
  const lines = [
    activity.title || 'Untitled activity',
    `Type: ${type}`,
    activity.org && `Organization: ${activity.org}`,
    position && `Position/Leadership: ${position}`,
    (activity.hoursPerWeek || activity.weeksPerYear) &&
      `Hours/week: ${activity.hoursPerWeek || 0} · Weeks/year: ${activity.weeksPerYear || 0}`,
    summary && `Description: ${summary}`,
  ].filter(Boolean)
  return lines.join('\n')
}

export function formatAllActivities(activities) {
  return activities.map(formatActivityBlock).join('\n\n')
}

// A reasonable proxy for "importance" — sustained, heavier time commitments
// first — since Common App ranks activities by significance to the student.
export function sortByImportance(activities) {
  return [...activities].sort(
    (a, b) => (Number(b.hoursPerWeek) || 0) * (Number(b.weeksPerYear) || 0) - (Number(a.hoursPerWeek) || 0) * (Number(a.weeksPerYear) || 0)
  )
}
