<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { JOB_STATUSES } from '../../composables/useJobState'

const props = defineProps({
  jobs: { type: Array, required: true },
})

const canvas = ref(null)
let chart = null

const isDark = () => document.documentElement.classList.contains('dark')

const statusData = computed(() =>
  JOB_STATUSES.map(s => ({
    label: s.label,
    count: props.jobs.filter(j => j.status === s.value).length,
    color: s.dot,
  })).filter(s => s.count > 0)
)

async function render() {
  if (!canvas.value || !statusData.value.length) return
  try {
    const { Chart, DoughnutController, ArcElement, Tooltip, Legend } = await import('chart.js')
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend)
    if (chart) { chart.destroy(); chart = null }

    const dark = isDark()
    chart = new Chart(canvas.value, {
      type: 'doughnut',
      data: {
        labels: statusData.value.map(s => s.label),
        datasets: [{
          data: statusData.value.map(s => s.count),
          backgroundColor: statusData.value.map(s => s.color + 'cc'),
          borderColor: statusData.value.map(s => s.color),
          borderWidth: 2,
          hoverBorderWidth: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 11 },
              color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
              padding: 14,
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: false,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.raw} (${Math.round(ctx.raw / props.jobs.length * 100)}%)`,
            },
          },
        },
      },
    })
  } catch { /* chart.js not available */ }
}

onMounted(render)
onUnmounted(() => { chart?.destroy() })
watch(() => props.jobs, render, { deep: true })

const observer = typeof MutationObserver !== 'undefined'
  ? new MutationObserver(render) : null
onMounted(() => observer?.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] }))
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3 class="chart-title">Status Breakdown</h3>
        <p class="chart-sub">Current pipeline composition</p>
      </div>
      <span class="total-badge">{{ jobs.length }} total</span>
    </div>
    <div class="canvas-wrap">
      <canvas ref="canvas" />
      <div v-if="!jobs.length" class="empty">No applications yet</div>
    </div>
  </div>
</template>

<style scoped>
.chart-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
  height: 100%;
  display: flex; flex-direction: column;
}
.chart-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 1rem; gap: 0.5rem;
}
.chart-title { font-size: 0.875rem; font-weight: 600; color: var(--ink); }
.chart-sub   { font-size: 0.75rem; color: var(--ink-3); margin-top: 0.125rem; }
.total-badge {
  font-size: 0.6875rem; font-weight: 600; padding: 0.2rem 0.5rem;
  background: var(--gold-bg); color: var(--gold);
  border: 1px solid rgba(0,94,180,0.2); border-radius: 99px; white-space: nowrap;
}
.canvas-wrap { flex: 1; position: relative; min-height: 200px; }
.canvas-wrap canvas { width: 100% !important; }
.empty {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.875rem; color: var(--ink-3);
}
</style>
