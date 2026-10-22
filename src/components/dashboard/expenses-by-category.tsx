'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Cell, LabelList, ResponsiveContainer } from 'recharts';
import { formatAmount } from '@/lib/money';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch } from '@/lib/fetch';
import { useCurrency } from '@/components/currency-provider';

type CategoryStat = {
  id: string;
  name: string;
  icon: string;
  color: string;
  ARS: string;
  USD: string;
};
const MAX_LABEL_CHARS = 8;
// Right margin reserved for the amount + percent columns
const LABEL_MARGIN = 110;
const PERCENT_COL_WIDTH = 36;

function CategoryTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const label = payload?.value ?? '';
  const chars = Array.from(label);
  const short =
    chars.length > MAX_LABEL_CHARS ? `${chars.slice(0, MAX_LABEL_CHARS - 1).join('')}…` : label;
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fontSize={11} fill="hsl(var(--muted-foreground))">
      <title>{label}</title>
      {short}
    </text>
  );
}

export function ExpensesByCategory() {
  const t = useTranslations('dashboard.byCategory');
  const { currency } = useCurrency();
  const [showAll, setShowAll] = useState(false);
  const VISIBLE = 5;
  const searchParams = useSearchParams();
  const month = searchParams.get('month') ?? undefined;

  const { data = [], isLoading } = useQuery<CategoryStat[]>({
    queryKey: ['stats', 'categories', month],
    queryFn: () => {
      const url = month ? `/api/stats/categories?month=${month}` : '/api/stats/categories';
      return apiFetch<CategoryStat[]>(url);
    },
  });

  const chartData = data
    .map((c) => ({ ...c, value: parseFloat(c[currency]) }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((acc, c) => acc + c.value, 0);
  const max = chartData[0]?.value ?? 0;
  const visibleData = (showAll ? chartData : chartData.slice(0, VISIBLE)).map((c) => ({
    ...c,
    label: `${c.icon} ${c.name}`,
    percent: total > 0 ? Math.round((c.value / total) * 100) : 0,
  }));
  const ROW_HEIGHT = 32;

  return (
    <div className="flex basis-1/2 flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {t('title')}
        </span>
      </div>

      {isLoading ? (
        <Skeleton className="h-[180px] w-full rounded-lg" />
      ) : chartData.length === 0 ? (
        <div className="flex h-[180px] items-center justify-center">
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={visibleData.length * ROW_HEIGHT}>
            <BarChart
              data={visibleData}
              layout="vertical"
              margin={{ top: 0, right: LABEL_MARGIN, bottom: 0, left: 0 }}
            >
              <XAxis type="number" hide domain={[0, max]} />
              <YAxis
                type="category"
                dataKey="label"
                tick={<CategoryTick />}
                axisLine={false}
                tickLine={false}
              />
              <Bar
                dataKey="value"
                radius={4}
                barSize={8}
                background={{ fill: 'var(--background)', radius: 4, opacity: 1 }}
              >
                {visibleData.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="value"
                  content={({ x, y, width, height, index }) => {
                    const entry = visibleData[Number(index)];
                    if (!entry) return null;
                    // Place the label at the end of the track, not the end of the bar
                    const trackEnd = Number(x) + (Number(width) * max) / entry.value;
                    const cy = Number(y) + Number(height) / 2;
                    // Two right-aligned columns inside the right margin: amount | percent
                    return (
                      <g fontSize={11} textAnchor="end">
                        <text
                          x={trackEnd + LABEL_MARGIN - PERCENT_COL_WIDTH}
                          y={cy}
                          dy={4}
                          fontWeight={500}
                          fill="hsl(var(--foreground))"
                        >
                          {formatAmount(Number(entry.value ?? 0))}
                        </text>
                        <text
                          x={trackEnd + LABEL_MARGIN}
                          y={cy}
                          dy={4}
                          fill="hsl(var(--muted-foreground))"
                        >
                          {`${entry.percent}%`}
                        </text>
                      </g>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {chartData.length > VISIBLE && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {showAll ? t('showLess') : t('showMore')}
            </button>
          )}
        </>
      )}
    </div>
  );
}
