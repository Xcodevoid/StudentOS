import { uid } from './storage'

function d(offsetDays) {
  const dt = new Date()
  dt.setDate(dt.getDate() + offsetDays)
  return dt.toISOString().slice(0, 10)
}

export function seedDemoData() {
  return {
    version: 1,
    profile: {
      name: 'Jamie Chen',
      gradeLevel: '11th Grade',
      school: 'Lincoln High School',
      bio: 'Aspiring computer scientist interested in AI for healthcare. Founder of a robotics mentorship program.',
      gpaScale: 4.0,
      onboarded: true,
    },
    classes: [
      { id: uid(), name: 'AP Calculus BC', subject: 'Math', term: 'Fall 2026', credits: 1, weight: 'ap', grade: 96 },
      { id: uid(), name: 'AP Computer Science A', subject: 'CS', term: 'Fall 2026', credits: 1, weight: 'ap', grade: 98 },
      { id: uid(), name: 'AP US History', subject: 'History', term: 'Fall 2026', credits: 1, weight: 'ap', grade: 91 },
      { id: uid(), name: 'Honors Chemistry', subject: 'Science', term: 'Fall 2026', credits: 1, weight: 'honors', grade: 94 },
      { id: uid(), name: 'English 11', subject: 'English', term: 'Fall 2026', credits: 1, weight: 'regular', grade: 93 },
      { id: uid(), name: 'Spanish IV', subject: 'World Language', term: 'Fall 2026', credits: 1, weight: 'honors', grade: 89 },
    ],
    assignments: [
      { id: uid(), classId: null, title: 'Calc BC Problem Set 12', dueDate: d(0), status: 'todo', priority: 'high' },
      { id: uid(), classId: null, title: 'APUSH DBQ Essay Draft', dueDate: d(0), status: 'todo', priority: 'high' },
      { id: uid(), classId: null, title: 'CS: Binary Search Tree Lab', dueDate: d(2), status: 'todo', priority: 'medium' },
      { id: uid(), classId: null, title: 'Chem Lab Report — Titration', dueDate: d(-1), status: 'todo', priority: 'high' },
      { id: uid(), classId: null, title: 'Spanish Vocabulary Quiz Prep', dueDate: d(4), status: 'todo', priority: 'low' },
      { id: uid(), classId: null, title: 'English Essay: The Great Gatsby', dueDate: d(6), status: 'done', priority: 'medium' },
    ],
    exams: [
      { id: uid(), name: 'AP Calculus BC', date: d(24), examType: 'ap' },
      { id: uid(), name: 'AP Computer Science A', date: d(18), examType: 'ap' },
      { id: uid(), name: 'AP US History', date: d(31), examType: 'ap' },
      { id: uid(), name: 'IB Mathematics: Analysis and Approaches', date: d(45), examType: 'ib' },
      { id: uid(), name: 'A-Level Physics', date: d(52), examType: 'a-level' },
    ],
    studyTasks: [],
    projects: [
      {
        id: uid(),
        title: 'PathwAI — AI College Advisor',
        type: 'project',
        description: 'A web app that uses ML to recommend colleges based on student profile and interests. Built with React and a Python backend.',
        role: 'Founder & Lead Developer',
        date: d(-120),
        link: 'https://github.com',
        tags: ['React', 'Python', 'Machine Learning'],
        featured: true,
      },
      {
        id: uid(),
        title: 'Regional Science Fair — 1st Place, Computer Science',
        type: 'competition',
        description: 'Awarded first place for a research project on using computer vision to detect early signs of plant disease.',
        role: 'Independent Researcher',
        date: d(-200),
        link: '',
        tags: ['Computer Vision', 'Research'],
        featured: true,
      },
      {
        id: uid(),
        title: 'Summer Research Internship — State University Bioinformatics Lab',
        type: 'research',
        description: 'Worked with a graduate research team analyzing genomic datasets for cancer biomarker discovery.',
        role: 'Research Intern',
        date: d(-60),
        link: '',
        tags: ['Bioinformatics', 'Data Analysis'],
        featured: false,
      },
      {
        id: uid(),
        title: 'jamiechen.dev — Personal Website',
        type: 'website',
        description: 'Personal site showcasing projects, writing, and a blog about learning to code.',
        role: 'Designer & Developer',
        date: d(-30),
        link: 'https://example.com',
        tags: ['Web Design'],
        featured: false,
      },
    ],
    activities: [
      {
        id: uid(),
        title: 'Robotics Club — Team Captain',
        category: 'activity',
        org: 'Lincoln High School',
        hoursPerWeek: 8,
        weeksPerYear: 30,
        startDate: d(-400),
        endDate: '',
        description: 'Lead a 15-person team building competition robots; mentor underclassmen in CAD and programming.',
      },
      {
        id: uid(),
        title: 'Tutoring for Underserved Students',
        category: 'volunteering',
        org: 'City Learning Center',
        hoursPerWeek: 3,
        weeksPerYear: 40,
        startDate: d(-300),
        endDate: '',
        description: 'Weekly math and science tutoring for middle school students from low-income families.',
      },
      {
        id: uid(),
        title: 'Software Engineering Intern',
        category: 'internship',
        org: 'Local Health-Tech Startup',
        hoursPerWeek: 15,
        weeksPerYear: 10,
        startDate: d(-70),
        endDate: d(-10),
        description: 'Built internal dashboard tools using React and worked with the data team on patient scheduling features.',
      },
    ],
    deadlines: [
      { id: uid(), title: 'MIT — Early Action', schoolName: 'MIT', date: d(120), type: 'early-action', status: 'not-started', notes: '' },
      { id: uid(), title: 'Stanford — Restrictive EA', schoolName: 'Stanford', date: d(120), type: 'early-action', status: 'not-started', notes: '' },
      { id: uid(), title: 'State University — Regular Decision', schoolName: 'State University', date: d(180), type: 'regular', status: 'not-started', notes: '' },
      { id: uid(), title: 'National Merit Scholarship', schoolName: '', date: d(45), type: 'scholarship', status: 'in-progress', notes: 'Need to finalize essay' },
    ],
    goals: [],
    tasks: [
      { id: uid(), title: 'Email robotics mentor about regionals', dueDate: d(0), done: false },
      { id: uid(), title: 'Draft Common App essay outline', dueDate: d(1), done: false },
    ],
  }
}
