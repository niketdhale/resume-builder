# Resume Builder

<p align="center">
  <!-- License -->
  <a href="https://github.com">
   <img alt="GitHub License" src="https://img.shields.io/github/license/niketdhale/resume-builder">
  </a>

  <!-- Stars -->
  <a href="https://github.com">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/niketdhale/resume-builder">
  </a>

  <!-- Last Commit -->
  <a href="https://github.com/commits">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/niketdhale/resume-builder">
  </a>

  <a href="https://github.com/commits">
    <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/niketdhale/resume-builder/ci.yml">
  </a>

</p>


A modern, fully-featured resume builder built with **Vue 3** and **Tailwind CSS**. Create, customize, and export professional resumes with real-time preview, multiple templates, cloud sync, and a built-in job application tracker.

**Fully responsive** — works on mobile, tablet, and desktop.

---

## Features

### Resume Editor

- **Real-time preview** — see changes as you type, paginated across A4 / Letter / A3 / Legal pages
- **Drag & drop** — reorder sections and entries with touch support
- **Undo / Redo** — full history with `Ctrl+Z` / `Ctrl+Shift+Z`
- **Resume Info** — name, job title, email, phone, location, LinkedIn, website, profile photo
- **Multiple sections** — Experience, Education, Skills, Projects, Certifications, and custom sections
- **Language variants** — create translated copies of any resume (EN, FR, DE, ES, and more)

### Customization

- **Templates** — Classic, Executive, Modern, Creative, and more
- **Fonts & Typography** — font family, size, line height, margins
- **Layouts** — one-column, two-column, or mixed column per section
- **Colors & Design** — accent color, heading styles, border styles
- **Header layouts** — Classic, Centered, Compact, Bold
- **Per-section control** — toggle visibility, assign columns, reorder

### Export & Import

- **PDF export** via `html2pdf.js` with accurate page rendering
- **JSON export / import** for backup and sharing
- **Print** directly from browser

### Job Tracker

- Track applications with company, role, status, salary, applied date, and linked resume
- **Table view** and **Kanban board** with drag-to-change-status
- Filter by status (Applied, Interview, Offered, Rejected)
- Stats dashboard with response rate, interview rate, offer count, and average response time
- Chart visualisation of application history

### Auth & Cloud Sync

- **Guest mode** — works fully offline with `localStorage`, no account needed
- **Sign in with magic link** (Supabase) — data syncs to the cloud automatically on login
- **Offline queue** — changes made offline sync when back online

### Responsive UI

- **Mobile (< 768px)** — hamburger drawer nav, single-column card list, bottom tab bar in editor, card list for jobs, FAB buttons, bottom-sheet modals
- **Tablet (768px – 1023px)** — 2-column resume grid, stacked editor with bottom tabs, compact job table
- **Desktop (1024px+)** — 40/60 split editor, 4-column resume grid, full job table / board
- **Dark mode** — full dark theme, toggleable from nav or drawer

---

## Tech Stack

| Category    | Library                                                                           |
| ----------- | --------------------------------------------------------------------------------- |
| Framework   | [Vue 3](https://vuejs.org/) (Composition API)                                     |
| Build       | [Vite 7](https://vite.dev/)                                                       |
| Styling     | [Tailwind CSS v4](https://tailwindcss.com/)                                       |
| Routing     | [Vue Router 5](https://router.vuejs.org/)                                         |
| Icons       | [Lucide Vue Next](https://lucide.dev/)                                            |
| Drag & Drop | [vue-draggable-next](https://github.com/SortableJS/vue.draggable.next)            |
| PDF Export  | [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) + jsPDF + html2canvas-pro |
| Charts      | [Chart.js](https://www.chartjs.org/)                                              |
| Backend     | [Supabase](https://supabase.com/) (auth + database)                               |
| Utilities   | [@vueuse/core](https://vueuse.org/)                                               |
| Testing     | [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)             |

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
│   ├── OverviewView.vue    # Resume list / dashboard
│   ├── EditorView.vue      # Resume editor (split panel)
│   ├── JobsView.vue        # Job application tracker
│   └── AuthView.vue        # Magic link login
├── components/
│   ├── customize/          # Customization panel tabs (Templates, Basics, Layout, Design, Header, Sections)
│   ├── editor/             # Section & entry list with drag and drop
│   ├── preview/            # Resume page rendering & pagination
│   └── ui/                 # NavBar, MobileDrawer, MobileEditorTabs, DatePicker
├── composables/            # Shared state & logic (resume, history, storage, PDF, auth, breakpoint)
├── jobs/                   # Job tracker feature module
│   └── components/         # BoardView, TableView, StatsBar, JobChart, AddJobModal
├── services/
│   ├── auth/               # Guest + Supabase auth adapters
│   └── storage/            # localStorage + cloud storage adapters
├── constants/              # Resume templates & section defaults
└── utils/                  # Column derivation, UID generation
```

---

## Scripts

| Command           | Description                |
| ----------------- | -------------------------- |
| `bun dev`         | Start dev server           |
| `bun run build`   | Production build           |
| `bun run preview` | Preview production build   |
| `bun test`        | Run unit tests (Vitest)    |
| `bun test:ui`     | Run e2e tests (Playwright) |
| `bun lint`        | Lint with ESLint           |
| `bun format`      | Format with Prettier       |

---

## IDE Setup

[VS Code](https://code.visualstudio.com/) with the [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension (disable Vetur if installed).

**Recommended browser extensions for development:**

- [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) (Chrome/Edge)
- [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/) (Firefox)
