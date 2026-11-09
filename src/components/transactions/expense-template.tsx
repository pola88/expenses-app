'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { RecurringExpenseTemplateItem } from '@/components/dashboard/recurring-expense-template-item';
import { walletKeys } from '@/lib/query-keys';
import { ExpenseForm } from '@/components/quick-add/expense-form';
import type { ExpenseTemplate } from '@/types/movement';
import { useGetExpensesTemplate } from '@/actions/api-calls';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIsDesktop } from '@/lib/hooks/useIsDesktop';
import { Skeleton } from '@/components/ui/skeleton';

export const ExpenseTemplateList = () => {
  const tExp = useTranslations('expenses');
  const qc = useQueryClient();
  const isDesktop = useIsDesktop();
  const [editTemplate, setEditTemplate] = useState<ExpenseTemplate | null>(null);
  const { templates, isLoading: loadingTemplates } = useGetExpensesTemplate();

  const handleEditSuccess = () => {
    setEditTemplate(null);
    qc.invalidateQueries({ queryKey: ['expenses', 'templates'] });
    qc.invalidateQueries({ queryKey: ['expenses'] });
    qc.invalidateQueries({ queryKey: walletKeys.all });
    toast.success(tExp('recurringUpdated'));
  };

  const editForm = editTemplate ? (
    <ExpenseForm
      editId={editTemplate.id}
      initialValues={{
        amount: editTemplate.amount,
        currency: editTemplate.currency,
        description: editTemplate.description,
        date: editTemplate.date.split('T')[0],
        categoryId: editTemplate.categoryId,
        isRecurring: true,
        recurringDay: editTemplate.recurringDay,
      }}
      onSuccess={handleEditSuccess}
    />
  ) : null;

  if (loadingTemplates) {
    return <Skeleton className="h-14 rounded-xl" />;
  }

  if (templates.length == 0) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {tExp('recurringConfigured')}
        </h2>
        <div className="divide-y divide-border rounded-xl border bg-background px-4">
          {templates.map((tmpl) => (
            <RecurringExpenseTemplateItem key={tmpl.id} template={tmpl} onEdit={setEditTemplate} />
          ))}
        </div>
      </div>
      {isDesktop ? (
        <Dialog open={!!editTemplate} onOpenChange={(v) => !v && setEditTemplate(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{tExp('editRecurring')}</DialogTitle>
            </DialogHeader>
            {editForm}
          </DialogContent>
        </Dialog>
      ) : (
        <Sheet open={!!editTemplate} onOpenChange={(v) => !v && setEditTemplate(null)}>
          <SheetContent side="bottom" className="rounded-t-2xl px-4 pt-4 pb-8">
            <SheetHeader className="mb-4">
              <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-muted" />
              <SheetTitle>{tExp('editRecurring')}</SheetTitle>
            </SheetHeader>
            {editForm}
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};
