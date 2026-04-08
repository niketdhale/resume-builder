<script setup>
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme.js'

const router = useRouter()
const { isDark, toggleTheme } = useTheme()

const features = [
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    title: 'Seven premium templates',
    desc: 'Ranging from executive serif to modern two-column — each template is precision-crafted for ATS compatibility and human first-impressions alike.',
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>`,
    title: 'Real-time live preview',
    desc: 'Every keystroke updates your resume instantly. The split-panel editor keeps your content and your design in perfect view at all times.',
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    title: 'Pixel-perfect PDF export',
    desc: 'Download a print-ready PDF in A4, Letter, or Legal format. What you see is precisely what the hiring manager receives.',
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
    title: 'Typographic control',
    desc: 'Choose from 30+ Google Fonts across three categories. Control size, spacing, and heading styles to make every resume uniquely yours.',
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    title: 'Cloud sync & offline',
    desc: 'Works completely in your browser with no account required. Sign in with email when you want your resumes synced across every device.',
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    title: '13 supported languages',
    desc: 'Create language variants of the same resume — ideal for international job applications without duplicating work.',
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
          <div class="wordmark-icon">R</div>
          <span class="wordmark-text">Résumé Builder</span>
        </div>

        <!-- Links (desktop) -->
        <div class="nav-links">
          <a href="#features" class="nav-a">Features</a>
          <a href="#how-it-works" class="nav-a">How it works</a>
          <a href="#" class="nav-a">Templates</a>
        </div>

        <!-- Actions -->
        <div class="nav-actions">
          <button class="nav-btn-ghost" @click="router.push('/auth')">Sign in</button>
          <button class="nav-btn-primary" @click="router.push({ name: 'overview' })">
            Start free
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
            Built for the serious professional
          </div>

          <h1 class="hero-headline anim-fade-up anim-fade-up-d2">
            Your career,<br>
            <em>beautifully</em><br>
            presented.
          </h1>

          <p class="hero-sub anim-fade-up anim-fade-up-d3">
            The resume builder that respects your craft.
            Seven premium templates, real-time preview, and
            pixel-perfect PDF export — no subscriptions required.
          </p>

          <div class="hero-actions anim-fade-up anim-fade-up-d4">
            <button class="hero-cta-primary" @click="router.push({ name: 'overview' })">
              Start building — it's free
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
          <p class="section-eyebrow">Everything you need</p>
          <h2 class="section-headline">Crafted for the<br><em>serious professional</em></h2>
          <p class="section-sub">Not a template mill. Not a subscription trap. A precision tool built for people who take their career seriously.</p>
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
        <h2 class="cta-headline">Ready to make<br><em>your mark?</em></h2>
        <p class="cta-sub">Join thousands of professionals who've landed their next role with a resume that stands apart.</p>
        <div class="cta-actions">
          <button class="cta-btn-primary" @click="router.push({ name: 'overview' })">
            Create your resume — free
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
            <div class="wordmark-icon">R</div>
            <span class="wordmark-text">Résumé Builder</span>
          </div>
          <p class="footer-tagline">Craft the career you deserve.</p>
        </div>
        <div class="footer-links">
          <a href="#features" class="footer-a">Features</a>
          <a href="#how-it-works" class="footer-a">How it works</a>
          <button class="footer-a" @click="router.push({ name: 'overview' })">My Resumes</button>
          <button class="footer-a" @click="router.push('/auth')">Sign in</button>
        </div>
        <p class="footer-copy">© 2025 Résumé Builder. All rights reserved.</p>
      </div>
    </footer>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

/* ─── Root ─────────────────────────────────────────────────────── */
.landing-root {
  font-family: 'DM Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  background: #0C0B09;
  color: #F0EDE6;
  min-height: 100vh;
  overflow-x: hidden;
}

/* ─── Nav ──────────────────────────────────────────────────────── */
.landing-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(12,11,9,0.85);
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
  background: #B8923A;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 1.125rem;
  font-weight: 500;
  color: #fff;
  flex-shrink: 0;
}
.wordmark-text {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.125rem;
  font-weight: 500;
  color: #F0EDE6;
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
  color: rgba(240,237,230,0.55);
  text-decoration: none;
  transition: color 0.15s;
  letter-spacing: 0.01em;
}
.nav-a:hover { color: #F0EDE6; }

/* Nav actions */
.nav-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.nav-btn-ghost {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgba(240,237,230,0.65);
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  padding: 0.375rem 0.875rem;
  cursor: pointer;
  transition: all 0.15s;
}
.nav-btn-ghost:hover { color: #F0EDE6; border-color: rgba(255,255,255,0.22); background: rgba(255,255,255,0.04); }
.nav-btn-primary {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #fff;
  background: #B8923A;
  border: none;
  border-radius: 8px;
  padding: 0.375rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: background 0.15s;
}
.nav-btn-primary:hover { background: #A07E2E; }

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
  background: radial-gradient(ellipse at center, rgba(184,146,58,0.08) 0%, transparent 70%);
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
  color: #B8923A;
}
.eyebrow-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  background: #B8923A;
  border-radius: 50%;
}
.hero-headline {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(3.25rem, 5.5vw, 5rem);
  font-weight: 300;
  line-height: 1.04;
  letter-spacing: -0.025em;
  color: #F0EDE6;
  margin: 0;
}
.hero-headline em {
  font-style: italic;
  font-weight: 300;
  color: #C8A050;
}
.hero-sub {
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.65;
  color: rgba(240,237,230,0.55);
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
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #fff;
  background: #B8923A;
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1.75rem;
  cursor: pointer;
  transition: background 0.18s, transform 0.12s;
  letter-spacing: 0.005em;
}
.hero-cta-primary:hover { background: #A07E2E; }
.hero-cta-primary:active { transform: scale(0.98); }
.hero-cta-ghost {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  color: rgba(240,237,230,0.5);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s;
}
.hero-cta-ghost:hover { color: rgba(240,237,230,0.85); }
.hero-fine {
  font-size: 0.75rem;
  font-weight: 300;
  color: rgba(240,237,230,0.3);
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
.rc-avatar { width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg, #D4A94A, #B8923A); flex-shrink: 0; }
.rc-info { flex: 1; display: flex; flex-direction: column; gap: 0.375rem; padding-top: 0.25rem; }
.rc-name { height: 10px; background: #1A1914; border-radius: 4px; width: 70%; }
.rc-title { height: 7px; background: #B8923A; border-radius: 4px; width: 50%; opacity: 0.7; }
.rc-divider { height: 1px; background: linear-gradient(to right, #B8923A, transparent); margin-bottom: 0.875rem; }

.rc-body { display: flex; flex-direction: column; gap: 0.875rem; }
.rc-section { display: flex; flex-direction: column; gap: 0.35rem; }
.rc-section-label { height: 7px; background: #1A1914; border-radius: 3px; width: 40%; margin-bottom: 0.2rem; }
.rc-line { height: 5px; background: #E5E3DC; border-radius: 3px; }
.rc-line-full { width: 100%; }
.rc-line-3q   { width: 75%; }
.rc-line-half { width: 50%; }

.rc-entry { display: flex; gap: 0.5rem; margin-top: 0.2rem; }
.rc-entry-dot { width: 4px; height: 4px; border-radius: 50%; background: #B8923A; margin-top: 0.35rem; flex-shrink: 0; }
.rc-entry-lines { flex: 1; display: flex; flex-direction: column; gap: 0.3rem; }

.rc-chips { display: flex; flex-wrap: wrap; gap: 0.25rem; }
.rc-chip { height: 14px; background: #F5F3EF; border: 1px solid #E5E3DC; border-radius: 4px; width: 50px; }
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
  background: rgba(12,11,9,0.9);
  border: 1px solid rgba(184,146,58,0.3);
  color: #F0EDE6;
  backdrop-filter: blur(8px);
  white-space: nowrap;
}
.badge-icon { color: #B8923A; font-size: 0.875rem; }
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
  border-top: 1px solid rgba(255,255,255,0.06);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
.stat { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; flex: 1; }
.stat-num {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.875rem;
  font-weight: 300;
  color: #B8923A;
  line-height: 1;
}
.stat-label { font-size: 0.6875rem; font-weight: 400; color: rgba(240,237,230,0.4); letter-spacing: 0.03em; }
.stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.08); flex-shrink: 0; }

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
  color: #B8923A;
  margin: 0;
}
.section-headline {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0;
}
.section-headline em { font-style: italic; color: #C8A050; }
.section-sub {
  font-size: 0.9375rem;
  font-weight: 300;
  line-height: 1.65;
  color: rgba(240,237,230,0.5);
  max-width: 500px;
  margin: 0;
}

/* ─── Features section ─────────────────────────────────────────── */
.features-section {
  background: #111009;
  border-top: 1px solid rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.features-section .section-headline,
.features-section .section-sub { color: #F0EDE6; }
.features-section .section-sub { color: rgba(240,237,230,0.5); }

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
}
.feature-card {
  padding: 2rem;
  border: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  transition: background 0.2s;
}
.feature-card:hover { background: rgba(184,146,58,0.04); }
.feature-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(184,146,58,0.08);
  color: #B8923A;
  flex-shrink: 0;
}
.feature-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.125rem;
  font-weight: 500;
  color: #F0EDE6;
  margin: 0;
  line-height: 1.3;
}
.feature-desc {
  font-size: 0.8125rem;
  font-weight: 300;
  line-height: 1.65;
  color: rgba(240,237,230,0.45);
  margin: 0;
}

/* ─── How it works ─────────────────────────────────────────────── */
.how-section { background: #0C0B09; }
.how-section .section-headline { color: #F0EDE6; }

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
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.5rem;
  font-weight: 300;
  color: rgba(184,146,58,0.35);
  line-height: 1;
}
.step-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.1875rem;
  font-weight: 500;
  color: #F0EDE6;
  margin: 0;
  line-height: 1.3;
}
.step-desc {
  font-size: 0.8125rem;
  font-weight: 300;
  line-height: 1.65;
  color: rgba(240,237,230,0.45);
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
  background: linear-gradient(to right, rgba(184,146,58,0.3), transparent);
}

/* ─── Quote section ────────────────────────────────────────────── */
.quote-section {
  background: #111009;
  border-top: 1px solid rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.05);
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
  font-family: 'Cormorant Garamond', serif;
  font-size: 5rem;
  line-height: 0.6;
  color: #B8923A;
  opacity: 0.4;
  user-select: none;
}
.quote-text {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.375rem, 2.5vw, 2rem);
  font-weight: 300;
  font-style: italic;
  line-height: 1.45;
  color: #F0EDE6;
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
  background: linear-gradient(135deg, #B8923A, #7A6025);
  flex-shrink: 0;
}
.quote-name { font-size: 0.875rem; font-weight: 500; color: #F0EDE6; }
.quote-role { font-size: 0.75rem; font-weight: 300; color: rgba(240,237,230,0.45); }

/* ─── CTA ──────────────────────────────────────────────────────── */
.cta-section {
  background: radial-gradient(ellipse at center top, rgba(184,146,58,0.1) 0%, transparent 60%), #0C0B09;
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
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2.25rem, 4vw, 3.5rem);
  font-weight: 300;
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: #F0EDE6;
  margin: 0;
}
.cta-headline em { font-style: italic; color: #C8A050; }
.cta-sub {
  font-size: 0.9375rem;
  font-weight: 300;
  line-height: 1.65;
  color: rgba(240,237,230,0.45);
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
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #fff;
  background: #B8923A;
  border: none;
  border-radius: 10px;
  padding: 0.8125rem 2rem;
  cursor: pointer;
  transition: background 0.18s, transform 0.12s;
}
.cta-btn-primary:hover { background: #A07E2E; }
.cta-btn-primary:active { transform: scale(0.98); }
.cta-btn-ghost {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  color: rgba(240,237,230,0.55);
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: 0.8125rem 1.25rem;
  cursor: pointer;
  transition: all 0.15s;
}
.cta-btn-ghost:hover { color: #F0EDE6; border-color: rgba(255,255,255,0.22); }
.cta-fine {
  font-size: 0.6875rem;
  font-weight: 300;
  color: rgba(240,237,230,0.28);
  letter-spacing: 0.02em;
  margin: 0;
}

/* ─── Footer ───────────────────────────────────────────────────── */
.landing-footer {
  border-top: 1px solid rgba(255,255,255,0.06);
  background: #0C0B09;
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
.footer-tagline { font-size: 0.8125rem; font-weight: 300; color: rgba(240,237,230,0.35); margin: 0; font-style: italic; font-family: 'Cormorant Garamond', serif; }
.footer-links { display: flex; gap: 1.5rem; flex-wrap: wrap; justify-content: center; }
.footer-a {
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgba(240,237,230,0.4);
  text-decoration: none;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  transition: color 0.15s;
}
.footer-a:hover { color: rgba(240,237,230,0.8); }
.footer-copy { font-size: 0.6875rem; color: rgba(240,237,230,0.2); font-weight: 300; margin: 0; }

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
