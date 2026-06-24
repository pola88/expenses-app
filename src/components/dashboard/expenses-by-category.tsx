'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatMoney } from '@/lib/money'
import { Skeleton } from '@/components/ui/skeleton'
import { apiFetch } from '@/lib/fetch'

type CategoryStat = {
  id: string; name: string; icon: string; color: string
  ARS: string; USD: string
}

type Currency = 'ARS' | 'USD'

const chip = (active: boolean) =>
  `rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
    active ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
  }`

export function ExpensesByCategory() {
  const t = useTranslations('dashboard.byCategory')
  const [currency, setCurrency] = useState<Currency>('ARS')
  const [showAll, setShowAll] = useState(false)
  const VISIBLE = 4
  const searchParams = useSearchParams()
  const month = searchParams.get('month') ?? undefined

  const { data = [], isLoading } = useQuery<CategoryStat[]>({
    queryKey: ['stats', 'categories', month],
    queryFn: () => {
      const url = month ? `/api/stats/categories?month=${month}` : '/api/stats/categories'
      return apiFetch<CategoryStat[]>(url)
    },
  })

  const chartData = data
    .map((c) => ({ ...c, value: parseFloat(c[currency]) }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value)

  const total = chartData.reduce((acc, c) => acc + c.value, 0)

  return (
    <div className="rounded-xl border border-border bg-background p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t('title')}
        </span>
        <div className="flex gap-1">
          {(['ARS', 'USD'] as Currency[]).map((c) => (
            <button key={c} type="button" onClick={() => setCurrency(c)} className={chip(currency === c)}>
              {c}$
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-[180px] w-full rounded-lg" />
      ) : chartData.length === 0 ? (
        <div className="flex h-[180px] items-center justify-center">
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatMoney(Number(value ?? 0), currency), '']}
                labelFormatter={() => ''}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex flex-col gap-1.5">
            <AnimatePresence initial={false}>
              {(showAll ? chartData : chartData.slice(0, VISIBLE)).map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15, delay: i * 0.03 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-sm">{c.icon}</span>
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{c.name}</span>
                  <span className="text-xs font-medium tabular-nums">
                    {total > 0 ? Math.round((c.value / total) * 100) : 0}%
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {chartData.length > VISIBLE && (
              <button
                type="button"
                onClick={() => setShowAll(v => !v)}
                className="mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showAll ? t('showLess') : t('showMore')}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
