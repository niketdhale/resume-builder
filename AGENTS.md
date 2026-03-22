# Agent Guidelines — Resume Builder

Vue 3 + Vite + Tailwind CSS v4 + Bun resume builder with 15 section types, live preview, dark mode.

**State:** Module-level singleton composables (no Pinia)  
**Storage:** localStorage (now) → Supabase (future)

---

## Commands

```powershell
# Development
bun dev                    # Dev server → http://localhost:5173
bun run build              # Production build → dist/
bun run lint               # ESLint check (fail on warnings)
bun run lint:oxlint        # oxlint (faster alternative)
bun run lint:eslint        # eslint only
bun run format             # Prettier format

# Testing
bun run test               # Vitest watch mode
bun run test:run           # Vitest run once (CI)
bun run test:run src/composables/__tests__/useResumeActions.test.js  # Single file
bun run test:coverage      # Coverage report
bun run test:e2e           # Playwright E2E tests
bun run test:e2e:ui        # Playwright with UI

# Full CI check
bun run lint; bun run test:run; bun run build
```

---

## Code Style

### Imports

- Use `../` relative paths (no aliases configured)
- Order: Vue → external libs → internal → utils → constants
- **Always include `.js` extension**: `from '../utils/uid.js'`

### Vue Components

- Use `<script setup>` syntax
- `defineProps()` without assignment (Vue auto-exposes in template)
- Computed refs need `.value` in `<script>`, auto-unwrap in `<template>`
- Keep `@change` handlers on single lines

### Composables

- **Singleton pattern**: module-level `ref`/`computed` shared across all components
- Export factory function + named exports: `export function useX() { ... }`
- Helper functions at module level: `function now() { return new Date().toISOString() }`

### Tailwind CSS v4

- Global dark mode strategy in `style.css`:
  ```css
  @variant dark (&:where(.dark, .dark *));
  ```
- Component usage: `class="bg-white dark:bg-gray-900"`
- `scrollbar-hide` not default — defined in style.css

### Error Handling

- Storage adapters: try/catch, return false/null on failure, log to console
- Always log warnings with namespace: `[localAdapter] Failed to save...`
- No silent failures

---

## Naming Conventions

| Type               | Convention        | Example                      |
| ------------------ | ----------------- | ---------------------------- |
| Files: Composables | camelCase + .js   | `useResumeState.js`          |
| Files: Components  | PascalCase + .vue | `NavBar.vue`                 |
| Props              | camelCase         | `dateStyle`, `subtitleStyle` |
| State              | `ref` suffix      | `resumesRef`                 |
| Computed           | descriptive       | `activeSections`             |

### 15 Section Types

`experience`, `education`, `skills`, `languages`, `certificates`, `interests`, `projects`, `courses`, `awards`, `organisations`, `publications`, `references`, `declaration`, `dob`, `custom`

---

## Data Shapes

```js
// Resume
{ id, userId, title, pageSize, settings: {}, metadata: {}, createdAt, updatedAt }

// Section
{ id, userId, resumeId, title, type, description, sharedAcrossViews, viewIds, isCollapsed, entries, createdAt, updatedAt }

// Entry
{ id, userId, sectionId, isVisible, isEditing, information, createdAt, updatedAt, ...typeFields }
```

---

## Architecture

```
services/
├── storage/
│   ├── index.js        # Adapter selector
│   ├── localAdapter.js # localStorage impl
│   └── cloudAdapter.js # Supabase stub
└── auth/
    ├── index.js       # Auth selector
    └── guestAuth.js   # userId: 'local'

components/
├── ui/           # Shared UI (NavBar)
├── editor/      # SectionList, SectionItem, EntryList, EntryItem
├── customize/   # CustomizePanel + 5 sub-tabs (Basics, Header, Design, Layout, Sections)
└── preview/     # PreviewPanel, ResumePage, SectionContent, ResumeHeader

views/
├── OverviewView.vue   # /
├── EditorView.vue     # /editor/:id
├── JobsView.vue       # /jobs (stub)
└── AuthView.vue       # /auth (stub)
```

When Supabase is added: only 4 service files change. Zero component changes.

---

## ESLint

- Flat config in `eslint.config.js`
- Ignores: `dist/**`, `node_modules/**`, `coverage/**`, `playwright-report/**`
- Node globals: `vite.config.js`, `playwright.config.js`, `eslint.config.js`
- Test globals: `describe`, `it`, `expect`, `beforeEach`, `afterEach` in `src/**/*.test.js`
- Use `/* eslint-disable no-unused-vars */` for stub files

---

## Gotchas

- `useRoute()` must be called inside `setup()`
- `vue-draggable-next` needs a local ref copy (not computed) for v-model
- Resume preview always stays white (even in dark mode)
- `html2canvas` doesn't support oklch — aliased to `html2canvas-pro` in vite.config.js
- `dist/**` must be in ESLint ignores array

---

## Commit Conventions

```
feat:     new feature
fix:      bug fix
refactor: code change without feature/fix
style:    formatting, dark mode classes
chore:    dependencies, config, CI
docs:     documentation
ci:       CI/CD changes
test:     adding/updating tests
```
