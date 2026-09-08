import { TelegramLink } from '@prisma/client'
import { getWalletSummary, getCategoryBreakdown } from '@/services/wallet.service'
import { formatMoney } from '@/lib/money'
import { sendMessage } from '../client'

export async function handleResumen(link: TelegramLink) {
  const now = new Date()
  const [summary, breakdown] = await Promise.all([
    getWalletSummary(link.householdId, now),
    getCategoryBreakdown(link.householdId, now),
  ])

  const monthLabel = now.toLocaleDateString('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' })

  const lines = [
    `📊 Resumen de ${monthLabel}`,
    '',
    `Ingresos: ${formatMoney(summary.month.incomes.ARS, 'ARS')} · ${formatMoney(summary.month.incomes.USD, 'USD')}`,
    `Gastos: ${formatMoney(summary.month.expenses.ARS, 'ARS')} · ${formatMoney(summary.month.expenses.USD, 'USD')}`,
    `Cambios: ${formatMoney(summary.month.exchanges.ARS, 'ARS')} · ${formatMoney(summary.month.exchanges.USD, 'USD')}`,
    `Resultado: ${formatMoney(summary.month.net.ARS, 'ARS')} · ${formatMoney(summary.month.net.USD, 'USD')}`,
  ]

  const withSpend = breakdown.filter((c) => c.ARS !== '0.00' || c.USD !== '0.00')
  if (withSpend.length > 0) {
    lines.push('', 'Por categoría:')
    for (const cat of withSpend) {
      const parts = []
      if (cat.ARS !== '0.00') parts.push(formatMoney(cat.ARS, 'ARS'))
      if (cat.USD !== '0.00') parts.push(formatMoney(cat.USD, 'USD'))
      lines.push(`${cat.icon} ${cat.name} — ${parts.join(' · ')}`)
    }
  }

  lines.push('', `Saldo total: ${formatMoney(summary.balance.ARS, 'ARS')} · ${formatMoney(summary.balance.USD, 'USD')}`)

  await sendMessage(link.telegramChatId, lines.join('\n'))
}
