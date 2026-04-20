# UI Redesign: Notion-Inspired Design System

## Context
The app currently uses a warm gold (#B8923A) accent with Cormorant Garamond + DM Sans fonts, brownish neutrals, and 8px rounded buttons. The goal is to adopt a Notion-inspired design system: Inter font, Notion Blue (#0075de) accent, warm neutrals with yellow-brown undertones, whisper-thin borders, multi-layer shadows, and tighter typography at display sizes. The full design spec is in `DESIGN.md` at project root.

## Phase 1: Design Tokens (`src/style.css`)
**~60% of visual change cascades from here. This is the most important file.**

1. **Font import** — Replace Google Fonts URL: swap Cormorant Garamond + DM Sans → Inter (400,500,600,700)
2. **CSS variables** — Update `:root`:
   - `--font-display` / `--font-sans` → `'Inter', -apple-system, system-ui, sans-serif`
   - Backgrounds: `--bg-base: #ffffff`, `--bg-subtle: #f6f5f4`, `--bg-surface: #ffffff`, `--bg-editor-preview: #f6f5f4`
   - Text: `--ink: rgba(0,0,0,0.95)`, `--ink-2: #615d59`, `--ink-3: #a39e98`
   - Borders: `--border: rgba(0,0,0,0.1)`, `--border-2: rgba(0,0,0,0.15)`
   - Rename gold → accent: `--accent: #0075de`, `--accent-hover: #005bab`, `--accent-bg: rgba(0,117,222,0.06)`, `--accent-border: rgba(0,117,222,0.2)`
3. **Add shadow tokens**: `--shadow-card`, `--shadow-deep`, `--shadow-card-hover` using Notion's multi-layer stacks from DESIGN.md
4. **Dark mode** — Update `.dark` block with Notion-dark values:
   - `--bg-base: #191919`, `--bg-subtle: #202020`, `--bg-surface: #252525`, `--bg-editor-preview: #1e1e1e`
   - `--ink: rgba(255,255,255,0.95)`, `--ink-2: #9b9a97`, `--ink-3: #6b6966`
   - `--border: rgba(255,255,255,0.1)`, `--border-2: rgba(255,255,255,0.15)`
   - `--accent: #529cca`, `--accent-hover: #6db3d9`, `--accent-bg: rgba(82,156,202,0.08)`, `--accent-border: rgba(82,156,202,0.25)`
5. **Component classes** — Update `.rb-input`, `.rb-btn-primary`, `.rb-btn-ghost`, `.rb-card`, `.rb-nav-link`:
   - Border-radius: 8px → 4px for buttons/inputs, keep 12px for cards
   - Replace ALL `--gold*` refs → `--accent*` (e.g. `var(--gold)` → `var(--accent)`)
   - Card hover: use multi-layer shadow from DESIGN.md, remove `transform: translateY(-2px)`
   - Nav active border: `var(--accent)` instead of `var(--gold)`
6. **Rename** `.rb-divider-gold` → `.rb-divider-accent`, update its gradient to use `--accent-border`

## Phase 2: Global Find-Replace (All .vue files)

**Search the ENTIRE `src/` directory for these replacements:**

1. **`--gold` → `--accent`** in all scoped `<style>` blocks. Files known to have these:
   - `src/components/ui/NavBar.vue`
   - `src/components/ui/MobileDrawer.vue`
   - `src/components/editor/SectionItem.vue`
   - `src/components/versions/BranchSwitcher.vue`
   - `src/components/versions/CommitDialog.vue`
   - `src/components/versions/DiffModal.vue`
   - `src/components/versions/VersionHistoryPanel.vue`
   - `src/components/groups/GroupManagerModal.vue`
   - `src/views/LandingView.vue`
   - `src/views/OverviewView.vue`
   - `src/views/EditorView.vue`
   - `src/views/JobsView.vue`
   - **But grep for `--gold` across ALL files to catch any missed ones**

2. **Tailwind `indigo-*` → `blue-*`** in all template and class strings. Mappings:
   - `indigo-500` → `blue-600` (Notion Blue is darker than Tailwind blue-500)
   - `indigo-600` → `blue-700`
   - `indigo-700` → `blue-800`
   - `indigo-400` → `blue-500`
   - `indigo-300` → `blue-400`
   - `indigo-50` → `blue-50`
   - `indigo-100` → `blue-100`
   - `indigo-900` → `blue-900`
   - **Grep for `indigo` across ALL .vue files to find every occurrence**

   **Files with heaviest indigo usage** (prioritize these):
   - `src/jobs/components/AddJobModal.vue`
   - `src/components/customize/HeaderTab.vue`
   - `src/components/customize/DesignTab.vue`
   - `src/components/customize/LayoutTab.vue`
   - `src/components/customize/BasicsTab.vue`
   - `src/components/customize/CustomizePanel.vue`
   - `src/components/customize/SectionsTab.vue`
   - `src/components/editor/EntryItem.vue`
   - `src/views/EditorView.vue`
   - `src/views/JobsView.vue`

3. **`.rb-divider-gold`** → `.rb-divider-accent` in any template that uses this class

4. **Border radius** on buttons/inputs: `rounded-lg` → `rounded` (4px) where it applies to buttons and inputs only (NOT cards)

5. **`font-display`** class: keep the class but it now applies Inter with negative letter-spacing (updated in Phase 1)

## Phase 3: View-Level Updates

### LandingView.vue
- Update hero typography to use Inter bold + `letter-spacing: -0.02em` for large headings
- Replace any gold gradient/decorative elements with Notion Blue variants
- Use warm white (#f6f5f4) for alternating section backgrounds
- Update CTA buttons to use `--accent` (Notion Blue)

### OverviewView.vue (Dashboard)
- Card shadows → use new `var(--shadow-card)` token
- Sidebar accent colors → `--accent`
- Group chips → blue accent instead of gold
- Resume card hover → `var(--shadow-card-hover)`

### EditorView.vue
- Panel backgrounds → `var(--bg-subtle)` for warm-white sidebar
- Titlebar accents → `--accent`
- Modal accent colors → `--accent`
- All `dark:` Tailwind classes with indigo → blue

### JobsView.vue
- Chart/graph colors → Notion Blue variants
- Filter pills → blue accent
- Stat cards → blue accent
- Status badges → update accent references

## Phase 4: Component Polish

### NavBar.vue + MobileDrawer.vue
- Active nav link indicator → `var(--accent)` (blue underline)
- Sync status badge colors (keep green/amber for status, but accent → blue)
- User menu hover states

### Customize Panels (CustomizePanel.vue, DesignTab.vue, BasicsTab.vue, HeaderTab.vue, LayoutTab.vue, SectionsTab.vue)
- Tab active states: indigo → blue
- Toggle switches, range inputs: indigo → blue
- Form focus states: handled by Phase 1 CSS var change

### Version Control Components (BranchSwitcher, CommitDialog, DiffModal, VersionHistoryPanel)
- All `--gold` → `--accent` refs in scoped styles
- Font-display refs updated by Phase 1

### Editor Components (SectionItem.vue, EntryItem.vue)
- Section card badges: gold → accent blue
- Entry input focus: indigo → blue (Tailwind classes)
- Drag handle hover: gold → accent blue

### GroupManagerModal.vue
- Accent color references → blue

## Phase 5: Verification

1. Run `bun run dev` and visually inspect ALL views (Landing, Dashboard, Editor, Jobs, Auth)
2. Toggle dark mode — verify all colors look correct in both themes
3. Check print styles still function (`Ctrl+P` from editor)
4. Run `grep -r "gold" src/` — should find zero CSS/style references (only content text like "gold" in templates is OK)
5. Run `grep -r "indigo" src/` — should find zero references
6. Test responsive breakpoints: mobile drawer, editor panel collapse, dashboard grid
7. Run `bun run lint` to catch any issues
8. Run `bun run test:run` to ensure no tests break
