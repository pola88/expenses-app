'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'

type MonthStat = {
  month: string
  incomesARS: number; incomesUSD: number
  expensesARS: number; expensesUSD: number
}

type Currency = 'ARS' | 'USD'

const chip = (active: boolean) =>
  `rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
    active ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
  }`

const fmt = (value: number) =>
  new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 }).format(value)

export function MonthlyEvolution() {
  const [currency, setCurrency] = useState<Currency>('ARS')

  const { data = [], isLoading } = useQuery<MonthStat[]>({
    queryKey: ['stats', 'monthly'],
    queryFn: () => fetch('/api/stats/monthly').then((r) => r.json()),
  })

  const chartData = data.map((m) => ({
    month: m.month,
    Ingresos: currency === 'ARS' ? m.incomesARS : m.incomesUSD,
    Gastos: currency === 'ARS' ? m.expensesARS : m.expensesUSD,
  }))

  return (
    <div className="rounded-xl border border-border bg-background p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Evolución mensual
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
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barGap={3} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={fmt}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              formatter={(value, name) => [fmt(Number(value ?? 0)), String(name)]}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid hsl(var(--border))',
                fontSize: '12px',
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            />
            <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Gastos" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
