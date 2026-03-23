<script setup>
import { computed } from 'vue'
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-vue-next'

const props = defineProps({
  metadata:      { type: Object, required: true },
  s:             { type: Object, required: true },
  nameStyle:     { type: Object, default: () => ({}) },
  jobTitleStyle: { type: Object, default: () => ({}) },
  iconStyle:     { type: Object, default: () => ({}) },
  headerLayout:  { type: String, default: 'classic' },
  show:          { type: Function, required: true },
})

// ─── Contact field config ─────────────────────────────────────────────────────
const FIELD_CONFIG = {
  email:    { icon: Mail,     label: (m) => m.email,    href: (m) => `mailto:${m.email}`,                                          show: 'showEmail'    },
  phone:    { icon: Phone,    label: (m) => m.phone,    href: (m) => `tel:${m.phone}`,                                             show: 'showPhone'    },
  location: { icon: MapPin,   label: (m) => m.location, href: () => null,                                                          show: 'showLocation' },
  linkedin: { icon: Linkedin, label: (m) => m.linkedin, href: (m) => `https://${m.linkedin.replace(/^https?:\/\//, '')}`,          show: 'showLinkedin' },
  website:  { icon: Globe,    label: (m) => m.website,  href: (m) => `https://${m.website.replace(/^https?:\/\//, '')}`,           show: 'showWebsite'  },
}

const fieldOrder = computed(() =>
  props.s.headerFieldOrder || ['email', 'phone', 'location', 'linkedin', 'website'],
)
const showIcons = computed(() => props.s.showHeaderIcons !== false)

const contactItems = computed(() =>
  fieldOrder.value
    .map((key) => ({ key, ...FIELD_CONFIG[key] }))
    .filter(({ key, show }) => props.metadata[key] && props.show(show)),
)

// ─── Photo helpers ────────────────────────────────────────────────────────────
const hasPhoto = computed(() => props.metadata.photo && props.s.showPhoto !== false)

const photoSizePx = computed(() => {
  const map = { S: '52px', M: '72px', L: '96px' }
  return map[props.s.photoSize] || '72px'
})

const photoRadius = computed(() => {
  const map = { circle: '50%', rounded: '12px', square: '4px' }
  return map[props.s.photoShape] || '50%'
})

const photoStyle = computed(() => ({
  width:        photoSizePx.value,
  height:       photoSizePx.value,
  borderRadius: photoRadius.value,
  objectFit:    'cover',
  flexShrink:   '0',
  border:       `2px solid ${props.s.borderColor || '#e5e7eb'}`,
}))
</script>

<template>
  <!-- ══ CENTERED — photo above name ══ -->
  <template v-if="headerLayout === 'centered'">
    <div class="flex flex-col items-center text-center gap-1">
      <img v-if="hasPhoto" :src="metadata.photo" alt="Profile photo" :style="photoStyle" class="mb-2" />
      <h1 class="text-2xl font-bold tracking-tight" :style="nameStyle">
        {{ metadata.fullName || 'Your Name' }}
      </h1>
      <p v-if="metadata.jobTitle" class="text-sm font-medium" :style="jobTitleStyle">
        {{ metadata.jobTitle }}
      </p>
      <div class="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
        <component
          v-for="item in contactItems" :key="item.key"
          :is="item.href(metadata) ? 'a' : 'span'"
          :href="item.href(metadata) || undefined"
          target="_blank" rel="noopener noreferrer"
          class="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          <component v-if="showIcons" :is="item.icon" :size="11" :style="iconStyle" />
          {{ item.label(metadata) }}
        </component>
      </div>
    </div>
  </template>

  <!-- ══ COMPACT — photo left of name row ══ -->
  <template v-else-if="headerLayout === 'compact'">
    <div class="flex items-center gap-3">
      <img v-if="hasPhoto" :src="metadata.photo" alt="Profile photo" :style="photoStyle" />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 flex-wrap">
          <h1 class="text-lg font-bold tracking-tight" :style="nameStyle">
            {{ metadata.fullName || 'Your Name' }}
          </h1>
          <span v-if="metadata.jobTitle" class="text-gray-300">|</span>
          <p v-if="metadata.jobTitle" class="text-sm font-medium" :style="jobTitleStyle">
            {{ metadata.jobTitle }}
          </p>
        </div>
        <div class="flex flex-wrap gap-x-4 gap-y-1 mt-1">
          <component
            v-for="item in contactItems" :key="item.key"
            :is="item.href(metadata) ? 'a' : 'span'"
            :href="item.href(metadata) || undefined"
            target="_blank" rel="noopener noreferrer"
            class="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <component v-if="showIcons" :is="item.icon" :size="11" :style="iconStyle" />
            {{ item.label(metadata) }}
          </component>
        </div>
      </div>
    </div>
  </template>

  <!-- ══ BOLD — photo right of name block ══ -->
  <template v-else-if="headerLayout === 'bold'">
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <h1 class="text-3xl font-black tracking-tight" :style="nameStyle">
          {{ metadata.fullName || 'Your Name' }}
        </h1>
        <div class="h-1 w-16 rounded-full mt-1 mb-2" :style="{ backgroundColor: s.accentColor }" />
        <p v-if="metadata.jobTitle" class="text-sm font-medium mb-2" :style="jobTitleStyle">
          {{ metadata.jobTitle }}
        </p>
        <div class="flex flex-wrap gap-x-4 gap-y-1">
          <component
            v-for="item in contactItems" :key="item.key"
            :is="item.href(metadata) ? 'a' : 'span'"
            :href="item.href(metadata) || undefined"
            target="_blank" rel="noopener noreferrer"
            class="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <component v-if="showIcons" :is="item.icon" :size="11" :style="iconStyle" />
            {{ item.label(metadata) }}
          </component>
        </div>
      </div>
      <img v-if="hasPhoto" :src="metadata.photo" alt="Profile photo" :style="photoStyle" />
    </div>
  </template>

  <!-- ══ CLASSIC (default) — photo top-right ══ -->
  <template v-else>
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <h1 class="text-2xl font-bold tracking-tight" :style="nameStyle">
          {{ metadata.fullName || 'Your Name' }}
        </h1>
        <p v-if="metadata.jobTitle" class="text-sm font-medium mt-0.5" :style="jobTitleStyle">
          {{ metadata.jobTitle }}
        </p>
        <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          <component
            v-for="item in contactItems" :key="item.key"
            :is="item.href(metadata) ? 'a' : 'span'"
            :href="item.href(metadata) || undefined"
            target="_blank" rel="noopener noreferrer"
            class="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <component v-if="showIcons" :is="item.icon" :size="11" :style="iconStyle" />
            {{ item.label(metadata) }}
          </component>
        </div>
      </div>
      <img v-if="hasPhoto" :src="metadata.photo" alt="Profile photo" :style="photoStyle" />
    </div>
  </template>
</template>
