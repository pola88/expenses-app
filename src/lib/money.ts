import Decimal from 'decimal.js';

const esAR = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatAmount(amount: string | number | Decimal): string {
  return esAR.format(new Decimal(amount.toString()).toNumber());
}

export function formatMoney(amount: string | number | Decimal, currency: 'ARS' | 'USD'): string {
  const prefix = currency === 'ARS' ? 'ARS$' : 'USD$';
  return `${prefix} ${formatAmount(amount)}`;
}

export function formatRate(rate: string | number | Decimal): string {
  return esAR.format(new Decimal(rate.toString()).toNumber());
}
