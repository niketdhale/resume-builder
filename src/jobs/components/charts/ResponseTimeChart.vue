<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  jobs: { type: Array, required: true },
})

const canvas = ref(null)
let chart = null
const isDark = () => document.documentElement.classList.contains('dark')

// Jobs that received a response (not still in 'applied' state)
const responseTimes = computed(() => {
  return props.jobs
    .filter(j => j.status !== 'applied' && j.appliedDate && j.updatedAt)
    .map(j => {
      const applied = new Date(j.appliedDate)
      const updated = new Date(j.updatedAt)
      return Math.max(0, Math.round((updated - applied) / 86400000))
    })
    .filter(d => d >= 0 && d <= 120)
})

// Bucket into ranges: 0–3, 4–7, 8–14, 15–21, 22–30, 31–45, 46–60, 60+
const BUCKETS = [
  { label: '0–3d',   min: 0,  max: 3   },
  { label: '4–7d',   min: 4,  max: 7   },
  { label: '8–14d',  min: 8,  max: 14  },
  { label: '15–21d', min: 15, max: 21  },
  { label: '22–30d', min: 22, max: 30  },
  { label: '31–45d', min: 31, max: 45  },
  { label: '46–60d', min: 46, max: 60  },
  { label: '60d+',   min: 61, max: 9999},
]

const bucketCounts = computed(() =>
  BUCKETS.map(b => responseTimes.value.filter(d => d >= b.min && d <= b.max).length)
)

const avgDays = computed(() => {
  if (!responseTimes.value.length) return null
  const sum = responseTimes.value.reduce((a, b) => a + b, 0)
  return Math.round(sum / responseTimes.value.length)
})

const medianDays = computed(() => {
  if (!responseTimes.value.length) return null
  const sorted = [...responseTimes.value].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
})

async function render() {
  if (!canvas.value) return
  try {
    const { Chart, BarController, CategoryScale, LinearScale, BarElement, Tooltip } = await import('chart.js')
    Chart.register(BarController, CategoryScale, LinearScale, BarElement, Tooltip)
    if (chart) { chart.destroy(); chart = null }

    const dark = isDark()
    const tick = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
    const grid = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'

    chart = new Chart(canvas.value, {
      type: 'bar',
      data: {
        labels: BUCKETS.map(b => b.label),
        datasets: [{
          data: bucketCounts.value,
          backgroundColor: bucketCounts.value.map((_, i) => {
            const opacity = 0.4 + (i / BUCKETS.length) * 0.5
            return `rgba(0,94,180,${opacity})`
          }),
          borderRadius: 5,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => ` ${ctx.raw} application${ctx.raw !== 1 ? 's' : ''}` },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: 10 }, color: tick, maxRotation: 0 },
          },
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: grid },
            ticks: { stepSize: 1, precision: 0, font: { size: 10 }, color: tick },
          },
        },
      },
    })
  } catch { /* chart.js not available */ }
}

onMounted(render)
onUnmounted(() => { chart?.destroy() })
watch(() => props.jobs, render, { deep: true })
const observer = typeof MutationObserver !== 'undefined' ? new MutationObserver(render) : null
onMounted(() => observer?.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] }))
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3 class="chart-title">Response Time</h3>
        <p class="chart-sub">Days from application to first response</p>
      </div>
      <div v-if="avgDays !== null" class="stat-pills">
        <span class="stat-pill">avg <strong>{{ avgDays }}d</strong></span>
        <span class="stat-pill">median <strong>{{ medianDays }}d</strong></span>
      </div>
    </div>
    <div class="canvas-wrap">
      <canvas ref="canvas" />
      <div v-if="!responseTimes.length" class="empty">
        Not enough data yet — responses will appear here
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-card {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 1.25rem; height: 100%;
  display: flex; flex-direction: column;
}
.chart-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 1rem; gap: 0.5rem; flex-wrap: wrap;
}
.chart-title { font-size: 0.875rem; font-weight: 600; color: var(--ink); }
.chart-sub   { font-size: 0.75rem; color: var(--ink-3); margin-top: 0.125rem; }
.stat-pills  { display: flex; gap: 0.375rem; flex-wrap: wrap; }
.stat-pill {
  font-size: 0.6875rem; color: var(--ink-3);
  background: var(--bg-subtle); border: 1px solid var(--border);
  padding: 0.2rem 0.5rem; border-radius: 99px;
}
.stat-pill strong { color: var(--gold); font-weight: 700; }
.canvas-wrap { flex: 1; position: relative; min-height: 160px; }
.empty {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8125rem; color: var(--ink-3); text-align: center; padding: 1rem;
}
</style>
