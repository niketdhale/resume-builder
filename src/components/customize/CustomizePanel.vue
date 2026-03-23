<script setup>
import { ref } from 'vue'
import BasicsTab from './BasicsTab.vue'
import LayoutTab from './LayoutTab.vue'
import DesignTab from './DesignTab.vue'
import HeaderTab from './HeaderTab.vue'
import SectionsTab from './SectionsTab.vue'
import TemplatesTab from './TemplatesTab.vue'

const activeSubTab = ref('templates')

const subTabs = [
  { value: 'templates', label: 'Templates' },
  { value: 'basics',   label: 'Basics'    },
  { value: 'layout',   label: 'Layout'    },
  { value: 'design',   label: 'Design'    },
  { value: 'header',   label: 'Header'    },
  { value: 'sections', label: 'Sections'  },
]
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- Sub-tabs -->
    <div
      class="flex items-center gap-1 px-3 pt-3 pb-0 border-b border-gray-100 dark:border-gray-700 overflow-x-auto scrollbar-hide flex-shrink-0"
    >
      <button
        v-for="tab in subTabs"
        :key="tab.value"
        @click="activeSubTab = tab.value"
        :class="[
          'flex-shrink-0 px-3 py-2 text-xs font-medium rounded-t-md border-b-2 transition-colors whitespace-nowrap',
          activeSubTab === tab.value
            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50',
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab content -->
    <div class="flex-1 overflow-y-auto">
      <TemplatesTab v-if="activeSubTab === 'templates'" />
      <BasicsTab v-else-if="activeSubTab === 'basics'" />
      <LayoutTab v-else-if="activeSubTab === 'layout'" />
      <DesignTab v-else-if="activeSubTab === 'design'" />
      <HeaderTab v-else-if="activeSubTab === 'header'" />
      <SectionsTab v-else-if="activeSubTab === 'sections'" />
    </div>
  </div>
</template>
