import { apiHandler, ok } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import Decimal from 'decimal.js'

export const GET = apiHandler(async (_, { householdId }) => {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const [incomes, expenses] = await Promise.all([
    prisma.income.findMany({
      where: { householdId, date: { gte: from } },
      select: { amount: true, currency: true, date: true },
    }),
    prisma.expense.findMany({
      where: { householdId, date: { gte: from } },
      select: { amount: true, currency: true, date: true },
    }),
  ])

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString('es-AR', { month: 'short' }),
      incomes: { ARS: new Decimal(0), USD: new Decimal(0) },
      expenses: { ARS: new Decimal(0), USD: new Decimal(0) },
    }
  })

  const monthIndex = (date: Date) => {
    const key = `${date.getFullYear()}-${date.getMonth()}`
    return months.findIndex((m) => m.key === key)
  }

  for (const inc of incomes) {
    const idx = monthIndex(new Date(inc.date))
    if (idx >= 0) months[idx].incomes[inc.currency] = months[idx].incomes[inc.currency].plus(inc.amount.toString())
  }
  for (const exp of expenses) {
    const idx = monthIndex(new Date(exp.date))
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
