export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, init)
  const body = await r.json()
  if (!r.ok) throw new ApiError(body.error ?? 'Error inesperado', r.status)
  return body as T
}
