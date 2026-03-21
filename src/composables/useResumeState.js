import { ref, computed } from 'vue'
import { uid } from '../utils/uid'
import { defaultMetadata, defaultSettings, defaultSections } from '../constants/sectionDefaults'

// ─── Singleton state (shared across all composables) ──────────────────────────
// We export the raw refs so other composables can mutate them directly

const firstId = uid()

export const resumes = ref([
  {
    id: firstId,
    title: 'My Resume',
    pageSize: 'A4',
    settings: defaultSettings(),
    metadata: defaultMetadata(),
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
    if (r) r.metadata = val
  },
})

export const activeSettings = computed(
  () => resumes.value.find((r) => r.id === activeResumeId.value)?.settings || defaultSettings(),
)

export const activePageSize = computed(
  () => resumes.value.find((r) => r.id === activeResumeId.value)?.pageSize || 'A4',
)
