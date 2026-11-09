import { formatAmount } from '@/lib/money';
import { useTotals } from '@/lib/hooks/useTotals';
import type { Movement } from '@/types/movement';
import type { FilterType } from '@/types/transaction-page';
import { MoneyValue } from '@/components/money-value';

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
    <div className="flex flex-col divide-y rounded-xl border bg-card lg:flex-row lg:divide-x lg:divide-y-0">
      <div className="flex flex-1 flex-col gap-2 divide-y divide-dotted p-4">
        <div className="flex items-start pb-2">
          <p className="mt-1.5 flex-1 text-3xl font-bold tabular-nums lg:text-4xl">
            <MoneyValue value={totals.USD} />
          </p>
          <span className="rounded border px-1.5 py-0.5 font-mono text-xs font-medium tracking-wide">
            USD
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 divide-y divide-dotted p-4">
        <div className="flex items-start pb-2">
          <p className="mt-1.5 flex-1 text-3xl font-bold tabular-nums lg:text-4xl">
            <MoneyValue value={totals.ARS} />
          </p>
          <span className="rounded border px-1.5 py-0.5 font-mono text-xs font-medium tracking-wide">
            ARS
          </span>
        </div>
      </div>
    </div>
  );
};
