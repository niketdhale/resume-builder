/**
 * Guest auth — used when no real auth is set up.
 * Returns a consistent guest user object.
 * Mirrors the interface that real auth will use.
 */

export const GUEST_USER = {
  id: 'local',
  name: 'Guest',
  email: null,
  isGuest: true,
  provider: 'local',
}

export const guestAuth = {
  getUser() {
    return GUEST_USER
  },
  isLoggedIn() {
    return false
  },
  getUserId() {
    return 'local'
  },
}
