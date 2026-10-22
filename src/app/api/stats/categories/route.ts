import { apiHandler, ok } from '@/lib/api';
import { getCategoryBreakdown } from '@/services/wallet.service';

export const GET = apiHandler(async (req, { householdId }) => {
  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get('month');
  const ref = monthParam ? new Date(`${monthParam}-01T00:00:00Z`) : new Date();

  return ok(await getCategoryBreakdown(householdId, ref));
});
