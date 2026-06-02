import { apiHandler, ok } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import Decimal from 'decimal.js'

export const GET = apiHandler(async (_, { householdId }) => {
  const now = new Date()
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1))

  const [incomes, expenses] = await Promise.all([
    prisma.income.findMany({
      where: { householdId, isRecurring: false, date: { gte: from } },
      select: { amount: true, currency: true, date: true },
    }),
    prisma.expense.findMany({
      where: { householdId, date: { gte: from } },
      select: { amount: true, currency: true, date: true },
    }),
  ])

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + i, 1))
    return {
      key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`,
      label: d.toLocaleDateString('es-AR', { month: 'short', timeZone: 'UTC' }),
      incomes: { ARS: new Decimal(0), USD: new Decimal(0) },
      expenses: { ARS: new Decimal(0), USD: new Decimal(0) },
    }
  })

  const monthKey = (date: Date) => `${date.getUTCFullYear()}-${date.getUTCMonth()}`

  for (const inc of incomes) {
    const idx = months.findIndex((m) => m.key === monthKey(inc.date))
    if (idx >= 0) months[idx].incomes[inc.currency] = months[idx].incomes[inc.currency].plus(inc.amount.toString())
  }
  for (const exp of expenses) {
    const idx = months.findIndex((m) => m.key === monthKey(exp.date))
    if (idx >= 0) months[idx].expenses[exp.currency] = months[idx].expenses[exp.currency].plus(exp.amount.toString())
  }

  return ok(months.map(({ label, incomes, expenses }) => ({
    month: label,
    incomesARS: parseFloat(incomes.ARS.toFixed(2)),
    incomesUSD: parseFloat(incomes.USD.toFixed(2)),
    expensesARS: parseFloat(expenses.ARS.toFixed(2)),
    expensesUSD: parseFloat(expenses.USD.toFixed(2)),
  })))
})
