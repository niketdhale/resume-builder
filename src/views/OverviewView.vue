<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { inject } from 'vue'
import NavBar from '../components/ui/NavBar.vue'

const router = useRouter()
const resumes = inject('resumes')
const setActiveResume = inject('setActiveResume')
const deleteResume = inject('deleteResume')
const duplicateResume = inject('duplicateResume')
const addResume = inject('addResume')

// ─── Language flag map ────────────────────────────────────────────────────────
const LANG_FLAG = {
  'English':    'GB',
  'French':     'FR',
  'German':     'DE',
  'Spanish':    'ES',
  'Italian':    'IT',
  'Portuguese': 'PT',
  'Dutch':      'NL',
  'Japanese':   'JP',
  'Chinese':    'CN',
  'Korean':     'KR',
  'Arabic':     'AR',
  'Russian':    'RU',
  'Hindi':      'HI',
}

function flagCode(language) {
  return LANG_FLAG[language] || language?.slice(0, 2).toUpperCase() || 'GB'
}

// ─── Only show base resumes in the grid ──────────────────────────────────────
const baseResumes = computed(() => resumes.value.filter((r) => !r.variantOf))

// ─── Get all variants for a base resume ──────────────────────────────────────
function variantsOf(baseId) {
  return resumes.value.filter((r) => r.variantOf === baseId)
}

// ─── All languages for a base resume (base + variants) ───────────────────────
function languagesFor(resume) {
  const all = [resume, ...variantsOf(resume.id)]
  return all.map((r) => ({ code: flagCode(r.language), label: r.language, id: r.id }))
}

function openResume(id) {
  setActiveResume(id)
  router.push({ name: 'editor', params: { id } })
}

function createResume() {
  addResume()
  const newResume = resumes.value[resumes.value.length - 1]
  router.push({ name: 'editor', params: { id: newResume.id } })
}

function handleDelete(resumeId) {
  deleteResume(resumeId)
}

function handleDuplicate(resumeId) {
  duplicateResume(resumeId)
}

function timeAgo(isoString) {
  if (!isoString) return ''
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs === 1 ? '1 hour' : hrs + ' hours'} ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}



</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
    <NavBar />

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
      <!-- Header -->
      <div class="flex items-end justify-between mb-6">
        <div>
          <h1 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-50">My Resumes</h1>
          <p class="text-sm mt-0.5 text-gray-400 dark:text-gray-500">
            {{ baseResumes.length }} {{ baseResumes.length === 1 ? 'resume' : 'resumes' }}
          </p>
        </div>
        <!-- Desktop button — hidden on mobile (FAB used instead) -->
        <button
          @click="createResume"
          class="hidden sm:block bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-lg transition font-medium"
        >
          + New Resume
        </button>
      </div>

      <!-- Cards grid: 1 col mobile → 2 col tablet → 3 col lg → 4 col xl -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <!-- Create new card — vertical on sm+, hidden on mobile (FAB is used) -->
        <div
          @click="createResume"
          class="hidden sm:flex border-2 border-dashed rounded-xl flex-col items-center justify-center gap-3 cursor-pointer transition min-h-52 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 dark:border-gray-700 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/30"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
          >
            +
          </div>
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">New Resume</span>
        </div>

        <!-- Resume cards (base resumes only) -->
        <div
          v-for="resume in baseResumes"
          :key="resume.id"
          class="border rounded-xl overflow-hidden transition cursor-pointer bg-white border-gray-200 hover:shadow-md dark:bg-gray-800 dark:border-gray-700 dark:hover:border-indigo-500"
          @click="openResume(resume.id)"
        >
          <!-- Mobile: horizontal layout. sm+: vertical layout -->
          <div class="flex sm:flex-col">
            <!-- Thumbnail -->
            <div
              class="border-r sm:border-r-0 sm:border-b p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 w-24 sm:w-auto flex-shrink-0"
              style="height: 96px"
              :style="{ height: undefined }"
              :class="'sm:h-[120px] h-24'"
            >
              <div class="rounded shadow-sm p-2 h-full w-full bg-white dark:bg-gray-600">
                <div class="h-2 rounded w-3/4 mb-1 bg-gray-300 dark:bg-gray-500" />
                <div class="h-1.5 rounded w-1/2 mb-2 bg-indigo-200 dark:bg-indigo-400/40" />
                <div class="h-px mb-2 bg-gray-200 dark:bg-gray-500" />
                <div class="flex gap-1.5">
                  <div class="flex-1 flex flex-col gap-1">
                    <div class="h-1 rounded bg-gray-200 dark:bg-gray-500" />
                    <div class="h-1 rounded w-2/3 bg-gray-200 dark:bg-gray-500" />
                  </div>
                  <div class="flex-1 flex flex-col gap-1">
                    <div class="h-1 rounded bg-gray-200 dark:bg-gray-500" />
                    <div class="h-1 rounded w-3/4 bg-gray-200 dark:bg-gray-500" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Info -->
            <div class="p-3 flex-1 min-w-0">
              <p class="text-sm font-semibold truncate text-gray-800 dark:text-gray-100">
                {{ resume.title }}
              </p>
              <p class="text-xs mt-0.5 truncate text-gray-400 dark:text-gray-500">
                {{ resume.metadata?.jobTitle || 'No title set' }}
              </p>

              <!-- Language flags row -->
              <div class="flex items-center gap-1.5 mt-2 flex-wrap">
                <span
                  v-for="lang in languagesFor(resume)"
                  :key="lang.id"
                  :title="lang.label"
                  class="text-xs font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                >
                  {{ lang.code }}
                </span>
              </div>

              <!-- Updated + sections -->
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-gray-400 dark:text-gray-500">
                  {{ timeAgo(resume.updatedAt) }}
                </span>
                <span
                  class="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                >
                  {{ resume.sections?.length || 0 }} sec
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-1 px-3 pb-3" @click.stop>
            <button
              @click="openResume(resume.id)"
              class="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg transition"
            >
              Open
            </button>
            <button
              @click="handleDuplicate(resume.id)"
              class="text-xs border px-2 py-1.5 rounded-lg transition border-gray-200 text-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-500 dark:hover:bg-gray-700"
              title="Duplicate"
            >
              ⧉
            </button>
            <button
              @click="handleDelete(resume.id)"
              class="text-xs border px-2 py-1.5 rounded-lg transition border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-400 dark:border-gray-600 dark:text-gray-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              title="Delete"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- FAB: mobile only -->
    <button
      @click="createResume"
      class="sm:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-2xl rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center transition"
      aria-label="New Resume"
    >+</button>
  </div>
</template>
