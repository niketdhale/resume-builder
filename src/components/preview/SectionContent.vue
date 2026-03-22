<script setup>
defineProps({
  section: { type: Object, required: true },
  s: { type: Object, required: true },
  dateStyle: { type: Object, default: () => ({}) },
  subtitleStyle: { type: Object, default: () => ({}) },
  formatMonth: { type: Function, required: true },
  formatDate: { type: Function, required: true },
  levelColors: { type: Object, required: true },
  proficiencyColors: { type: Object, required: true },
  entrySpacing: { type: Number, default: 8 },
})
</script>

<template>
  <div class="flex flex-col" :style="{ gap: entrySpacing + 'px' }">
    <!-- EXPERIENCE -->
    <template v-if="section.type === 'experience'">
      <div v-for="e in section.visibleEntries" :key="e.id">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-semibold text-gray-800">{{ e.role }}</p>
            <p class="text-xs" :style="subtitleStyle">{{ e.company }}</p>
          </div>
          <p class="text-xs whitespace-nowrap ml-2" :style="dateStyle">
            {{ formatMonth(e.startDate) }}{{ e.startDate ? ' – ' : ''
            }}{{ e.currentlyWorking ? 'Present' : formatMonth(e.endDate) }}
          </p>
        </div>
        <p
          v-if="e.description"
          class="text-xs text-gray-600 mt-1 leading-relaxed whitespace-pre-wrap"
        >
          {{ e.description }}
        </p>
        <p v-if="e.information" class="text-xs text-gray-400 mt-1 italic">{{ e.information }}</p>
      </div>
    </template>

    <!-- EDUCATION -->
    <template v-else-if="section.type === 'education'">
      <div v-for="e in section.visibleEntries" :key="e.id">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-semibold text-gray-800">{{ e.degree }}</p>
            <p class="text-xs" :style="subtitleStyle">{{ e.institution }}</p>
            <p v-if="e.honors" class="text-xs mt-0.5" :style="{ color: s.accentColor }">
              {{ e.honors }}
            </p>
          </div>
          <p class="text-xs whitespace-nowrap ml-2" :style="dateStyle">
            {{ formatMonth(e.startDate) }}{{ e.startDate ? ' – ' : '' }}{{ formatMonth(e.endDate) }}
          </p>
        </div>
        <p v-if="e.information" class="text-xs text-gray-400 mt-1 italic">{{ e.information }}</p>
      </div>
    </template>

    <!-- SKILLS -->
    <template v-else-if="section.type === 'skills'">
      <div class="flex flex-wrap gap-2">
        <span
          v-for="e in section.visibleEntries"
          :key="e.id"
          :class="[
            'text-xs px-2.5 py-1 rounded-full font-medium',
            e.level
              ? levelColors[e.level] || 'bg-gray-100 text-gray-600'
              : 'bg-gray-100 text-gray-600',
          ]"
        >
          {{ e.skill }}<span v-if="e.level" class="opacity-60 font-normal"> · {{ e.level }}</span>
        </span>
      </div>
    </template>

    <!-- LANGUAGES -->
    <template v-else-if="section.type === 'languages'">
      <div class="flex flex-wrap gap-2">
        <span
          v-for="e in section.visibleEntries"
          :key="e.id"
          :class="[
            'text-xs px-2.5 py-1 rounded-full font-medium',
            e.proficiency
              ? proficiencyColors[e.proficiency] || 'bg-gray-100 text-gray-600'
              : 'bg-gray-100 text-gray-600',
          ]"
        >
          {{ e.language
          }}<span v-if="e.proficiency" class="opacity-60 font-normal"> · {{ e.proficiency }}</span>
        </span>
      </div>
    </template>

    <!-- CERTIFICATES -->
    <template v-else-if="section.type === 'certificates'">
      <div
        v-for="e in section.visibleEntries"
        :key="e.id"
        class="flex items-center justify-between"
      >
        <div>
          <p class="text-sm font-semibold text-gray-800">{{ e.certName }}</p>
          <p class="text-xs" :style="subtitleStyle">{{ e.issuer }}</p>
        </div>
        <p class="text-xs" :style="dateStyle">{{ formatMonth(e.dateEarned) }}</p>
      </div>
    </template>

    <!-- INTERESTS -->
    <template v-else-if="section.type === 'interests'">
      <div v-for="e in section.visibleEntries" :key="e.id">
        <p class="text-sm font-medium text-gray-700">{{ e.title }}</p>
        <p v-if="e.content" class="text-xs text-gray-500">{{ e.content }}</p>
        <p v-if="e.information" class="text-xs text-gray-400 italic">{{ e.information }}</p>
      </div>
    </template>

    <!-- PROJECTS -->
    <template v-else-if="section.type === 'projects'">
      <div v-for="e in section.visibleEntries" :key="e.id">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-semibold text-gray-800">{{ e.projectName }}</p>
            <p class="text-xs" :style="subtitleStyle">{{ e.projectRole }}</p>
          </div>
          <p class="text-xs whitespace-nowrap ml-2" :style="dateStyle">
            {{ formatMonth(e.startDate) }}{{ e.startDate ? ' – ' : '' }}{{ formatMonth(e.endDate) }}
          </p>
        </div>
        <p
          v-if="e.description"
          class="text-xs text-gray-600 mt-1 leading-relaxed whitespace-pre-wrap"
        >
          {{ e.description }}
        </p>
        <p v-if="e.information" class="text-xs text-gray-400 mt-1 italic">{{ e.information }}</p>
      </div>
    </template>

    <!-- COURSES -->
    <template v-else-if="section.type === 'courses'">
      <div
        v-for="e in section.visibleEntries"
        :key="e.id"
        class="flex items-center justify-between"
      >
        <div>
          <p class="text-sm font-semibold text-gray-800">{{ e.courseName }}</p>
          <p class="text-xs" :style="subtitleStyle">{{ e.courseInstitution }}</p>
        </div>
        <p class="text-xs" :style="dateStyle">{{ formatMonth(e.dateCompleted) }}</p>
      </div>
    </template>

    <!-- AWARDS -->
    <template v-else-if="section.type === 'awards'">
      <div v-for="e in section.visibleEntries" :key="e.id">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-semibold text-gray-800">{{ e.awardName }}</p>
            <p class="text-xs" :style="subtitleStyle">{{ e.awardIssuer }}</p>
          </div>
          <p class="text-xs whitespace-nowrap ml-2" :style="dateStyle">
            {{ formatMonth(e.awardDate) }}
          </p>
        </div>
        <p v-if="e.description" class="text-xs text-gray-500 mt-0.5">{{ e.description }}</p>
        <p v-if="e.information" class="text-xs text-gray-400 mt-0.5 italic">{{ e.information }}</p>
      </div>
    </template>

    <!-- ORGANISATIONS -->
    <template v-else-if="section.type === 'organisations'">
      <div v-for="e in section.visibleEntries" :key="e.id">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-semibold text-gray-800">{{ e.orgName }}</p>
            <p class="text-xs" :style="subtitleStyle">{{ e.orgRole }}</p>
          </div>
          <p class="text-xs whitespace-nowrap ml-2" :style="dateStyle">
            {{ formatMonth(e.orgStart) }}{{ e.orgStart ? ' – ' : '' }}{{ formatMonth(e.orgEnd) }}
          </p>
        </div>
        <p v-if="e.information" class="text-xs text-gray-400 mt-0.5 italic">{{ e.information }}</p>
      </div>
    </template>

    <!-- PUBLICATIONS -->
    <template v-else-if="section.type === 'publications'">
      <div v-for="e in section.visibleEntries" :key="e.id">
        <p class="text-sm font-semibold text-gray-800">{{ e.pubTitle }}</p>
        <div class="flex items-center gap-2">
          <p class="text-xs" :style="subtitleStyle">{{ e.publisher }}</p>
          <span v-if="e.pubDate" class="text-xs text-gray-400">· {{ formatMonth(e.pubDate) }}</span>
        </div>
        <a
          v-if="e.pubUrl"
          :href="e.pubUrl"
          target="_blank"
          :class="[
            'text-xs',
            s.linkBlueColor ? 'text-blue-500' : 'text-indigo-500',
            s.linkUnderline ? 'underline' : '',
          ]"
        >
          {{ e.pubUrl }}
        </a>
        <p v-if="e.information" class="text-xs text-gray-400 mt-0.5 italic">{{ e.information }}</p>
      </div>
    </template>

    <!-- REFERENCES -->
    <template v-else-if="section.type === 'references'">
      <div class="grid grid-cols-2 gap-2">
        <div v-for="e in section.visibleEntries" :key="e.id">
          <p class="text-sm font-semibold text-gray-800">{{ e.refName }}</p>
          <p class="text-xs" :style="subtitleStyle">
            {{ e.refJobTitle }}{{ e.refCompany ? `, ${e.refCompany}` : '' }}
          </p>
          <p v-if="e.refEmail" class="text-xs mt-1" :style="{ color: s.accentColor }">
            {{ e.refEmail }}
          </p>
          <p v-if="e.refPhone" class="text-xs text-gray-400">{{ e.refPhone }}</p>
        </div>
      </div>
    </template>

    <!-- DECLARATION -->
    <template v-else-if="section.type === 'declaration'">
      <div v-for="e in section.visibleEntries" :key="e.id">
        <p class="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{{ e.content }}</p>
        <p v-if="e.information" class="text-xs text-gray-400 mt-1 italic">{{ e.information }}</p>
      </div>
    </template>

    <!-- DOB -->
    <template v-else-if="section.type === 'dob'">
      <div v-for="e in section.visibleEntries" :key="e.id">
        <p class="text-sm text-gray-700">{{ formatDate(e.dob) }}</p>
      </div>
    </template>

    <!-- CUSTOM -->
    <template v-else>
      <div v-for="e in section.visibleEntries" :key="e.id">
        <p class="text-sm font-medium text-gray-800">{{ e.title }}</p>
        <p v-if="e.content" class="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
          {{ e.content }}
        </p>
        <p v-if="e.information" class="text-xs text-gray-400 mt-0.5 italic">{{ e.information }}</p>
      </div>
    </template>
  </div>
</template>
