import { formatAmount } from '@/lib/money';
import { useTotals } from '@/lib/hooks/useTotals';
import type { Movement } from '@/types/movement';
import type { FilterType } from '@/types/transaction-page';

type TotalsProps = {
  movements: Movement[];
  type: FilterType;
};

export const Totals = ({ movements, type }: TotalsProps) => {
  const totals = useTotals({ type, movements });
  if (!totals) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <span className="text-xs font-semibold tracking-wide text-blue-600">USD$</span>
        <p className="mt-1 text-xl font-bold text-blue-900 tabular-nums">
          {formatAmount(totals.USD)}
        </p>
      </div>
      <div className="rounded-xl border border-green-100 bg-green-50 p-4">
        <span className="text-xs font-semibold tracking-wide text-green-600">ARS$</span>
        <p className="mt-1 text-xl font-bold text-green-900 tabular-nums">
          {formatAmount(totals.ARS)}
        </p>
      </div>
    </div>
  );
};
