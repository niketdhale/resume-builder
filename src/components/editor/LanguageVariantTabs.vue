<script setup>
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import { AVAILABLE_LANGUAGES, flagCode } from '../../constants/languages'

const router = useRouter()
const resumes = inject('resumes')
const activeResumeId = inject('activeResumeId')
const addLanguageVariant = inject('addLanguageVariant')


const showPicker = ref(false)

// Find the base resume for the currently active resume
const baseResume = computed(() => {
  const active = resumes.value.find((r) => r.id === activeResumeId.value)
  if (!active) return null
  if (!active.variantOf) return active
  return resumes.value.find((r) => r.id === active.variantOf) || active
})

// All language versions: base + variants
const allVariants = computed(() => {
  if (!baseResume.value) return []
  const base = baseResume.value
  const variants = resumes.value.filter((r) => r.variantOf === base.id)
  return [base, ...variants]
})

// Languages already used (for filtering picker)
const usedLanguages = computed(() =>
  allVariants.value.map((r) => r.language),
)

// Available languages not yet used
const availableLanguages = computed(() =>
  AVAILABLE_LANGUAGES.filter((l) => !usedLanguages.value.includes(l)),
)

// Only show tabs if there are multiple variants
const showTabs = computed(() => allVariants.value.length > 1)

function switchVariant(resumeId) {
  activeResumeId.value = resumeId
  router.replace({ name: 'editor', params: { id: resumeId } })
}

function addVariant(language) {
  showPicker.value = false
  addLanguageVariant(activeResumeId.value, language)
}

</script>

<template>
  <div
    v-if="showTabs || availableLanguages.length > 0"
    class="flex items-center gap-1 px-4 py-1.5 border-b flex-shrink-0 bg-gray-50 border-gray-200 dark:bg-gray-900/50 dark:border-gray-800"
  >
    <!-- Language variant tabs -->
    <template v-for="variant in allVariants" :key="variant.id">
      <button
        @click="switchVariant(variant.id)"
        :class="[
          'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
          activeResumeId === variant.id
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800',
        ]"
      >
        <img
          :src="`https://flagcdn.com/16x12/${flagCode(variant.language).toLowerCase()}.png`"
          :alt="variant.language"
          class="w-4 h-3 rounded-sm object-cover"
        />
        {{ variant.language }}
      </button>
    </template>

    <!-- Add Language Copy button -->
    <div class="relative">
      <button
        v-if="availableLanguages.length > 0"
        @click.stop="showPicker = !showPicker"
        class="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/40 transition-colors"
      >
        <Plus :size="12" />
        Add Language
      </button>

      <!-- Language picker dropdown -->
      <div
        v-if="showPicker"
        class="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1 max-h-60 overflow-y-auto"
        @click.stop
      >
        <button
          v-for="lang in availableLanguages"
          :key="lang"
          @click="addVariant(lang)"
          class="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <img
            :src="`https://flagcdn.com/16x12/${flagCode(lang).toLowerCase()}.png`"
            :alt="lang"
            class="w-4 h-3 rounded-sm object-cover"
          />
          {{ lang }}
        </button>
      </div>
    </div>

    <!-- Click-away overlay for picker -->
    <Teleport to="body">
      <div
        v-if="showPicker"
        class="fixed inset-0 z-40"
        @click="showPicker = false"
      />
    </Teleport>
  </div>
</template>
