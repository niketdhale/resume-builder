<script setup>
import { ref } from 'vue'
import TimelineChart     from './charts/TimelineChart.vue'
import SankeyChart       from './charts/SankeyChart.vue'
import FunnelChart       from './charts/FunnelChart.vue'
import DonutChart        from './charts/DonutChart.vue'
import ResponseTimeChart from './charts/ResponseTimeChart.vue'
import CompanyChart      from './charts/CompanyChart.vue'
import HeatmapChart      from './charts/HeatmapChart.vue'
import SalaryChart       from './charts/SalaryChart.vue'
import DayOfWeekChart    from './charts/DayOfWeekChart.vue'

defineProps({
  jobs: { type: Array, required: true },
})

// Collapsible sections
const open = ref({ t1: true, t2: true, t3: false })
function toggle(key) { open.value[key] = !open.value[key] }
</script>

<template>
  <div class="charts-panel">

    <!-- ── Tier 1 ──────────────────────────────────────────────── -->
    <section class="chart-section">
      <button class="section-header" @click="toggle('t1')">
        <span class="section-title">Overview</span>
        <span class="section-meta">Applications over time · Pipeline funnel · Status breakdown</span>
        <svg class="chevron" :class="{ 'chevron--open': open.t1 }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      <Transition name="section">
        <div v-show="open.t1" class="section-body">
          <!-- Timeline: full width -->
          <div class="row-full">
            <TimelineChart :jobs="jobs" />
          </div>
          <!-- Sankey: full width -->
          <div class="row-full">
            <SankeyChart :jobs="jobs" />
          </div>
          <!-- Funnel + Donut: 2 cols -->
          <div class="row-2col">
            <FunnelChart :jobs="jobs" />
            <DonutChart  :jobs="jobs" />
          </div>
        </div>
      </Transition>
    </section>

    <!-- ── Tier 2 ──────────────────────────────────────────────── -->
    <section class="chart-section">
      <button class="section-header" @click="toggle('t2')">
        <span class="section-title">Deep Dive</span>
        <span class="section-meta">Response time · Top companies · Activity heatmap</span>
        <svg class="chevron" :class="{ 'chevron--open': open.t2 }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      <Transition name="section">
        <div v-show="open.t2" class="section-body">
          <div class="row-2col">
            <ResponseTimeChart :jobs="jobs" />
            <CompanyChart      :jobs="jobs" />
          </div>
          <div class="row-full">
            <HeatmapChart :jobs="jobs" />
          </div>
        </div>
      </Transition>
    </section>

    <!-- ── Tier 3 ──────────────────────────────────────────────── -->
    <section class="chart-section">
      <button class="section-header" @click="toggle('t3')">
        <span class="section-title">Advanced</span>
        <span class="section-meta">Salary distribution · Best day to apply</span>
        <svg class="chevron" :class="{ 'chevron--open': open.t3 }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      <Transition name="section">
        <div v-show="open.t3" class="section-body">
          <div class="row-2col">
            <SalaryChart    :jobs="jobs" />
            <DayOfWeekChart :jobs="jobs" />
          </div>
        </div>
      </Transition>
    </section>

  </div>
</template>

<style scoped>
.charts-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.chart-section {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
}

.section-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}
.section-header:hover { background: var(--bg-subtle); }

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap;
}
.section-meta {
  font-size: 0.75rem;
  color: var(--ink-3);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chevron {
  color: var(--ink-3);
  flex-shrink: 0;
  transition: transform 0.2s;
}
.chevron--open { transform: rotate(180deg); }

.section-body {
  padding: 0 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.row-full { }

.row-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
@media (max-width: 768px) {
  .row-2col { grid-template-columns: 1fr; }
}

/* Transition */
.section-enter-active,
.section-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.section-enter-from,
.section-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
