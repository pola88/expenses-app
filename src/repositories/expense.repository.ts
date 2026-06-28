import { prisma } from '@/lib/prisma'
import { Currency } from '@prisma/client'

export type ExpenseFilters = {
  categoryId?: string
  currency?: Currency
  from?: Date
  to?: Date
}

const USER_SELECT = { select: { id: true, name: true } }

export const expenseRepository = {
  findByHousehold(householdId: string, filters: ExpenseFilters = {}) {
    return prisma.expense.findMany({
      where: {
        householdId,
        isRecurring: false,
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.currency && { currency: filters.currency }),
        ...(filters.from || filters.to
          ? { date: { ...(filters.from && { gte: filters.from }), ...(filters.to && { lte: filters.to }) } }
          : {}),
      },
      include: {
        category: true,
        user: USER_SELECT,
      },
      orderBy: { date: 'desc' },
    })
  },

  findActiveTemplates(householdId: string) {
    return prisma.expense.findMany({
      where: { householdId, isRecurring: true, recurringActive: true },
      include: { category: true, user: USER_SELECT },
      orderBy: { description: 'asc' },
    })
  },

  findAllTemplates(householdId: string) {
    return prisma.expense.findMany({
      where: { householdId, isRecurring: true },
      include: { category: true, user: USER_SELECT },
      orderBy: { recurringActive: 'desc' },
    })
  },

  findInstanceForMonth(templateId: string, year: number, month: number) {
    const from = new Date(Date.UTC(year, month, 1))
    const to = new Date(Date.UTC(year, month + 1, 1))
    return prisma.expense.findFirst({
      where: { recurringSourceId: templateId, date: { gte: from, lt: to } },
    })
  },

  findById(id: string, householdId: string) {
    return prisma.expense.findFirst({
      where: { id, householdId },
      include: { category: true, user: USER_SELECT },
    })
  },

  create(data: {
    amount: string; currency: Currency; description: string
    date: Date; householdId: string; userId: string; categoryId: string
    isRecurring?: boolean; recurringDay?: number; recurringSourceId?: string
  }) {
    return prisma.expense.create({ data })
  },

  update(id: string, householdId: string, data: Partial<{
    amount: string; currency: Currency; description: string; date: Date; categoryId: string
    isRecurring: boolean; recurringDay: number | null; recurringActive: boolean
  }>) {
    return prisma.expense.update({ where: { id, householdId }, data })
  },

  delete(id: string, householdId: string) {
    return prisma.expense.delete({ where: { id, householdId } })
  },
}
