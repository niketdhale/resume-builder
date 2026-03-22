import { uid } from '../utils/uid'
import { resumes, sections, activeResumeId } from './useResumeState'
import { getAuthService } from '../services/auth/index.js'

function now() {
  return new Date().toISOString()
}
function userId() {
  return getAuthService().getUserId()
}

export function addSection(type = 'custom') {
  const resumeId = activeResumeId.value
  sections.value.push({
    id: uid(),
    userId: userId(),
    resumeId,
    title: type === 'custom' ? 'Custom Section' : type.charAt(0).toUpperCase() + type.slice(1),
    type,
    description: '',
    column: 'left',
    sharedAcrossViews: false,
    viewIds: [resumeId],
    isCollapsed: false,
    entries: [],
    createdAt: now(),
    updatedAt: now(),
  })
}

export function renameSection(sectionId, newTitle) {
  const s = sections.value.find((s) => s.id === sectionId)
  if (s) {
    s.title = newTitle.trim() || s.title
    s.updatedAt = now()
  }
}

export function deleteSection(sectionId) {
  sections.value = sections.value.filter((s) => s.id !== sectionId)
}

export function toggleSectionCollapse(sectionId) {
  const s = sections.value.find((s) => s.id === sectionId)
  if (s) {
    s.isCollapsed = !s.isCollapsed
    s.updatedAt = now()
  }
}

export function toggleSectionSharing(sectionId) {
  const s = sections.value.find((s) => s.id === sectionId)
  if (!s) return
  if (s.sharedAcrossViews) {
    if (!confirm('This will remove the section from all other resumes. Continue?')) return
    s.sharedAcrossViews = false
    s.viewIds = [activeResumeId.value]
  } else {
    s.sharedAcrossViews = true
    s.viewIds = resumes.value.map((r) => r.id)
  }
  s.updatedAt = now()
}

export function updateSectionOrder(newSections) {
  const inactive = sections.value.filter(
    (s) => !s.sharedAcrossViews && !s.viewIds.includes(activeResumeId.value),
  )
  sections.value = [...newSections, ...inactive]
}

export function setSectionColumn(sectionId, column) {
  const s = sections.value.find((s) => s.id === sectionId)
  if (s) {
    s.column = column
    s.updatedAt = new Date().toISOString()
  }
}
