/**
 * repo.js — thin isomorphic-git wrapper.
 *
 * All public functions are async and safe to call concurrently;
 * isomorphic-git handles its own locking on the object store.
 */

import git from 'isomorphic-git'
import { getFs, REPO_DIR } from './fs.js'

const AUTHOR = { name: 'Resume Builder', email: 'app@resume-builder.local' }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fs() { return getFs() }
const dir = REPO_DIR

async function mkdirp(path) {
  const parts = path.replace(/^\//, '').split('/')
  let current = ''
  for (const part of parts) {
    current += '/' + part
    try { await fs().promises.mkdir(current) } catch { /* already exists */ }
  }
}

async function writeFile(path, content) {
  const dir = path.substring(0, path.lastIndexOf('/'))
  if (dir) await mkdirp(dir)
  await fs().promises.writeFile(path, content)
}

async function fileExists(path) {
  try { await fs().promises.stat(path); return true } catch { return false }
}

async function listDir(path) {
  try { return await fs().promises.readdir(path) } catch { return [] }
}

// Recursively collect all file paths under a directory
async function walkDir(path, collected = []) {
  const entries = await listDir(path)
  for (const entry of entries) {
    const full = path.endsWith('/') ? path + entry : `${path}/${entry}`
    try {
      const stat = await fs().promises.stat(full)
      if (stat.isDirectory()) {
        await walkDir(full, collected)
      } else {
        collected.push(full)
      }
    } catch { /* skip */ }
  }
  return collected
}

/** Public readFile for use by composables. */
export async function readFile(path) {
  try {
    const buf = await fs().promises.readFile(path)
    return typeof buf === 'string' ? buf : new TextDecoder().decode(buf)
  } catch { return null }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export async function ensureRepo() {
  const already = await fileExists(`${dir}/.git/config`)
  if (!already) {
    await git.init({ fs: fs(), dir, defaultBranch: 'main' })
  }
}

// ─── Write files to working tree ──────────────────────────────────────────────

export async function writeFiles(fileMap) {
  for (const [path, content] of Object.entries(fileMap)) {
    await writeFile(path, content)
  }
}

export async function removeFile(path) {
  try { await fs().promises.unlink(path) } catch { /* ignore */ }
}

// ─── Staging & committing ─────────────────────────────────────────────────────

/** Stage all changes (equivalent to `git add -A`). */
export async function stageAll() {
  const status = await git.statusMatrix({ fs: fs(), dir })
  for (const [filepath, head, workdir, stage] of status) {
    if (workdir === 0) {
      // deleted
      await git.remove({ fs: fs(), dir, filepath })
    } else if (head !== workdir || stage !== workdir) {
      await git.add({ fs: fs(), dir, filepath })
    }
  }
}

/** Stage specific file paths. */
export async function stageFiles(paths) {
  for (const filepath of paths) {
    const exists = await fileExists(`${dir}${filepath.startsWith('/') ? '' : '/'}${filepath}`)
    if (exists) {
      await git.add({ fs: fs(), dir, filepath: filepath.replace(/^\//, '') })
    } else {
      try { await git.remove({ fs: fs(), dir, filepath: filepath.replace(/^\//, '') }) } catch { /* ok */ }
    }
  }
}

/**
 * Create a commit. Stages all pending changes first unless `staged: true`.
 * @param {object} opts
 * @param {string} opts.message
 * @param {boolean} [opts.auto=false]
 * @param {string}  [opts.reason]  'template'|'export'|'job-link'|'group-change'|'manual'
 * @param {boolean} [opts.staged=false]  skip staging if already staged by caller
 * @returns {string} commit OID
 */
export async function commit({ message, auto = false, reason = 'manual', staged = false } = {}) {
  await ensureRepo()
  if (!staged) await stageAll()

  // Check if there's anything to commit
  const status = await git.statusMatrix({ fs: fs(), dir })
  const dirty = status.some(([, head, workdir, stage]) => !(head === 1 && workdir === 1 && stage === 1))
  if (!dirty) return null  // nothing changed

  const fullMessage = auto
    ? `[auto] ${message}${reason !== 'manual' ? ` (${reason})` : ''}`
    : message

  const oid = await git.commit({
    fs: fs(), dir,
    message: fullMessage,
    author: AUTHOR,
  })
  return oid
}

// ─── Log ──────────────────────────────────────────────────────────────────────

/**
 * @param {object} [opts]
 * @param {string} [opts.ref]    branch name or OID; defaults to HEAD
 * @param {string} [opts.path]   filter to commits touching this path
 * @param {number} [opts.depth]  max commits to return
 */
export async function log({ ref, path: filePath, depth = 100 } = {}) {
  try {
    const commits = await git.log({ fs: fs(), dir, ref, depth })
    if (!filePath) return commits

    // Simplified: return all commits when path filter is set.
    // Full path-filter diffing is expensive; callers can filter client-side.
    return commits
  } catch { return [] }
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

/** Switch to a named branch. */
export async function checkout(ref) {
  await git.checkout({ fs: fs(), dir, ref })
}

/** Checkout a specific commit OID (detached HEAD). */
export async function checkoutCommit(oid) {
  await git.checkout({ fs: fs(), dir, ref: oid })
}

// ─── Branches ─────────────────────────────────────────────────────────────────

export async function listBranches() {
  return git.listBranches({ fs: fs(), dir })
}

export async function currentBranch() {
  return git.currentBranch({ fs: fs(), dir, fullname: false })
}

export async function createBranch(name, fromOid) {
  if (fromOid) {
    // Create branch pointing to specific commit
    await git.branch({ fs: fs(), dir, ref: name, object: fromOid })
  } else {
    await git.branch({ fs: fs(), dir, ref: name })
  }
}

export async function deleteBranch(name) {
  await git.deleteBranch({ fs: fs(), dir, ref: name })
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export async function createTag(oid, name) {
  await git.tag({ fs: fs(), dir, ref: name, object: oid })
}

export async function listTags() {
  return git.listTags({ fs: fs(), dir })
}

export async function deleteTag(name) {
  await git.deleteTag({ fs: fs(), dir, ref: name })
}

// ─── Revert ───────────────────────────────────────────────────────────────────

/**
 * "Revert" by reading the target commit's tree and writing a new commit
 * that mirrors its state (non-destructive, like `git revert` not `git reset`).
 * Returns the new commit OID.
 */
export async function revertToCommit(oid, message) {
  const files = await readCommitFiles(oid)
  // Wipe current working tree files (tracked)
  const currentFiles = await walkDir(dir)
  for (const f of currentFiles) {
    if (f.startsWith('/.git')) continue
    await removeFile(f)
  }
  // Write snapshot files
  await writeFiles(files)
  await stageAll()
  return commit({ message: message || `Revert to ${oid.slice(0, 7)}`, staged: true })
}

// ─── Read a commit's file tree ────────────────────────────────────────────────

/**
 * Read all files from a specific commit's tree.
 * Returns { filepath: content } map (paths starting with '/').
 */
export async function readCommitFiles(oid) {
  const files = {}
  await git.walk({
    fs: fs(), dir,
    trees: [git.TREE({ ref: oid })],
    map: async (filepath, [entry]) => {
      if (!entry) return
      if ((await entry.type()) === 'blob') {
        const buf = await entry.content()
        files['/' + filepath] = new TextDecoder().decode(buf)
      }
    },
  })
  return files
}

// ─── Diff ─────────────────────────────────────────────────────────────────────

/**
 * Compare two commits. Returns array of { path, type: 'added'|'removed'|'modified', before, after }.
 * `before` and `after` are the file contents as strings (null if absent).
 */
export async function diff(oidA, oidB) {
  const changes = []
  await git.walk({
    fs: fs(), dir,
    trees: [git.TREE({ ref: oidA }), git.TREE({ ref: oidB })],
    map: async (filepath, [a, b]) => {
      if (filepath === '.') return

      const aOid = a ? await a.oid() : null
      const bOid = b ? await b.oid() : null
      if (aOid === bOid) return  // unchanged

      const aContent = a && (await a.type()) === 'blob'
        ? new TextDecoder().decode(await a.content()) : null
      const bContent = b && (await b.type()) === 'blob'
        ? new TextDecoder().decode(await b.content()) : null

      const type = !aContent ? 'added' : !bContent ? 'removed' : 'modified'
      changes.push({ path: '/' + filepath, type, before: aContent, after: bContent })
    },
  })
  return changes
}

// ─── Export FS as archive ─────────────────────────────────────────────────────

/**
 * Dump the entire virtual FS (excluding .git) as a JSON-serialisable map.
 * Used for syncing to Supabase Storage.
 */
export async function exportWorkingTree() {
  const paths = await walkDir(dir)
  const map = {}
  for (const p of paths) {
    if (p.startsWith('/.git')) continue
    map[p] = await readFile(p)
  }
  return map
}

/**
 * Export the full .git directory as a map (for cloud backup).
 * Keys are paths like '/.git/HEAD', values are base64 strings for binary files.
 */
export async function exportGitDir() {
  const paths = await walkDir(`${dir}/.git`)
  const map = {}
  for (const p of paths) {
    try {
      const buf = await fs().promises.readFile(p)
      if (typeof buf === 'string') {
        map[p] = buf
      } else {
        // Base64-encode binary git objects
        map[p] = btoa(String.fromCharCode(...new Uint8Array(buf)))
      }
    } catch { /* skip */ }
  }
  return map
}

/**
 * Import a previously-exported .git directory map back into the FS.
 */
export async function importGitDir(map) {
  for (const [p, content] of Object.entries(map)) {
    const dirPath = p.substring(0, p.lastIndexOf('/'))
    if (dirPath) await mkdirp(dirPath)
    try {
      if (typeof content === 'string' && content.match(/^[A-Za-z0-9+/]+=*$/)) {
        // Try base64 decode for binary objects
        const binary = Uint8Array.from(atob(content), c => c.charCodeAt(0))
        await fs().promises.writeFile(p, binary)
      } else {
        await fs().promises.writeFile(p, content)
      }
    } catch {
      await fs().promises.writeFile(p, content)
    }
  }
}
