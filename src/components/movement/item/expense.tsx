import { MovementExpense } from '@/types/movement';
import { formatMoney } from '@/lib/money';
import { Initials } from '@/components/initials';
import { CurrencyBadge } from '@/components/currency-badge';
import { formatDate } from '@/lib/date';
import { MovementActions } from '../movement-actions';

type ItemExpense = {
  movement: MovementExpense;
};

export const ItemExpense = ({ movement }: ItemExpense) => {
  return (
    <div className="group flex items-center gap-3 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-lg">
        {movement.category.icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">
          {movement.description || movement.category.name}
        </span>
        <div className="mt-0.5 flex items-center gap-1.5">
          <Initials name={movement.user.name} />
          <span className="text-xs text-muted-foreground">{formatDate(movement.date)}</span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-sm font-semibold text-destructive tabular-nums">
          -{formatMoney(movement.amount, movement.currency).replace(/^(ARS|USD)\$ /, '')}
        </span>
        <CurrencyBadge currency={movement.currency} />
      </div>
      <MovementActions movement={movement} />
    </div>
  );
};
