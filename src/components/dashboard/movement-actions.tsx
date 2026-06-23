'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ExpenseForm } from '@/components/quick-add/expense-form'
import { IncomeForm } from '@/components/quick-add/income-form'
import type { Movement } from '@/types/movement'
import { apiFetch } from '@/lib/fetch'

type Props = { movement: Movement }

const ENDPOINT: Record<Movement['type'], string> = {
  expense: 'expenses',
  income: 'incomes',
  exchange: 'exchanges',
}

function EditContent({ movement, onSuccess }: { movement: Movement; onSuccess: () => void }) {
  if (movement.type === 'expense') {
    return (
      <ExpenseForm
        editId={movement.id}
        initialValues={{
          amount: movement.amount,
          currency: movement.currency,
          description: movement.description,
          date: movement.date.split('T')[0],
          categoryId: movement.category.id,
        }}
        onSuccess={onSuccess}
      />
    )
  }
  if (movement.type === 'income') {
    return (
      <IncomeForm
        editId={movement.id}
        initialValues={{
          amount: movement.amount,
          currency: movement.currency,
          description: movement.description,
          date: movement.date.split('T')[0],
          isRecurring: movement.isRecurring,
          recurringDay: undefined,
        }}
        onSuccess={onSuccess}
      />
    )
  }
  return null
}

export function MovementActions({ movement }: Props) {
  const t = useTranslations('dashboard.movement')
  const tCommon = useTranslations('common')
  const qc = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['wallet'] })
    qc.invalidateQueries({ queryKey: ['expenses'] })
    qc.invalidateQueries({ queryKey: ['incomes'] })
    qc.invalidateQueries({ queryKey: ['exchanges'] })
  }

  const deleteMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/${ENDPOINT[movement.type]}/${movement.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      invalidate()
      toast.success(t('deleted'))
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleEditSuccess = () => {
    setEditOpen(false)
    invalidate()
    toast.success(t('updated'))
  }

  const editTitle = movement.type === 'expense' ? t('editExpense') : t('editIncome')
  const canEdit = movement.type !== 'exchange'

  const editNode = canEdit ? (
    isDesktop ? (
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTitle}</DialogTitle>
          </DialogHeader>
          <EditContent movement={movement} onSuccess={handleEditSuccess} />
        </DialogContent>
      </Dialog>
    ) : (
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 pt-4">
          <SheetHeader className="mb-4">
            <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-muted" />
            <SheetTitle>{editTitle}</SheetTitle>
          </SheetHeader>
          <EditContent movement={movement} onSuccess={handleEditSuccess} />
        </SheetContent>
      </Sheet>
    )
  ) : null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-opacity hover:bg-muted hover:text-foreground md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
            aria-label={tCommon('actions')}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canEdit && (
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              {tCommon('edit')}
            </DropdownMenuItem>
          )}
          {canEdit && <DropdownMenuSeparator />}
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {tCommon('delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {editNode}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate()}
            >
              {tCommon('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
