export type MovementExpense = {
  type: 'expense'
  id: string
  date: string
  amount: string
  currency: 'ARS' | 'USD'
  description: string
  category: { name: string; icon: string; color: string }
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
