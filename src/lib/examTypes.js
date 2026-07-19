export const EXAM_TYPES = {
  ap: { label: 'AP', tone: 'purple' },
  ib: { label: 'IB', tone: 'accent' },
  'a-level': { label: 'A-Level', tone: 'green' },
  other: { label: 'Exam', tone: 'neutral' },
}

export const EXAM_TYPE_OPTIONS = [
  { value: 'ap', label: 'AP' },
  { value: 'ib', label: 'IB' },
  { value: 'a-level', label: 'A-Level' },
  { value: 'other', label: 'Other' },
]

const AP_SUBJECTS = [
  'AP Calculus AB', 'AP Calculus BC', 'AP Statistics', 'AP Computer Science A', 'AP Computer Science Principles',
  'AP Biology', 'AP Chemistry', 'AP Physics 1', 'AP Physics 2', 'AP Physics C: Mechanics',
  'AP English Language', 'AP English Literature', 'AP US History', 'AP World History', 'AP European History',
  'AP US Government', 'AP Human Geography', 'AP Psychology', 'AP Economics (Micro)', 'AP Economics (Macro)',
  'AP Spanish Language', 'AP French Language', 'AP Art History', 'AP Environmental Science',
]

const IB_SUBJECTS = [
  'IB Mathematics: Analysis and Approaches', 'IB Mathematics: Applications and Interpretation',
  'IB Biology', 'IB Chemistry', 'IB Physics', 'IB Computer Science',
  'IB English A: Language and Literature', 'IB English B', 'IB History', 'IB Geography',
  'IB Economics', 'IB Business Management', 'IB Psychology', 'IB Environmental Systems and Societies',
  'IB Visual Arts', 'IB Music', 'IB Theatre', 'IB French B', 'IB Spanish B', 'IB Philosophy',
  'IB Global Politics', 'IB Design Technology', 'IB Sports, Exercise and Health Science', 'Theory of Knowledge',
]

const A_LEVEL_SUBJECTS = [
  'A-Level Mathematics', 'A-Level Further Mathematics', 'A-Level Physics', 'A-Level Chemistry', 'A-Level Biology',
  'A-Level Computer Science', 'A-Level English Literature', 'A-Level English Language', 'A-Level History',
  'A-Level Geography', 'A-Level Economics', 'A-Level Business', 'A-Level Psychology', 'A-Level Sociology',
  'A-Level Politics', 'A-Level Law', 'A-Level Art & Design', 'A-Level Music', 'A-Level French',
  'A-Level Spanish', 'A-Level German', 'A-Level Religious Studies', 'A-Level Physical Education', 'A-Level Design & Technology',
]

export const SUBJECTS_BY_TYPE = {
  ap: AP_SUBJECTS,
  ib: IB_SUBJECTS,
  'a-level': A_LEVEL_SUBJECTS,
  other: [],
}
