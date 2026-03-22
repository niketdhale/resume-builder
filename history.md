# Change History

## Column Assignment Feature (2026-03-22)

### Problem

- Two-column layout split sections by even/odd index (automatic)
- No user control over which sections go to which column

### Solution

- Added `columnLayout: { left: [], right: [] }` to settings
- Updated SectionsTab to show drag-and-drop zones for column assignment
- Updated preview to use user-assigned columns instead of even/odd split

### Changes Made

#### 1. `src/constants/sectionDefaults.js`

- Added `columnLayout: { left: [], right: [] }` to defaultSettings()

#### 2. `src/components/customize/SectionsTab.vue`

- Complete rewrite with two-column mode support
- When columns is 'two' or 'mix':
  - Shows Left Column and Right Column drop zones
  - Drag sections between columns using arrow buttons
  - Unassigned sections shown in separate zone
- When columns is 'one':
  - Single list reorder (original behavior)
- Uses `vue-draggable-next` with `group="sections"` for cross-zone dragging

#### 3. `src/components/preview/ResumePage.vue`

- Added `columnLayout` prop
- Changed `evenSections`/`oddSections` to `leftSections`/`rightSections`
- Falls back to even/odd split if columnLayout is empty

#### 4. `src/components/preview/PreviewPanel.vue`

- Passes `columnLayout` from activeSettings to ResumePage
- Removed unused SectionContent import

### Bug Fix: Single Source Array Pattern (2026-03-22)

#### Problem

- Sections were not visible when switching to "Two" or "Mix" column mode
- vue-draggable-next was breaking Vue 3 reactivity when using multiple reactive arrays (`leftSections`, `rightSections`) with `group="sections"`

#### Root Cause

- The library internally replaces array references, causing desync with Vue's reactivity system
- Using `v-model` on computed arrays or separate refs doesn't work reliably

#### Solution

Implemented the **Single Source Array Pattern**:

1. **Single master array**: `localSections` ref holds all sections
2. **Column property**: Each section has a `column: 'left' | 'right'` property
3. **Computed views**: `leftSections` and `rightSections` are computed, derived from filtering `localSections`
4. **`:list` not `v-model`**: Draggable uses `:list` (read-only) instead of `v-model`
5. **Manual sync**: `@change` handler updates `column` property and forces reactivity
6. **`forceReactivity()`**: Rebuilds array reference to trigger Vue updates

#### Key Code Changes

```js
// Single source array
const localSections = ref([])

// Derived computed views (read-only)
const leftSections = computed(() => localSections.value.filter((s) => s.column === 'left'))
const rightSections = computed(() => localSections.value.filter((s) => s.column === 'right'))

// When item added to left column
function onLeftChange(evt) {
  if (evt.added) {
    evt.added.element.column = 'left'
    forceReactivity()
    syncColumnLayout()
  }
}

// Force Vue to recognize change
function forceReactivity() {
  localSections.value = [...localSections.value]
}
```

---

## PDF Export Fix & Zoom Modal (2026-03-22)

### Problem

- PDF export was failing silently
- Generated PDF content was squeezed/distorted

### Root Cause

- `jspdf` was only a transitive dependency (via `html2pdf.js`), not explicitly listed in `package.json`
- The `html2canvas` alias in `vite.config.js` wasn't resolving correctly to `html2canvas-pro`
- PDF capture logic was incorrectly handling aspect ratios

### Changes Made

#### 1. `package.json`

- Added `jspdf` as explicit dependency:
  ```json
  "jspdf": "^4.0.1"
  ```

#### 2. `vite.config.js`

- Updated `html2canvas` alias to use explicit path:

  ```js
  // Before
  html2canvas: 'html2canvas-pro'

  // After
  html2canvas: fileURLToPath(new URL('./node_modules/html2canvas-pro', import.meta.url))
  ```

#### 3. `src/composables/usePdfExport.js`

- Simplified capture logic using direct html2canvas capture
- Set capture scale to 6x for maximum quality
- Properly adds multi-page PDFs with `pdf.addPage()`
- Removed complex canvas manipulation code

#### 4. `src/components/preview/PreviewPanel.vue`

- Added zoom modal feature:
  - `cursor-zoom-in` class on resume pages
  - Click handler opens modal with `openZoom()`
  - Modal features:
    - Semi-transparent gray overlay (`bg-black/60 backdrop-blur-sm`)
    - Shows ALL resume pages (not just one)
    - Close button (X) in top-right
    - Click outside to close
    - Hidden scrollbar using `scrollbar-hide` class (scrolling still works)
    - Smooth fade transitions

### Testing

- Run `bun run lint` - passes
- Run `bun run build` - passes
- PDF export now generates proper A4-sized documents
- Zoom modal displays full resume with hidden scrollbar
