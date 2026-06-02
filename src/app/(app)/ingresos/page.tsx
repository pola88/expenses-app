'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import Decimal from 'decimal.js'
import type { MovementIncome, IncomeTemplate } from '@/types/movement'
import { MovementItem } from '@/components/dashboard/movement-item'
import { RecurringTemplateItem } from '@/components/dashboard/recurring-template-item'
import { IncomeForm } from '@/components/quick-add/income-form'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

type Filter = 'todos' | 'variable' | 'recurrente'

const fmt = (val: string) =>
  new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    parseFloat(val),
  )

export default function IngresosPage() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState<Filter>('todos')
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
      fetch('/api/incomes').then((r) => r.json()).then((items) =>
        items.map((i: MovementIncome) => ({ ...i, type: 'income' as const }))
      ),
  })

  const { data: templates = [], isLoading: loadingTemplates } = useQuery<IncomeTemplate[]>({
    queryKey: ['incomes', 'templates'],
    queryFn: () => fetch('/api/incomes?templates=true').then((r) => r.json()),
  })

  const isLoading = loadingIncomes || loadingTemplates

  const filtered = useMemo(() => {
    if (filter === 'variable') return incomes.filter((i) => !i.recurringSourceId)
    if (filter === 'recurrente') return incomes.filter((i) => !!i.recurringSourceId)
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
    toast.success('Recurrente actualizado')
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

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 max-w-2xl mx-auto w-full">
      <h1 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Ingresos
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

      {/* Templates section */}
      {!loadingTemplates && templates.length > 0 && (
        <div className="flex flex-col gap-1">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Recurrentes configurados
          </h2>
          <div className="rounded-xl border bg-background divide-y divide-border px-4">
            {templates.map((t) => (
              <RecurringTemplateItem key={t.id} template={t} onEdit={setEditTemplate} />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-1">
        {(['todos', 'variable', 'recurrente'] as Filter[]).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={chip(filter === f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
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
          <p className="text-sm text-muted-foreground">No hay ingresos registrados.</p>
          <p className="text-xs text-muted-foreground mt-1">Agregá el primero con el botón +</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-background divide-y divide-border px-4">
          {sorted.map((income) => (
            <MovementItem key={income.id} movement={income} />
          ))}
        </div>
      )}

      {/* Edit template sheet/dialog */}
      {isDesktop ? (
        <Dialog open={!!editTemplate} onOpenChange={(v) => !v && setEditTemplate(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar recurrente</DialogTitle>
            </DialogHeader>
            {editForm}
          </DialogContent>
        </Dialog>
      ) : (
        <Sheet open={!!editTemplate} onOpenChange={(v) => !v && setEditTemplate(null)}>
          <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 pt-4">
            <SheetHeader className="mb-4">
              <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-muted" />
              <SheetTitle>Editar recurrente</SheetTitle>
            </SheetHeader>
            {editForm}
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
