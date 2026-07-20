import { GraduationCap, Trophy, FlaskConical, Briefcase, Award, Sun } from 'lucide-react'

export const CATEGORY_TYPES = {
  'college-application': { label: 'College Application', icon: GraduationCap, tone: 'accent' },
  competition: { label: 'Competition', icon: Trophy, tone: 'purple' },
  'research-program': { label: 'Research Program', icon: FlaskConical, tone: 'green' },
  internship: { label: 'Internship', icon: Briefcase, tone: 'neutral' },
  scholarship: { label: 'Scholarship', icon: Award, tone: 'amber' },
  'summer-program': { label: 'Summer Program', icon: Sun, tone: 'amber' },
}

export const APPLICATION_ROUNDS = {
  '': { label: 'No round set', tone: 'neutral' },
  'early-action': { label: 'Early Action', tone: 'accent' },
  'early-decision': { label: 'Early Decision', tone: 'purple' },
  regular: { label: 'Regular Decision', tone: 'neutral' },
}

export const OPPORTUNITY_STATUS = {
  'not-started': { label: 'Not started', tone: 'neutral' },
  'in-progress': { label: 'In progress', tone: 'amber' },
  submitted: { label: 'Submitted', tone: 'green' },
}
