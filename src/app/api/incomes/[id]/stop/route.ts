import { apiHandler, ok } from '@/lib/api'
import { incomeService } from '@/services/income.service'

type Params = { params: Promise<{ id: string }> }

export const POST = (req: Request, { params }: Params) =>
  apiHandler(async (_, { householdId }) => {
    const { id } = await params
    return ok(await incomeService.stopRecurring(id, householdId))
  })(req)
