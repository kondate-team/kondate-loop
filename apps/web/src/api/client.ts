import { API_BASE_URL, API_TIMEOUT_MS } from "./config"

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      const message = await response.text().catch(() => "")
      throw new Error(message || `API error: ${response.status}`)
    }

    return (await response.json()) as T
  } finally {
    window.clearTimeout(timeoutId)
  }
}
