import { apiHandler, ok } from '@/lib/api'
import { expenseService } from '@/services/expense.service'
import { createExpenseSchema } from '@/dtos/expense.dto'

export const GET = apiHandler(async (req, { householdId }) => {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('templates') === 'true') {
    return ok(await expenseService.listTemplates(householdId))
  }
  const filters = {
    categoryId: searchParams.get('categoryId') ?? undefined,
    currency: (searchParams.get('currency') as 'ARS' | 'USD') ?? undefined,
    from: searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined,
    to: searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined,
  }
  return ok(await expenseService.list(householdId, filters))
})

export const POST = apiHandler(async (req, { householdId, userId }) => {
  const input = createExpenseSchema.parse(await req.json())
  return ok(await expenseService.create(input, householdId, userId), 201)
})
