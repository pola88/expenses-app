'use client'

import { useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { createExchangeSchema, CreateExchangeInput } from '@/dtos/exchange.dto'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatMoney, formatRate } from '@/lib/money'

type Currency = 'ARS' | 'USD'
type CommissionType = 'pct' | 'fixed'

function computeToAmount(
  from: Currency,
  fromAmt: number,
  rate: number,
  commissionType: CommissionType,
  commissionValue: number
): number {
  const gross = from === 'USD' ? fromAmt * rate : fromAmt / rate
  if (commissionType === 'pct') return gross * (1 - commissionValue / 100)
  return gross - commissionValue
}

export function ExchangeForm({ onSuccess }: { onSuccess: () => void }) {
  const t = useTranslations('quickAdd.exchange')
  const tCommon = useTranslations('common')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateExchangeInput>({
    resolver: zodResolver(createExchangeSchema),
    defaultValues: {
      fromCurrency: 'USD',
      toCurrency: 'ARS',
      commissionType: 'pct',
      commissionValue: '0',
      date: new Date().toISOString().split('T')[0] as unknown as Date,
    },
  })

  const [fromCurrency, toCurrency, fromAmount, toAmount, exchangeRate, commissionType, commissionValue] = watch([
    'fromCurrency', 'toCurrency', 'fromAmount', 'toAmount', 'exchangeRate', 'commissionType', 'commissionValue',
  ])

  const toAmountManual = useRef(false)

  useEffect(() => {
    if (toAmountManual.current) return
    const from = parseFloat(fromAmount ?? '')
    const rate = parseFloat(exchangeRate ?? '')
    const commission = parseFloat(commissionValue ?? '0') || 0
    if (!from || !rate) return
    const result = computeToAmount(fromCurrency, from, rate, commissionType, commission)
    setValue('toAmount', result.toFixed(2) as unknown as string)
  }, [fromAmount, exchangeRate, commissionValue, commissionType, fromCurrency, setValue])

  const handleFromCurrency = (v: Currency) => {
    setValue('fromCurrency', v)
    setValue('toCurrency', v === 'ARS' ? 'USD' : 'ARS')
    toAmountManual.current = false
  }

  const handleSwap = () => {
    setValue('fromCurrency', toCurrency)
    setValue('toCurrency', fromCurrency)
    setValue('fromAmount', toAmount)
    setValue('toAmount', fromAmount)
    toAmountManual.current = false
  }

  const from = parseFloat(fromAmount ?? '')
  const rate = parseFloat(exchangeRate ?? '')
  const commission = parseFloat(commissionValue ?? '0') || 0
  const toCurrencyLabel = toCurrency as Currency

  let gross: number | null = null
  let commissionAmount: number | null = null
  if (from && rate && commission > 0) {
    gross = fromCurrency === 'USD' ? from * rate : from / rate
    commissionAmount = commissionType === 'pct' ? gross * (commission / 100) : commission
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
          <Label>{t('from')}</Label>
          <button
            type="button"
            onClick={handleSwap}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('invert')}
          </button>
        </div>
        <div className="flex gap-2">
          <Select value={fromCurrency} onValueChange={(v) => handleFromCurrency(v as Currency)}>
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">{tCommon('usd')}</SelectItem>
              <SelectItem value="ARS">{tCommon('ars')}</SelectItem>
            </SelectContent>
          </Select>
          <Input
            {...register('fromAmount')}
            type="number"
            step="0.01"
            placeholder="0.00"
            className="flex-1"
            onChange={(e) => {
              toAmountManual.current = false
              register('fromAmount').onChange(e)
            }}
          />
        </div>
        {errors.fromAmount && <p className="text-xs text-destructive">{errors.fromAmount.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label>{t('exchangeRate')} <span className="font-normal text-muted-foreground text-xs">{t('exchangeRateLabel')}</span></Label>
        <Input
          {...register('exchangeRate')}
          type="number"
          step="0.01"
          placeholder={t('exchangeRatePlaceholder')}
          onChange={(e) => {
            toAmountManual.current = false
            register('exchangeRate').onChange(e)
          }}
        />
        {errors.exchangeRate && <p className="text-xs text-destructive">{errors.exchangeRate.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label>{t('commission')} <span className="font-normal text-muted-foreground text-xs">{tCommon('optional')}</span></Label>
        <div className="flex gap-2">
          <Controller
            control={control}
            name="commissionType"
            render={({ field }) => (
              <div className="flex rounded-md border overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={() => { field.onChange('pct'); toAmountManual.current = false }}
                  className={`px-3 py-2 text-sm transition-colors ${field.value === 'pct' ? 'bg-foreground text-background' : 'bg-background text-muted-foreground hover:text-foreground'}`}
                >
                  {t('commissionPercent')}
                </button>
                <button
                  type="button"
                  onClick={() => { field.onChange('fixed'); toAmountManual.current = false }}
                  className={`px-3 py-2 text-sm transition-colors ${field.value === 'fixed' ? 'bg-foreground text-background' : 'bg-background text-muted-foreground hover:text-foreground'}`}
                >
                  {t('commissionFixed')}
                </button>
              </div>
            )}
          />
          <div className="relative flex-1">
            <Input
              {...register('commissionValue')}
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              className={commissionType === 'pct' ? 'pr-7' : ''}
              onChange={(e) => {
                toAmountManual.current = false
                register('commissionValue').onChange(e)
              }}
            />
            {commissionType === 'pct' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
            )}
          </div>
        </div>
        {errors.commissionValue && <p className="text-xs text-destructive">{errors.commissionValue.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label>{t('receives')} <span className="font-normal text-muted-foreground">{toCurrency}$</span></Label>
        <Input
          {...register('toAmount')}
          type="number"
          step="0.01"
          placeholder="0.00"
          onChange={(e) => {
            toAmountManual.current = true
            register('toAmount').onChange(e)
          }}
        />
        {errors.toAmount && <p className="text-xs text-destructive">{errors.toAmount.message}</p>}

        {gross !== null && commissionAmount !== null && (
          <div className="rounded-lg bg-muted/50 px-3 py-2 flex flex-col gap-0.5 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>{t('subtotal')}</span>
              <span>{formatMoney(gross, toCurrencyLabel)}</span>
            </div>
            <div className="flex justify-between text-destructive/80">
              <span>
                {commissionType === 'pct'
                  ? t('commissionPercentLabel', { percentage: formatRate(commission) })
                  : t('commissionFixedLabel')}
              </span>
              <span>{t('commissionAmount', { amount: formatMoney(commissionAmount, toCurrencyLabel) })}</span>
            </div>
            <div className="flex justify-between font-medium text-foreground border-t border-border pt-0.5 mt-0.5">
              <span>{t('receivesTotal')}</span>
              <span>{formatMoney(gross - commissionAmount, toCurrencyLabel)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Label>{t('date')}</Label>
        <Input {...register('date')} type="date" />
      </div>

      {errors.root && <p className="text-xs text-destructive">{errors.root.message}</p>}

      <Button type="submit" disabled={mutation.isPending} className="mt-1 w-full">
        {mutation.isPending ? tCommon('saving') : t('saveButton')}
      </Button>
    </form>
  )
}
