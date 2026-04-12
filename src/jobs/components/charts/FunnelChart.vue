<script setup>
import { computed } from 'vue'
import { JOB_STATUSES } from '../../composables/useJobState'

const props = defineProps({
  jobs: { type: Array, required: true },
})

// Pipeline stages in order
const FUNNEL_STAGES = [
  { key: 'applied',   label: 'Applied'    },
  { key: 'screening', label: 'Screening'  },
  { key: 'interview', label: 'Interview'  },
  { key: 'offer',     label: 'Offer'      },
]

const stages = computed(() => {
  const total = props.jobs.length
  if (!total) return []

  return FUNNEL_STAGES.map((stage, i) => {
    // Count jobs that reached this stage or beyond
    const reached = props.jobs.filter(j => {
      const order = FUNNEL_STAGES.findIndex(s => s.key === j.status)
      const stageOrder = i
      // Offer/interview/screening count as having passed through lower stages
      if (j.status === 'rejected' || j.status === 'withdrawn') {
        // Need to figure out at which stage they were rejected
        // We use updatedAt ordering — for simplicity count status at face value
        return false
      }
      return order >= stageOrder
    }).length

    // More accurate: count by cumulative reach
    // applied = all, screening = screening+interview+offer, interview = interview+offer, offer = offer
    const stageKeys = FUNNEL_STAGES.slice(i).map(s => s.key)
    const count = props.jobs.filter(j => stageKeys.includes(j.status)).length

    const prevCount = i === 0 ? total : null
    return { ...stage, count, total }
  }).map((stage, i, arr) => {
    const prev = arr[i - 1]
    const convRate = prev && prev.count > 0 ? Math.round((stage.count / prev.count) * 100) : null
    const widthPct = arr[0].count > 0 ? (stage.count / arr[0].count) * 100 : 0
    return { ...stage, convRate, widthPct }
  })
})

// Also compute "lost" at each stage
const lost = computed(() => {
  return stages.value.map((stage, i) => {
    const next = stages.value[i + 1]
    if (!next) return null
    return stage.count - next.count
  })
})

// Ghost/rejected summary
const rejected = computed(() => props.jobs.filter(j => j.status === 'rejected').length)
const withdrawn = computed(() => props.jobs.filter(j => j.status === 'withdrawn').length)
const noResponse = computed(() => {
  const responded = props.jobs.filter(j => j.status !== 'applied').length
  return props.jobs.filter(j => j.status === 'applied').length
})
</script>

<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3 class="chart-title">Pipeline Funnel</h3>
        <p class="chart-sub">Conversion through each stage</p>
      </div>
      <div class="summary-pills">
        <span class="pill pill--red">{{ rejected }} rejected</span>
        <span class="pill pill--gray">{{ withdrawn }} withdrawn</span>
      </div>
    </div>

    <div v-if="!jobs.length" class="empty">No applications yet</div>

    <div v-else class="funnel">
      <div v-for="(stage, i) in stages" :key="stage.key" class="funnel-row">
        <!-- Stage bar -->
        <div class="stage-label">{{ stage.label }}</div>
        <div class="bar-track">
          <div
            class="bar-fill"
            :style="{ width: stage.widthPct + '%' }"
          >
            <span class="bar-count">{{ stage.count }}</span>
          </div>
          <span v-if="stage.count === 0" class="bar-zero">0</span>
        </div>
        <div class="stage-right">
          <span v-if="stage.convRate !== null" class="conv-rate">
            {{ stage.convRate }}% from prev
          </span>
          <span v-else class="conv-rate conv-rate--base">
            {{ Math.round((stage.count / jobs.length) * 100) }}% of total
          </span>
        </div>

        <!-- Drop-off indicator between stages -->
        <div v-if="i < stages.length - 1 && lost[i]" class="dropoff">
          <span class="dropoff__label">▼ {{ lost[i] }} didn't advance</span>
        </div>
      </div>
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
}
.chart-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 1.25rem; gap: 0.75rem; flex-wrap: wrap;
}
.chart-title { font-size: 0.875rem; font-weight: 600; color: var(--ink); }
.chart-sub   { font-size: 0.75rem; color: var(--ink-3); margin-top: 0.125rem; }

.summary-pills { display: flex; gap: 0.375rem; flex-wrap: wrap; }
.pill { font-size: 0.6875rem; font-weight: 500; padding: 0.2rem 0.5rem; border-radius: 99px; }
.pill--red  { background: rgba(239,68,68,0.1);  color: #ef4444; }
.pill--gray { background: var(--bg-subtle); color: var(--ink-3); border: 1px solid var(--border); }

.empty { font-size: 0.875rem; color: var(--ink-3); text-align: center; padding: 3rem 0; }

.funnel { display: flex; flex-direction: column; gap: 0; }

.funnel-row { display: grid; grid-template-columns: 80px 1fr 110px; align-items: center; gap: 0.5rem; }

.stage-label {
  font-size: 0.75rem; font-weight: 600; color: var(--ink-2);
  text-align: right; white-space: nowrap;
}

.bar-track {
  position: relative;
  background: var(--bg-subtle);
  border-radius: 6px;
  height: 28px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gold) 0%, rgba(184,146,58,0.7) 100%);
  border-radius: 6px;
  display: flex; align-items: center; justify-content: flex-end;
  padding-right: 0.5rem;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  min-width: 2px;
}
.bar-count {
  font-size: 0.75rem; font-weight: 700; color: #fff;
  white-space: nowrap;
}
.bar-zero {
  position: absolute; left: 0.5rem; top: 50%; transform: translateY(-50%);
  font-size: 0.75rem; color: var(--ink-3);
}

.stage-right { display: flex; align-items: center; }
.conv-rate {
  font-size: 0.6875rem; color: var(--ink-3); white-space: nowrap;
}
.conv-rate--base { color: var(--gold); }

.dropoff {
  grid-column: 2 / 3;
  display: flex; align-items: center;
  padding: 0.15rem 0.5rem;
}
.dropoff__label {
  font-size: 0.625rem; color: rgba(239,68,68,0.7);
  letter-spacing: 0.02em;
}
</style>
