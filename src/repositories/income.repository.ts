import { prisma } from '@/lib/prisma'
import { Currency } from '@prisma/client'

export const incomeRepository = {
  findByHousehold(householdId: string, filters: { from?: Date; to?: Date } = {}) {
    return prisma.income.findMany({
      where: {
        householdId,
        ...(filters.from || filters.to
          ? { date: { ...(filters.from && { gte: filters.from }), ...(filters.to && { lte: filters.to }) } }
          : {}),
      },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    })
  },

  findById(id: string, householdId: string) {
    return prisma.income.findFirst({
      where: { id, householdId },
      include: { user: { select: { id: true, name: true } } },
    })
  },

  create(data: {
    amount: string; currency: Currency; description: string; date: Date
    isRecurring: boolean; recurringDay?: number; householdId: string; userId: string
  }) {
    return prisma.income.create({ data })
  },

  update(id: string, householdId: string, data: Partial<{
    amount: string; currency: Currency; description: string; date: Date
    isRecurring: boolean; recurringDay: number | null
  }>) {
    return prisma.income.update({ where: { id, householdId }, data })
  },

  delete(id: string, householdId: string) {
    return prisma.income.delete({ where: { id, householdId } })
  },
}
