## 🚀 Changelog

### ✨ Features

- Add responsive UI for mobile, tablet, and desktop
- Add language variant tabs in the editor
- Add custom zoom controls for resume preview modal
- Add real-time cloud sync status indicator
- Add persistent cloud sync badge with cloud icon

### 🐛 Bug Fixes

- Fix README links for commits and GitHub Actions
- Fix font size scaling, font loading, and header positioning UX
- Fix modal scroll blocking and PDF capture issues on mobile
- Fix zoom modal spacing, close button behavior, and mobile responsiveness
- Fix mobile preview scaling to fit screen width
- Fix editor UX: collapse sections on open, add auto-translate option
- Fix password field issues and visibility toggle behavior
- Fix editor toolbar sync indicator for guest vs logged-in users
- Fix import/export issues causing API errors and sync failures
- Fix merge conflicts in `useImportExport.js` and other components
- Fix lint errors and remove unused variables
- Fix session management issues (sign-out leaks, migration re-entry, race conditions)
- Fix database issues (null timestamps, invalid UUIDs, foreign key errors)
- Fix migration and signup issues affecting new users
- Fix parsing and ID handling issues (UUID compatibility)
- Fix cloud adapter userId initialization before operations
- Fix build error caused by missing closing div in `OverviewView`

### ♻️ Improvements & Refactoring

- Refactor README badges and descriptions
- Improve overall README structure and documentation clarity
- Remove obsolete documentation and wireframe files
- Update `.gitignore` for better project hygiene

### 📝 Documentation

- Rewrite README with full project documentation
- Add and update GitHub badges (stars, links, images)

### 📦 Other Changes

- Add MIT License
- Merge multiple feature and fix branches into `develop`
