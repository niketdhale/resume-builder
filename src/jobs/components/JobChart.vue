<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  jobs: { type: Array, required: true },
})

const canvas = ref(null)
let chartInstance = null

const isDark = () => document.documentElement.classList.contains('dark')

// Build last 12 weeks — stacked: Applied on bottom, Responses on top
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

    // Label: show month only when it changes
    const monthLabel = week.start.toLocaleDateString('en-US', { month: 'short' })

    return { applied, responses, weekStart: week.start, monthLabel }
  })
})

// Deduplicate month labels — only show on first week of each month
const xLabels = computed(() => {
  const seen = new Set()
  return chartData.value.map(w => {
    if (!seen.has(w.monthLabel)) {
      seen.add(w.monthLabel)
      return w.monthLabel
    }
    return ''
  })
})

async function renderChart() {
  if (!canvas.value) return
  try {
    const { Chart, BarController, CategoryScale, LinearScale, BarElement, Tooltip } = await import('chart.js')
    Chart.register(BarController, CategoryScale, LinearScale, BarElement, Tooltip)
    if (chartInstance) { chartInstance.destroy(); chartInstance = null }

    const dark       = isDark()
    const tickColor  = dark ? '#6b7280' : '#9ca3af'
    const gridColor  = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
    const appliedBg  = dark ? 'rgba(165,180,252,0.7)' : 'rgba(165,180,252,0.85)'
    const responsesBg = dark ? 'rgba(110,231,183,0.7)' : 'rgba(110,231,183,0.85)'

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
                const w = chartData.value[idx]
                return w.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              },
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            border: { display: false },
            ticks: {
              font: { size: 11 },
              color: tickColor,
              maxRotation: 0,
              autoSkip: false,
            },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            max: Math.max(...chartData.value.map(w => w.applied + w.responses), 3) + 1,
            border: { display: false },
            grid: { color: gridColor },
            ticks: {
              stepSize: 1,
              precision: 0,
              font: { size: 10 },
              color: tickColor,
            },
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
  ? new MutationObserver(renderChart)
  : null
onMounted(() => observer?.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] }))
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-100">Applications Over Time</h3>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Last 12 weeks</p>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-sm bg-indigo-300" />
          <span class="text-xs text-gray-500 dark:text-gray-400">Applied</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-sm bg-emerald-300" />
          <span class="text-xs text-gray-500 dark:text-gray-400">Responses</span>
        </div>
        <span class="text-xs text-gray-300 dark:text-gray-600 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded-lg">
          📊 More charts coming soon
        </span>
      </div>
    </div>
    <div style="height: 160px; position: relative">
      <canvas ref="canvas" />
      <div
        v-if="jobs.length === 0"
        class="absolute inset-0 flex items-center justify-center text-xs text-gray-300 dark:text-gray-600"
      >
        No data yet
      </div>
    </div>
  </div>
</template>
