import { uid } from '../utils/uid'
import { defaultMetadata, defaultSettings, defaultSections } from '../constants/sectionDefaults'
import { resumes, sections, activeResumeId } from './useResumeState'
import { getAuthService } from '../services/auth/index.js'
import { pushHistory, clearHistory } from './useHistory'

function now() {
  return new Date().toISOString()
}
function userId() {
  return getAuthService().getUserId()
}

export function addResume() {
  pushHistory(true)
  const newId = uid()
  resumes.value.push({
    id: newId,
    userId: userId(),
    title: `Resume ${resumes.value.length + 1}`,
    pageSize: 'A4',
    variantOf: null,
    language: 'English',
    settings: defaultSettings(),
    metadata: defaultMetadata(),
    createdAt: now(),
    updatedAt: now(),
  })
  sections.value.push(...defaultSections(newId))
  activeResumeId.value = newId
}

export function renameResume(resumeId, newTitle) {
  pushHistory(true)
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
    variantOf: null,
    language: original.language || 'English',
    settings: JSON.parse(JSON.stringify(original.settings)),
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

// ─── Add a language variant ───────────────────────────────────────────────────
// Deep-clones the base resume (sections + entries + settings).
// IMPORTANT: all sections must be pushed BEFORE setting activeResumeId,
// otherwise Vue reactivity updates activeSections to the new empty resume
// before the cloned sections are in place.

export function addLanguageVariant(baseResumeId, language) {
  // Resolve true root: if caller is already a variant, find its base
  const caller = resumes.value.find((r) => r.id === baseResumeId)
  if (!caller) return
  const rootId = caller.variantOf ?? caller.id
  const base = resumes.value.find((r) => r.id === rootId)
  if (!base) return

  // Guard: don't add duplicate languages
  const alreadyExists = resumes.value.some(
    (r) => (r.id === rootId || r.variantOf === rootId) && r.language === language,
  )
  if (alreadyExists) return

  const newId = uid()

  // ── Step 1: Clone all sections + entries FIRST ──────────────────────────
  // Filter by viewIds so shared sections are included correctly.
  const baseSections = sections.value.filter(
    (s) => s.viewIds.includes(rootId) && !s.sharedAcrossViews,
  )

  const clonedSections = baseSections.map((s) => {
    const newSectionId = uid()
    return {
      ...s,
      id: newSectionId,
      userId: userId(),
      resumeId: newId,
      viewIds: [newId],
      sharedAcrossViews: false,
      createdAt: now(),
      updatedAt: now(),
      entries: s.entries.map((e) => ({
        ...e,
        id: uid(),
        userId: userId(),
        sectionId: newSectionId,
        createdAt: now(),
        updatedAt: now(),
      })),
    }
  })

  // Push sections before the resume so state is consistent
  sections.value.push(...clonedSections)

  // Clone resume metadata + settings
  // Reset columnLayout IDs — they point to base section IDs which won't exist on the variant.
  // ResumePage will fall back to section.column field which is correctly cloned.
  const clonedSettings = JSON.parse(JSON.stringify(base.settings))
  clonedSettings.columnLayout = { left: [], right: [] }

  resumes.value.push({
    id: newId,
    userId: userId(),
    title: base.title,
    pageSize: base.pageSize || 'A4',
    variantOf: rootId,
    language,
    settings: clonedSettings,
    metadata: { ...base.metadata },
    createdAt: now(),
    updatedAt: now(),
  })

  // ── Step 3: Switch active AFTER both sections and resume are in place ────
  activeResumeId.value = newId
}

// ─── Set a variant (or any resume) as the new base ───────────────────────────
// Promotes target to base (variantOf = null).
// Old base + all siblings become variants pointing to the new base.

export function setBaseResume(resumeId) {
  const target = resumes.value.find((r) => r.id === resumeId)
  if (!target) return

  const oldRootId = target.variantOf ?? target.id
  if (oldRootId === resumeId) return // already the base

  resumes.value.forEach((r) => {
    if (r.id === resumeId) {
      r.variantOf = null
    } else if (r.id === oldRootId || r.variantOf === oldRootId) {
      r.variantOf = resumeId
    }
  })
}

// ─── Delete resume ────────────────────────────────────────────────────────────
// Deleting the base also deletes all its variants.
// Deleting a variant only removes that one.
// Guards against deleting the last base resume.

export function deleteResume(resumeId) {
  const target = resumes.value.find((r) => r.id === resumeId)
  if (!target) return

  const isBase = !target.variantOf
  const idsToDelete = isBase
    ? [resumeId, ...resumes.value.filter((r) => r.variantOf === resumeId).map((r) => r.id)]
    : [resumeId]

  // Guard: must always have at least one base resume remaining
  const remainingBases = resumes.value.filter(
    (r) => !r.variantOf && !idsToDelete.includes(r.id),
  )
  if (remainingBases.length === 0) return

  // Remove sections belonging to deleted resumes
  sections.value = sections.value.filter((s) => {
    if (idsToDelete.includes(s.resumeId)) return false
    s.viewIds = s.viewIds.filter((id) => !idsToDelete.includes(id))
    return s.sharedAcrossViews || s.viewIds.length > 0
  })

  // Remove resumes
  resumes.value = resumes.value.filter((r) => !idsToDelete.includes(r.id))

  // Switch active to first remaining base
  activeResumeId.value = remainingBases[0].id
}

export function setActiveResume(resumeId) {
  clearHistory()
  activeResumeId.value = resumeId
}

export function updateMetadata(field, value) {
  pushHistory()  // debounced — typing
  const r = resumes.value.find((r) => r.id === activeResumeId.value)
  if (r) {
    r.metadata[field] = value
    r.updatedAt = now()
  }
}

export function updateSetting(key, value) {
  pushHistory(true)
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
