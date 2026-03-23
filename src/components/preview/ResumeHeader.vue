<script setup>
import { computed } from 'vue'
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-vue-next'

const props = defineProps({
  metadata: { type: Object, required: true },
  s:        { type: Object, required: true },
  nameStyle:     { type: Object, default: () => ({}) },
  jobTitleStyle: { type: Object, default: () => ({}) },
  iconStyle:     { type: Object, default: () => ({}) },
  headerLayout:  { type: String, default: 'classic' },
  show:          { type: Function, required: true },
})

// ─── Contact field config ─────────────────────────────────────────────────────
const FIELD_CONFIG = {
  email:    { icon: Mail,     label: (m) => m.email,    href: (m) => `mailto:${m.email}`,           show: 'showEmail'    },
  phone:    { icon: Phone,    label: (m) => m.phone,    href: (m) => `tel:${m.phone}`,               show: 'showPhone'    },
  location: { icon: MapPin,   label: (m) => m.location, href: () => null,                            show: 'showLocation' },
  linkedin: { icon: Linkedin, label: (m) => m.linkedin, href: (m) => `https://${m.linkedin.replace(/^https?:\/\//, '')}`, show: 'showLinkedin' },
  website:  { icon: Globe,    label: (m) => m.website,  href: (m) => `https://${m.website.replace(/^https?:\/\//, '')}`,  show: 'showWebsite'  },
}

// Order from settings, fallback to default order
const fieldOrder = computed(() =>
  props.s.headerFieldOrder || ['email', 'phone', 'location', 'linkedin', 'website'],
)

const showIcons = computed(() => props.s.showHeaderIcons !== false)

// Build visible contact items in drag order
const contactItems = computed(() =>
  fieldOrder.value
    .map((key) => ({ key, ...FIELD_CONFIG[key] }))
    .filter(({ key, show }) => props.metadata[key] && props.show(show)),
)
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
        <component
          v-for="item in contactItems"
          :key="item.key"
          :is="item.href(metadata) ? 'a' : 'span'"
          :href="item.href(metadata) || undefined"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          :style="item.href(metadata) ? { cursor: 'pointer' } : {}"
        >
          <component v-if="showIcons" :is="item.icon" :size="11" :style="iconStyle" />
          {{ item.label(metadata) }}
        </component>
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
      <component
        v-for="item in contactItems"
        :key="item.key"
        :is="item.href(metadata) ? 'a' : 'span'"
        :href="item.href(metadata) || undefined"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        <component v-if="showIcons" :is="item.icon" :size="11" :style="iconStyle" />
        {{ item.label(metadata) }}
      </component>
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
      <component
        v-for="item in contactItems"
        :key="item.key"
        :is="item.href(metadata) ? 'a' : 'span'"
        :href="item.href(metadata) || undefined"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        <component v-if="showIcons" :is="item.icon" :size="11" :style="iconStyle" />
        {{ item.label(metadata) }}
      </component>
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
      <component
        v-for="item in contactItems"
        :key="item.key"
        :is="item.href(metadata) ? 'a' : 'span'"
        :href="item.href(metadata) || undefined"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        <component v-if="showIcons" :is="item.icon" :size="11" :style="iconStyle" />
        {{ item.label(metadata) }}
      </component>
    </div>
  </template>
</template>
