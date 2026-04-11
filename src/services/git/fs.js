/**
 * LightningFS singleton — one virtual filesystem per user, backed by IndexedDB.
 * The FS name is scoped per user so guest and cloud users never share objects.
 */
import LightningFS from '@isomorphic-git/lightning-fs'

let _fs = null
let _fsName = null

/**
 * (Re)initialise the FS for a given userId.
 * Call this whenever auth state changes (guest → user or sign-out).
 * @param {string} userId  'guest' or a UUID
 */
export function initFs(userId = 'guest') {
  const name = `resume_builder_git_${userId}`
  if (_fs && _fsName === name) return _fs   // already initialised for this user
  _fs = new LightningFS(name)
  _fsName = name
  return _fs
}

/** Return the current FS instance (initialised with 'guest' if never called). */
export function getFs() {
  if (!_fs) initFs('guest')
  return _fs
}

/** The dir root used inside every isomorphic-git call. */
export const REPO_DIR = '/'
