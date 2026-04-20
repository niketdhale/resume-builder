# CuratorWorkspace

<p align="center">
  <!-- License -->
  <a href="https://github.com/niketdhale/resume-builder/blob/main/LICENSE">
   <img alt="GitHub License" src="https://img.shields.io/github/license/niketdhale/resume-builder">
  </a>

  <!-- Last Commit -->
  <a href="https://github.com/niketdhale/resume-builder/commits">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/niketdhale/resume-builder">
  </a>

  <!-- Github Action Workflow Status -->
  <a href="https://github.com/niketdhale/resume-builder/actions">
    <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/niketdhale/resume-builder/ci.yml">
  </a>

  <!-- Stars -->
  <a href="https://github.com/niketdhale/resume-builder/stargazers">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/niketdhale/resume-builder">
  </a>
</p>

A modern, fully-featured resume builder built with **Vue 3** and **Tailwind CSS**. Craft, curate, and export professional resumes with real-time preview, multiple templates, cloud sync, version control, and a built-in job application tracker.

**Fully responsive** — works on mobile, tablet, and desktop.

---

## What's New — UI Redesign v3 (Paper & Ink)

This release introduces a complete visual overhaul under the **"Paper & Ink"** design system — a light, editorial aesthetic built for professionals who treat their career as a portfolio.

### Design System

- **New identity** — rebranded from *Resume Builder* to **CuratorWorkspace** throughout the app
- **Light paper theme** — warm white (`#faf9f8`) replaces the previous dark background; readable in any environment
- **Inter typography** — replaced Cormorant Garamond + DM Sans with Inter across the entire UI for clarity and consistency
- **Blue primary accent** — `#005eb4` (light) / `#0075DE` (dark) replaces the warm gold accent; applied through a single CSS variable (`--gold`) for zero-breaking-change propagation
- **Full dark mode support** — all components now use CSS design tokens (`var(--bg-surface)`, `var(--ink)`, `var(--border)`, etc.) instead of hardcoded Tailwind `dark:` classes, ensuring consistent theming in both modes

### Landing Page

- Redesigned hero: *"The invisible architecture of a perfect career."* — tight letter-spacing, editorial voice
- 4-card feature grid (2×2) replacing the previous 6-card layout: **Adaptive Hierarchy**, **Version Control**, **Pipeline View**, **Language Variants**
- New testimonials section: *"Voices of the Curated"*
- New bottom CTA: *"Ready to start curating?"*
- Updated nav: Product / Templates / Pricing / Resources with *"Build Resume"* CTA
- Updated footer with CuratorWorkspace branding

### Auth Page

- Left branding panel fully updated: light paper background, Inter font, blue accent
- Headline: *"The invisible architecture of a perfect career."* with blue highlight
- Updated feature checklist copy matching the new brand voice

### Customize Panel (All Tabs)

All six customize panel tabs — **Templates**, **Basics**, **Layout**, **Design**, **Header**, **Sections** — have been migrated from hardcoded Tailwind gray/indigo classes to the CSS token system:

- Card wrappers, borders, labels, hover states, active selection states, checkboxes, and range sliders all use design tokens
- Active option cards: `indigo-500` → `var(--gold)` blue accent
- Preview bar decorative lines inside option cards use border/ink tokens

### Editor & Preview

- Section list card borders updated to blue token
- Sections tab column drop zones (Left / Right / Full width) use CSS variables; indigo hover borders replaced with blue
- Preview panel empty-state placeholder correctly themed for both light and dark modes

### Global Token Cleanup

All hardcoded legacy gold hex values (`#B8923A`, `rgba(184,146,58,...)`) replaced with blue equivalents across 9 Chart.js chart files, BoardView, JobChart, MobileDrawer, DiffModal, AuthView, JobsView, useGroups.js, overview thumbnails, and FAB shadows.

---

## Features

### Resume Editor

- **Real-time preview** — see changes as you type, paginated across A4 / Letter / A3 / Legal pages
- **Drag & drop** — reorder sections and entries with touch support
- **Undo / Redo** — full history with `Ctrl+Z` / `Ctrl+Shift+Z`
- **Resume Info** — name, job title, email, phone, location, LinkedIn, website, profile photo
- **Multiple sections** — Experience, Education, Skills, Projects, Certifications, and custom sections.
- **Language variants** — create translated copies of any resume (EN, FR, DE, ES, and more)

### Customization

- **Templates** — Classic, Executive, Modern, Creative, and more
- **Fonts & Typography** — font family, size, line height, margins
- **Layouts** — one-column, two-column, or mixed column per section
- **Colors & Design** — accent color, heading styles, border styles
- **Header layouts** — Classic, Centered, Compact, Bold
- **Per-section control** — toggle visibility, assign columns, reorder

### Version Control

- **Commit snapshots** — save named checkpoints of any resume at any point
- **Branch & switch** — create branches for different roles or industries and switch between them instantly
- **Time travel** — check out any past commit non-destructively to review previous versions
- **Revert** — roll back to any snapshot by creating a new commit from it
- **Tags** — mark important versions (e.g. `v1-applied-google`)
- **Diff view** — visual diff between any two commits

### Export & Import

- **PDF export** via `html2pdf.js` with accurate page rendering
- **JSON export / import** for backup and sharing
- **Print** directly from browser

### Job Tracker

- Track applications with company, role, status, salary, applied date, and linked resume
- **Table view** and **Kanban board** with drag-to-change-status
- Filter by status (Applied, Screening, Interview, Offer, Rejected, Withdrawn)
- **Stats dashboard** with response rate, interview rate, offer count, and average response time
- **Chart visualisations** — pipeline funnel, timeline, salary comparison, response time, heatmap, day-of-week activity, donut breakdown, company comparison, Sankey flow

### Group Management

- Organise resumes into named groups (e.g. by industry, target company, or role type)
- Drag resumes between groups in the overview
- Groups persisted in the virtual git filesystem alongside resume data

### Auth & Cloud Sync

- **Guest mode** — works fully offline with `localStorage`, no account needed
- **Sign in with magic link** (Supabase) — data syncs to the cloud automatically on login
- **Offline queue** — changes made offline sync when back online

### Responsive UI

- **Mobile (< 768px)** — hamburger drawer nav, single-column card list, bottom tab bar in editor, card list for jobs, FAB buttons, bottom-sheet modals
- **Tablet (768px – 1023px)** — 2-column resume grid, stacked editor with bottom tabs, compact job table
- **Desktop (1024px+)** — 40/60 split editor, 4-column resume grid, full job table / board
- **Dark mode** — full dark theme via CSS tokens, toggleable from nav or drawer

---

## Tech Stack

| Category        | Library                                                                            |
| --------------- | ---------------------------------------------------------------------------------- |
| Framework       | [Vue 3](https://vuejs.org/) (Composition API)                                      |
| Build           | [Vite 7](https://vite.dev/)                                                        |
| Styling         | [Tailwind CSS v4](https://tailwindcss.com/) + CSS custom properties                |
| Typography      | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts                  |
| Routing         | [Vue Router 5](https://router.vuejs.org/)                                          |
| Icons           | [Lucide Vue Next](https://lucide.dev/)                                             |
| Drag & Drop     | [vue-draggable-next](https://github.com/SortableJS/vue.draggable.next)             |
| PDF Export      | [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) + jsPDF + html2canvas-pro |
| Charts          | [Chart.js](https://www.chartjs.org/)                                               |
| Version Control | [isomorphic-git](https://isomorphic-git.org/) + LightningFS (IndexedDB)            |
| Backend         | [Supabase](https://supabase.com/) (auth + database)                                |
| Utilities       | [@vueuse/core](https://vueuse.org/)                                                |
| Testing         | [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)              |

---

## Getting Started

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- [Bun](https://bun.sh/) (recommended) or npm

### Install

```sh
bun install
# or
npm install
```

### Development

```sh
bun dev
# or
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```sh
bun run build
# or
npm run build
```

### Preview Production Build

```sh
bun run preview
```

---

## Cloud Sync Setup (Optional)

The app works fully in guest mode without any configuration. To enable magic-link login and cloud sync:

1. Create a [Supabase](https://supabase.com/) project
2. Copy `.env.example` to `.env.local`
3. Fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Run the database migrations from `supabase/migrations/` in your Supabase SQL editor

Without these variables, the app runs entirely on `localStorage`.

---

## Project Structure

```
src/
├── views/                  # Page-level components
│   ├── LandingView.vue     # Marketing landing page (Paper & Ink redesign)
│   ├── OverviewView.vue    # Resume list / dashboard
│   ├── EditorView.vue      # Resume editor (split panel)
│   ├── JobsView.vue        # Job application tracker
│   └── AuthView.vue        # Magic link login
├── components/
│   ├── customize/          # Customization panel tabs (Templates, Basics, Layout, Design, Header, Sections)
│   ├── editor/             # Section & entry list with drag and drop
│   ├── preview/            # Resume page rendering & pagination
│   ├── versions/           # Version control UI (history panel, branch switcher, commit dialog, diff modal)
│   ├── groups/             # Group management modal
│   └── ui/                 # NavBar, MobileDrawer, MobileEditorTabs, DatePicker
├── composables/            # Shared state & logic (resume, history, storage, PDF, auth, version control, groups, breakpoint)
├── jobs/                   # Job tracker feature module
│   └── components/         # BoardView, TableView, StatsBar, JobChart, AddJobModal, charts/
├── services/
│   ├── auth/               # Guest + Supabase auth adapters
│   ├── storage/            # localStorage + cloud storage adapters
│   └── git/                # isomorphic-git wrapper, LightningFS, virtual FS serialization
├── constants/              # Resume templates & section defaults
└── utils/                  # Column derivation, UID generation
```

---

## Design Tokens

The UI is driven by CSS custom properties defined in `src/style.css`. All components consume these tokens — override them to retheme the entire app in one place.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--bg-base` | `#FAFAF8` | `#0F0F0D` | Page background |
| `--bg-subtle` | `#F5F3EF` | `#1A1917` | Hover states, subtle sections |
| `--bg-surface` | `#FFFFFF` | `#1C1B18` | Cards, panels, inputs |
| `--ink` | `#1A1914` | `#F0EDE6` | Primary text |
| `--ink-2` | `#6B6858` | `#B0AA9E` | Secondary text |
| `--ink-3` | `#A09E94` | `#6E6A60` | Muted / placeholder text |
| `--border` | `#E5E3DC` | `#2A2825` | Borders |
| `--gold` | `#005eb4` | `#0075DE` | Primary accent (blue) |
| `--gold-hover` | `#00529e` | `#005eb4` | Hover state |
| `--gold-bg` | `rgba(0,94,180,0.07)` | `rgba(0,117,222,0.07)` | Accent tint background |

> **Note:** The variable is named `--gold` for backward compatibility. The rendered color is blue.

---

## Scripts

| Command             | Description                |
| ------------------- | -------------------------- |
| `bun dev`           | Start dev server           |
| `bun run build`     | Production build           |
| `bun run preview`   | Preview production build   |
| `bun test`          | Run unit tests (Vitest)    |
| `bun test:e2e`      | Run e2e tests (Playwright) |
| `bun run lint`      | Lint with ESLint           |
| `bun run format`    | Format with Prettier       |

---

## IDE Setup

[VS Code](https://code.visualstudio.com/) with the [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension (disable Vetur if installed).

**Recommended browser extensions for development:**

- [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) (Chrome/Edge)
- [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/) (Firefox)

---

## License

[MIT](./LICENSE)
