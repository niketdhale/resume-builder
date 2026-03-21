<script setup>
import { useRouter } from 'vue-router'
import { resumes } from '../composables/useResumeState'
import { addResume } from '../composables/useResumeActions'
import NavBar from '../components/ui/NavBar.vue'

const router = useRouter()

function openResume(id) {
  router.push({ name: 'editor', params: { id } })
}

function createResume() {
  addResume()
  const newResume = resumes.value[resumes.value.length - 1]
  router.push({ name: 'editor', params: { id: newResume.id } })
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
    <NavBar />

    <div class="max-w-5xl mx-auto px-8 py-8 w-full">
      <!-- Header -->
      <div class="flex items-end justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold text-gray-900 dark:text-gray-50">My Resumes</h1>
          <p class="text-sm mt-0.5 text-gray-400 dark:text-gray-500">
            {{ resumes.length }} resumes
          </p>
        </div>
        <button
          @click="createResume"
          class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-lg transition font-medium"
        >
          + New Resume
        </button>
      </div>

      <!-- Cards grid -->
      <div class="grid grid-cols-4 gap-4">
        <!-- Create new card -->
        <div
          @click="createResume"
          class="border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition min-h-52 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 dark:border-gray-700 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/30"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
          >
            +
          </div>
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">New Resume</span>
        </div>

        <!-- Resume cards -->
        <div
          v-for="resume in resumes"
          :key="resume.id"
          class="border rounded-xl overflow-hidden transition cursor-pointer bg-white border-gray-200 hover:shadow-md dark:bg-gray-800 dark:border-gray-700 dark:hover:border-indigo-500"
          @click="openResume(resume.id)"
        >
          <!-- Thumbnail -->
          <div
            class="border-b p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
            style="height: 120px"
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
          <div class="p-3">
            <p class="text-sm font-semibold truncate text-gray-800 dark:text-gray-100">
              {{ resume.title }}
            </p>
            <p class="text-xs mt-0.5 truncate text-gray-400 dark:text-gray-500">
              {{ resume.metadata?.fullName || 'No name set' }}
            </p>
            <p class="text-xs mt-0.5 truncate text-gray-400 dark:text-gray-500">
              {{ resume.metadata?.jobTitle || 'No title set' }}
            </p>
            <div class="flex items-center gap-1 mt-2">
              <span class="text-base">🇬🇧</span>
              <span class="text-xs text-gray-400 dark:text-gray-500">English</span>
            </div>
            <div class="flex items-center justify-between mt-2">
              <span class="text-xs text-gray-400 dark:text-gray-500">{{
                resume.pageSize || 'A4'
              }}</span>
              <span
                class="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              >
                {{ resume.sections?.length || 0 }} sections
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-1 px-3 pb-3">
            <button
              @click.stop="openResume(resume.id)"
              class="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg transition"
            >
              Open
            </button>
            <button
              @click.stop
              class="text-xs border px-2 py-1.5 rounded-lg transition border-gray-200 text-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-500 dark:hover:bg-gray-700"
            >
              ⧉
            </button>
            <button
              @click.stop
              class="text-xs border px-2 py-1.5 rounded-lg transition border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-400 dark:border-gray-600 dark:text-gray-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
