'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExpenseForm } from './expense-form'
import { IncomeForm } from './income-form'
import { ExchangeForm } from './exchange-form'
import { toast } from 'sonner'

type Props = { open: boolean; onOpenChange: (v: boolean) => void; householdId: string }

export function QuickAddSheet({ open, onOpenChange, householdId }: Props) {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'gasto' | 'ingreso' | 'cambio'>('gasto')

  const handleSuccess = (label: string) => {
    onOpenChange(false)
    toast.success(label)
    qc.invalidateQueries({ queryKey: ['wallet'] })
    qc.invalidateQueries({ queryKey: ['expenses'] })
    qc.invalidateQueries({ queryKey: ['incomes'] })
    qc.invalidateQueries({ queryKey: ['exchanges'] })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 pt-4 data-[side=bottom]:md:left-1/2 data-[side=bottom]:md:right-auto data-[side=bottom]:md:bottom-8 md:w-full md:max-w-lg md:-translate-x-1/2 md:rounded-2xl">
        <SheetHeader className="mb-4">
          <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-muted" />
          <SheetTitle className="sr-only">Agregar movimiento</SheetTitle>
        </SheetHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="gasto" className="flex-1">Gasto</TabsTrigger>
            <TabsTrigger value="ingreso" className="flex-1">Ingreso</TabsTrigger>
            <TabsTrigger value="cambio" className="flex-1">Cambio</TabsTrigger>
          </TabsList>
          <TabsContent value="gasto">
            <ExpenseForm onSuccess={() => handleSuccess('Gasto guardado')} />
          </TabsContent>
          <TabsContent value="ingreso">
            <IncomeForm onSuccess={() => handleSuccess('Ingreso guardado')} />
          </TabsContent>
          <TabsContent value="cambio">
            <ExchangeForm onSuccess={() => handleSuccess('Cambio guardado')} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
