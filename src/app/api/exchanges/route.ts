import { apiHandler, ok } from '@/lib/api'
import { exchangeService } from '@/services/exchange.service'
import { createExchangeSchema } from '@/dtos/exchange.dto'

export const GET = apiHandler(async (req, { householdId }) => {
  const { searchParams } = new URL(req.url)
  const filters = {
    from: searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined,
    to: searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined,
  }
  return ok(await exchangeService.list(householdId, filters))
})

export const POST = apiHandler(async (req, { householdId, userId }) => {
  const input = createExchangeSchema.parse(await req.json())
  return ok(await exchangeService.create(input, householdId, userId), 201)
})
