import { jobs, customColumns } from './useJobState'
import { uid } from '../../utils/uid'
import { getAuthService } from '../../services/auth/index.js'

function now() { return new Date().toISOString() }
function userId() { return getAuthService().getUserId() }

// ─── Job CRUD ─────────────────────────────────────────────────────────────────
export function addJob(fields) {
  const newJob = {
    id:           uid(),
    userId:       userId(),
    title:        '',
    company:      '',
    location:     '',
    salary:       '',
    currency:     '$',
    status:       'applied',
    priority:     'medium',
    appliedDate:  new Date().toISOString().split('T')[0],
    resumeId:     null,
    notes:        '',
    url:          '',
    attachments:  [],
    customFields: {},
    ...fields,
    createdAt:    now(),
    updatedAt:    now(),
  }
  jobs.value.unshift(newJob)
  return newJob
}

export function updateJob(jobId, updates) {
  const j = jobs.value.find(j => j.id === jobId)
  if (j) Object.assign(j, updates, { updatedAt: now() })
}

export function deleteJob(jobId) {
  jobs.value = jobs.value.filter(j => j.id !== jobId)
}

export function setJobStatus(jobId, status) {
  updateJob(jobId, { status })
}

export function moveJob(jobId, newStatus) {
  updateJob(jobId, { status: newStatus })
}

// ─── Attachments ──────────────────────────────────────────────────────────────
export function addAttachment(jobId, { name, dataUrl, type, size }) {
  const j = jobs.value.find(j => j.id === jobId)
  if (!j) return
  if (!j.attachments) j.attachments = []
  j.attachments.push({ id: uid(), name, dataUrl, type, size, addedAt: now() })
  j.updatedAt = now()
}

export function removeAttachment(jobId, attachmentId) {
  const j = jobs.value.find(j => j.id === jobId)
  if (j) {
    j.attachments = (j.attachments || []).filter(a => a.id !== attachmentId)
    j.updatedAt = now()
  }
}

// ─── Custom columns ───────────────────────────────────────────────────────────
export function addCustomColumn(label, type = 'text') {
  customColumns.value.push({ id: uid(), label, type })
}

export function removeCustomColumn(colId) {
  customColumns.value = customColumns.value.filter(c => c.id !== colId)
}

export function updateCustomField(jobId, colId, value) {
  const j = jobs.value.find(j => j.id === jobId)
  if (j) {
    if (!j.customFields) j.customFields = {}
    j.customFields[colId] = value
    j.updatedAt = now()
  }
}

export function clearDummyData() {
  jobs.value = []
}
