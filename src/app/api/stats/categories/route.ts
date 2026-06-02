import { apiHandler, ok } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import Decimal from 'decimal.js'

export const GET = apiHandler(async (_, { householdId }) => {
  const now = new Date()
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))

  const expenses = await prisma.expense.findMany({
    where: { householdId, date: { gte: from, lt: to } },
    select: {
      amount: true,
      currency: true,
      category: { select: { id: true, name: true, icon: true, color: true } },
    },
  })

  const grouped: Record<string, {
    name: string; icon: string; color: string
    ARS: Decimal; USD: Decimal
  }> = {}

  for (const exp of expenses) {
    const { id, name, icon, color } = exp.category
    if (!grouped[id]) grouped[id] = { name, icon, color, ARS: new Decimal(0), USD: new Decimal(0) }
    grouped[id][exp.currency] = grouped[id][exp.currency].plus(exp.amount.toString())
  }

  const result = Object.entries(grouped).map(([id, { name, icon, color, ARS, USD }]) => ({
    id, name, icon, color,
    ARS: ARS.toFixed(2),
    USD: USD.toFixed(2),
  }))

  return ok(result)
})
