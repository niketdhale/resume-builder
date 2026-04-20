<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  jobs: { type: Array, required: true },
})

const canvas = ref(null)
let chart = null
const isDark = () => document.documentElement.classList.contains('dark')

const salaries = computed(() =>
  props.jobs
    .map(j => Number(j.salary))
    .filter(s => s > 0 && s < 10_000_000)
)

// Auto-detect if values look like annual (> 1000) or hourly/monthly
// Build smart buckets based on data range
const buckets = computed(() => {
  if (!salaries.value.length) return []
  const min = Math.min(...salaries.value)
  const max = Math.max(...salaries.value)
  const range = max - min

  // Round to nice bucket sizes
  const rawStep = range / 7
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const step = Math.ceil(rawStep / magnitude) * magnitude || 10000

  const start = Math.floor(min / step) * step
  const bkts = []
  for (let lo = start; lo <= max; lo += step) {
    const hi = lo + step
    bkts.push({
      label: lo >= 1000 ? `${(lo / 1000).toFixed(0)}k` : String(lo),
      min: lo,
      max: hi,
      count: salaries.value.filter(s => s >= lo && s < hi).length,
    })
  }
  return bkts
})

const avgSalary = computed(() => {
  if (!salaries.value.length) return null
  return Math.round(salaries.value.reduce((a, b) => a + b, 0) / salaries.value.length)
})

const currency = computed(() => props.jobs.find(j => j.salary)?.currency || '$')

async function render() {
  if (!canvas.value || !buckets.value.length) return
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
        labels: buckets.value.map(b => b.label),
        datasets: [{
          data: buckets.value.map(b => b.count),
          backgroundColor: 'rgba(0,94,180,0.65)',
          hoverBackgroundColor: 'rgba(0,94,180,0.9)',
          borderRadius: 5,
          borderSkipped: false,
          barPercentage: 0.9,
          categoryPercentage: 0.9,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: ctx => `${currency.value}${buckets.value[ctx[0].dataIndex].min.toLocaleString()} – ${currency.value}${buckets.value[ctx[0].dataIndex].max.toLocaleString()}`,
              label: ctx => ` ${ctx.raw} role${ctx.raw !== 1 ? 's' : ''}`,
            },
          },
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10 }, color: tick } },
          y: { beginAtZero: true, border: { display: false }, grid: { color: grid }, ticks: { stepSize: 1, precision: 0, font: { size: 10 }, color: tick } },
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
        <h3 class="chart-title">Salary Distribution</h3>
        <p class="chart-sub">Range of salaries across applications</p>
      </div>
      <span v-if="avgSalary" class="avg-badge">
        avg {{ currency }}{{ avgSalary >= 1000 ? (avgSalary / 1000).toFixed(0) + 'k' : avgSalary }}
      </span>
    </div>
    <div class="canvas-wrap">
      <canvas ref="canvas" />
      <div v-if="!salaries.length" class="empty">No salary data yet</div>
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
.avg-badge {
  font-size: 0.6875rem; font-weight: 600; padding: 0.2rem 0.5rem;
  background: var(--gold-bg); color: var(--gold);
  border: 1px solid rgba(0,94,180,0.2); border-radius: 99px; white-space: nowrap;
}
.canvas-wrap { flex: 1; position: relative; min-height: 160px; }
.empty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; color: var(--ink-3); }
</style>
