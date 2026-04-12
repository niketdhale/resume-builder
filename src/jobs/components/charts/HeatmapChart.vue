<script setup>
import { computed } from 'vue'

const props = defineProps({
  jobs: { type: Array, required: true },
})

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Build last 16 weeks of daily application data
const grid = computed(() => {
  const now = new Date()
  // Find start of the week 16 weeks ago
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay() - 15 * 7)
  start.setHours(0, 0, 0, 0)

  // Count applications per day
  const dayMap = {}
  for (const j of props.jobs) {
    if (!j.appliedDate) continue
    const d = new Date(j.appliedDate)
    const key = d.toISOString().slice(0, 10)
    dayMap[key] = (dayMap[key] || 0) + 1
  }

  // Build weeks array
  const weeks = []
  let current = new Date(start)
  while (current <= now) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(current)
      date.setDate(current.getDate() + d)
      const key = date.toISOString().slice(0, 10)
      const isFuture = date > now
      week.push({
        date: key,
        count: isFuture ? -1 : (dayMap[key] || 0),
        isFuture,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      })
    }
    weeks.push(week)
    current.setDate(current.getDate() + 7)
  }
  return weeks
})

// Month labels for x-axis
const monthLabels = computed(() => {
  const labels = []
  let lastMonth = -1
  grid.value.forEach((week, i) => {
    const month = new Date(week[0].date).getMonth()
    if (month !== lastMonth) {
      labels.push({ col: i, label: new Date(week[0].date).toLocaleString('default', { month: 'short' }) })
      lastMonth = month
    } else {
      labels.push(null)
    }
  })
  return labels
})

const maxCount = computed(() => Math.max(1, ...grid.value.flat().map(c => c.count)))

function cellColor(count) {
  if (count < 0) return 'transparent'
  if (count === 0) return 'var(--bg-subtle)'
  const intensity = Math.min(count / Math.max(maxCount.value, 1), 1)
  const opacity = 0.2 + intensity * 0.8
  return `rgba(184,146,58,${opacity})`
}

function cellTitle(cell) {
  if (cell.isFuture) return ''
  if (cell.count === 0) return `${cell.label}: no applications`
  return `${cell.label}: ${cell.count} application${cell.count > 1 ? 's' : ''}`
}
</script>

<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3 class="chart-title">Application Activity</h3>
        <p class="chart-sub">Daily applications over the last 16 weeks</p>
      </div>
      <div class="legend">
        <span class="legend-text">Less</span>
        <div class="legend-cells">
          <div v-for="n in 5" :key="n" class="legend-cell" :style="{ backgroundColor: `rgba(184,146,58,${0.1 + n * 0.18})` }" />
        </div>
        <span class="legend-text">More</span>
      </div>
    </div>

    <div v-if="!jobs.length" class="empty">No applications yet</div>
    <div v-else class="heatmap-wrap">
      <!-- Month row -->
      <div class="month-row">
        <div class="day-labels-spacer" />
        <div v-for="(label, i) in monthLabels" :key="i" class="month-cell">
          <span v-if="label">{{ label.label }}</span>
        </div>
      </div>

      <!-- Grid rows per day of week -->
      <div v-for="(dayName, dayIdx) in DAYS" :key="dayName" class="grid-row">
        <div class="day-label">{{ dayIdx % 2 === 1 ? dayName : '' }}</div>
        <div
          v-for="(week, wi) in grid"
          :key="wi"
          class="grid-cell"
          :style="{ backgroundColor: cellColor(week[dayIdx].count) }"
          :title="cellTitle(week[dayIdx])"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-card {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 1.25rem;
}
.chart-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 1rem; gap: 0.5rem; flex-wrap: wrap;
}
.chart-title { font-size: 0.875rem; font-weight: 600; color: var(--ink); }
.chart-sub   { font-size: 0.75rem; color: var(--ink-3); margin-top: 0.125rem; }

.legend { display: flex; align-items: center; gap: 0.375rem; }
.legend-text  { font-size: 0.625rem; color: var(--ink-3); }
.legend-cells { display: flex; gap: 2px; }
.legend-cell  { width: 10px; height: 10px; border-radius: 2px; }

.empty { font-size: 0.875rem; color: var(--ink-3); text-align: center; padding: 2rem 0; }

.heatmap-wrap { overflow-x: auto; }

.month-row {
  display: flex; align-items: flex-end; margin-bottom: 2px;
}
.day-labels-spacer { width: 28px; flex-shrink: 0; }
.month-cell {
  width: 14px; flex-shrink: 0; margin-right: 2px;
  font-size: 0.5625rem; color: var(--ink-3); white-space: nowrap; overflow: visible;
}

.grid-row { display: flex; align-items: center; gap: 0; margin-bottom: 2px; }
.day-label {
  width: 28px; flex-shrink: 0;
  font-size: 0.5625rem; color: var(--ink-3); text-align: right; padding-right: 4px;
}
.grid-cell {
  width: 12px; height: 12px; border-radius: 2px; flex-shrink: 0;
  margin-right: 2px; cursor: default; transition: opacity 0.1s;
}
.grid-cell:hover { opacity: 0.75; }
</style>
