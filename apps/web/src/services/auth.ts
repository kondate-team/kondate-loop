import { API_USE_MOCK } from "@/api/config"
import { apiFetch } from "@/api/client"
import type { ApiUser, ApiUserRole } from "@/types/api"

export type AuthSession = {
  user: ApiUser
  token: string
}

export async function login(email: string, password: string): Promise<AuthSession> {
  if (API_USE_MOCK) {
    return {
      user: { id: "mock-user", name: "こんだてユーザー", role: "user" },
      token: "mock-token",
    }
  }

  return apiFetch<AuthSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function signup(name: string, email: string, password: string): Promise<AuthSession> {
  if (API_USE_MOCK) {
    return {
      user: { id: "mock-user", name, role: "user" },
      token: "mock-token",
    }
  }

  return apiFetch<AuthSession>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  })
}

export async function changeRole(role: ApiUserRole): Promise<ApiUser> {
  if (API_USE_MOCK) {
    return { id: "mock-user", name: "こんだてユーザー", role }
  }

  return apiFetch<ApiUser>("/auth/role", {
    method: "PATCH",
    body: JSON.stringify({ role }),
  })
}

export async function logout(): Promise<void> {
  if (API_USE_MOCK) {
    return
  }

  await apiFetch("/auth/logout", {
    method: "POST",
  })
}
