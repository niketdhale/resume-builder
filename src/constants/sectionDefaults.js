import { uid } from '../utils/uid'
import { getAuthService } from '../services/auth/index.js'

function now() {
  return new Date().toISOString()
}

function userId() {
  return getAuthService().getUserId()
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export function defaultMetadata() {
  return {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function defaultSettings() {
  return {
    // Basics
    language: 'English (UK)',
    dateFormat: 'DD/MM/YYYY',
    // Layout
    columns: 'one',
    columnLayout: { left: [], right: [] },
    headerPosition: 'top',
    headerLayout: 'classic',
    showEmail: true,
    showPhone: true,
    showLocation: true,
    showLinkedin: true,
    showWebsite: true,
    fontSize: 9.5,
    lineHeight: 1.15,
    marginX: 12,
    marginY: 12,
    entrySpacing: 8,
    // Design — Font
    fontCategory: 'sans',
    fontFamily: 'Source Sans Pro',
    // Design — Colors
    accentColor: '#6366f1',
    borderColor: '#e5e7eb',
    // Design — Apply accent
    accentName: false,
    accentJobTitle: false,
    accentHeadings: false,
    accentHeadingLine: true,
    accentDots: true,
    accentDates: false,
    accentSubtitle: false,
    accentLinkIcons: false,
    accentHeaderIcons: false,
    // Design — Section headings
    headingStyle: 'underline',
    headingCapitalization: 'uppercase',
    headingSize: 'M',
    headingIcons: 'none',
    // Design — Link styling
    linkUnderline: false,
    linkBlueColor: false,
    linkIcon: true,
    linkIconStyle: 'external',
  }
}

// ─── Default sections ─────────────────────────────────────────────────────────

export function defaultSections(resumeId) {
  let _idx = 0
  const make = (title, type, description) => ({
    id: uid(),
    userId: userId(),
    resumeId,
    title,
    type,
    description,
    column: _idx++ % 2 === 0 ? 'left' : 'right',
    sharedAcrossViews: false,
    viewIds: [resumeId],
    isCollapsed: true,
    isHidden: false,
    entries: [],
    createdAt: now(),
    updatedAt: now(),
  })

  return [
    make(
      'Professional Experience',
      'experience',
      'Add your professional roles and employer history including internships.',
    ),
    make(
      'Education',
      'education',
      'Add your degrees and schools. Include your focus, honors, or exchange terms.',
    ),
    make(
      'Skills',
      'skills',
      'Add your hard and soft skills that help you stand out from the crowd today.',
    ),
    make(
      'Languages',
      'languages',
      'Add your languages and proficiency level to show your communication range.',
    ),
    make(
      'Certificates',
      'certificates',
      'Add your industry certificates or licences. Include issuer and date earned.',
    ),
    make(
      'Interests',
      'interests',
      'Add relevant personal interests that support your career story and cultural fit.',
    ),
    make(
      'Projects',
      'projects',
      'Add key projects you participated in and highlight your challenges, role, and impact.',
    ),
    make(
      'Courses',
      'courses',
      'Add online or in-person courses and trainings you joined and completed.',
    ),
    make(
      'Awards',
      'awards',
      'Add your awards and recognitions from industry, competitions, or academia.',
    ),
    make(
      'Organisations',
      'organisations',
      'Add your memberships or volunteering with organisations including your role.',
    ),
    make(
      'Publications',
      'publications',
      'Add publications, articles, or books you wrote or contributed to.',
    ),
    make(
      'References',
      'references',
      'Add your references from managers or coworkers, including their contact details.',
    ),
    make(
      'Declaration',
      'declaration',
      'Add your declaration by creating or uploading your personal signature.',
    ),
    make('DOB', 'dob', 'Add your date of birth.'),
    make(
      'Custom',
      'custom',
      'Add a custom section for anything else, or combine sections cleanly.',
    ),
  ]
}

// ─── Default entry ────────────────────────────────────────────────────────────

export function defaultEntry(sectionId) {
  return {
    id: uid(),
    userId: userId(),
    sectionId,
    isVisible: true,
    isEditing: true,
    information: '',
    createdAt: now(),
    updatedAt: now(),
    // common
    title: '',
    content: '',
    // experience
    role: '',
    company: '',
    startDate: '',
    endDate: '',
    currentlyWorking: false,
    description: '',
    // education
    degree: '',
    institution: '',
    honors: '',
    // skills
    skill: '',
    level: '',
    // languages
    language: '',
    proficiency: '',
    // certificates
    certName: '',
    issuer: '',
    dateEarned: '',
    // projects
    projectName: '',
    projectRole: '',
    // courses
    courseName: '',
    courseInstitution: '',
    dateCompleted: '',
    // awards
    awardName: '',
    awardIssuer: '',
    awardDate: '',
    // organisations
    orgName: '',
    orgRole: '',
    orgStart: '',
    orgEnd: '',
    // publications
    pubTitle: '',
    publisher: '',
    pubDate: '',
    pubUrl: '',
    // references
    refName: '',
    refJobTitle: '',
    refCompany: '',
    refEmail: '',
    refPhone: '',
    // dob
    dob: '',
  }
}
