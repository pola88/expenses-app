import { z } from 'zod'

const baseExpenseSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido'),
  currency: z.enum(['ARS', 'USD']),
  description: z.string().min(1).max(200),
  date: z.coerce.date(),
  categoryId: z.string().cuid(),
  isRecurring: z.boolean().default(false),
  recurringDay: z.number().int().min(1).max(31).optional(),
})

export const createExpenseSchema = baseExpenseSchema.refine(
  (data) => !data.isRecurring || data.recurringDay !== undefined,
  { message: 'recurringDay es requerido cuando isRecurring es true', path: ['recurringDay'] }
)

export const updateExpenseSchema = baseExpenseSchema.partial()

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
