import { getTranslations } from 'next-intl/server';
import { requireHousehold } from '@/lib/session';
import { getWalletSummary, getRecentMovements } from '@/services/wallet.service';
import { BalanceCard } from '@/components/dashboard/balance';
import { MovementList } from '@/components/dashboard/movement-list';
import { ExpensesByCategory } from '@/components/dashboard/expenses-by-category';
import { MonthlyEvolution } from '@/components/dashboard/monthly-evolution';
import { MonthNavigator } from '@/components/ui/month-navigator';
import { parseMonthParam, monthBounds } from '@/lib/month';
import { Suspense } from 'react';
import { CurrencySwitch } from '@/components/dashboard/currency-switch';

type Props = { searchParams: Promise<{ month?: string }> };

export default async function DashboardPage({ searchParams }: Props) {
  const session = await requireHousehold();
  const householdId = session.user.householdId;
  const t = await getTranslations('dashboard');

  const { month: monthParam } = await searchParams;
  const selectedMonth = parseMonthParam(monthParam);

  const { from, to } = monthBounds(selectedMonth);

  const [summary, movements] = await Promise.all([
    getWalletSummary(householdId, selectedMonth),
    getRecentMovements(householdId, 10, { from, to }),
  ]);

  return (
    <div className="flex w-full flex-col gap-6 p-4 md:p-6">
      <section>
        <Suspense>
          <MonthNavigator />
        </Suspense>
      </section>
      <section className="flex flex-col divide-y rounded-xl border bg-card lg:flex-row lg:divide-x lg:divide-y-0">
        <BalanceCard currency="USD" householdId={householdId} initialData={summary} />
        <BalanceCard currency="ARS" householdId={householdId} initialData={summary} />
      </section>

      <section>
        <div className="justify-content flex pb-4">
          <h2 className="mb-3 flex-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {t('analysis')}
          </h2>
          <CurrencySwitch />
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <Suspense>
            <ExpensesByCategory />
          </Suspense>
          <MonthlyEvolution />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {t('lastMovements')}
        </h2>
        <MovementList movements={movements} />
      </section>
    </div>
  );
}
