const baseUrl = import.meta.env.VITE_API_BASE_URL
const timeoutMs = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 8000)
const useMock = (import.meta.env.VITE_API_USE_MOCK ?? "true") === "true"

export const API_BASE_URL = baseUrl?.toString().replace(/\/$/, "") ?? ""
export const API_TIMEOUT_MS = Number.isFinite(timeoutMs) ? timeoutMs : 8000
export const API_USE_MOCK = useMock
