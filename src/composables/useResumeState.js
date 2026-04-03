import { ref, computed } from 'vue'
import { uid } from '../utils/uid'
import { defaultMetadata, defaultSettings, defaultSections } from '../constants/sectionDefaults'
import { getAuthService } from '../services/auth/index.js'

function now() {
  return new Date().toISOString()
}

// ─── Initial resume ───────────────────────────────────────────────────────────

const firstId = uid()

export const resumes = ref([
  {
    id: firstId,
    userId: getAuthService().getUserId(),
    title: 'My Resume',
    pageSize: 'A4',
    settings: defaultSettings(),
    metadata: defaultMetadata(),
    createdAt: now(),
    updatedAt: now(),
  },
])

export const sections = ref(defaultSections(firstId))

export const activeResumeId = ref(firstId)

// ─── Computed ─────────────────────────────────────────────────────────────────

export const activeSections = computed(() =>
  sections.value.filter((s) => s.sharedAcrossViews || s.viewIds.includes(activeResumeId.value)),
)

export const activeMetadata = computed({
  get() {
    return resumes.value.find((r) => r.id === activeResumeId.value)?.metadata || defaultMetadata()
  },
  set(val) {
    const r = resumes.value.find((r) => r.id === activeResumeId.value)
    if (r) {
      r.metadata = val
      r.updatedAt = now()
    }
  },
})

export const activeSettings = computed(
  () => resumes.value.find((r) => r.id === activeResumeId.value)?.settings || defaultSettings(),
)

export const activePageSize = computed(
  () => resumes.value.find((r) => r.id === activeResumeId.value)?.pageSize || 'A4',
)

// ─── Reset to a clean default state ──────────────────────────────────────────
// Called when signing out with empty local storage, so cloud data isn't shown in guest mode.

export function resetResumeState() {
  const id = uid()
  resumes.value = [{
    id,
    userId: getAuthService().getUserId(),
    title: 'My Resume',
    pageSize: 'A4',
    settings: defaultSettings(),
    metadata: defaultMetadata(),
    createdAt: now(),
    updatedAt: now(),
  }]
  sections.value = defaultSections(id)
  activeResumeId.value = id
}
