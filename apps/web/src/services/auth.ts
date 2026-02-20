import { API_USE_MOCK } from "@/api/config"
import { apiFetch } from "@/api/client"
import type { ApiUser, ApiUserRole } from "@/types/api"

const AUTH_USER_ID_KEY = "kondate.auth.userId"
const AUTH_REFRESH_TOKEN_KEY = "kondate.auth.refreshToken"

export type AuthSession = {
  user: ApiUser
  accessToken: string
  refreshToken: string
  tokenType: "Bearer"
  expiresIn: number
  issuedAt: string
  token: string
}

type AuthSessionResponseBody = {
  user: {
    id: string
    email?: string
    name?: string | null
    role?: ApiUserRole
    avatarUrl?: string | null
  }
  accessToken: string
  refreshToken: string
  tokenType: "Bearer"
  expiresIn: number
  issuedAt: string
}

type CallbackRequest = {
  code?: string
  idToken?: string
  accessToken?: string
  refreshToken?: string
  userId?: string
  email?: string
  name?: string
  avatarUrl?: string | null
}

type RefreshRequest = {
  refreshToken: string
  userId?: string
  email?: string
}

type LoginRequest = {
  email: string
  password: string
  userId?: string
}

type SignupRequest = {
  name: string
  email: string
  password: string
  userId?: string
}

type ApiEnvelope<T> = {
  data: T
}

function resolveUserIdFromEmail(email: string): string {
  const normalized = email.trim().toLowerCase()
  const safe = normalized.replace(/[^a-z0-9._-]+/g, "_")
  return `user_${safe || "demo"}`
}

function persistSession(session: AuthSession) {
  try {
    window.localStorage.setItem(AUTH_USER_ID_KEY, session.user.id)
    window.localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, session.refreshToken)
  } catch {
    // Ignore storage failures.
  }
}

function clearSession() {
  try {
    window.localStorage.removeItem(AUTH_USER_ID_KEY)
    window.localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY)
  } catch {
    // Ignore storage failures.
  }
}

function readStoredUserId(): string | null {
  try {
    return window.localStorage.getItem(AUTH_USER_ID_KEY)
  } catch {
    return null
  }
}

function readStoredRefreshToken(): string | null {
  try {
    return window.localStorage.getItem(AUTH_REFRESH_TOKEN_KEY)
  } catch {
    return null
  }
}

function toAuthSession(payload: AuthSessionResponseBody): AuthSession {
  const user: ApiUser = {
    id: payload.user.id,
    name: payload.user.name ?? payload.user.email ?? "User",
    role: payload.user.role ?? "user",
    avatarUrl: payload.user.avatarUrl ?? undefined,
  }

  return {
    user,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    tokenType: payload.tokenType,
    expiresIn: payload.expiresIn,
    issuedAt: payload.issuedAt,
    token: payload.accessToken,
  }
}

export async function authCallback(request: CallbackRequest): Promise<AuthSession> {
  if (API_USE_MOCK) {
    return {
      user: { id: "mock-user", name: request.name ?? "Mock User", role: "user" },
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      tokenType: "Bearer",
      expiresIn: 3600,
      issuedAt: new Date().toISOString(),
      token: "mock-access-token",
    }
  }

  const response = await apiFetch<ApiEnvelope<AuthSessionResponseBody>>("/v1/auth/callback", {
    method: "POST",
    body: JSON.stringify(request),
  })
  const session = toAuthSession(response.data)
  persistSession(session)
  return session
}

export async function refreshSession(request?: Partial<RefreshRequest>): Promise<AuthSession> {
  if (API_USE_MOCK) {
    return {
      user: { id: "mock-user", name: "Mock User", role: "user" },
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      tokenType: "Bearer",
      expiresIn: 3600,
      issuedAt: new Date().toISOString(),
      token: "mock-access-token",
    }
  }

  const refreshToken = request?.refreshToken ?? readStoredRefreshToken()
  if (!refreshToken) {
    throw new Error("refreshToken is required")
  }

  const response = await apiFetch<ApiEnvelope<AuthSessionResponseBody>>("/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify({
      refreshToken,
      userId: request?.userId ?? readStoredUserId() ?? undefined,
      email: request?.email,
    } as RefreshRequest),
  })
  const session = toAuthSession(response.data)
  persistSession(session)
  return session
}

export async function login(email: string, password: string): Promise<AuthSession> {
  if (API_USE_MOCK) {
    return {
      user: { id: "mock-user", name: "Mock User", role: "user" },
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      tokenType: "Bearer",
      expiresIn: 3600,
      issuedAt: new Date().toISOString(),
      token: "mock-access-token",
    }
  }

  const response = await apiFetch<ApiEnvelope<AuthSessionResponseBody>>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({
      userId: resolveUserIdFromEmail(email),
      email,
      password,
    } as LoginRequest),
  })
  const session = toAuthSession(response.data)
  persistSession(session)
  return session
}

export async function signup(name: string, email: string, password: string): Promise<AuthSession> {
  if (API_USE_MOCK) {
    return {
      user: { id: "mock-user", name: name || "Mock User", role: "user" },
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      tokenType: "Bearer",
      expiresIn: 3600,
      issuedAt: new Date().toISOString(),
      token: "mock-access-token",
    }
  }

  const response = await apiFetch<ApiEnvelope<AuthSessionResponseBody>>("/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      userId: resolveUserIdFromEmail(email),
      name,
      email,
      password,
    } as SignupRequest),
  })
  const session = toAuthSession(response.data)
  persistSession(session)
  return session
}

export async function changeRole(role: ApiUserRole): Promise<ApiUser> {
  if (API_USE_MOCK) {
    return { id: "mock-user", name: "Mock User", role }
  }

  const userId = readStoredUserId()
  const response = await apiFetch<ApiEnvelope<{ id: string; name?: string | null; role?: ApiUserRole }>>(
    `/v1/auth/me${userId ? `?userId=${encodeURIComponent(userId)}` : ""}`
  )
  return {
    id: response.data.id,
    name: response.data.name ?? "User",
    role: response.data.role ?? "user",
  }
}

export async function logout(refreshToken?: string): Promise<void> {
  if (API_USE_MOCK) {
    clearSession()
    return
  }

  await apiFetch<ApiEnvelope<{ loggedOut: boolean }>>("/v1/auth/logout", {
    method: "POST",
    body: JSON.stringify({
      refreshToken: refreshToken ?? readStoredRefreshToken() ?? undefined,
    }),
  })
  clearSession()
}
