import { prisma } from '@/lib/prisma'
import { Currency } from '@prisma/client'

const USER_SELECT = { select: { id: true, name: true } }

export const incomeRepository = {
  findByHousehold(householdId: string, filters: { from?: Date; to?: Date } = {}) {
    return prisma.income.findMany({
      where: {
        householdId,
        isRecurring: false, // templates excluded — only actual entries
        ...(filters.from || filters.to
          ? { date: { ...(filters.from && { gte: filters.from }), ...(filters.to && { lte: filters.to }) } }
          : {}),
      },
      include: { user: USER_SELECT },
      orderBy: { date: 'desc' },
    })
  },

  findActiveTemplates(householdId: string) {
    return prisma.income.findMany({
      where: { householdId, isRecurring: true, recurringActive: true },
      include: { user: USER_SELECT },
      orderBy: { description: 'asc' },
    })
  },

  findAllTemplates(householdId: string) {
    return prisma.income.findMany({
      where: { householdId, isRecurring: true },
      include: { user: USER_SELECT },
      orderBy: { recurringActive: 'desc' },
    })
  },

  findInstanceForMonth(templateId: string, year: number, month: number) {
    const from = new Date(Date.UTC(year, month, 1))
    const to = new Date(Date.UTC(year, month + 1, 1))
    return prisma.income.findFirst({
      where: { recurringSourceId: templateId, date: { gte: from, lt: to } },
    })
  },

  findById(id: string, householdId: string) {
    return prisma.income.findFirst({
      where: { id, householdId },
      include: { user: USER_SELECT },
    })
  },

  create(data: {
    amount: string; currency: Currency; description: string; date: Date
    isRecurring: boolean; recurringDay?: number; householdId: string; userId: string
    recurringSourceId?: string
  }) {
    return prisma.income.create({ data })
  },

  update(id: string, householdId: string, data: Partial<{
    amount: string; currency: Currency; description: string; date: Date
    isRecurring: boolean; recurringDay: number | null; recurringActive: boolean
  }>) {
    return prisma.income.update({ where: { id, householdId }, data })
  },

  delete(id: string, householdId: string) {
    return prisma.income.delete({ where: { id, householdId } })
  },
}
