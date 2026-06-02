import { z } from 'zod'

const amountString = z.string().regex(/^\d+(\.\d{1,4})?$/, 'Monto inválido')
const commissionValueString = z.string().regex(/^(\d+(\.\d{1,4})?)?$/, 'Comisión inválida')
  .transform((v) => v === '' ? '0' : v)
  .optional()
  .default('0')

export const createExchangeSchema = z.object({
  fromCurrency: z.enum(['ARS', 'USD']),
  toCurrency: z.enum(['ARS', 'USD']),
  fromAmount: amountString,
  toAmount: amountString,
  exchangeRate: amountString,
  commissionType: z.enum(['pct', 'fixed']).default('pct'),
  commissionValue: commissionValueString,
  date: z.coerce.date(),
}).refine(
  (data) => data.fromCurrency !== data.toCurrency,
  { message: 'Las monedas deben ser distintas' }
).superRefine((data, ctx) => {
  if (data.commissionType === 'pct' && parseFloat(data.commissionValue) > 100) {
    ctx.addIssue({ code: 'custom', message: 'La comisión no puede superar 100%', path: ['commissionValue'] })
  }
})

export type CreateExchangeInput = z.infer<typeof createExchangeSchema>
