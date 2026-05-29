import { apiHandler, ok } from '@/lib/api'
import { expenseService } from '@/services/expense.service'
import { updateExpenseSchema } from '@/dtos/expense.dto'

type Params = { params: Promise<{ id: string }> }

export const GET = (req: Request, { params }: Params) =>
  apiHandler(async (_, { householdId }) => {
    const { id } = await params
    return ok(await expenseService.getById(id, householdId))
  })(req)

export const PATCH = (req: Request, { params }: Params) =>
  apiHandler(async (req, { householdId }) => {
    const { id } = await params
    const input = updateExpenseSchema.parse(await req.json())
    return ok(await expenseService.update(id, input, householdId))
  })(req)

export const DELETE = (req: Request, { params }: Params) =>
  apiHandler(async (_, { householdId }) => {
    const { id } = await params
    await expenseService.delete(id, householdId)
    return ok({ deleted: true })
  })(req)
