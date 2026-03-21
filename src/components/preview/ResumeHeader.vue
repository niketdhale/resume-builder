<script setup>
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-vue-next'

const props = defineProps({
  metadata: { type: Object, required: true },
  s: { type: Object, required: true },
  nameStyle: { type: Object, default: () => ({}) },
  jobTitleStyle: { type: Object, default: () => ({}) },
  iconStyle: { type: Object, default: () => ({}) },
  headerLayout: { type: String, default: 'classic' },
  show: { type: Function, required: true },
})
</script>

<template>
  <!-- ── Centered ── -->
  <template v-if="headerLayout === 'centered'">
    <div class="flex flex-col items-center text-center gap-1">
      <h1 class="text-2xl font-bold tracking-tight" :style="nameStyle">
        {{ metadata.fullName || 'Your Name' }}
      </h1>
      <p v-if="metadata.jobTitle" class="text-sm font-medium" :style="jobTitleStyle">
        {{ metadata.jobTitle }}
      </p>
      <div class="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
        <span
          v-if="metadata.email && show('showEmail')"
          class="flex items-center gap-1 text-xs text-gray-500"
          ><Mail :size="11" :style="iconStyle" /> {{ metadata.email }}</span
        >
        <span
          v-if="metadata.phone && show('showPhone')"
          class="flex items-center gap-1 text-xs text-gray-500"
          ><Phone :size="11" :style="iconStyle" /> {{ metadata.phone }}</span
        >
        <span
          v-if="metadata.location && show('showLocation')"
          class="flex items-center gap-1 text-xs text-gray-500"
          ><MapPin :size="11" :style="iconStyle" /> {{ metadata.location }}</span
        >
        <span
          v-if="metadata.linkedin && show('showLinkedin')"
          class="flex items-center gap-1 text-xs text-gray-500"
          ><Linkedin :size="11" :style="iconStyle" /> {{ metadata.linkedin }}</span
        >
        <span
          v-if="metadata.website && show('showWebsite')"
          class="flex items-center gap-1 text-xs text-gray-500"
          ><Globe :size="11" :style="iconStyle" /> {{ metadata.website }}</span
        >
      </div>
    </div>
  </template>

  <!-- ── Compact ── -->
  <template v-else-if="headerLayout === 'compact'">
    <div class="flex items-center gap-3 flex-wrap">
      <h1 class="text-lg font-bold tracking-tight" :style="nameStyle">
        {{ metadata.fullName || 'Your Name' }}
      </h1>
      <span class="text-gray-300">|</span>
      <p v-if="metadata.jobTitle" class="text-sm font-medium" :style="jobTitleStyle">
        {{ metadata.jobTitle }}
      </p>
    </div>
    <div class="flex flex-wrap gap-x-4 gap-y-1 mt-1">
      <span
        v-if="metadata.email && show('showEmail')"
        class="flex items-center gap-1 text-xs text-gray-500"
        ><Mail :size="11" :style="iconStyle" /> {{ metadata.email }}</span
      >
      <span
        v-if="metadata.phone && show('showPhone')"
        class="flex items-center gap-1 text-xs text-gray-500"
        ><Phone :size="11" :style="iconStyle" /> {{ metadata.phone }}</span
      >
      <span
        v-if="metadata.location && show('showLocation')"
        class="flex items-center gap-1 text-xs text-gray-500"
        ><MapPin :size="11" :style="iconStyle" /> {{ metadata.location }}</span
      >
      <span
        v-if="metadata.linkedin && show('showLinkedin')"
        class="flex items-center gap-1 text-xs text-gray-500"
        ><Linkedin :size="11" :style="iconStyle" /> {{ metadata.linkedin }}</span
      >
      <span
        v-if="metadata.website && show('showWebsite')"
        class="flex items-center gap-1 text-xs text-gray-500"
        ><Globe :size="11" :style="iconStyle" /> {{ metadata.website }}</span
      >
    </div>
  </template>

  <!-- ── Bold ── -->
  <template v-else-if="headerLayout === 'bold'">
    <h1 class="text-3xl font-black tracking-tight" :style="nameStyle">
      {{ metadata.fullName || 'Your Name' }}
    </h1>
    <div class="h-1 w-16 rounded-full mt-1 mb-2" :style="{ backgroundColor: s.accentColor }" />
    <p v-if="metadata.jobTitle" class="text-sm font-medium mb-2" :style="jobTitleStyle">
      {{ metadata.jobTitle }}
    </p>
    <div class="flex flex-wrap gap-x-4 gap-y-1">
      <span
        v-if="metadata.email && show('showEmail')"
        class="flex items-center gap-1 text-xs text-gray-500"
        ><Mail :size="11" :style="iconStyle" /> {{ metadata.email }}</span
      >
      <span
        v-if="metadata.phone && show('showPhone')"
        class="flex items-center gap-1 text-xs text-gray-500"
        ><Phone :size="11" :style="iconStyle" /> {{ metadata.phone }}</span
      >
      <span
        v-if="metadata.location && show('showLocation')"
        class="flex items-center gap-1 text-xs text-gray-500"
        ><MapPin :size="11" :style="iconStyle" /> {{ metadata.location }}</span
      >
      <span
        v-if="metadata.linkedin && show('showLinkedin')"
        class="flex items-center gap-1 text-xs text-gray-500"
        ><Linkedin :size="11" :style="iconStyle" /> {{ metadata.linkedin }}</span
      >
      <span
        v-if="metadata.website && show('showWebsite')"
        class="flex items-center gap-1 text-xs text-gray-500"
        ><Globe :size="11" :style="iconStyle" /> {{ metadata.website }}</span
      >
    </div>
  </template>

  <!-- ── Classic (default) ── -->
  <template v-else>
    <h1 class="text-2xl font-bold tracking-tight" :style="nameStyle">
      {{ metadata.fullName || 'Your Name' }}
    </h1>
    <p v-if="metadata.jobTitle" class="text-sm font-medium mt-0.5" :style="jobTitleStyle">
      {{ metadata.jobTitle }}
    </p>
    <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2">
      <span
        v-if="metadata.email && show('showEmail')"
        class="flex items-center gap-1 text-xs text-gray-500"
        ><Mail :size="11" :style="iconStyle" /> {{ metadata.email }}</span
      >
      <span
        v-if="metadata.phone && show('showPhone')"
        class="flex items-center gap-1 text-xs text-gray-500"
        ><Phone :size="11" :style="iconStyle" /> {{ metadata.phone }}</span
      >
      <span
        v-if="metadata.location && show('showLocation')"
        class="flex items-center gap-1 text-xs text-gray-500"
        ><MapPin :size="11" :style="iconStyle" /> {{ metadata.location }}</span
      >
      <span
        v-if="metadata.linkedin && show('showLinkedin')"
        class="flex items-center gap-1 text-xs text-gray-500"
        ><Linkedin :size="11" :style="iconStyle" /> {{ metadata.linkedin }}</span
      >
      <span
        v-if="metadata.website && show('showWebsite')"
        class="flex items-center gap-1 text-xs text-gray-500"
        ><Globe :size="11" :style="iconStyle" /> {{ metadata.website }}</span
      >
    </div>
  </template>
</template>
