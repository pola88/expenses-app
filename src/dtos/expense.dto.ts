import { z } from 'zod'

export const createExpenseSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido'),
  currency: z.enum(['ARS', 'USD']),
  description: z.string().min(1).max(200),
  date: z.coerce.date(),
  categoryId: z.string().cuid(),
})

export const updateExpenseSchema = createExpenseSchema.partial()

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
