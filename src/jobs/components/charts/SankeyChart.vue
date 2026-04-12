<script setup>
import { computed } from 'vue'

const props = defineProps({
  jobs: { type: Array, required: true },
})

const SVG_W    = 560
const SVG_H    = 300
const NODE_W   = 16
const Y_MARGIN = 24
const Y_GAP    = 16   // gap between stacked nodes in same column
const AVAILABLE = SVG_H - 2 * Y_MARGIN   // 252px

// Column x positions
const COL = [24, 184, 344, 484]

const counts = computed(() => {
  const total = props.jobs.length
  if (!total) return null

  const screening     = props.jobs.filter(j => ['screening', 'interview', 'offer'].includes(j.status)).length
  const interview     = props.jobs.filter(j => ['interview', 'offer'].includes(j.status)).length
  const offer         = props.jobs.filter(j => j.status === 'offer').length
  const noProgress    = total - screening
  const lostScreening = screening - interview
  const lostInterview = interview - offer

  return { total, screening, noProgress, interview, lostScreening, offer, lostInterview }
})

// px height proportional to count from total
function ph(count, total) {
  return Math.max(4, Math.round(AVAILABLE * count / total))
}

const layout = computed(() => {
  const c = counts.value
  if (!c) return null

  const { total, screening, noProgress, interview, lostScreening, offer, lostInterview } = c

  // Node heights (exact proportions from total so flows tile perfectly)
  const hApplied      = AVAILABLE
  const hScreening    = ph(screening,     total)
  const hNoProgress   = ph(noProgress,    total)
  const hInterview    = ph(interview,     total)
  const hLostScreen   = ph(lostScreening, total)
  const hOffer        = ph(offer,         total)
  const hLostInterview = ph(lostInterview, total)

  // Within-Applied split for outflows
  const apSplitScreen = screening > 0 ? Math.round(AVAILABLE * screening / total) : 0

  // Within-Screening split for outflows
  const scSplitInterview = screening > 0 && interview > 0
    ? Math.round(hScreening * interview / screening) : 0

  // Within-Interview split for outflows
  const intSplitOffer = interview > 0 && offer > 0
    ? Math.round(hInterview * offer / interview) : 0

  // ── Nodes ──────────────────────────────────────────────────────
  const nodes = [
    { id: 'applied',       col: 0, x: COL[0], y: Y_MARGIN,                           h: hApplied,      fill: 'rgba(184,146,58,1)',    label: 'Applied',     count: total },
    { id: 'screening',     col: 1, x: COL[1], y: Y_MARGIN,                           h: hScreening,    fill: 'rgba(184,146,58,0.75)', label: 'Screening',   count: screening },
    { id: 'noProgress',    col: 1, x: COL[1], y: Y_MARGIN + hScreening + Y_GAP,      h: hNoProgress,   fill: 'rgba(140,140,140,0.4)', label: 'No Response', count: noProgress },
    { id: 'interview',     col: 2, x: COL[2], y: Y_MARGIN,                           h: hInterview,    fill: 'rgba(184,146,58,0.6)',  label: 'Interview',   count: interview },
    { id: 'lostScreen',    col: 2, x: COL[2], y: Y_MARGIN + hInterview + Y_GAP,      h: hLostScreen,   fill: 'rgba(239,68,68,0.55)',  label: 'Dropped',     count: lostScreening },
    { id: 'offer',         col: 3, x: COL[3], y: Y_MARGIN,                           h: hOffer,        fill: 'rgba(34,197,94,0.8)',   label: 'Offer',       count: offer },
    { id: 'lostInterview', col: 3, x: COL[3], y: Y_MARGIN + hOffer + Y_GAP,          h: hLostInterview,fill: 'rgba(239,68,68,0.55)',  label: 'Rejected',    count: lostInterview },
  ].filter(n => n.count > 0 && n.h >= 4)

  // ── Helper: cubic bezier ribbon ──────────────────────────────
  function ribbon(x0, y0t, y0b, x1, y1t, y1b) {
    const mx = (x0 + x1) / 2
    return [
      `M ${x0} ${y0t}`,
      `C ${mx} ${y0t} ${mx} ${y1t} ${x1} ${y1t}`,
      `L ${x1} ${y1b}`,
      `C ${mx} ${y1b} ${mx} ${y0b} ${x0} ${y0b}`,
      'Z',
    ].join(' ')
  }

  const flows = []
  const applied  = nodes.find(n => n.id === 'applied')
  const scNode   = nodes.find(n => n.id === 'screening')
  const npNode   = nodes.find(n => n.id === 'noProgress')
  const intNode  = nodes.find(n => n.id === 'interview')
  const lsNode   = nodes.find(n => n.id === 'lostScreen')
  const ofNode   = nodes.find(n => n.id === 'offer')
  const liNode   = nodes.find(n => n.id === 'lostInterview')

  // Applied → Screening
  if (applied && scNode && screening > 0) {
    flows.push({
      path: ribbon(applied.x + NODE_W, applied.y, applied.y + apSplitScreen, scNode.x, scNode.y, scNode.y + scNode.h),
      fill: 'rgba(184,146,58,0.12)',
    })
  }

  // Applied → No Progress
  if (applied && npNode && noProgress > 0) {
    flows.push({
      path: ribbon(applied.x + NODE_W, applied.y + apSplitScreen, applied.y + hApplied, npNode.x, npNode.y, npNode.y + npNode.h),
      fill: 'rgba(140,140,140,0.08)',
    })
  }

  // Screening → Interview
  if (scNode && intNode && interview > 0) {
    flows.push({
      path: ribbon(scNode.x + NODE_W, scNode.y, scNode.y + scSplitInterview, intNode.x, intNode.y, intNode.y + intNode.h),
      fill: 'rgba(184,146,58,0.12)',
    })
  }

  // Screening → Dropped
  if (scNode && lsNode && lostScreening > 0) {
    flows.push({
      path: ribbon(scNode.x + NODE_W, scNode.y + scSplitInterview, scNode.y + scNode.h, lsNode.x, lsNode.y, lsNode.y + lsNode.h),
      fill: 'rgba(239,68,68,0.08)',
    })
  }

  // Interview → Offer
  if (intNode && ofNode && offer > 0) {
    flows.push({
      path: ribbon(intNode.x + NODE_W, intNode.y, intNode.y + intSplitOffer, ofNode.x, ofNode.y, ofNode.y + ofNode.h),
      fill: 'rgba(34,197,94,0.12)',
    })
  }

  // Interview → Rejected
  if (intNode && liNode && lostInterview > 0) {
    flows.push({
      path: ribbon(intNode.x + NODE_W, intNode.y + intSplitOffer, intNode.y + intNode.h, liNode.x, liNode.y, liNode.y + liNode.h),
      fill: 'rgba(239,68,68,0.08)',
    })
  }

  // Conversion labels between columns
  const convLabels = []
  if (screening > 0 && total > 0)
    convLabels.push({ x: (COL[0] + COL[1]) / 2 + NODE_W / 2, y: Y_MARGIN - 6, text: `${Math.round(screening / total * 100)}%` })
  if (interview > 0 && screening > 0)
    convLabels.push({ x: (COL[1] + COL[2]) / 2 + NODE_W / 2, y: Y_MARGIN - 6, text: `${Math.round(interview / screening * 100)}%` })
  if (offer > 0 && interview > 0)
    convLabels.push({ x: (COL[2] + COL[3]) / 2 + NODE_W / 2, y: Y_MARGIN - 6, text: `${Math.round(offer / interview * 100)}%` })

  return { nodes, flows, convLabels }
})

// Label position helpers
function labelX(node) {
  return node.col === 3 ? node.x + NODE_W + 6 : node.x + NODE_W + 6
}
function labelAnchor() { return 'start' }
function labelMidY(node) { return node.y + node.h / 2 }
</script>

<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3 class="chart-title">Application Flow (Sankey)</h3>
        <p class="chart-sub">How applications progress through each stage</p>
      </div>
    </div>

    <div v-if="!jobs.length" class="empty">No applications yet</div>

    <div v-else-if="!layout" class="empty">Building chart…</div>

    <div v-else class="sankey-wrap">
      <svg
        :viewBox="`0 0 ${SVG_W} ${SVG_H}`"
        :width="SVG_W"
        :height="SVG_H"
        preserveAspectRatio="xMidYMid meet"
        class="sankey-svg"
      >
        <!-- Flows (drawn behind nodes) -->
        <path
          v-for="(flow, i) in layout.flows"
          :key="'f' + i"
          :d="flow.path"
          :fill="flow.fill"
          stroke="none"
        />

        <!-- Nodes -->
        <g v-for="node in layout.nodes" :key="node.id">
          <rect
            :x="node.x"
            :y="node.y"
            :width="NODE_W"
            :height="node.h"
            :fill="node.fill"
            rx="3"
          />
          <!-- Label: name -->
          <text
            :x="labelX(node)"
            :y="labelMidY(node) - 5"
            :text-anchor="labelAnchor()"
            class="node-label"
          >{{ node.label }}</text>
          <!-- Label: count -->
          <text
            :x="labelX(node)"
            :y="labelMidY(node) + 9"
            :text-anchor="labelAnchor()"
            class="node-count"
          >{{ node.count }}</text>
        </g>

        <!-- Conversion % labels between columns -->
        <text
          v-for="(lbl, i) in layout.convLabels"
          :key="'c' + i"
          :x="lbl.x"
          :y="lbl.y"
          text-anchor="middle"
          class="conv-label"
        >{{ lbl.text }}</text>
      </svg>
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
.chart-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem; }
.chart-title  { font-size: 0.875rem; font-weight: 600; color: var(--ink); }
.chart-sub    { font-size: 0.75rem; color: var(--ink-3); margin-top: 0.125rem; }
.empty        { font-size: 0.875rem; color: var(--ink-3); text-align: center; padding: 3rem 0; }

.sankey-wrap  { overflow-x: auto; }
.sankey-svg   { display: block; max-width: 100%; height: auto; }

.node-label {
  font-size: 11px;
  font-family: var(--font-sans, system-ui);
  fill: var(--ink-2);
  font-weight: 600;
}
.node-count {
  font-size: 10px;
  font-family: var(--font-sans, system-ui);
  fill: var(--ink-3);
}
.conv-label {
  font-size: 9px;
  font-family: var(--font-sans, system-ui);
  fill: var(--gold);
  font-weight: 700;
  letter-spacing: 0.02em;
}
</style>
