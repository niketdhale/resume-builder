<script setup>
const props  = defineProps({ activePanel: String })
const emit   = defineEmits(['update:activePanel'])

const tabs = [
  { id: 'content',   label: 'Content',   icon: '📝' },
  { id: 'customize', label: 'Style',     icon: '🎨' },
  { id: 'preview',   label: 'Preview',   icon: '👁' },
]
</script>

<template>
  <!-- Fixed bottom tab bar — mobile only (lg+ hides via parent) -->
  <div class="flex border-t bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 flex-shrink-0">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      @click="emit('update:activePanel', tab.id)"
      :class="[
        'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition',
        activePanel === tab.id
          ? 'text-indigo-600 dark:text-indigo-400'
          : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300',
      ]"
    >
      <span class="text-lg leading-none">{{ tab.icon }}</span>
      {{ tab.label }}
    </button>
  </div>
</template>
