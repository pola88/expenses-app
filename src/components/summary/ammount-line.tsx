import Decimal from 'decimal.js';
import { MoneyValue } from '../money-value';
import { cn } from '@/lib/utils';

type AmountLineProps = {
  label: string;
  amount: Decimal;
  strong?: boolean;
  forceFullLine?: boolean;
  className?: string;
};

export const AmountLine = ({
  label,
  amount,
  strong = false,
  forceFullLine,
  className,
}: AmountLineProps) => {
  const positive = amount.gte(0);
  const sign = amount.isZero() ? '' : positive ? '+ ' : '− ';

  return (
    <div
      className={cn(
        'flex flex-1 justify-between',
        forceFullLine ? `flex-row items-center` : `flex-col gap-1 lg:flex-row lg:items-center`,
        strong ?? 'mt-1 border-t pt-1.5',
        className
      )}
    >
      <span className={strong ? 'text-xs font-semibold' : 'text-xs text-muted-foreground'}>
        {label}
      </span>
      <span
        className={cn(
          'text-xs tabular-nums',
          strong ? `font-semibold ${positive ? 'text-income' : 'text-red-600'}` : 'text-foreground'
        )}
      >
        {sign}
        <MoneyValue value={amount.abs()} />
      </span>
    </div>
  );
};
