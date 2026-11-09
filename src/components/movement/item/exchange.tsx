import { MovementExchange } from '@/types/movement';
import { formatMoney, formatRate } from '@/lib/money';
import { MovementActions } from '@/components/movement/movement-actions';
import { Initials } from '@/components/initials';
import { formatDate } from '@/lib/date';

type ItemExchangeProp = {
  movement: MovementExchange;
};

export const ItemExchange = ({ movement }: ItemExchangeProp) => {
  const hasCommission = parseFloat(movement.commissionValue) > 0;
  const commissionLabel = hasCommission
    ? movement.commissionType === 'pct'
      ? ` · ${formatRate(movement.commissionValue)}%`
      : ` · ${formatMoney(movement.commissionValue, movement.toCurrency)}`
    : null;

  return (
    <div className="group flex items-center gap-3 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-lg">
        ⇄
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium">
          {formatMoney(movement.fromAmount, movement.fromCurrency)} →{' '}
          {formatMoney(movement.toAmount, movement.toCurrency)}
        </span>
        <div className="mt-0.5 flex items-center gap-1.5">
          <Initials name={movement.user.name} />
          <span className="text-xs text-muted-foreground">
            {formatDate(movement.date)} · $1 = {formatRate(movement.exchangeRate)}
            {commissionLabel}
          </span>
        </div>
      </div>
      <MovementActions movement={movement} />
    </div>
  );
};
