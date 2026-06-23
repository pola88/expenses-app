export function parseMonthParam(month?: string | null): Date {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [year, m] = month.split('-').map(Number)
    return new Date(Date.UTC(year, m - 1, 1))
  }
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

export function monthToParam(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function monthBounds(month: Date): { from: Date; to: Date } {
  const y = month.getUTCFullYear()
  const mo = month.getUTCMonth()
  return {
    from: new Date(Date.UTC(y, mo, 1)),
    to: new Date(Date.UTC(y, mo + 1, 0, 23, 59, 59, 999)),
  }
}
