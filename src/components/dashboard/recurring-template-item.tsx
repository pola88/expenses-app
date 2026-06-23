'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Pencil, StopCircle, PlayCircle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { IncomeTemplate } from '@/types/movement'
import { formatMoney } from '@/lib/money'
import { apiFetch } from '@/lib/fetch'

type Props = { template: IncomeTemplate; onEdit: (t: IncomeTemplate) => void }

export function RecurringTemplateItem({ template, onEdit }: Props) {
  const t = useTranslations('dashboard.recurringTemplate')
  const tCommon = useTranslations('common')
  const qc = useQueryClient()
  const [stopOpen, setStopOpen] = useState(false)

  const stopMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/incomes/${template.id}/stop`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes', 'templates'] })
      qc.invalidateQueries({ queryKey: ['wallet'] })
      toast.success(t('stoppedToast'))
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const resumeMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/incomes/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recurringActive: true }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes', 'templates'] })
      qc.invalidateQueries({ queryKey: ['wallet'] })
      toast.success(t('resumedToast'))
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <>
      <div className={`flex items-center gap-3 py-3 ${!template.recurringActive ? 'opacity-50' : ''}`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-lg">
          ↻
        </span>
        <div className="flex flex-1 flex-col min-w-0">
          <span className="text-sm font-medium truncate">{template.description}</span>
          <span className="text-xs text-muted-foreground">
            {t('day', { day: template.recurringDay })} · {template.recurringActive ? t('active') : t('stopped')}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0 mr-1">
          <span className="text-sm font-semibold text-green-700 tabular-nums">
            +{formatMoney(template.amount, template.currency).replace(/^(ARS|USD)\$ /, '')}
          </span>
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
            template.currency === 'USD'
              ? 'bg-blue-50 text-blue-800'
              : 'bg-green-50 text-green-800'
          }`}>
            {template.currency}$
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(template)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label={t('editLabel')}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {template.recurringActive ? (
            <button
              type="button"
              onClick={() => setStopOpen(true)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
              aria-label={t('stopLabel')}
            >
              <StopCircle className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => resumeMutation.mutate()}
              disabled={resumeMutation.isPending}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-green-700 transition-colors"
              aria-label={t('resumeLabel')}
            >
              <PlayCircle className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <AlertDialog open={stopOpen} onOpenChange={setStopOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('stopConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('stopConfirmDesc', { description: template.description })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => stopMutation.mutate()}
            >
              {t('stopLabel')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
