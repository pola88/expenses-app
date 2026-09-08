import Decimal from 'decimal.js'
import { prisma } from '@/lib/prisma'
import { incomeRepository } from '@/repositories/income.repository'
import { expenseRepository } from '@/repositories/expense.repository'
import { exchangeRepository } from '@/repositories/exchange.repository'
import type { Movement } from '@/types/movement'

export type WalletBalance = { ARS: string; USD: string }

export type WalletSummary = {
  balance: WalletBalance
  month: {
    incomes: WalletBalance
    expenses: WalletBalance
    exchanges: WalletBalance
    net: WalletBalance
  }
}

export type { Movement }

export async function getWalletBalance(householdId: string): Promise<WalletBalance> {
  const [incomeSums, expenseSums, exchangeFromSums, exchangeToSums] = await Promise.all([
    prisma.income.groupBy({
      by: ['currency'],
      where: { householdId, isRecurring: false },
      _sum: { amount: true },
    }),
    prisma.expense.groupBy({
      by: ['currency'],
      where: { householdId, isRecurring: false },
      _sum: { amount: true },
    }),
    prisma.currencyExchange.groupBy({
      by: ['fromCurrency'],
      where: { householdId },
      _sum: { fromAmount: true },
    }),
    prisma.currencyExchange.groupBy({
      by: ['toCurrency'],
      where: { householdId },
      _sum: { toAmount: true },
    }),
  ])

  let ARS = new Decimal(0)
  let USD = new Decimal(0)

  for (const row of incomeSums) {
    const sum = row._sum.amount?.toString() ?? '0'
    if (row.currency === 'ARS') ARS = ARS.plus(sum)
    else USD = USD.plus(sum)
  }

  for (const row of expenseSums) {
    const sum = row._sum.amount?.toString() ?? '0'
    if (row.currency === 'ARS') ARS = ARS.minus(sum)
    else USD = USD.minus(sum)
  }

  for (const row of exchangeFromSums) {
    const sum = row._sum.fromAmount?.toString() ?? '0'
    if (row.fromCurrency === 'ARS') ARS = ARS.minus(sum)
    else USD = USD.minus(sum)
  }

  for (const row of exchangeToSums) {
    const sum = row._sum.toAmount?.toString() ?? '0'
    if (row.toCurrency === 'ARS') ARS = ARS.plus(sum)
    else USD = USD.plus(sum)
  }

  return { ARS: ARS.toFixed(2), USD: USD.toFixed(2) }
}

export async function getWalletSummary(householdId: string, month: Date): Promise<WalletSummary> {
  const y = month.getUTCFullYear()
  const mo = month.getUTCMonth()
  const from = new Date(Date.UTC(y, mo, 1))
  const to = new Date(Date.UTC(y, mo + 1, 0, 23, 59, 59, 999))

  const [balance, monthIncomes, monthExpenses, monthExchanges] = await Promise.all([
    getWalletBalance(householdId),
    incomeRepository.findByHousehold(householdId, { from, to }),
    expenseRepository.findByHousehold(householdId, { from, to }),
    exchangeRepository.findByHousehold(householdId, { from, to }),
  ])

  const sum = (items: { currency: string; amount: { toString(): string } }[], currency: string) =>
    items
      .filter((i) => i.currency === currency)
      .reduce((acc, i) => acc.plus(i.amount.toString()), new Decimal(0))
      .toFixed(2)

  const incomes = { ARS: sum(monthIncomes, 'ARS'), USD: sum(monthIncomes, 'USD') }
  const expenses = { ARS: sum(monthExpenses, 'ARS'), USD: sum(monthExpenses, 'USD') }

  // Efecto neto de los cambios sobre cada moneda: lo que salió (−) y lo que entró (+)
  let exchangeARS = new Decimal(0)
  let exchangeUSD = new Decimal(0)
  for (const ex of monthExchanges) {
    if (ex.fromCurrency === 'ARS') exchangeARS = exchangeARS.minus(ex.fromAmount.toString())
    else exchangeUSD = exchangeUSD.minus(ex.fromAmount.toString())
    if (ex.toCurrency === 'ARS') exchangeARS = exchangeARS.plus(ex.toAmount.toString())
    else exchangeUSD = exchangeUSD.plus(ex.toAmount.toString())
  }
  const exchanges = { ARS: exchangeARS.toFixed(2), USD: exchangeUSD.toFixed(2) }

  return {
    balance,
    month: {
      incomes,
      expenses,
      exchanges,
      net: {
        ARS: new Decimal(incomes.ARS).minus(expenses.ARS).plus(exchanges.ARS).toFixed(2),
        USD: new Decimal(incomes.USD).minus(expenses.USD).plus(exchanges.USD).toFixed(2),
      },
    },
  }
}

export type CategoryBreakdown = {
  id: string; name: string; icon: string; color: string; ARS: string; USD: string
}

export async function getCategoryBreakdown(householdId: string, month: Date): Promise<CategoryBreakdown[]> {
  const y = month.getUTCFullYear()
  const mo = month.getUTCMonth()
  const from = new Date(Date.UTC(y, mo, 1))
  const to = new Date(Date.UTC(y, mo + 1, 1))

  const expenses = await prisma.expense.findMany({
    where: { householdId, isRecurring: false, date: { gte: from, lt: to } },
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

  return Object.entries(grouped).map(([id, { name, icon, color, ARS, USD }]) => ({
    id, name, icon, color,
    ARS: ARS.toFixed(2),
    USD: USD.toFixed(2),
  }))
}

export async function getRecentMovements(
  householdId: string,
  limit = 10,
  filter?: { from: Date; to: Date },
): Promise<Movement[]> {
  const [expenses, incomes, exchanges] = await Promise.all([
    expenseRepository.findByHousehold(householdId, filter),
    incomeRepository.findByHousehold(householdId, filter),
    exchangeRepository.findByHousehold(householdId, filter),
  ])

  const movements: Movement[] = [
    ...expenses.map((e) => ({
      type: 'expense' as const,
      id: e.id,
      date: e.date.toISOString(),
      amount: e.amount.toString(),
      currency: e.currency,
      description: e.description,
      isRecurring: e.isRecurring,
      recurringSourceId: e.recurringSourceId,
      category: { id: e.category.id, name: e.category.name, icon: e.category.icon, color: e.category.color },
      user: e.user,
    })),
    ...incomes.map((i) => ({
      type: 'income' as const,
      id: i.id,
      date: i.date.toISOString(),
      amount: i.amount.toString(),
      currency: i.currency,
      description: i.description,
      isRecurring: i.isRecurring,
      recurringSourceId: i.recurringSourceId,
      user: i.user,
    })),
    ...exchanges.map((ex) => ({
      type: 'exchange' as const,
      id: ex.id,
      date: ex.date.toISOString(),
      fromCurrency: ex.fromCurrency,
      toCurrency: ex.toCurrency,
      fromAmount: ex.fromAmount.toString(),
      toAmount: ex.toAmount.toString(),
      exchangeRate: ex.exchangeRate.toString(),
      commissionType: ex.commissionType,
      commissionValue: ex.commissionValue.toString(),
      user: ex.user,
    })),
  ]

  return movements.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit)
}
