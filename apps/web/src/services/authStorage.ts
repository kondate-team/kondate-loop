const AUTH_USER_ID_KEY = "kondate.auth.userId"
const AUTH_ACCESS_TOKEN_KEY = "kondate.auth.accessToken"
const AUTH_REFRESH_TOKEN_KEY = "kondate.auth.refreshToken"

type PersistableSession = {
  user: {
    id: string
  }
  accessToken: string
  refreshToken: string
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function persistAuthSession(session: PersistableSession) {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(AUTH_USER_ID_KEY, session.user.id)
  storage.setItem(AUTH_ACCESS_TOKEN_KEY, session.accessToken)
  storage.setItem(AUTH_REFRESH_TOKEN_KEY, session.refreshToken)
}

export function clearAuthSessionStorage() {
  const storage = getStorage()
  if (!storage) return
  storage.removeItem(AUTH_USER_ID_KEY)
  storage.removeItem(AUTH_ACCESS_TOKEN_KEY)
  storage.removeItem(AUTH_REFRESH_TOKEN_KEY)
}

export function readStoredUserId(): string | null {
  const storage = getStorage()
  return storage ? storage.getItem(AUTH_USER_ID_KEY) : null
}

export function readStoredAccessToken(): string | null {
  const storage = getStorage()
  return storage ? storage.getItem(AUTH_ACCESS_TOKEN_KEY) : null
}

export function readStoredRefreshToken(): string | null {
  const storage = getStorage()
  return storage ? storage.getItem(AUTH_REFRESH_TOKEN_KEY) : null
}
