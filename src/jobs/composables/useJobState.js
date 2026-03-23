import { ref, computed } from 'vue'

// ─── Status config ────────────────────────────────────────────────────────────
export const JOB_STATUSES = [
  { value: 'applied',   label: 'Applied',   color: '#6366f1', bg: '#eef2ff', dot: '#6366f1' },
  { value: 'screening', label: 'Screening', color: '#f59e0b', bg: '#fffbeb', dot: '#f59e0b' },
  { value: 'interview', label: 'Interview', color: '#8b5cf6', bg: '#f5f3ff', dot: '#8b5cf6' },
  { value: 'offer',     label: 'Offer',     color: '#10b981', bg: '#ecfdf5', dot: '#10b981' },
  { value: 'rejected',  label: 'Rejected',  color: '#ef4444', bg: '#fef2f2', dot: '#ef4444' },
  { value: 'withdrawn', label: 'Withdrawn', color: '#9ca3af', bg: '#f9fafb', dot: '#9ca3af' },
]

export const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: '#ef4444' },
  medium: { label: 'Medium', color: '#f59e0b' },
  low:    { label: 'Low',    color: '#9ca3af' },
}

// ─── Singleton state ──────────────────────────────────────────────────────────
export const jobs = ref([])

// Custom columns: [{ id, label, type: 'text'|'number'|'file' }]
export const customColumns = ref([])

// ─── Computed helpers ─────────────────────────────────────────────────────────
export const jobsByStatus = computed(() => {
  const map = {}
  JOB_STATUSES.forEach(({ value }) => { map[value] = [] })
  jobs.value.forEach((j) => { if (map[j.status]) map[j.status].push(j) })
  return map
})

export const jobStats = computed(() => {
  const total      = jobs.value.length
  const responded  = jobs.value.filter((j) => ['screening','interview','offer','rejected'].includes(j.status)).length
  const interviews = jobs.value.filter((j) => ['interview','offer'].includes(j.status)).length
  const offers     = jobs.value.filter((j) => j.status === 'offer').length

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonth  = jobs.value.filter((j) => new Date(j.appliedDate) >= monthStart).length

  const responseTimes = jobs.value
    .filter((j) => ['screening','interview','offer'].includes(j.status) && j.appliedDate && j.updatedAt)
    .map((j) => Math.round((new Date(j.updatedAt) - new Date(j.appliedDate)) / 86400000))
    .filter((d) => d > 0)
  const avgResponse = responseTimes.length
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0

  return { total, responseRate: total ? Math.round((responded / total) * 100) : 0, responded, interviewRate: total ? Math.round((interviews / total) * 100) : 0, interviews, offers, thisMonth, avgResponse }
})
