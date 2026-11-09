'use client';

import { useCurrency, type Currency } from '@/components/currency-provider';
import { MyToggle } from '../toggle';

const CURRENCIES = [
  {
    value: 'ARS',
    label: 'ARS',
  },
  {
    value: 'USD',
    label: 'USD',
  },
];

export function CurrencySwitch({ className }: { className?: string }) {
  const { currency: value, setCurrency: onChange } = useCurrency();

  return (
    <MyToggle
      className={className}
      items={CURRENCIES}
      onChange={(newValue) => onChange(newValue as Currency)}
      currentValue={value}
    />
  );
}
