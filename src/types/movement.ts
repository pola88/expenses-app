export type MovementExpense = {
  type: 'expense'
  id: string
  date: string
  amount: string
  currency: 'ARS' | 'USD'
  description: string
  category: { id: string; name: string; icon: string; color: string }
  user: { id: string; name: string | null }
}

export type MovementIncome = {
  type: 'income'
  id: string
  date: string
  amount: string
  currency: 'ARS' | 'USD'
  description: string
  isRecurring: boolean
  recurringSourceId: string | null
  user: { id: string; name: string | null }
}

export type IncomeTemplate = {
  id: string
  amount: string
  currency: 'ARS' | 'USD'
  description: string
  recurringDay: number
  recurringActive: boolean
  date: string
  user: { id: string; name: string | null }
}

export type MovementExchange = {
  type: 'exchange'
  id: string
  date: string
  fromCurrency: 'ARS' | 'USD'
  toCurrency: 'ARS' | 'USD'
  fromAmount: string
  toAmount: string
  exchangeRate: string
  user: { id: string; name: string | null }
}

export type Movement = MovementExpense | MovementIncome | MovementExchange
