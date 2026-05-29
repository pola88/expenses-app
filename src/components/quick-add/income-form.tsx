'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { createIncomeSchema, CreateIncomeInput } from '@/dtos/income.dto'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

export function IncomeForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateIncomeInput>({
    resolver: zodResolver(createIncomeSchema),
    defaultValues: { currency: 'ARS', isRecurring: false, date: new Date() },
  })

  const isRecurring = watch('isRecurring')

  const mutation = useMutation({
    mutationFn: (data: CreateIncomeInput) =>
      fetch('/api/incomes', {
        method: 'POST',
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
          <Input
            {...register('amount')}
            type="number"
            step="0.01"
            placeholder="0,00"
            className="flex-1"
          />
          <Select defaultValue="ARS" onValueChange={(v) => setValue('currency', v as 'ARS' | 'USD')}>
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
        <Label>Descripción</Label>
        <Input {...register('description')} placeholder="ej: Sueldo, freelance..." />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label>Tipo</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => { setValue('isRecurring', false); setValue('recurringDay', undefined) }}
            className={`rounded-lg border px-3 py-2 text-sm transition-colors
              ${!isRecurring ? 'border-foreground bg-muted font-medium' : 'border-border text-muted-foreground'}`}
          >
            Variable
          </button>
          <button
            type="button"
            onClick={() => setValue('isRecurring', true)}
            className={`rounded-lg border px-3 py-2 text-sm transition-colors
              ${isRecurring ? 'border-foreground bg-muted font-medium' : 'border-border text-muted-foreground'}`}
          >
            Recurrente
          </button>
        </div>
      </div>

      {isRecurring && (
        <div className="flex flex-col gap-1">
          <Label>Día del mes</Label>
          <Select onValueChange={(v) => setValue('recurringDay', parseInt(v))}>
            <SelectTrigger><SelectValue placeholder="Elegí el día" /></SelectTrigger>
            <SelectContent>
              {DAYS.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  Día {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.recurringDay && (
            <p className="text-xs text-destructive">{errors.recurringDay.message}</p>
          )}
        </div>
      )}

      <Button type="submit" disabled={mutation.isPending} className="mt-1 w-full">
        {mutation.isPending ? 'Guardando...' : 'Guardar ingreso'}
      </Button>
    </form>
  )
}
