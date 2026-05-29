import { z } from 'zod'

const baseIncomeSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido'),
  currency: z.enum(['ARS', 'USD']),
  description: z.string().min(1).max(200),
  date: z.coerce.date(),
  isRecurring: z.boolean().default(false),
  recurringDay: z.number().int().min(1).max(31).optional(),
})

export const createIncomeSchema = baseIncomeSchema.refine(
  (data) => !data.isRecurring || data.recurringDay !== undefined,
  { message: 'recurringDay es requerido cuando isRecurring es true', path: ['recurringDay'] }
)

export const updateIncomeSchema = baseIncomeSchema.partial()

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>
