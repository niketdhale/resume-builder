import { uid } from '../utils/uid'
import { defaultMetadata, defaultSettings, defaultSections } from '../constants/sectionDefaults'
import { resumes, sections, activeResumeId } from './useResumeState'
import { getAuthService } from '../services/auth/index.js'

function now() {
  return new Date().toISOString()
}
function userId() {
  return getAuthService().getUserId()
}

export function addResume() {
  const newId = uid()
  resumes.value.push({
    id: newId,
    userId: userId(),
    title: `Resume ${resumes.value.length + 1}`,
    pageSize: 'A4',
    settings: defaultSettings(),
    metadata: defaultMetadata(),
    createdAt: now(),
    updatedAt: now(),
  })
  sections.value.push(...defaultSections(newId))
  activeResumeId.value = newId
}

export function renameResume(resumeId, newTitle) {
  const r = resumes.value.find((r) => r.id === resumeId)
  if (r) {
    r.title = newTitle.trim() || r.title
    r.updatedAt = now()
  }
}

export function duplicateResume(resumeId) {
  const original = resumes.value.find((r) => r.id === resumeId)
  if (!original) return
  const newId = uid()
  resumes.value.push({
    id: newId,
    userId: userId(),
    title: `${original.title} (Copy)`,
    pageSize: original.pageSize || 'A4',
    settings: { ...original.settings },
    metadata: { ...original.metadata },
    createdAt: now(),
    updatedAt: now(),
  })
  sections.value.forEach((s) => {
    if (s.sharedAcrossViews) {
      s.viewIds.push(newId)
    } else if (s.viewIds.includes(resumeId)) {
      sections.value.push({
        ...s,
        id: uid(),
        userId: userId(),
        resumeId: newId,
        viewIds: [newId],
        createdAt: now(),
        updatedAt: now(),
        entries: s.entries.map((e) => ({
          ...e,
          id: uid(),
          userId: userId(),
          createdAt: now(),
          updatedAt: now(),
        })),
      })
    }
  })
  activeResumeId.value = newId
}

export function deleteResume(resumeId) {
  if (resumes.value.length === 1) return
  sections.value.forEach((s) => {
    s.viewIds = s.viewIds.filter((id) => id !== resumeId)
  })
  sections.value = sections.value.filter((s) => s.sharedAcrossViews || s.viewIds.length > 0)
  resumes.value = resumes.value.filter((r) => r.id !== resumeId)
  activeResumeId.value = resumes.value[0].id
}

export function setActiveResume(resumeId) {
  activeResumeId.value = resumeId
}

export function updateMetadata(field, value) {
  const r = resumes.value.find((r) => r.id === activeResumeId.value)
  if (r) {
    r.metadata[field] = value
    r.updatedAt = now()
  }
}

export function updateSetting(key, value) {
  const r = resumes.value.find((r) => r.id === activeResumeId.value)
  if (r) {
    r.settings[key] = value
    r.updatedAt = now()
  }
}

export function updatePageSize(size) {
  const r = resumes.value.find((r) => r.id === activeResumeId.value)
  if (r) {
    r.pageSize = size
    r.updatedAt = now()
  }
}
