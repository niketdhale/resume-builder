<script setup>
defineProps({
  stats: { type: Object, required: true },
})
</script>

<template>
  <div class="stats-grid">
    <div class="stat-card">
      <p class="stat-value">{{ stats.total }}</p>
      <p class="stat-label">Total Applied</p>
      <p class="stat-sub">All time</p>
    </div>

    <div class="stat-card stat-card--accent">
      <p class="stat-value stat-value--gold">{{ stats.responseRate }}%</p>
      <p class="stat-label">Response Rate</p>
      <p class="stat-sub">{{ stats.responded }} responded</p>
    </div>

    <div class="stat-card stat-card--accent">
      <p class="stat-value stat-value--gold">{{ stats.interviewRate }}%</p>
      <p class="stat-label">Interview Rate</p>
      <p class="stat-sub">{{ stats.interviews }} interviews</p>
    </div>

    <div class="stat-card stat-card--accent">
      <p class="stat-value stat-value--gold">{{ stats.offers }}</p>
      <p class="stat-label">Offers</p>
      <p class="stat-sub">In negotiation</p>
    </div>

    <div class="stat-card stat-card--accent">
      <p class="stat-value stat-value--gold">{{ stats.thisMonth }}</p>
      <p class="stat-label">This Month</p>
      <p class="stat-sub">{{ new Date().toLocaleString('default', { month: 'short', year: 'numeric' }) }}</p>
    </div>

    <div class="stat-card stat-card--accent">
      <p class="stat-value stat-value--gold">{{ stats.avgResponse }}d</p>
      <p class="stat-label">Avg Response Time</p>
      <p class="stat-sub">Days to hear back</p>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}
@media (min-width: 640px) {
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(6, 1fr); }
}

.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
}

.stat-card--accent {
  background: var(--gold-bg);
  border-color: rgba(184, 146, 58, 0.2);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.2;
}

.stat-value--gold {
  color: var(--gold);
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ink-2);
  margin-top: 0.125rem;
}

.stat-sub {
  font-size: 0.6875rem;
  color: var(--ink-3);
  margin-top: 0.125rem;
}
</style>
