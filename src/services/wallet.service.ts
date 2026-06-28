import Decimal from 'decimal.js'
import { incomeRepository } from '@/repositories/income.repository'
import { expenseRepository } from '@/repositories/expense.repository'
import { exchangeRepository } from '@/repositories/exchange.repository'
import { incomeService } from '@/services/income.service'
import { expenseService } from '@/services/expense.service'
import type { Movement } from '@/types/movement'

export type WalletBalance = { ARS: string; USD: string }

export type WalletSummary = {
  balance: WalletBalance
  month: {
    incomes: WalletBalance
    expenses: WalletBalance
  }
}

export type { Movement }

export async function getWalletBalance(householdId: string): Promise<WalletBalance> {
  await Promise.all([
    incomeService.syncRecurringIncomes(householdId),
    expenseService.syncRecurringExpenses(householdId),
  ])

  const [incomes, expenses, exchanges] = await Promise.all([
    incomeRepository.findByHousehold(householdId),
    expenseRepository.findByHousehold(householdId),
    exchangeRepository.findByHousehold(householdId),
  ])

  let ARS = new Decimal(0)
  let USD = new Decimal(0)

  for (const inc of incomes) {
    if (inc.currency === 'ARS') ARS = ARS.plus(inc.amount.toString())
    else USD = USD.plus(inc.amount.toString())
  }

  for (const exp of expenses) {
    if (exp.currency === 'ARS') ARS = ARS.minus(exp.amount.toString())
    else USD = USD.minus(exp.amount.toString())
  }

  for (const ex of exchanges) {
    if (ex.fromCurrency === 'ARS') ARS = ARS.minus(ex.fromAmount.toString())
    else USD = USD.minus(ex.fromAmount.toString())

    if (ex.toCurrency === 'ARS') ARS = ARS.plus(ex.toAmount.toString())
    else USD = USD.plus(ex.toAmount.toString())
  }

  return { ARS: ARS.toFixed(2), USD: USD.toFixed(2) }
}

export async function getWalletSummary(householdId: string, month: Date): Promise<WalletSummary> {
  const y = month.getUTCFullYear()
  const mo = month.getUTCMonth()
  const from = new Date(Date.UTC(y, mo, 1))
  const to = new Date(Date.UTC(y, mo + 1, 0, 23, 59, 59, 999))

  const [balance, monthIncomes, monthExpenses] = await Promise.all([
    getWalletBalance(householdId),
    incomeRepository.findByHousehold(householdId, { from, to }),
    expenseRepository.findByHousehold(householdId, { from, to }),
  ])

  const sum = (items: { currency: string; amount: { toString(): string } }[], currency: string) =>
    items
      .filter((i) => i.currency === currency)
      .reduce((acc, i) => acc.plus(i.amount.toString()), new Decimal(0))
      .toFixed(2)

  return {
    balance,
    month: {
      incomes: { ARS: sum(monthIncomes, 'ARS'), USD: sum(monthIncomes, 'USD') },
      expenses: { ARS: sum(monthExpenses, 'ARS'), USD: sum(monthExpenses, 'USD') },
    },
  }
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
