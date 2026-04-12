<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  jobs: { type: Array, required: true },
})

const canvas = ref(null)
let chartInstance = null

const isDark = () => document.documentElement.classList.contains('dark')

const chartData = computed(() => {
  const weeks = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - i * 7 - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weeks.push({ start: weekStart, end: weekEnd })
  }

  return weeks.map((week) => {
    const applied = props.jobs.filter((j) => {
      const d = new Date(j.appliedDate)
      return d >= week.start && d <= week.end
    }).length

    const responses = props.jobs.filter((j) => {
      const d = new Date(j.updatedAt)
      return ['screening', 'interview', 'offer'].includes(j.status) && d >= week.start && d <= week.end
    }).length

    const monthLabel = week.start.toLocaleDateString('en-US', { month: 'short' })
    return { applied, responses, weekStart: week.start, monthLabel }
  })
})

const xLabels = computed(() => {
  const seen = new Set()
  return chartData.value.map(w => {
    if (!seen.has(w.monthLabel)) { seen.add(w.monthLabel); return w.monthLabel }
    return ''
  })
})

async function renderChart() {
  if (!canvas.value) return
  try {
    const { Chart, BarController, CategoryScale, LinearScale, BarElement, Tooltip } = await import('chart.js')
    Chart.register(BarController, CategoryScale, LinearScale, BarElement, Tooltip)
    if (chartInstance) { chartInstance.destroy(); chartInstance = null }

    const dark        = isDark()
    const tickColor   = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
    const gridColor   = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
    // Gold palette
    const appliedBg   = dark ? 'rgba(184,146,58,0.55)' : 'rgba(184,146,58,0.65)'
    const responsesBg = dark ? 'rgba(184,146,58,0.9)'  : 'rgba(184,146,58,1)'

    chartInstance = new Chart(canvas.value, {
      type: 'bar',
      data: {
        labels: xLabels.value,
        datasets: [
          {
            label: 'Responses',
            data: chartData.value.map(w => w.responses),
            backgroundColor: responsesBg,
            borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
            borderSkipped: false,
            stack: 'stack',
            barPercentage: 0.85,
            categoryPercentage: 0.92,
          },
          {
            label: 'Applied',
            data: chartData.value.map(w => w.applied),
            backgroundColor: appliedBg,
            borderRadius: 0,
            borderSkipped: false,
            stack: 'stack',
            barPercentage: 0.85,
            categoryPercentage: 0.92,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title: (items) => {
                const idx = items[0]?.dataIndex
                if (idx == null) return ''
                return chartData.value[idx].weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              },
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: 11 }, color: tickColor, maxRotation: 0, autoSkip: false },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            max: Math.max(...chartData.value.map(w => w.applied + w.responses), 3) + 1,
            border: { display: false },
            grid: { color: gridColor },
            ticks: { stepSize: 1, precision: 0, font: { size: 10 }, color: tickColor },
          },
        },
      },
    })
  } catch {
    // chart.js not installed
  }
}

onMounted(renderChart)
onUnmounted(() => { if (chartInstance) chartInstance.destroy() })
watch(() => props.jobs, renderChart, { deep: true })

const observer = typeof MutationObserver !== 'undefined'
  ? new MutationObserver(renderChart) : null
onMounted(() => observer?.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] }))
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3 class="chart-title">Applications Over Time</h3>
        <p class="chart-sub">Last 12 weeks</p>
      </div>
      <div class="chart-legend">
        <div class="legend-item">
          <div class="legend-dot legend-dot--dim" />
          <span class="legend-label">Applied</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot legend-dot--solid" />
          <span class="legend-label">Responses</span>
        </div>
        <span class="legend-soon">📊 More charts coming soon</span>
      </div>
    </div>
    <div class="chart-canvas-wrap">
      <canvas ref="canvas" />
      <div v-if="jobs.length === 0" class="chart-empty">No data yet</div>
    </div>
  </div>
</template>

<style scoped>
.chart-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
}
.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;
  flex-wrap: wrap;
}
.chart-title { font-size: 0.875rem; font-weight: 600; color: var(--ink); }
.chart-sub   { font-size: 0.75rem; color: var(--ink-3); margin-top: 0.125rem; }

.chart-legend {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.legend-item { display: flex; align-items: center; gap: 0.375rem; }
.legend-dot  { width: 12px; height: 12px; border-radius: 3px; }
.legend-dot--dim   { background: rgba(184,146,58,0.55); }
.legend-dot--solid { background: var(--gold); }
.legend-label { font-size: 0.75rem; color: var(--ink-3); }

.legend-soon {
  font-size: 0.75rem;
  color: var(--ink-3);
  border: 1px solid var(--border);
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
}

.chart-canvas-wrap { height: 160px; position: relative; }
.chart-empty {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; color: var(--ink-3);
}
</style>
