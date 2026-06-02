import type { Movement } from '@/types/movement'
import { formatMoney, formatRate } from '@/lib/money'
import { MovementActions } from './movement-actions'

function Initials({ name }: { name: string | null }) {
  const letters = (name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
      {letters}
    </span>
  )
}

function CurrencyBadge({ currency }: { currency: 'ARS' | 'USD' }) {
  return currency === 'USD' ? (
    <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-800">USD$</span>
  ) : (
    <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-green-50 text-green-800">ARS$</span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

export function MovementItem({ movement }: { movement: Movement }) {
  if (movement.type === 'expense') {
    return (
      <div className="group flex items-center gap-3 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-lg">
          {movement.category.icon}
        </span>
        <div className="flex flex-1 flex-col min-w-0">
          <span className="text-sm font-medium truncate">{movement.description || movement.category.name}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Initials name={movement.user.name} />
            <span className="text-xs text-muted-foreground">{formatDate(movement.date)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-sm font-semibold text-destructive tabular-nums">
            -{formatMoney(movement.amount, movement.currency).replace(/^(ARS|USD)\$ /, '')}
          </span>
          <CurrencyBadge currency={movement.currency} />
        </div>
        <MovementActions movement={movement} />
      </div>
    )
  }

  if (movement.type === 'income') {
    return (
      <div className="group flex items-center gap-3 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-lg">
          ↑
        </span>
        <div className="flex flex-1 flex-col min-w-0">
          <span className="text-sm font-medium truncate">{movement.description}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Initials name={movement.user.name} />
            <span className="text-xs text-muted-foreground">{formatDate(movement.date)}</span>
            {movement.isRecurring && (
              <span className="text-[10px] text-muted-foreground border rounded px-1 py-0.5">recurrente</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-sm font-semibold text-green-700 tabular-nums">
            +{formatMoney(movement.amount, movement.currency).replace(/^(ARS|USD)\$ /, '')}
          </span>
          <CurrencyBadge currency={movement.currency} />
        </div>
        <MovementActions movement={movement} />
      </div>
    )
  }

  // exchange — solo eliminar
  return (
    <div className="group flex items-center gap-3 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-lg">
        ⇄
      </span>
      <div className="flex flex-1 flex-col min-w-0">
        <span className="text-sm font-medium">
          {formatMoney(movement.fromAmount, movement.fromCurrency)} → {movement.toCurrency}$
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Initials name={movement.user.name} />
          <span className="text-xs text-muted-foreground">
            {formatDate(movement.date)} · $1 = {formatRate(movement.exchangeRate)}
          </span>
        </div>
      </div>
      <MovementActions movement={movement} />
    </div>
  )
}
