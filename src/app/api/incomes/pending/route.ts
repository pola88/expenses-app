import { apiHandler, ok } from '@/lib/api'
import { prisma } from '@/lib/prisma'

export const GET = apiHandler(async (_, { householdId }) => {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const [allRecurring, thisMonth] = await Promise.all([
    prisma.income.findMany({
      where: { householdId, isRecurring: true },
      orderBy: { date: 'desc' },
      select: { id: true, description: true, amount: true, currency: true, recurringDay: true },
    }),
    prisma.income.findMany({
      where: { householdId, isRecurring: true, date: { gte: from, lte: to } },
      select: { description: true },
    }),
  ])

  const registeredThisMonth = new Set(thisMonth.map((i) => i.description))

  const seen = new Set<string>()
  const pending = []
  for (const inc of allRecurring) {
    if (seen.has(inc.description)) continue
    seen.add(inc.description)
    if (!registeredThisMonth.has(inc.description)) {
      pending.push({
        id: inc.id,
        description: inc.description,
        amount: inc.amount.toString(),
        currency: inc.currency,
        recurringDay: inc.recurringDay,
      })
    }
  }

  return ok(pending)
})
