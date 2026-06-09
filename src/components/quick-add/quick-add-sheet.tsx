'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExpenseForm } from './expense-form'
import { IncomeForm } from './income-form'
import { ExchangeForm } from './exchange-form'
import { toast } from 'sonner'

type Props = { open: boolean; onOpenChange: (v: boolean) => void }

function QuickAddTabs({ onSuccess }: { onSuccess: (label: string) => void }) {
  const t = useTranslations('quickAdd')
  const [tab, setTab] = useState<'gasto' | 'ingreso' | 'cambio'>('gasto')

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
      <TabsList className="w-full mb-4">
        <TabsTrigger value="gasto" className="flex-1">{t('expenseTab')}</TabsTrigger>
        <TabsTrigger value="ingreso" className="flex-1">{t('incomeTab')}</TabsTrigger>
        <TabsTrigger value="cambio" className="flex-1">{t('exchangeTab')}</TabsTrigger>
      </TabsList>
      <TabsContent value="gasto">
        <ExpenseForm onSuccess={() => onSuccess(t('expenseSaved'))} />
      </TabsContent>
      <TabsContent value="ingreso">
        <IncomeForm onSuccess={() => onSuccess(t('incomeSaved'))} />
      </TabsContent>
      <TabsContent value="cambio">
        <ExchangeForm onSuccess={() => onSuccess(t('exchangeSaved'))} />
      </TabsContent>
    </Tabs>
  )
}

export function QuickAddSheet({ open, onOpenChange }: Props) {
  const t = useTranslations('quickAdd')
  const router = useRouter()
  const qc = useQueryClient()
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const handleSuccess = (label: string) => {
    onOpenChange(false)
    toast.success(label)
    qc.invalidateQueries({ queryKey: ['wallet'] })
    qc.invalidateQueries({ queryKey: ['expenses'] })
    qc.invalidateQueries({ queryKey: ['incomes'] })
    qc.invalidateQueries({ queryKey: ['exchanges'] })
    router.refresh()
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
          </DialogHeader>
          <QuickAddTabs onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 pt-4">
        <SheetHeader className="mb-4">
          <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-muted" />
          <SheetTitle className="sr-only">{t('title')}</SheetTitle>
        </SheetHeader>
        <QuickAddTabs onSuccess={handleSuccess} />
      </SheetContent>
    </Sheet>
  )
}
