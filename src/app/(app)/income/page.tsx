'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import Decimal from 'decimal.js'
import type { MovementIncome, IncomeTemplate } from '@/types/movement'
import { apiFetch } from '@/lib/fetch'
import { MovementItem } from '@/components/dashboard/movement-item'
import { RecurringTemplateItem } from '@/components/dashboard/recurring-template-item'
import { IncomeForm } from '@/components/quick-add/income-form'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

type Filter = 'all' | 'variable' | 'recurring'

const fmt = (val: string) =>
  new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    parseFloat(val),
  )

export default function IngresosPage() {
  const t = useTranslations('incomes')
  const qc = useQueryClient()
  const [filter, setFilter] = useState<Filter>('all')
  const [editTemplate, setEditTemplate] = useState<IncomeTemplate | null>(null)
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const { data: incomes = [], isLoading: loadingIncomes } = useQuery<MovementIncome[]>({
    queryKey: ['incomes'],
    queryFn: () =>
      apiFetch<MovementIncome[]>('/api/incomes').then((items) =>
        items.map((i) => ({ ...i, type: 'income' as const }))
      ),
  })

  const { data: templates = [], isLoading: loadingTemplates } = useQuery<IncomeTemplate[]>({
    queryKey: ['incomes', 'templates'],
    queryFn: () => apiFetch<IncomeTemplate[]>('/api/incomes?templates=true'),
  })

  const isLoading = loadingIncomes || loadingTemplates

  const filtered = useMemo(() => {
    if (filter === 'variable') return incomes.filter((i) => !i.recurringSourceId)
    if (filter === 'recurring') return incomes.filter((i) => !!i.recurringSourceId)
    return incomes
  }, [incomes, filter])

  const totals = useMemo(() => {
    const sum = (currency: 'ARS' | 'USD') =>
      filtered
        .filter((i) => i.currency === currency)
        .reduce((acc, i) => acc.plus(i.amount), new Decimal(0))
        .toFixed(2)
    return { ARS: sum('ARS'), USD: sum('USD') }
  }, [filtered])

  const chip = (active: boolean) =>
    `rounded-full px-3 py-1 text-sm font-medium transition-colors ${
      active ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
    }`

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date))

  const handleEditSuccess = () => {
    setEditTemplate(null)
    qc.invalidateQueries({ queryKey: ['incomes', 'templates'] })
    qc.invalidateQueries({ queryKey: ['incomes'] })
    qc.invalidateQueries({ queryKey: ['wallet'] })
    toast.success(t('recurringUpdated'))
  }

  const editForm = editTemplate ? (
    <IncomeForm
      editId={editTemplate.id}
      initialValues={{
        amount: editTemplate.amount,
        currency: editTemplate.currency,
        description: editTemplate.description,
        date: editTemplate.date.split('T')[0],
        isRecurring: true,
        recurringDay: editTemplate.recurringDay,
      }}
      onSuccess={handleEditSuccess}
    />
  ) : null

  const filterOptions: { value: Filter; label: string }[] = [
    { value: 'all', label: t('all') },
    { value: 'variable', label: t('variable') },
    { value: 'recurring', label: t('recurring') },
  ]

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 max-w-2xl mx-auto w-full">
      <h1 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t('title')}
      </h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <span className="text-xs font-semibold tracking-wide text-blue-600">USD$</span>
          <p className="mt-1 text-xl font-bold tabular-nums text-blue-900">{fmt(totals.USD)}</p>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50 p-4">
          <span className="text-xs font-semibold tracking-wide text-green-600">ARS$</span>
          <p className="mt-1 text-xl font-bold tabular-nums text-green-900">{fmt(totals.ARS)}</p>
        </div>
      </div>

      {!loadingTemplates && templates.length > 0 && (
        <div className="flex flex-col gap-1">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t('recurringConfigured')}
          </h2>
          <div className="rounded-xl border bg-background divide-y divide-border px-4">
            {templates.map((tmpl) => (
              <RecurringTemplateItem key={tmpl.id} template={tmpl} onEdit={setEditTemplate} />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-1">
        {filterOptions.map(({ value, label }) => (
          <button key={value} type="button" onClick={() => setFilter(value)} className={chip(filter === value)}>
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border bg-background py-12 text-center">
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('emptyCta')}</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-background divide-y divide-border px-4">
          {sorted.map((income) => (
            <MovementItem key={income.id} movement={income} />
          ))}
        </div>
      )}

      {isDesktop ? (
        <Dialog open={!!editTemplate} onOpenChange={(v) => !v && setEditTemplate(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('editRecurring')}</DialogTitle>
            </DialogHeader>
            {editForm}
          </DialogContent>
        </Dialog>
      ) : (
        <Sheet open={!!editTemplate} onOpenChange={(v) => !v && setEditTemplate(null)}>
          <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 pt-4">
            <SheetHeader className="mb-4">
              <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-muted" />
              <SheetTitle>{t('editRecurring')}</SheetTitle>
            </SheetHeader>
            {editForm}
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
