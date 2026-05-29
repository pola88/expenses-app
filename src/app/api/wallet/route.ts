import { apiHandler, ok } from '@/lib/api'
import { getWalletSummary } from '@/services/wallet.service'

export const GET = apiHandler(async (req, { householdId }) => {
  const { searchParams } = new URL(req.url)
  const monthParam = searchParams.get('month')
  const month = monthParam ? new Date(`${monthParam}-01`) : new Date()
  return ok(await getWalletSummary(householdId, month))
})
