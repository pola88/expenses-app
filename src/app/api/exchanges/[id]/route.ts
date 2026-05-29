import { apiHandler, ok } from '@/lib/api'
import { exchangeService } from '@/services/exchange.service'

type Params = { params: Promise<{ id: string }> }

export const GET = (req: Request, { params }: Params) =>
  apiHandler(async (_, { householdId }) => {
    const { id } = await params
    return ok(await exchangeService.getById(id, householdId))
  })(req)

export const DELETE = (req: Request, { params }: Params) =>
  apiHandler(async (_, { householdId }) => {
    const { id } = await params
    await exchangeService.delete(id, householdId)
    return ok({ deleted: true })
  })(req)
