'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Check, ChevronsUpDown } from 'lucide-react'
import { createExpenseSchema, CreateExpenseInput } from '@/dtos/expense.dto'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'

type Category = { id: string; name: string; icon: string; color: string }

type InitialValues = {
  amount: string
  currency: 'ARS' | 'USD'
  description: string
  date: string
  categoryId: string
}

type Props = {
  onSuccess: () => void
  editId?: string
  initialValues?: InitialValues
}

export function ExpenseForm({ onSuccess, editId, initialValues }: Props) {
  const t = useTranslations('quickAdd.expense')
  const tCommon = useTranslations('common')
  const [categoryOpen, setCategoryOpen] = useState(false)

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
  })

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<CreateExpenseInput>({
      resolver: zodResolver(createExpenseSchema),
      defaultValues: initialValues
        ? {
            amount: initialValues.amount,
            currency: initialValues.currency,
            description: initialValues.description,
            date: initialValues.date as unknown as Date,
            categoryId: initialValues.categoryId,
          }
        : { currency: 'ARS', date: new Date().toISOString().split('T')[0] as unknown as Date },
    })

  const mutation = useMutation({
    mutationFn: (data: CreateExpenseInput) =>
      fetch(editId ? `/api/expenses/${editId}` : '/api/expenses', {
        method: editId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess,
  })

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Label>{t('amount')}</Label>
        <div className="flex gap-2">
          <Input {...register('amount')} type="number" step="0.01" placeholder={t('amountPlaceholder')} className="flex-1" />
          <Select defaultValue={initialValues?.currency ?? 'ARS'} onValueChange={(v) => setValue('currency', v as 'ARS' | 'USD')}>
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ARS">{tCommon('ars')}</SelectItem>
              <SelectItem value="USD">{tCommon('usd')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label>{t('category')}</Label>
        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={categoryOpen}
              className="w-full justify-between font-normal">
              {watch('categoryId')
                ? (() => {
                    const cat = categories.find((c) => c.id === watch('categoryId'))
                    return cat ? <span>{cat.icon} {cat.name}</span> : t('selectCategory')
                  })()
                : t('selectCategory')}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder={t('searchCategory')} />
              <CommandList>
                <CommandEmpty>{t('noCategoryFound')}</CommandEmpty>
                <CommandGroup>
                  {categories.map((cat) => (
                    <CommandItem key={cat.id} value={cat.name}
                      onSelect={() => {
                        setValue('categoryId', cat.id)
                        setCategoryOpen(false)
                      }}>
                      <Check className={cn('mr-2 h-4 w-4', watch('categoryId') === cat.id ? 'opacity-100' : 'opacity-0')} />
                      <span className="mr-2">{cat.icon}</span>{cat.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label>{t('description')} <span className="text-muted-foreground">{tCommon('optional')}</span></Label>
        <Input {...register('description')} placeholder={t('descriptionPlaceholder')} />
      </div>

      <div className="flex flex-col gap-1">
        <Label>{t('date')}</Label>
        <Input {...register('date')} type="date" />
      </div>

      <Button type="submit" disabled={mutation.isPending} className="mt-1 w-full">
        {mutation.isPending ? tCommon('saving') : editId ? t('saveChanges') : t('saveButton')}
      </Button>
    </form>
  )
}
