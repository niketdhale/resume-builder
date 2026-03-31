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
  async getSession() {
    return null
  },
  isLoggedIn() {
    return false
  },
  getUserId() {
    return 'local'
  },
  async signUp() {
    return { user: null, error: new Error('Guest mode — sign up unavailable') }
  },
  async signIn() {
    return { user: null, error: new Error('Guest mode — sign in unavailable') }
  },
  async sendMagicLink() {
    return { error: new Error('Guest mode — magic link unavailable') }
  },
  async signOut() {
    return { error: null }
  },
  onAuthStateChange() {
    return () => {}
  },
}
