<script setup>
defineProps({
  stats: { type: Object, required: true },
})
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
    <!-- Total Applied -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
      <p class="text-2xl font-bold text-gray-900 dark:text-gray-50">{{ stats.total }}</p>
      <p class="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">Total Applied</p>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">All time</p>
    </div>

    <!-- Response Rate -->
    <div class="bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900 p-4">
      <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ stats.responseRate }}%</p>
      <p class="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">Response Rate</p>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ stats.responded }} responded</p>
    </div>

    <!-- Interview Rate -->
    <div class="bg-violet-50 dark:bg-violet-950/40 rounded-xl border border-violet-100 dark:border-violet-900 p-4">
      <p class="text-2xl font-bold text-violet-600 dark:text-violet-400">{{ stats.interviewRate }}%</p>
      <p class="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">Interview Rate</p>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ stats.interviews }} interviews</p>
    </div>

    <!-- Offers -->
    <div class="bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900 p-4">
      <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ stats.offers }}</p>
      <p class="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">Offers</p>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">In negotiation</p>
    </div>

    <!-- This Month -->
    <div class="bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900 p-4">
      <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.thisMonth }}</p>
      <p class="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">This Month</p>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ new Date().toLocaleString('default', { month: 'short', year: 'numeric' }) }}</p>
    </div>

    <!-- Avg Response Time -->
    <div class="bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900 p-4">
      <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ stats.avgResponse }}d</p>
      <p class="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">Avg Response Time</p>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Days to hear back</p>
    </div>
  </div>
</template>
