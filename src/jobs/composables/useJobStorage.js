import { watch } from 'vue'
import { getStorageAdapter } from '../../services/storage/index.js'
import { jobs, customColumns } from './useJobState'

const JOBS_KEY = 'jobs'
const COLS_KEY = 'jobs_custom_columns'

// ─── Dummy seed data ──────────────────────────────────────────────────────────
function makeDummyJobs() {
  const now = new Date()
  const d = (daysAgo) => {
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    return date.toISOString().split('T')[0]
  }
  const t = (daysAgo) => {
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    return date.toISOString()
  }
  return [
    { id:'job_001', userId:'local', title:'Senior Frontend Engineer', company:'Google',    location:'London, UK',        salary:'80000',  currency:'£',   status:'interview', priority:'high',   appliedDate:d(8),  updatedAt:t(2),  createdAt:t(8),  resumeId:null, notes:'Great culture fit. Spoke to recruiter Sarah.', url:'https://careers.google.com',  attachments:[], customFields:{} },
    { id:'job_002', userId:'local', title:'Product Manager',          company:'Meta',      location:'Remote',             salary:'120000', currency:'$',   status:'screening', priority:'high',   appliedDate:d(11), updatedAt:t(1),  createdAt:t(11), resumeId:null, notes:'Applied via referral from James.',              url:'https://metacareers.com',      attachments:[], customFields:{} },
    { id:'job_003', userId:'local', title:'iOS Engineer',             company:'Apple',     location:'New York, US',       salary:'140000', currency:'$',   status:'interview', priority:'medium', appliedDate:d(13), updatedAt:t(1),  createdAt:t(13), resumeId:null, notes:'Technical screen scheduled for next week.',     url:'https://apple.com/jobs',       attachments:[], customFields:{} },
    { id:'job_004', userId:'local', title:'Staff Engineer',           company:'Amazon',    location:'Seattle, US',        salary:'160000', currency:'$',   status:'offer',     priority:'high',   appliedDate:d(18), updatedAt:t(0),  createdAt:t(18), resumeId:null, notes:'Offer received! Negotiating equity package.',   url:'https://amazon.jobs',          attachments:[], customFields:{} },
    { id:'job_005', userId:'local', title:'Frontend Engineer',        company:'Spotify',   location:'Stockholm, SE',      salary:'90000',  currency:'€',   status:'applied',   priority:'medium', appliedDate:d(20), updatedAt:t(20), createdAt:t(20), resumeId:null, notes:'',                                              url:'https://spotify.com/jobs',     attachments:[], customFields:{} },
    { id:'job_006', userId:'local', title:'React Native Developer',   company:'Airbnb',    location:'Remote',             salary:'110000', currency:'$',   status:'rejected',  priority:'low',    appliedDate:d(25), updatedAt:t(10), createdAt:t(25), resumeId:null, notes:'Rejected after final round. Good experience.', url:'',                             attachments:[], customFields:{} },
    { id:'job_007', userId:'local', title:'Engineering Manager',      company:'Stripe',    location:'Dublin, IE',         salary:'130000', currency:'€',   status:'screening', priority:'high',   appliedDate:d(14), updatedAt:t(3),  createdAt:t(14), resumeId:null, notes:'Recruiter reached out on LinkedIn.',            url:'https://stripe.com/jobs',      attachments:[], customFields:{} },
    { id:'job_008', userId:'local', title:'Senior Backend Engineer',  company:'Shopify',   location:'Remote',             salary:'115000', currency:'CA$', status:'withdrawn', priority:'low',    appliedDate:d(30), updatedAt:t(5),  createdAt:t(30), resumeId:null, notes:'Withdrew — accepted another offer.',           url:'',                             attachments:[], customFields:{} },
    { id:'job_009', userId:'local', title:'Principal Engineer',       company:'Netflix',   location:'Los Gatos, US',      salary:'200000', currency:'$',   status:'applied',   priority:'high',   appliedDate:d(5),  updatedAt:t(5),  createdAt:t(5),  resumeId:null, notes:'Dream company. Applied directly.',              url:'https://jobs.netflix.com',     attachments:[], customFields:{} },
    { id:'job_010', userId:'local', title:'Tech Lead',                company:'Figma',     location:'San Francisco, US',  salary:'175000', currency:'$',   status:'interview', priority:'high',   appliedDate:d(10), updatedAt:t(0),  createdAt:t(10), resumeId:null, notes:'System design interview next Tuesday.',         url:'https://figma.com/jobs',       attachments:[], customFields:{} },
  ]
}

// ─── Save ─────────────────────────────────────────────────────────────────────
export async function saveJobs() {
  await getStorageAdapter().save(JOBS_KEY, jobs.value)
  await getStorageAdapter().save(COLS_KEY, customColumns.value)
}

// ─── Hydrate ──────────────────────────────────────────────────────────────────
export async function hydrateJobs() {
  const savedJobs = await getStorageAdapter().load(JOBS_KEY)
  const savedCols = await getStorageAdapter().load(COLS_KEY)

  if (savedJobs && savedJobs.length > 0) {
    jobs.value = savedJobs.map(j => ({
      attachments: [], customFields: {}, ...j,
    }))
  } else {
    jobs.value = makeDummyJobs()
  }

  if (savedCols) customColumns.value = savedCols
}

// ─── Watchers ─────────────────────────────────────────────────────────────────
export function setupJobStorageWatcher() {
  watch(jobs,          () => saveJobs(), { deep: true })
  watch(customColumns, () => saveJobs(), { deep: true })
}
