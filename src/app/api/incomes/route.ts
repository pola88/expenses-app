import { apiHandler, ok } from '@/lib/api'
import { incomeService } from '@/services/income.service'
import { createIncomeSchema } from '@/dtos/income.dto'

export const GET = apiHandler(async (req, { householdId }) => {
  const { searchParams } = new URL(req.url)

  if (searchParams.get('templates') === 'true') {
    return ok(await incomeService.listTemplates(householdId))
  }

  const filters = {
    from: searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined,
    to: searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined,
  }
  return ok(await incomeService.list(householdId, filters))
})

export const POST = apiHandler(async (req, { householdId, userId }) => {
  const input = createIncomeSchema.parse(await req.json())
  return ok(await incomeService.create(input, householdId, userId), 201)
})
