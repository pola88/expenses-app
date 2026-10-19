import { formatAmount } from '@/lib/money';
import Decimal from 'decimal.js';

type MoneyValueProps = {
  value: string | number | Decimal;
};

export const MoneyValue = ({ value }: MoneyValueProps) => (
  <span className="font-mono">{formatAmount(value)}</span>
);
