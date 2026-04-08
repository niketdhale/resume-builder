<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { inject } from 'vue'
import NavBar from '../components/ui/NavBar.vue'
import { flagCode } from '../constants/languages'

const router = useRouter()
const resumes = inject('resumes')
const sections = inject('sections')
const setActiveResume = inject('setActiveResume')
const deleteResume = inject('deleteResume')
const duplicateResume = inject('duplicateResume')
const addResume = inject('addResume')

function sectionCount(resumeId) {
  return sections.value.filter(s => s.viewIds?.includes(resumeId)).length
}

const baseResumes = computed(() => resumes.value.filter((r) => !r.variantOf))

function variantsOf(baseId) {
  return resumes.value.filter((r) => r.variantOf === baseId)
}

function languagesFor(resume) {
  const all = [resume, ...variantsOf(resume.id)]
  return all.map((r) => ({ code: flagCode(r.language), label: r.language, id: r.id }))
}

function openResume(id) {
  setActiveResume(id)
  router.push({ name: 'editor', params: { id } })
}

function createResume() {
  addResume()
  const newResume = resumes.value[resumes.value.length - 1]
  router.push({ name: 'editor', params: { id: newResume.id } })
}

function handleDelete(resumeId) { deleteResume(resumeId) }
function handleDuplicate(resumeId) { duplicateResume(resumeId) }

function timeAgo(isoString) {
  if (!isoString) return ''
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}
</script>

<template>
  <div class="overview-root">
    <NavBar />

    <main class="overview-main">

      <!-- Page header -->
      <div class="page-header anim-fade-up anim-fade-up-d1">
        <div class="page-header-copy">
          <h1 class="page-title">My Resumes</h1>
          <p class="page-subtitle">
            {{ baseResumes.length === 0 ? 'Create your first resume to get started' : `${baseResumes.length} ${baseResumes.length === 1 ? 'resume' : 'resumes'}` }}
          </p>
        </div>
        <button class="new-resume-btn" @click="createResume">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Resume
        </button>
      </div>

      <!-- ── Empty state ── -->
      <div v-if="baseResumes.length === 0" class="empty-state anim-fade-up anim-fade-up-d2">
        <div class="empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </div>
        <h2 class="empty-title">Start with a blank canvas</h2>
        <p class="empty-desc">Create your first resume and choose from seven premium templates. No account required.</p>
        <button class="empty-cta" @click="createResume">Create first resume</button>
      </div>

      <!-- ── Resume grid ── -->
      <div v-else class="resume-grid">

        <!-- New resume card -->
        <div class="new-card anim-fade-up anim-fade-up-d2" @click="createResume">
          <div class="new-card-inner">
            <div class="new-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <span class="new-card-label">New Resume</span>
          </div>
        </div>

        <!-- Resume cards -->
        <div
          v-for="(resume, idx) in baseResumes"
          :key="resume.id"
          class="resume-card anim-fade-up"
          :class="`anim-fade-up-d${Math.min(idx + 3, 5)}`"
          @click="openResume(resume.id)"
        >
          <!-- Thumbnail -->
          <div class="card-thumb">
            <div class="thumb-inner">
              <!-- Mini resume mockup -->
              <div class="thumb-header">
                <div class="thumb-avatar"></div>
                <div class="thumb-info">
                  <div class="thumb-name"></div>
                  <div class="thumb-role" :style="{ background: resume.design?.accentColor || '#B8923A' }"></div>
                </div>
              </div>
              <div class="thumb-divider" :style="{ background: resume.design?.accentColor || '#B8923A' }"></div>
              <div class="thumb-lines">
                <div class="thumb-label"></div>
                <div class="tl tl-full"></div>
                <div class="tl tl-3q"></div>
                <div class="tl tl-half"></div>
              </div>
              <div class="thumb-lines" style="margin-top: 6px;">
                <div class="thumb-label"></div>
                <div class="tl tl-full"></div>
                <div class="tl tl-3q"></div>
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="card-body">
            <div class="card-top">
              <p class="card-title">{{ resume.title }}</p>
              <p class="card-subtitle">{{ resume.metadata?.jobTitle || 'No job title' }}</p>
            </div>

            <!-- Lang flags -->
            <div class="card-langs">
              <span
                v-for="lang in languagesFor(resume)"
                :key="lang.id"
                :title="lang.label"
                class="lang-chip"
              >{{ lang.code }}</span>
            </div>

            <!-- Meta row -->
            <div class="card-meta">
              <span class="meta-time">{{ timeAgo(resume.updatedAt) }}</span>
              <span class="meta-sections">{{ sectionCount(resume.id) }} sections</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="card-actions" @click.stop>
            <button class="action-open" @click="openResume(resume.id)">Open</button>
            <button
              class="action-icon"
              @click="handleDuplicate(resume.id)"
              title="Duplicate"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
            <button
              class="action-icon action-delete"
              @click="handleDelete(resume.id)"
              title="Delete"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </div>
      </div>

    </main>

    <!-- Mobile FAB -->
    <button class="fab" @click="createResume" aria-label="New Resume">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>
  </div>
</template>

<style scoped>
/* ─── Root ─────────────────────────────────────────────────────── */
.overview-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-base);
}

/* ─── Main layout ──────────────────────────────────────────────── */
.overview-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 2rem 5rem;
  width: 100%;
}

/* ─── Page header ──────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  gap: 1rem;
}
.page-header-copy { display: flex; flex-direction: column; gap: 0.25rem; }
.page-title {
  font-family: var(--font-display);
  font-size: 2.25rem;
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin: 0;
}
.page-subtitle {
  font-size: 0.8125rem;
  font-weight: 400;
  color: var(--ink-3);
  margin: 0;
  letter-spacing: 0.01em;
}
.new-resume-btn {
  display: none;
  align-items: center;
  gap: 0.375rem;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 500;
  color: #fff;
  background: var(--gold);
  border: none;
  border-radius: 8px;
  padding: 0.5625rem 1rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, transform 0.1s;
}
.new-resume-btn:hover { background: var(--gold-hover); }
.new-resume-btn:active { transform: scale(0.98); }
@media (min-width: 640px) { .new-resume-btn { display: flex; } }

/* ─── Empty state ──────────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 5rem 2rem;
  text-align: center;
}
.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: var(--gold-bg);
  border: 1px solid var(--gold-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold);
}
.empty-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--ink);
  margin: 0;
  letter-spacing: -0.01em;
}
.empty-desc {
  font-size: 0.875rem;
  font-weight: 300;
  line-height: 1.65;
  color: var(--ink-3);
  max-width: 380px;
  margin: 0;
}
.empty-cta {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  background: var(--gold);
  border: none;
  border-radius: 8px;
  padding: 0.6875rem 1.5rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.15s;
}
.empty-cta:hover { background: var(--gold-hover); }

/* ─── Resume grid ──────────────────────────────────────────────── */
.resume-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}

/* ─── New card ─────────────────────────────────────────────────── */
.new-card {
  border: 1.5px dashed var(--border);
  border-radius: 12px;
  cursor: pointer;
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, background 0.2s;
}
.new-card:hover {
  border-color: var(--gold);
  background: var(--gold-bg);
}
.new-card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.new-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--gold-bg);
  border: 1px solid var(--gold-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold);
  transition: background 0.2s;
}
.new-card:hover .new-card-icon { background: var(--gold); color: #fff; border-color: var(--gold); }
.new-card-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ink-3);
  letter-spacing: 0.01em;
  transition: color 0.2s;
}
.new-card:hover .new-card-label { color: var(--gold); }

/* ─── Resume card ──────────────────────────────────────────────── */
.resume-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.22s ease, border-color 0.22s ease, transform 0.22s ease;
}
.resume-card:hover {
  box-shadow: 0 8px 28px -8px rgba(0,0,0,0.1);
  border-color: var(--gold-border);
  transform: translateY(-3px);
}

/* Card thumbnail */
.card-thumb {
  background: var(--bg-subtle);
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  height: 140px;
  overflow: hidden;
}
.thumb-inner {
  background: #fff;
  border-radius: 6px;
  padding: 0.75rem;
  height: 100%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.thumb-header { display: flex; gap: 0.5rem; align-items: flex-start; margin-bottom: 0.5rem; }
.thumb-avatar { width: 22px; height: 22px; border-radius: 5px; background: linear-gradient(135deg, #D4A94A, #B8923A); flex-shrink: 0; }
.thumb-info { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; padding-top: 0.1rem; }
.thumb-name { height: 6px; background: #1A1914; border-radius: 3px; width: 60%; }
.thumb-role { height: 4px; border-radius: 2px; width: 40%; opacity: 0.6; }
.thumb-divider { height: 1px; background: #B8923A; opacity: 0.35; margin-bottom: 0.5rem; }
.thumb-lines { display: flex; flex-direction: column; gap: 0.25rem; }
.thumb-label { height: 5px; background: #1A1914; border-radius: 2px; width: 35%; margin-bottom: 0.2rem; }
.tl { height: 4px; border-radius: 2px; background: #E5E3DC; }
.tl-full { width: 100%; }
.tl-3q   { width: 75%; }
.tl-half { width: 50%; }

/* Card body */
.card-body { padding: 0.875rem 1rem 0.75rem; display: flex; flex-direction: column; gap: 0.625rem; flex: 1; }
.card-top { display: flex; flex-direction: column; gap: 0.2rem; }
.card-title { font-size: 0.875rem; font-weight: 500; color: var(--ink); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-subtitle { font-size: 0.75rem; color: var(--ink-3); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.card-langs { display: flex; flex-wrap: wrap; gap: 0.25rem; }
.lang-chip {
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  background: var(--bg-subtle);
  color: var(--ink-2);
  border: 1px solid var(--border);
}
.card-meta { display: flex; align-items: center; justify-content: space-between; }
.meta-time { font-size: 0.6875rem; color: var(--ink-3); }
.meta-sections {
  font-size: 0.6875rem;
  padding: 0.125rem 0.5rem;
  border-radius: 99px;
  background: var(--bg-subtle);
  color: var(--ink-3);
  border: 1px solid var(--border);
}

/* Card actions */
.card-actions {
  display: flex;
  gap: 0.375rem;
  padding: 0.625rem 0.875rem;
  border-top: 1px solid var(--border);
}
.action-open {
  flex: 1;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 500;
  color: #fff;
  background: var(--gold);
  border: none;
  border-radius: 6px;
  padding: 0.4375rem 0.75rem;
  cursor: pointer;
  transition: background 0.15s;
}
.action-open:hover { background: var(--gold-hover); }

.action-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--ink-3);
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.action-icon:hover { background: var(--bg-subtle); color: var(--ink); border-color: var(--border-2); }
.action-delete:hover { background: rgba(220,38,38,0.06); color: #dc2626; border-color: rgba(220,38,38,0.2); }

/* ─── Mobile FAB ───────────────────────────────────────────────── */
.fab {
  display: none;
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 30;
  width: 56px;
  height: 56px;
  background: var(--gold);
  color: #fff;
  border: none;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(184,146,58,0.35);
  transition: background 0.15s, transform 0.12s;
}
.fab:active { transform: scale(0.95); }
.fab:hover { background: var(--gold-hover); }
@media (max-width: 639px) { .fab { display: flex; } }

/* ─── Animations ───────────────────────────────────────────────── */
.anim-fade-up {
  opacity: 0;
  animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.anim-fade-up-d1 { animation-delay: 0.05s; }
.anim-fade-up-d2 { animation-delay: 0.12s; }
.anim-fade-up-d3 { animation-delay: 0.20s; }
.anim-fade-up-d4 { animation-delay: 0.28s; }
.anim-fade-up-d5 { animation-delay: 0.38s; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
