<script setup>
import { computed } from 'vue'
import ResumeHeader from './ResumeHeader.vue'
import SectionContent from './SectionContent.vue'

const props = defineProps({
  pageSize: { type: String, default: 'A4' },
  isFirstPage: { type: Boolean, default: true },
  sections: { type: Array, default: () => [] },
  s: { type: Object, required: true },
  headingStyle: { type: Object, default: () => ({}) },
  nameStyle: { type: Object, default: () => ({}) },
  jobTitleStyle: { type: Object, default: () => ({}) },
  iconStyle: { type: Object, default: () => ({}) },
  headerPos: { type: String, default: 'top' },
  headerLayout: { type: String, default: 'classic' },
  isTwoCol: { type: Boolean, default: false },
  isMixCol: { type: Boolean, default: false },
  show: { type: Function, required: true },
  sectionContentProps: { type: Object, required: true },
  metadata: { type: Object, default: () => ({}) },
})

const pageSizeConfig = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  Letter: { width: 216, height: 279 },
  Legal: { width: 216, height: 356 },
}

const pageStyle = computed(() => {
  const config = pageSizeConfig[props.pageSize] || pageSizeConfig.A4
  return {
    width: '100%',
    aspectRatio: `${config.width} / ${config.height}`,
    padding: `${props.s.marginY}mm ${props.s.marginX}mm`,
    fontFamily: props.s.fontFamily + ', sans-serif',
    fontSize: props.s.fontSize + 'pt',
    lineHeight: props.s.lineHeight,
    boxSizing: 'border-box',
    overflow: 'hidden',
  }
})

const evenSections = computed(() => props.sections.filter((_, i) => i % 2 === 0))
const oddSections = computed(() => props.sections.filter((_, i) => i % 2 !== 0))
</script>

<template>
  <div
    class="resume-page bg-white shadow-md rounded-lg text-gray-800 print:shadow-none print:rounded-none print:break-after-page"
    :style="pageStyle"
  >
    <!-- ══ HEADER LEFT ══ -->
    <template v-if="isFirstPage && headerPos === 'left'">
      <div class="flex gap-4 h-full">
        <div
          class="w-2/5 pr-4 flex-shrink-0"
          :style="{ borderRight: `2px solid ${s.borderColor}` }"
        >
          <ResumeHeader
            :metadata="metadata"
            :s="s"
            :nameStyle="nameStyle"
            :jobTitleStyle="jobTitleStyle"
            :iconStyle="iconStyle"
            headerLayout="classic"
            :show="show"
          />
        </div>
        <div
          class="w-3/5 flex flex-col overflow-hidden"
          :style="{ gap: s.entrySpacing * 2 + 'px' }"
        >
          <div v-for="section in sections" :key="section.id">
            <span :style="headingStyle">{{ section.title }}</span>
            <SectionContent :section="section" v-bind="sectionContentProps" />
          </div>
        </div>
      </div>
    </template>

    <!-- ══ HEADER RIGHT ══ -->
    <template v-else-if="isFirstPage && headerPos === 'right'">
      <div class="flex gap-4 h-full">
        <div
          class="w-3/5 flex flex-col overflow-hidden"
          :style="{ gap: s.entrySpacing * 2 + 'px' }"
        >
          <div v-for="section in sections" :key="section.id">
            <span :style="headingStyle">{{ section.title }}</span>
            <SectionContent :section="section" v-bind="sectionContentProps" />
          </div>
        </div>
        <div class="w-2/5 pl-4 flex-shrink-0" :style="{ borderLeft: `2px solid ${s.borderColor}` }">
          <ResumeHeader
            :metadata="metadata"
            :s="s"
            :nameStyle="nameStyle"
            :jobTitleStyle="jobTitleStyle"
            :iconStyle="iconStyle"
            headerLayout="classic"
            :show="show"
          />
        </div>
      </div>
    </template>

    <!-- ══ HEADER TOP ══ -->
    <template v-else>
      <!-- Header — first page only -->
      <div
        v-if="isFirstPage"
        class="mb-4 pb-4 flex-shrink-0"
        :style="{ borderBottom: `2px solid ${s.borderColor}` }"
      >
        <ResumeHeader
          :metadata="metadata"
          :s="s"
          :nameStyle="nameStyle"
          :jobTitleStyle="jobTitleStyle"
          :iconStyle="iconStyle"
          :headerLayout="headerLayout"
          :show="show"
        />
      </div>

      <!-- Two columns -->
      <div v-if="isTwoCol" class="grid grid-cols-2 gap-4">
        <div class="flex flex-col" :style="{ gap: s.entrySpacing * 2 + 'px' }">
          <div v-for="section in evenSections" :key="section.id">
            <span :style="headingStyle">{{ section.title }}</span>
            <SectionContent :section="section" v-bind="sectionContentProps" />
          </div>
        </div>
        <div class="flex flex-col" :style="{ gap: s.entrySpacing * 2 + 'px' }">
          <div v-for="section in oddSections" :key="section.id">
            <span :style="headingStyle">{{ section.title }}</span>
            <SectionContent :section="section" v-bind="sectionContentProps" />
          </div>
        </div>
      </div>

      <!-- Mix columns -->
      <div v-else-if="isMixCol" class="grid gap-4" style="grid-template-columns: 2fr 3fr">
        <div class="flex flex-col" :style="{ gap: s.entrySpacing * 2 + 'px' }">
          <div v-for="section in evenSections" :key="section.id">
            <span :style="headingStyle">{{ section.title }}</span>
            <SectionContent :section="section" v-bind="sectionContentProps" />
          </div>
        </div>
        <div class="flex flex-col" :style="{ gap: s.entrySpacing * 2 + 'px' }">
          <div v-for="section in oddSections" :key="section.id">
            <span :style="headingStyle">{{ section.title }}</span>
            <SectionContent :section="section" v-bind="sectionContentProps" />
          </div>
        </div>
      </div>

      <!-- One column -->
      <div v-else class="flex flex-col" :style="{ gap: s.entrySpacing * 2 + 'px' }">
        <div v-for="section in sections" :key="section.id">
          <span :style="headingStyle">{{ section.title }}</span>
          <SectionContent :section="section" v-bind="sectionContentProps" />
        </div>
      </div>
    </template>
  </div>
</template>
