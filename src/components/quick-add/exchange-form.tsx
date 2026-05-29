'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { createExchangeSchema, CreateExchangeInput } from '@/dtos/exchange.dto'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatRate } from '@/lib/money'

type Currency = 'ARS' | 'USD'

function calcRate(from: Currency, fromAmt: string, toAmt: string): string | null {
  const f = parseFloat(fromAmt)
  const t = parseFloat(toAmt)
  if (!f || !t) return null
  // siempre expresar como "ARS por USD"
  const rate = from === 'ARS' ? f / t : t / f
  return isFinite(rate) ? formatRate(rate) : null
}

export function ExchangeForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateExchangeInput>({
    resolver: zodResolver(createExchangeSchema),
    defaultValues: { fromCurrency: 'ARS', toCurrency: 'USD', date: new Date() },
  })

  const [fromCurrency, toCurrency, fromAmount, toAmount] = watch([
    'fromCurrency',
    'toCurrency',
    'fromAmount',
    'toAmount',
  ])

  const suggestedRate = calcRate(fromCurrency, fromAmount ?? '', toAmount ?? '')

  const handleFromCurrency = (v: Currency) => {
    setValue('fromCurrency', v)
    setValue('toCurrency', v === 'ARS' ? 'USD' : 'ARS')
  }

  const handleSwap = () => {
    setValue('fromCurrency', toCurrency)
    setValue('toCurrency', fromCurrency)
    setValue('fromAmount', toAmount)
    setValue('toAmount', fromAmount)
  }

  const mutation = useMutation({
    mutationFn: (data: CreateExchangeInput) =>
      fetch('/api/exchanges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess,
  })

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <Label>De</Label>
          <button
            type="button"
            onClick={handleSwap}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ⇄ invertir
          </button>
        </div>
        <div className="flex gap-2">
          <Select
            value={fromCurrency}
            onValueChange={(v) => handleFromCurrency(v as Currency)}
          >
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ARS">ARS$</SelectItem>
              <SelectItem value="USD">USD$</SelectItem>
            </SelectContent>
          </Select>
          <Input
            {...register('fromAmount')}
            type="number"
            step="0.01"
            placeholder="0,00"
            className="flex-1"
          />
        </div>
        {errors.fromAmount && <p className="text-xs text-destructive">{errors.fromAmount.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label>A — <span className="font-normal text-muted-foreground">{toCurrency}$</span></Label>
        <Input
          {...register('toAmount')}
          type="number"
          step="0.01"
          placeholder="0,00"
        />
        {errors.toAmount && <p className="text-xs text-destructive">{errors.toAmount.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <Label>Tipo de cambio</Label>
          {suggestedRate && (
            <button
              type="button"
              onClick={() => setValue('exchangeRate', suggestedRate.replace(/\./g, '').replace(',', '.'))}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              usar calculado: 1 USD = {suggestedRate} ARS
            </button>
          )}
        </div>
        <Input
          {...register('exchangeRate')}
          type="number"
          step="0.0001"
          placeholder={suggestedRate ? `≈ ${suggestedRate}` : '1 USD = ? ARS'}
        />
        {errors.exchangeRate && (
          <p className="text-xs text-destructive">{errors.exchangeRate.message}</p>
        )}
      </div>

      {errors.root && <p className="text-xs text-destructive">{errors.root.message}</p>}

      <Button type="submit" disabled={mutation.isPending} className="mt-1 w-full">
        {mutation.isPending ? 'Guardando...' : 'Guardar cambio'}
      </Button>
    </form>
  )
}
