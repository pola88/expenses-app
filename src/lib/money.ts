export function formatMoney(amount: string | number, currency: 'ARS' | 'USD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  const prefix = currency === 'ARS' ? 'ARS$' : 'USD$'

  return `${prefix} ${new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)}`
}

export function formatRate(rate: string | number): string {
  const num = typeof rate === 'string' ? parseFloat(rate) : rate
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}
