import { apiHandler, ok } from '@/lib/api'
import { incomeService } from '@/services/income.service'
import { updateIncomeSchema } from '@/dtos/income.dto'

type Params = { params: Promise<{ id: string }> }

export const GET = (req: Request, { params }: Params) =>
  apiHandler(async (_, { householdId }) => {
    const { id } = await params
    return ok(await incomeService.getById(id, householdId))
  })(req)

export const PATCH = (req: Request, { params }: Params) =>
  apiHandler(async (req, { householdId }) => {
    const { id } = await params
    const input = updateIncomeSchema.parse(await req.json())
    return ok(await incomeService.update(id, input, householdId))
  })(req)

export const DELETE = (req: Request, { params }: Params) =>
  apiHandler(async (_, { householdId }) => {
    const { id } = await params
    await incomeService.delete(id, householdId)
    return ok({ deleted: true })
  })(req)
