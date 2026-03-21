<script setup>
import { useRouter } from 'vue-router'
import { resumes } from '../composables/useResumeState'
import { addResume } from '../composables/useResumeActions'

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
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-5xl mx-auto px-8 py-8">
      <!-- Header -->
      <div class="flex items-end justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold text-gray-900">My Resumes</h1>
          <p class="text-sm text-gray-400 mt-0.5">{{ resumes.length }} resumes</p>
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
          class="bg-white border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition min-h-52"
        >
          <div
            class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl"
          >
            +
          </div>
          <span class="text-sm font-medium text-gray-500">New Resume</span>
        </div>

        <!-- Resume cards -->
        <div
          v-for="resume in resumes"
          :key="resume.id"
          class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer"
          @click="openResume(resume.id)"
        >
          <!-- Thumbnail -->
          <div class="bg-gray-50 border-b border-gray-100 p-3" style="height: 120px">
            <div class="bg-white rounded shadow-sm p-2 h-full w-full">
              <div class="h-2 bg-gray-300 rounded w-3/4 mb-1" />
              <div class="h-1.5 bg-indigo-200 rounded w-1/2 mb-2" />
              <div class="h-px bg-gray-200 mb-2" />
              <div class="flex gap-1.5">
                <div class="flex-1 flex flex-col gap-1">
                  <div class="h-1 bg-gray-200 rounded" />
                  <div class="h-1 bg-gray-200 rounded w-2/3" />
                </div>
                <div class="flex-1 flex flex-col gap-1">
                  <div class="h-1 bg-gray-200 rounded" />
                  <div class="h-1 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="p-3">
            <p class="text-sm font-semibold text-gray-800 truncate">{{ resume.title }}</p>
            <p class="text-xs text-gray-400 mt-0.5 truncate">
              {{ resume.metadata?.fullName || 'No name set' }}
            </p>
            <p class="text-xs text-gray-400 mt-0.5 truncate">
              {{ resume.metadata?.jobTitle || 'No title set' }}
            </p>

            <!-- Language flags placeholder -->
            <div class="flex items-center gap-1 mt-2">
              <span class="text-base">🇬🇧</span>
              <span class="text-xs text-gray-400">English</span>
            </div>

            <div class="flex items-center justify-between mt-2">
              <span class="text-xs text-gray-400">
                {{ resume.pageSize || 'A4' }}
              </span>
              <span class="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
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
              class="text-xs border border-gray-200 text-gray-400 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition"
              title="Duplicate"
            >
              ⧉
            </button>
            <button
              @click.stop
              class="text-xs border border-gray-200 text-gray-400 px-2 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-400 transition"
              title="Delete"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
