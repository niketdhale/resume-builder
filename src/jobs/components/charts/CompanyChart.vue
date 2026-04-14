<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  jobs: { type: Array, required: true },
})

const canvas = ref(null)
let chart = null
const isDark = () => document.documentElement.classList.contains('dark')

// Top companies by application count
const topCompanies = computed(() => {
  const map = {}
  for (const j of props.jobs) {
    const name = j.company?.trim() || 'Unknown'
    if (!map[name]) map[name] = { total: 0, offers: 0, interviews: 0 }
    map[name].total++
    if (j.status === 'offer') map[name].offers++
    if (j.status === 'interview' || j.status === 'offer') map[name].interviews++
  }
  return Object.entries(map)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
})

async function render() {
  if (!canvas.value || !topCompanies.value.length) return
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
        labels: topCompanies.value.map(c => c.name),
        datasets: [
          {
            label: 'Applications',
            data: topCompanies.value.map(c => c.total),
            backgroundColor: 'rgba(0,94,180,0.55)',
            borderRadius: { topRight: 4, bottomRight: 4, topLeft: 0, bottomLeft: 0 },
            borderSkipped: false,
            stack: 'stack',
          },
        ],
      },
      options: {
        indexAxis: 'y',
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
            beginAtZero: true,
            border: { display: false },
            grid: { color: grid },
            ticks: { stepSize: 1, precision: 0, font: { size: 10 }, color: tick },
          },
          y: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: 11 }, color: tick, maxRotation: 0 },
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
        <h3 class="chart-title">Top Companies</h3>
        <p class="chart-sub">Most-applied companies</p>
      </div>
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
.chart-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem; gap: 0.5rem; }
.chart-title { font-size: 0.875rem; font-weight: 600; color: var(--ink); }
.chart-sub   { font-size: 0.75rem; color: var(--ink-3); margin-top: 0.125rem; }
.canvas-wrap { flex: 1; position: relative; min-height: 200px; }
.empty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; color: var(--ink-3); }
</style>
