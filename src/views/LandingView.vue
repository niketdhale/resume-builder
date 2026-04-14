<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const features = [
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    title: 'Adaptive Hierarchy',
    desc: 'Your resume intelligently reflows across seven precision-crafted templates. Shift between executive serif and modern two-column in a single click.',
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>`,
    title: 'Version Control',
    desc: 'Every edit is tracked. Commit named snapshots, branch for different roles, and revert to any point in your career narrative without losing work.',
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    title: 'Pipeline View',
    desc: 'Track every application from prospect to offer. Your job pipeline lives alongside your resumes — context always within reach.',
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    title: 'Language Variants',
    desc: 'Create localized versions of a single resume for international markets. Manage all variants from one canonical source without duplication.',
  },
]

const steps = [
  { n: '01', title: 'Choose your template', desc: 'Select from seven thoughtfully designed layouts. Each is tuned for different industries and sensibilities.' },
  { n: '02', title: 'Fill in your details', desc: 'Our structured editor guides you through every section — experience, education, skills, and beyond.' },
  { n: '03', title: 'Style to perfection', desc: 'Adjust fonts, colors, spacing, and layout. Make it distinctly yours while keeping it professionally excellent.' },
  { n: '04', title: 'Download & apply', desc: 'Export a pixel-perfect PDF and start applying. It\'s that clean. That fast.' },
]
</script>

<template>
  <div class="landing-root">

    <!-- ══════════════════════════════════════════════════════════
         NAVIGATION
    ══════════════════════════════════════════════════════════ -->
    <nav class="landing-nav">
      <div class="landing-nav-inner">
        <!-- Wordmark -->
        <div class="wordmark" @click="router.push({ name: 'overview' })">
          <div class="wordmark-icon">C</div>
          <span class="wordmark-text">CuratorWorkspace</span>
        </div>

        <!-- Links (desktop) -->
        <div class="nav-links">
          <a href="#features" class="nav-a">Product</a>
          <a href="#" class="nav-a">Templates</a>
          <a href="#how-it-works" class="nav-a">Pricing</a>
          <a href="#" class="nav-a">Resources</a>
        </div>

        <!-- Actions -->
        <div class="nav-actions">
          <button class="nav-btn-ghost" @click="router.push('/auth')">Sign in</button>
          <button class="nav-btn-primary" @click="router.push({ name: 'overview' })">
            Build Resume
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>
    </nav>

    <!-- ══════════════════════════════════════════════════════════
         HERO
    ══════════════════════════════════════════════════════════ -->
    <section class="hero">
      <!-- Background grain -->
      <div class="hero-grain"></div>
      <!-- Radial glow -->
      <div class="hero-glow"></div>

      <div class="hero-inner">
        <!-- Left: Copy -->
        <div class="hero-copy">
          <div class="hero-eyebrow anim-fade-up anim-fade-up-d1">
            <span class="eyebrow-dot"></span>
            The digital curator
          </div>

          <h1 class="hero-headline anim-fade-up anim-fade-up-d2">
            The invisible<br>
            architecture of a<br>
            perfect <em>career.</em>
          </h1>

          <p class="hero-sub anim-fade-up anim-fade-up-d3">
            Build your professional identity across different roles
            and industries with curated resume versions.
          </p>

          <div class="hero-actions anim-fade-up anim-fade-up-d4">
            <button class="hero-cta-primary" @click="router.push({ name: 'overview' })">
              Start curating — it's free
            </button>
            <a href="#features" class="hero-cta-ghost">
              See all features
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </a>
          </div>

          <p class="hero-fine anim-fade-up anim-fade-up-d5">
            No credit card · No account needed · Works offline
          </p>
        </div>

        <!-- Right: Resume preview mockup -->
        <div class="hero-visual anim-fade-up anim-fade-up-d3">
          <div class="resume-card-wrap">
            <div class="resume-card">
              <!-- Resume card header -->
              <div class="rc-header">
                <div class="rc-avatar"></div>
                <div class="rc-info">
                  <div class="rc-name"></div>
                  <div class="rc-title"></div>
                </div>
              </div>
              <div class="rc-divider"></div>
              <!-- Resume card body -->
              <div class="rc-body">
                <div class="rc-section">
                  <div class="rc-section-label"></div>
                  <div class="rc-line rc-line-full"></div>
                  <div class="rc-line rc-line-3q"></div>
                  <div class="rc-line rc-line-half"></div>
                </div>
                <div class="rc-section">
                  <div class="rc-section-label"></div>
                  <div class="rc-entry">
                    <div class="rc-entry-dot"></div>
                    <div class="rc-entry-lines">
                      <div class="rc-line rc-line-3q"></div>
                      <div class="rc-line rc-line-full"></div>
                      <div class="rc-line rc-line-half"></div>
                    </div>
                  </div>
                  <div class="rc-entry">
                    <div class="rc-entry-dot"></div>
                    <div class="rc-entry-lines">
                      <div class="rc-line rc-line-full"></div>
                      <div class="rc-line rc-line-3q"></div>
                    </div>
                  </div>
                </div>
                <div class="rc-section">
                  <div class="rc-section-label"></div>
                  <div class="rc-chips">
                    <div class="rc-chip"></div>
                    <div class="rc-chip"></div>
                    <div class="rc-chip rc-chip-sm"></div>
                    <div class="rc-chip"></div>
                    <div class="rc-chip rc-chip-sm"></div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Floating accent cards -->
            <div class="badge badge-1">
              <span class="badge-icon">✓</span>
              <span>ATS Friendly</span>
            </div>
            <div class="badge badge-2">
              <span class="badge-icon">↓</span>
              <span>PDF Ready</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats strip -->
      <div class="stats-strip anim-fade-up anim-fade-up-d5">
        <div class="stat">
          <span class="stat-num">7</span>
          <span class="stat-label">Premium templates</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-num">30+</span>
          <span class="stat-label">Font choices</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-num">13</span>
          <span class="stat-label">Languages</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-num">∞</span>
          <span class="stat-label">Resumes, free</span>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════════════
         FEATURES
    ══════════════════════════════════════════════════════════ -->
    <section id="features" class="features-section">
      <div class="section-inner">
        <div class="section-header">
          <p class="section-eyebrow">Curated tools</p>
          <h2 class="section-headline">Every piece of work<br>in its right place</h2>
          <p class="section-sub">Purpose-built for professionals who treat their career as a portfolio.</p>
        </div>

        <div class="features-grid">
          <div
            v-for="(f, i) in features"
            :key="i"
            class="feature-card"
          >
            <div class="feature-icon" v-html="f.icon"></div>
            <h3 class="feature-title">{{ f.title }}</h3>
            <p class="feature-desc">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════════════
         HOW IT WORKS
    ══════════════════════════════════════════════════════════ -->
    <section id="how-it-works" class="how-section">
      <div class="section-inner">
        <div class="section-header">
          <p class="section-eyebrow">The process</p>
          <h2 class="section-headline">Four steps to<br><em>the perfect resume</em></h2>
        </div>

        <div class="steps-grid">
          <div v-for="(step, i) in steps" :key="i" class="step-item">
            <div class="step-num">{{ step.n }}</div>
            <div class="step-connector" v-if="i < steps.length - 1"></div>
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-desc">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════════════
         QUOTE
    ══════════════════════════════════════════════════════════ -->
    <section class="quote-section">
      <div class="quote-inner">
        <p class="section-eyebrow">Voices of the Curated</p>
        <div class="quote-mark">"</div>
        <blockquote class="quote-text">
          The most refined resume builder I've encountered.
          It gets out of your way and lets your experience speak.
        </blockquote>
        <div class="quote-attribution">
          <div class="quote-avatar"></div>
          <div>
            <div class="quote-name">Sarah Chen</div>
            <div class="quote-role">Head of Design · Stripe</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════════════
         CTA
    ══════════════════════════════════════════════════════════ -->
    <section class="cta-section">
      <div class="cta-inner">
        <h2 class="cta-headline">Ready to start<br><em>curating?</em></h2>
        <p class="cta-sub">Your professional identity, curated across every role and industry.</p>
        <div class="cta-actions">
          <button class="cta-btn-primary" @click="router.push({ name: 'overview' })">
            Start curating — it's free
          </button>
          <button class="cta-btn-ghost" @click="router.push('/auth')">
            Sign in to sync →
          </button>
        </div>
        <p class="cta-fine">No account required · Works in your browser · Export PDF instantly</p>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════════════
         FOOTER
    ══════════════════════════════════════════════════════════ -->
    <footer class="landing-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="wordmark" @click="router.push({ name: 'overview' })">
            <div class="wordmark-icon">C</div>
            <span class="wordmark-text">CuratorWorkspace</span>
          </div>
          <p class="footer-tagline">Your professional identity, curated.</p>
        </div>
        <div class="footer-links">
          <a href="#features" class="footer-a">Product</a>
          <a href="#" class="footer-a">Templates</a>
          <button class="footer-a" @click="router.push({ name: 'overview' })">My Resumes</button>
          <button class="footer-a" @click="router.push('/auth')">Sign in</button>
        </div>
        <p class="footer-copy">© 2025 CuratorWorkspace. All rights reserved.</p>
      </div>
    </footer>

  </div>
</template>

<style scoped>

/* ─── Root ─────────────────────────────────────────────────────── */
.landing-root {
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  background: #faf9f8;
  color: #2f3333;
  min-height: 100vh;
  overflow-x: hidden;
}

/* ─── Nav ──────────────────────────────────────────────────────── */
.landing-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(47,51,51,0.08);
  background: rgba(250,249,248,0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.landing-nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

/* Wordmark */
.wordmark {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  cursor: pointer;
  text-decoration: none;
}
.wordmark-icon {
  width: 30px;
  height: 30px;
  background: #005eb4;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.wordmark-text {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #2f3333;
  letter-spacing: -0.01em;
}

/* Nav links */
.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}
.nav-a {
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgba(47,51,51,0.5);
  text-decoration: none;
  transition: color 0.15s;
  letter-spacing: 0.01em;
}
.nav-a:hover { color: #2f3333; }

/* Nav actions */
.nav-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.nav-btn-ghost {
  font-family: 'Inter', sans-serif;
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgba(47,51,51,0.65);
  background: transparent;
  border: 1px solid rgba(47,51,51,0.18);
  border-radius: 8px;
  padding: 0.375rem 0.875rem;
  cursor: pointer;
  transition: all 0.15s;
}
.nav-btn-ghost:hover { color: #2f3333; border-color: rgba(47,51,51,0.3); background: rgba(47,51,51,0.04); }
.nav-btn-primary {
  font-family: 'Inter', sans-serif;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, #005eb4, #00529e);
  border: none;
  border-radius: 8px;
  padding: 0.375rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: background 0.15s;
}
.nav-btn-primary:hover { background: #00529e; }

/* ─── Hero ─────────────────────────────────────────────────────── */
.hero {
  position: relative;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.hero-grain {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  opacity: 0.6;
}
.hero-glow {
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 900px;
  height: 600px;
  background: radial-gradient(ellipse at center, rgba(0,94,180,0.06) 0%, transparent 70%);
  pointer-events: none;
}

.hero-inner {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 5rem 2rem 3rem;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

/* Hero copy */
.hero-copy { display: flex; flex-direction: column; gap: 1.5rem; }
.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #005eb4;
}
.eyebrow-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  background: #005eb4;
  border-radius: 50%;
}
.hero-headline {
  font-family: 'Inter', sans-serif;
  font-size: clamp(3.25rem, 5.5vw, 5rem);
  font-weight: 600;
  line-height: 1.04;
  letter-spacing: -2.125px;
  color: #2f3333;
  margin: 0;
}
.hero-headline em {
  font-style: normal;
  font-weight: 600;
  color: #005eb4;
}
.hero-sub {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.65;
  color: #5b605f;
  max-width: 420px;
  margin: 0;
}
.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  align-items: flex-start;
}
.hero-cta-primary {
  font-family: 'Inter', sans-serif;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, #005eb4, #00529e);
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.75rem;
  cursor: pointer;
  transition: background 0.18s, transform 0.12s;
  letter-spacing: 0.005em;
}
.hero-cta-primary:hover { background: #00529e; }
.hero-cta-primary:active { transform: scale(0.98); }
.hero-cta-ghost {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  color: #5b605f;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s;
}
.hero-cta-ghost:hover { color: #2f3333; }
.hero-fine {
  font-size: 0.75rem;
  font-weight: 400;
  color: rgba(47,51,51,0.35);
  letter-spacing: 0.01em;
}

/* ─── Resume mockup ────────────────────────────────────────────── */
.hero-visual { display: flex; align-items: center; justify-content: center; }
.resume-card-wrap {
  position: relative;
  width: 280px;
  filter: drop-shadow(0 40px 80px rgba(0,0,0,0.6));
}
.resume-card {
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  transform: rotate(2deg);
  transition: transform 0.4s ease;
  width: 100%;
}
.resume-card:hover { transform: rotate(0.5deg) scale(1.01); }

.rc-header { display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 0.875rem; }
.rc-avatar { width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg, #005eb4, #00529e); flex-shrink: 0; }
.rc-info { flex: 1; display: flex; flex-direction: column; gap: 0.375rem; padding-top: 0.25rem; }
.rc-name { height: 10px; background: #2f3333; border-radius: 4px; width: 70%; }
.rc-title { height: 7px; background: #005eb4; border-radius: 4px; width: 50%; opacity: 0.7; }
.rc-divider { height: 1px; background: linear-gradient(to right, #005eb4, transparent); margin-bottom: 0.875rem; }

.rc-body { display: flex; flex-direction: column; gap: 0.875rem; }
.rc-section { display: flex; flex-direction: column; gap: 0.35rem; }
.rc-section-label { height: 7px; background: #2f3333; border-radius: 3px; width: 40%; margin-bottom: 0.2rem; }
.rc-line { height: 5px; background: rgba(47,51,51,0.1); border-radius: 3px; }
.rc-line-full { width: 100%; }
.rc-line-3q   { width: 75%; }
.rc-line-half { width: 50%; }

.rc-entry { display: flex; gap: 0.5rem; margin-top: 0.2rem; }
.rc-entry-dot { width: 4px; height: 4px; border-radius: 50%; background: #005eb4; margin-top: 0.35rem; flex-shrink: 0; }
.rc-entry-lines { flex: 1; display: flex; flex-direction: column; gap: 0.3rem; }

.rc-chips { display: flex; flex-wrap: wrap; gap: 0.25rem; }
.rc-chip { height: 14px; background: #f3f4f2; border: 1px solid rgba(47,51,51,0.1); border-radius: 4px; width: 50px; }
.rc-chip-sm { width: 36px; }

/* Floating badges */
.badge {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 0.375rem 0.625rem;
  border-radius: 8px;
  background: rgba(250,249,248,0.95);
  border: 1px solid rgba(0,94,180,0.2);
  color: #2f3333;
  backdrop-filter: blur(8px);
  white-space: nowrap;
}
.badge-icon { color: #005eb4; font-size: 0.875rem; }
.badge-1 { top: -14px; left: -28px; animation: badge-float 3s ease-in-out infinite; }
.badge-2 { bottom: 16px; right: -28px; animation: badge-float 3s ease-in-out infinite 1.5s; }
@keyframes badge-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}

/* ─── Stats strip ──────────────────────────────────────────────── */
.stats-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 1.75rem 2rem;
  border-top: 1px solid rgba(47,51,51,0.08);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
.stat { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; flex: 1; }
.stat-num {
  font-family: 'Inter', sans-serif;
  font-size: 1.875rem;
  font-weight: 600;
  color: #005eb4;
  line-height: 1;
}
.stat-label { font-size: 0.6875rem; font-weight: 400; color: rgba(47,51,51,0.45); letter-spacing: 0.03em; }
.stat-divider { width: 1px; height: 36px; background: rgba(47,51,51,0.1); flex-shrink: 0; }

/* ─── Section commons ──────────────────────────────────────────── */
.section-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 5rem 2rem;
}
.section-header {
  text-align: center;
  margin-bottom: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.section-eyebrow {
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #005eb4;
  margin: 0;
}
.section-headline {
  font-family: 'Inter', sans-serif;
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.04em;
  color: #2f3333;
  margin: 0;
}
.section-headline em { font-style: italic; color: #005eb4; }
.section-sub {
  font-size: 0.9375rem;
  font-weight: 400;
  line-height: 1.65;
  color: #5b605f;
  max-width: 500px;
  margin: 0;
}

/* ─── Features section ─────────────────────────────────────────── */
.features-section {
  background: #f3f4f2;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}
.feature-card {
  padding: 2rem;
  border: 1px solid rgba(47,51,51,0.07);
  border-radius: 8px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  transition: background 0.2s, box-shadow 0.2s;
}
.feature-card:hover {
  background: rgba(0,94,180,0.03);
  box-shadow: inset 0 0 0 1px rgba(0,94,180,0.08);
}
.feature-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(0,94,180,0.07);
  color: #005eb4;
  flex-shrink: 0;
}
.feature-title {
  font-family: 'Inter', sans-serif;
  font-size: 1.0625rem;
  font-weight: 600;
  color: #2f3333;
  margin: 0;
  line-height: 1.3;
}
.feature-desc {
  font-size: 0.8125rem;
  font-weight: 400;
  line-height: 1.65;
  color: #5b605f;
  margin: 0;
}

/* ─── How it works ─────────────────────────────────────────────── */
.how-section { background: #faf9f8; }

.steps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  position: relative;
}
.step-item {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  position: relative;
}
.step-num {
  font-family: 'Inter', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: rgba(0,94,180,0.25);
  line-height: 1;
}
.step-title {
  font-family: 'Inter', sans-serif;
  font-size: 1.0625rem;
  font-weight: 600;
  color: #2f3333;
  margin: 0;
  line-height: 1.3;
}
.step-desc {
  font-size: 0.8125rem;
  font-weight: 400;
  line-height: 1.65;
  color: #5b605f;
  margin: 0;
}

/* Step connector line */
.step-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 1.25rem;
  right: -1.25rem;
  width: 2.5rem;
  height: 1px;
  background: linear-gradient(to right, rgba(0,94,180,0.2), transparent);
}

/* ─── Quote section ────────────────────────────────────────────── */
.quote-section {
  background: #f3f4f2;
}
.quote-inner {
  max-width: 700px;
  margin: 0 auto;
  padding: 5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}
.quote-mark {
  font-family: 'Inter', sans-serif;
  font-size: 5rem;
  line-height: 0.6;
  color: #005eb4;
  opacity: 0.4;
  user-select: none;
}
.quote-text {
  font-family: 'Inter', sans-serif;
  font-size: clamp(1.375rem, 2.5vw, 2rem);
  font-weight: 400;
  font-style: italic;
  line-height: 1.45;
  color: #2f3333;
  margin: 0;
}
.quote-attribution {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
.quote-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #005eb4, #00529e);
  flex-shrink: 0;
}
.quote-name { font-size: 0.875rem; font-weight: 500; color: #2f3333; }
.quote-role { font-size: 0.75rem; font-weight: 400; color: #5b605f; }

/* ─── CTA ──────────────────────────────────────────────────────── */
.cta-section {
  background: radial-gradient(ellipse at center top, rgba(0,94,180,0.07) 0%, transparent 60%), #faf9f8;
}
.cta-inner {
  max-width: 640px;
  margin: 0 auto;
  padding: 6rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}
.cta-headline {
  font-family: 'Inter', sans-serif;
  font-size: clamp(2.25rem, 4vw, 3.5rem);
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: -0.04em;
  color: #2f3333;
  margin: 0;
}
.cta-headline em { font-style: italic; color: #005eb4; }
.cta-sub {
  font-size: 0.9375rem;
  font-weight: 400;
  line-height: 1.65;
  color: #5b605f;
  max-width: 440px;
  margin: 0;
}
.cta-actions {
  display: flex;
  gap: 0.875rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 0.5rem;
}
.cta-btn-primary {
  font-family: 'Inter', sans-serif;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, #005eb4, #00529e);
  border: none;
  border-radius: 4px;
  padding: 0.8125rem 2rem;
  cursor: pointer;
  transition: background 0.18s, transform 0.12s;
}
.cta-btn-primary:hover { background: #00529e; }
.cta-btn-primary:active { transform: scale(0.98); }
.cta-btn-ghost {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  color: #5b605f;
  background: transparent;
  border: 1px solid rgba(47,51,51,0.18);
  border-radius: 4px;
  padding: 0.8125rem 1.25rem;
  cursor: pointer;
  transition: all 0.15s;
}
.cta-btn-ghost:hover { color: #2f3333; border-color: rgba(47,51,51,0.3); }
.cta-fine {
  font-size: 0.6875rem;
  font-weight: 400;
  color: rgba(47,51,51,0.28);
  letter-spacing: 0.02em;
  margin: 0;
}

/* ─── Footer ───────────────────────────────────────────────────── */
.landing-footer {
  border-top: 1px solid rgba(47,51,51,0.08);
  background: #f3f4f2;
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  text-align: center;
}
.footer-brand { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.footer-tagline { font-size: 0.8125rem; font-weight: 400; color: rgba(47,51,51,0.45); margin: 0; font-style: italic; font-family: 'Inter', sans-serif; }
.footer-links { display: flex; gap: 1.5rem; flex-wrap: wrap; justify-content: center; }
.footer-a {
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgba(47,51,51,0.45);
  text-decoration: none;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  transition: color 0.15s;
}
.footer-a:hover { color: rgba(47,51,51,0.8); }
.footer-copy { font-size: 0.6875rem; color: rgba(47,51,51,0.25); font-weight: 400; margin: 0; }

/* ─── Animations ───────────────────────────────────────────────── */
.anim-fade-up {
  opacity: 0;
  animation: fadeUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.anim-fade-up-d1 { animation-delay: 0.1s; }
.anim-fade-up-d2 { animation-delay: 0.2s; }
.anim-fade-up-d3 { animation-delay: 0.32s; }
.anim-fade-up-d4 { animation-delay: 0.46s; }
.anim-fade-up-d5 { animation-delay: 0.60s; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Responsive ───────────────────────────────────────────────── */
@media (max-width: 900px) {
  .hero-inner { grid-template-columns: 1fr; gap: 3rem; padding-top: 3rem; }
  .hero-visual { order: -1; }
  .resume-card-wrap { width: 220px; }
  .hero-headline { font-size: 3rem; }
  .hero-sub { max-width: 100%; }
  .features-grid { grid-template-columns: 1fr 1fr; }
  .steps-grid { grid-template-columns: 1fr 1fr; }
  .step-item::after { display: none; }
  .nav-links { display: none; }
}
@media (max-width: 600px) {
  .features-grid { grid-template-columns: 1fr; }
  .steps-grid { grid-template-columns: 1fr; }
  .stats-strip { flex-wrap: wrap; }
  .stat-divider { display: none; }
  .badge { display: none; }
}
</style>
