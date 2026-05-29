import { prisma } from '@/lib/prisma'
import { Currency } from '@prisma/client'

export type ExpenseFilters = {
  categoryId?: string
  currency?: Currency
  from?: Date
  to?: Date
}

export const expenseRepository = {
  findByHousehold(householdId: string, filters: ExpenseFilters = {}) {
    return prisma.expense.findMany({
      where: {
        householdId,
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.currency && { currency: filters.currency }),
        ...(filters.from || filters.to
          ? { date: { ...(filters.from && { gte: filters.from }), ...(filters.to && { lte: filters.to }) } }
          : {}),
      },
      include: {
        category: true,
        user: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    })
  },

  findById(id: string, householdId: string) {
    return prisma.expense.findFirst({
      where: { id, householdId },
      include: { category: true, user: { select: { id: true, name: true } } },
    })
  },

  create(data: {
    amount: string; currency: Currency; description: string
    date: Date; householdId: string; userId: string; categoryId: string
  }) {
    return prisma.expense.create({ data })
  },

  update(id: string, householdId: string, data: Partial<{
    amount: string; currency: Currency; description: string; date: Date; categoryId: string
  }>) {
    return prisma.expense.update({ where: { id, householdId }, data })
  },

  delete(id: string, householdId: string) {
    return prisma.expense.delete({ where: { id, householdId } })
  },
}
