import { uid } from '../utils/uid'
import { resumes, sections, activeResumeId } from './useResumeState'

export function addSection(type = 'custom') {
  sections.value.push({
    id: uid(),
    title: type === 'custom' ? 'Custom Section' : type.charAt(0).toUpperCase() + type.slice(1),
    type,
    description: '',
    sharedAcrossViews: false,
    viewIds: [activeResumeId.value],
    isCollapsed: false,
    entries: [],
  })
}

export function renameSection(sectionId, newTitle) {
  const s = sections.value.find((s) => s.id === sectionId)
  if (s) s.title = newTitle.trim() || s.title
}

export function deleteSection(sectionId) {
  sections.value = sections.value.filter((s) => s.id !== sectionId)
}

export function toggleSectionCollapse(sectionId) {
  const s = sections.value.find((s) => s.id === sectionId)
  if (s) s.isCollapsed = !s.isCollapsed
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
}

export function updateSectionOrder(newSections) {
  const inactive = sections.value.filter(
    (s) => !s.sharedAcrossViews && !s.viewIds.includes(activeResumeId.value),
  )
  sections.value = [...newSections, ...inactive]
}
