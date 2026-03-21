import { uid } from '../utils/uid'
import { defaultEntry } from '../constants/sectionDefaults'
import { sections } from './useResumeState'

function now() {
  return new Date().toISOString()
}

export function addEntry(sectionId) {
  const s = sections.value.find((s) => s.id === sectionId)
  if (!s) return
  s.entries.push(defaultEntry(sectionId))
  s.updatedAt = now()
}

export function updateEntry(sectionId, entryId, updates) {
  const s = sections.value.find((s) => s.id === sectionId)
  if (!s) return
  const e = s.entries.find((e) => e.id === entryId)
  if (e) {
    Object.assign(e, updates)
    e.updatedAt = now()
    s.updatedAt = now()
  }
}

export function deleteEntry(sectionId, entryId) {
  const s = sections.value.find((s) => s.id === sectionId)
  if (s) {
    s.entries = s.entries.filter((e) => e.id !== entryId)
    s.updatedAt = now()
  }
}

export function duplicateEntry(sectionId, entryId) {
  const s = sections.value.find((s) => s.id === sectionId)
  if (!s) return
  const idx = s.entries.findIndex((e) => e.id === entryId)
  if (idx === -1) return
  s.entries.splice(idx + 1, 0, {
    ...s.entries[idx],
    id: uid(),
    isEditing: false,
    createdAt: now(),
    updatedAt: now(),
  })
  s.updatedAt = now()
}

export function toggleEntryVisibility(sectionId, entryId) {
  const s = sections.value.find((s) => s.id === sectionId)
  if (!s) return
  const e = s.entries.find((e) => e.id === entryId)
  if (e) {
    e.isVisible = !e.isVisible
    e.updatedAt = now()
    s.updatedAt = now()
  }
}

export function updateEntryOrder(sectionId, newEntries) {
  const s = sections.value.find((s) => s.id === sectionId)
  if (s) {
    s.entries = newEntries
    s.updatedAt = now()
  }
}
