import { z } from 'zod'

const amountString = z.string().regex(/^\d+(\.\d{1,4})?$/, 'Monto inválido')

export const createExchangeSchema = z.object({
  fromCurrency: z.enum(['ARS', 'USD']),
  toCurrency: z.enum(['ARS', 'USD']),
  fromAmount: amountString,
  toAmount: amountString,
  exchangeRate: amountString,
  date: z.coerce.date(),
}).refine(
  (data) => data.fromCurrency !== data.toCurrency,
  { message: 'Las monedas deben ser distintas' }
)

export type CreateExchangeInput = z.infer<typeof createExchangeSchema>
