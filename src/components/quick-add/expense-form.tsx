'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { createExpenseSchema, CreateExpenseInput } from '@/dtos/expense.dto'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
        <Label>Monto</Label>
        <div className="flex gap-2">
          <Input {...register('amount')} type="number" step="0.01" placeholder="0,00" className="flex-1" />
          <Select defaultValue={initialValues?.currency ?? 'ARS'} onValueChange={(v) => setValue('currency', v as 'ARS' | 'USD')}>
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ARS">ARS$</SelectItem>
              <SelectItem value="USD">USD$</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label>Categoría</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {categories.map((cat) => (
            <button key={cat.id} type="button" onClick={() => setValue('categoryId', cat.id)}
              className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[11px] transition-colors
                ${watch('categoryId') === cat.id ? 'border-foreground bg-muted text-foreground' : 'border-border text-muted-foreground'}`}>
              <span className="text-lg">{cat.icon}</span>{cat.name}
            </button>
          ))}
        </div>
        {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label>Descripción <span className="text-muted-foreground">(opcional)</span></Label>
        <Input {...register('description')} placeholder="ej: Disco, Coto..." />
      </div>

      <div className="flex flex-col gap-1">
        <Label>Fecha</Label>
        <Input {...register('date')} type="date" />
      </div>

      <Button type="submit" disabled={mutation.isPending} className="mt-1 w-full">
        {mutation.isPending ? 'Guardando...' : editId ? 'Guardar cambios' : 'Guardar gasto'}
      </Button>
    </form>
  )
}
