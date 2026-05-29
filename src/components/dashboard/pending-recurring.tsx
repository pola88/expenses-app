'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/money'

type PendingIncome = {
  id: string
  description: string
  amount: string
  currency: 'ARS' | 'USD'
  recurringDay: number | null
}

export function PendingRecurring() {
  const qc = useQueryClient()

  const { data: pending = [] } = useQuery<PendingIncome[]>({
    queryKey: ['incomes', 'pending'],
    queryFn: () => fetch('/api/incomes/pending').then((r) => r.json()),
  })

  const confirm = useMutation({
    mutationFn: (inc: PendingIncome) =>
      fetch('/api/incomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: inc.description,
          amount: inc.amount,
          currency: inc.currency,
          isRecurring: true,
          recurringDay: inc.recurringDay ?? new Date().getDate(),
          date: new Date().toISOString(),
        }),
      }).then((r) => r.json()),
    onSuccess: (_, inc) => {
      qc.invalidateQueries({ queryKey: ['incomes'] })
      qc.invalidateQueries({ queryKey: ['wallet'] })
      toast.success(`${inc.description} registrado`)
    },
    onError: () => toast.error('No se pudo registrar el ingreso'),
  })

  if (pending.length === 0) return null

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        Ingresos del mes
      </h2>
      <div className="flex flex-col gap-2">
        {pending.map((inc) => (
          <div
            key={inc.id}
            className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-background px-4 py-3"
          >
            <span className="text-lg">🔄</span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">{inc.description}</span>
              <span className="text-xs text-muted-foreground">
                {formatMoney(inc.amount, inc.currency)}
                {inc.recurringDay && (
                  <> · día {inc.recurringDay}</>
                )}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="ml-auto shrink-0"
              disabled={confirm.isPending}
              onClick={() => confirm.mutate(inc)}
            >
              Confirmar
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}
