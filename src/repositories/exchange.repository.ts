import { prisma } from '@/lib/prisma'
import { Currency } from '@prisma/client'

export const exchangeRepository = {
  findByHousehold(householdId: string, filters: { from?: Date; to?: Date } = {}) {
    return prisma.currencyExchange.findMany({
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
    return prisma.currencyExchange.findFirst({
      where: { id, householdId },
      include: { user: { select: { id: true, name: true } } },
    })
  },

  create(data: {
    fromCurrency: Currency; toCurrency: Currency; fromAmount: string
    toAmount: string; exchangeRate: string
    commissionType: string; commissionValue: string
    date: Date; householdId: string; userId: string
  }) {
    return prisma.currencyExchange.create({ data })
  },

  delete(id: string, householdId: string) {
    return prisma.currencyExchange.delete({ where: { id, householdId } })
  },
}
