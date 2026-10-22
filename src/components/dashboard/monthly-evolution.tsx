'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch } from '@/lib/fetch';
import { useCurrency } from '@/components/currency-provider';

type MonthStat = {
  month: string;
  incomesARS: number;
  incomesUSD: number;
  expensesARS: number;
  expensesUSD: number;
};

const INCOMES_COLOR = '#10b981';
const EXPENSES_COLOR = '#f97316';

const fmt = (value: number) =>
  new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

export function MonthlyEvolution() {
  const t = useTranslations('dashboard.monthlyEvolution');
  const tDash = useTranslations('dashboard.monthSummary');
  const { currency } = useCurrency();

  const { data = [], isLoading } = useQuery<MonthStat[]>({
    queryKey: ['stats', 'monthly'],
    queryFn: () => apiFetch<MonthStat[]>('/api/stats/monthly'),
  });

  const incomesLabel = tDash('incomes').replace(' ↑', '');
  const expensesLabel = tDash('expenses').replace(' ↓', '');

  const chartData = data.map((m) => ({
    month: m.month,
    [incomesLabel]: currency === 'ARS' ? m.incomesARS : m.incomesUSD,
    [expensesLabel]: currency === 'ARS' ? m.expensesARS : m.expensesUSD,
  }));

  return (
    <div className="flex basis-1/2 flex-col gap-3 rounded-xl border border-border bg-background bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {t('title')}
        </span>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {[
            { label: incomesLabel, color: INCOMES_COLOR },
            { label: expensesLabel, color: EXPENSES_COLOR },
          ].map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className="size-2 rounded-sm" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-[180px] w-full rounded-lg" />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={chartData}
            barGap={3}
            barCategoryGap="30%"
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={false}
            />
            <Tooltip
              formatter={(value, name) => [fmt(Number(value ?? 0)), String(name)]}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid hsl(var(--border))',
                fontSize: '12px',
              }}
            />
            <Bar dataKey={incomesLabel} fill={INCOMES_COLOR} radius={[4, 4, 0, 0]} />
            <Bar dataKey={expensesLabel} fill={EXPENSES_COLOR} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
