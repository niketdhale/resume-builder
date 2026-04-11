/**
 * Serialise / deserialise resume state to/from virtual FS files.
 *
 * Repo layout:
 *   resumes/<id>.json          — resume object (without sections/entries)
 *   resumes/<id>/sections/<sid>.json
 *   groups/<id>.json           — group object
 *   index.json                 — { activeResumeId, resumeToGroup }
 *
 * Photos (base64) are stored separately as resumes/<id>/photo.txt so the
 * JSON diffs remain human-readable.
 */

const PHOTO_SENTINEL = '__photo_external__'

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function resumePath(id)               { return `/resumes/${id}.json` }
export function photoPath(id)                { return `/resumes/${id}/photo.txt` }
export function sectionPath(resumeId, secId) { return `/resumes/${resumeId}/sections/${secId}.json` }
export function groupPath(id)                { return `/groups/${id}.json` }
export const INDEX_PATH = '/index.json'

// ─── Resume → files ───────────────────────────────────────────────────────────

/**
 * Returns a flat map of { filePath: stringContent } for one resume + its sections.
 * Does NOT include photo content — photo is returned separately under photoPath(id).
 */
export function resumeToFiles(resume, sectionsForResume) {
  const files = {}

  // Strip photo from the main JSON for clean diffs
  const photo = resume.metadata?.photo || ''
  const resumeNoPhoto = {
    ...resume,
    metadata: { ...resume.metadata, photo: photo ? PHOTO_SENTINEL : '' },
  }
  files[resumePath(resume.id)] = JSON.stringify(resumeNoPhoto, null, 2)

  // Photo stored separately
  if (photo) {
    files[photoPath(resume.id)] = photo
  }

  // Sections
  for (const sec of sectionsForResume) {
    files[sectionPath(resume.id, sec.id)] = JSON.stringify(sec, null, 2)
  }

  return files
}

/**
 * Reconstruct a resume + sections from the flat file map.
 * @param {string} resumeId
 * @param {Object} files  { filePath: stringContent }
 */
export function filesToResume(resumeId, files) {
  const resumeJson = files[resumePath(resumeId)]
  if (!resumeJson) return null

  const resume = JSON.parse(resumeJson)

  // Restore photo
  const photo = files[photoPath(resumeId)] || ''
  if (resume.metadata?.photo === PHOTO_SENTINEL) {
    resume.metadata.photo = photo
  }

  // Collect sections
  const prefix = `/resumes/${resumeId}/sections/`
  const sections = Object.entries(files)
    .filter(([p]) => p.startsWith(prefix) && p.endsWith('.json'))
    .map(([, content]) => JSON.parse(content))

  return { resume, sections }
}

// ─── Index ────────────────────────────────────────────────────────────────────

export function serializeIndex(activeResumeId, resumeToGroup) {
  return JSON.stringify({ activeResumeId, resumeToGroup }, null, 2)
}

export function deserializeIndex(content) {
  try { return JSON.parse(content) }
  catch { return { activeResumeId: null, resumeToGroup: {} } }
}

// ─── Groups ───────────────────────────────────────────────────────────────────

export function serializeGroup(group) {
  return JSON.stringify(group, null, 2)
}

export function deserializeGroup(content) {
  return JSON.parse(content)
}
