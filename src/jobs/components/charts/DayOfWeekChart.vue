<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  jobs: { type: Array, required: true },
})

const canvas = ref(null)
let chart = null
const isDark = () => document.documentElement.classList.contains('dark')

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const dayStats = computed(() => {
  const applied  = Array(7).fill(0)
  const responded = Array(7).fill(0)

  for (const j of props.jobs) {
    if (j.appliedDate) {
      const day = new Date(j.appliedDate).getDay()
      applied[day]++
    }
    if (j.updatedAt && j.status !== 'applied') {
      const day = new Date(j.updatedAt).getDay()
      responded[day]++
    }
  }

  return { applied, responded }
})

// Best day to apply (highest response rate)
const bestDay = computed(() => {
  const { applied, responded } = dayStats.value
  let best = -1, bestRate = -1
  for (let i = 0; i < 7; i++) {
    if (applied[i] > 0) {
      const rate = responded[i] / applied[i]
      if (rate > bestRate) { bestRate = rate; best = i }
    }
  }
  return best >= 0 ? { day: DAYS[best], rate: Math.round(bestRate * 100) } : null
})

async function render() {
  if (!canvas.value) return
  try {
    const { Chart, BarController, CategoryScale, LinearScale, BarElement, Tooltip, Legend } = await import('chart.js')
    Chart.register(BarController, CategoryScale, LinearScale, BarElement, Tooltip, Legend)
    if (chart) { chart.destroy(); chart = null }

    const dark = isDark()
    const tick = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
    const grid = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'

    chart = new Chart(canvas.value, {
      type: 'bar',
      data: {
        labels: SHORT,
        datasets: [
          {
            label: 'Applied',
            data: dayStats.value.applied,
            backgroundColor: 'rgba(184,146,58,0.45)',
            borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 },
            borderSkipped: false,
            stack: 'stack',
            barPercentage: 0.7,
          },
          {
            label: 'Responses',
            data: dayStats.value.responded,
            backgroundColor: 'rgba(184,146,58,0.9)',
            borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
            borderSkipped: false,
            stack: 'stack',
            barPercentage: 0.7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 11 },
              color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
              padding: 12,
              usePointStyle: true,
              pointStyleWidth: 8,
            },
          },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: { stacked: true, grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 }, color: tick } },
          y: { stacked: true, beginAtZero: true, border: { display: false }, grid: { color: grid }, ticks: { stepSize: 1, precision: 0, font: { size: 10 }, color: tick } },
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
        <h3 class="chart-title">Best Day to Apply</h3>
        <p class="chart-sub">Applications vs responses by day of week</p>
      </div>
      <span v-if="bestDay" class="best-day-badge">
        🏆 {{ bestDay.day }} ({{ bestDay.rate }}% response)
      </span>
    </div>
    <div class="canvas-wrap">
      <canvas ref="canvas" />
      <div v-if="!jobs.length" class="empty">No applications yet</div>
    </div>
  </div>
</template>

<style scoped>
.chart-card {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 1.25rem; height: 100%;
  display: flex; flex-direction: column;
}
.chart-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem; gap: 0.5rem; flex-wrap: wrap; }
.chart-title { font-size: 0.875rem; font-weight: 600; color: var(--ink); }
.chart-sub   { font-size: 0.75rem; color: var(--ink-3); margin-top: 0.125rem; }
.best-day-badge {
  font-size: 0.6875rem; font-weight: 500; padding: 0.2rem 0.6rem;
  background: var(--gold-bg); color: var(--gold);
  border: 1px solid rgba(184,146,58,0.2); border-radius: 99px; white-space: nowrap;
}
.canvas-wrap { flex: 1; position: relative; min-height: 180px; }
.empty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; color: var(--ink-3); }
</style>
