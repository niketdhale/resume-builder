# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun run dev          # Start dev server at http://localhost:5173
bun run build        # Production build
bun run preview      # Preview production build

# Testing
bun run test         # Vitest unit tests (watch mode)
bun run test:run     # Vitest unit tests (single run)
bun run test:coverage  # Unit tests with coverage report
bun run test:e2e     # Playwright e2e tests (auto-starts dev server)
bun run test:e2e:ui  # Playwright with interactive UI

# Linting / formatting
bun run lint         # ESLint (no auto-fix, 0 max warnings)
bun run lint:eslint  # ESLint with --fix
bun run lint:oxlint  # oxlint with --fix
bun run format       # Prettier on src/
```

Unit tests live in `src/**/*.test.js`. To run a single test file:
```bash
bun run vitest run src/path/to/file.test.js
```

E2e tests require the dev server; Playwright starts it automatically via `webServer` in `playwright.config.js`.

## Architecture

This is a **Vue 3 + Vite** single-page app using Composition API, Vue Router, and Tailwind CSS v4. State is managed via composables (no Pinia/Vuex).

### State layer — `src/composables/`

All reactive state is in plain composables (module-level `ref`/`computed`), not a store:

- **`useResumeState.js`** — single source of truth: `resumes`, `sections`, `activeResumeId`, and derived `activeSettings`, `activeSections`, `activeMetadata`.
- **`useResumeActions.js`**, **`useSectionActions.js`**, **`useEntryActions.js`** — mutation helpers for resumes, sections, and entries respectively.
- **`useHistory.js`** — undo/redo over serialized state snapshots.
- **`useStorage.js`** — orchestrates persistence: loads on mount, saves on state change, handles auth-triggered migrations. Exposes `syncStatus` ref (`idle → saving → synced/pending`) and `suppressSaves` ref (suppresses watchers during migration/restore). An offline queue (`rb_offline_queue` in localStorage) retries failed writes on reconnect.
- **`useAuth.js`** — singleton auth state (`user`, `isLoggedIn`, `userId`, `userEmail`, `userInitial`); bootstraps on first import.
- **`useGroups.js`** — group management (`groupedResumes` computed, `createGroup`, `renameGroup`, `deleteGroup`, `assignResumeToGroup`, `hydrateGroups`). Groups are stored in the virtual git FS; all mutations auto-commit.
- **`useVersionControl.js`** — exposes `currentBranch`, `commitLog`, `allTags`, `isDirty`, `vcReady`; operations: `commitChanges`, `createBranch`, `switchBranch`, `removeBranch`, `checkoutCommit` (non-destructive time-travel), `revertToCommit` (creates new commit), `createTag`, `removeTag`, `diffCommits`.
- **`useMigration.js`** — one-shot localStorage→Supabase migration on first login; remaps local IDs to UUIDs, suppresses saves during migration.
- **`usePdfExport.js`** — PDF generation via html2pdf/jsPDF.
- **`useImportExport.js`** — JSON import/export.
- **`usePagination.js`** — multi-column page break calculation (single, two-column, mixed layouts); measures section heights and interleaves columns.
- **`useTheme.js`** — dark/light mode toggle, persisted to localStorage.
- **`useFontLoader.js`** — lazy-loads Google Fonts via dynamic `<link>` tags.
- **`useKeyboardShortcuts.js`** — global shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z/Ctrl+Y (redo), Ctrl+S (save), ? (help modal).

### Service layer — `src/services/`

Three independently-selectable services, chosen at runtime:

- **Auth** (`src/services/auth/index.js`): returns `supabaseAuth` when `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` env vars are set, otherwise `guestAuth`. Both expose the same interface.
- **Storage** (`src/services/storage/index.js`): `getStorageAdapter()` returns `cloudAdapter` (Supabase) for logged-in users, `localAdapter` (localStorage) for guests. Only import from the index, never directly from the adapters.
- **Git** (`src/services/git/`): in-browser Git using isomorphic-git + LightningFS (IndexedDB-backed, scoped per user as `resume_builder_git_{userId}`).
  - `repo.js` — thin isomorphic-git wrapper with async-safe concurrent operations.
  - `fs.js` — LightningFS singleton; call `initFs(userId)` on login/logout to re-scope.
  - `serialize.js` — virtual FS layout: `/resumes/<id>.json`, `/resumes/<id>/sections/<sid>.json`, `/groups/<id>.json`, `/index.json`. Photos stored as `.txt` for readable diffs.
  - Auto-commit is debounced 2 s per resume. `syncGitToCloud()` exports the repo as a JSON blob to cloud storage (non-blocking).

### Routing (`src/router/index.js`)

Routes: `/` (landing), `/dashboard`, `/editor/:id`, `/jobs`, `/auth`, `/auth/callback`. All routes are publicly accessible — authentication is opt-in for cloud sync, not required. The navigation guard only redirects logged-in users away from `/auth`.

### Component structure

```
src/components/
  preview/    # Read-only rendered resume (ResumePage, ResumeHeader, SectionContent, PreviewPanel)
  editor/     # Entry/section list editing UI
  customize/  # Settings panels (BasicsTab, DesignTab, LayoutTab, TemplatesTab, HeaderTab, SectionsTab)
  versions/   # Version history UI (VersionHistoryPanel, BranchSwitcher, CommitDialog, DiffModal)
  groups/     # Group management UI (GroupManagerModal)
  jobs/       # Jobs feature UI
  resume/     # Shared resume UI primitives
  ui/         # Generic UI primitives
```

`src/views/EditorView.vue` composes the three-panel editor layout (editor list + preview + customize panel).

### Dependency injection

`App.vue` provides ~40+ refs and action functions via `provide()`. All views and components consume them via `inject()` rather than importing composables directly. This is the established pattern — follow it when adding new state or actions to the component tree.

### Data model notes

- **Groups**: resumes can be assigned to a group (`groupId` field). `useGroups` returns `groupedResumes` — an array of `{ group, resumes[] }` with ungrouped resumes last. Groups are persisted in the git virtual FS alongside resume data.
- **Language variants**: a resume may have `variantOf: <baseResumeId>` to mark it as a language variant of another resume. `addLanguageVariant()` guards against duplicate languages; `setBaseResume()` promotes a variant to base (re-parenting other variants). Base resumes filter with `!r.variantOf`.

### Templates & constants (`src/constants/`)

- **`templates.js`** — `TEMPLATES` array; each entry is a partial settings object merged into `activeResume.settings` via `applyTemplate()`.
- **`sectionDefaults.js`** — `defaultSettings()`, `defaultMetadata()`, `defaultSections()` factory functions used when creating a new resume.

### Environment variables

```
VITE_SUPABASE_URL=       # Enables Supabase auth + cloud storage
VITE_SUPABASE_ANON_KEY=  # Required alongside VITE_SUPABASE_URL
```

Without these, the app runs fully in guest mode with localStorage only.
