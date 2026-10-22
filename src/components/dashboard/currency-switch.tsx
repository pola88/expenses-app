'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { useCurrency, type Currency } from '@/components/currency-provider';

const CURRENCIES: Currency[] = ['ARS', 'USD'];

export function CurrencySwitch({ className }: { className?: string }) {
  const { currency: value, setCurrency: onChange } = useCurrency();
  // Unique per instance so multiple switches on the same page don't share the animated pill
  const pillId = useId();

  return (
    <ToggleGroup
      type="single"
      value={value}
      // Radix emits '' when clicking the active item; keep one option always selected
      onValueChange={(v) => v && onChange(v as Currency)}
      spacing={1}
      aria-label="Moneda"
      className={cn('h-7 rounded-xl bg-muted p-1', className)}
    >
      {CURRENCIES.map((c) => {
        const active = value === c;
        return (
          <ToggleGroupItem
            key={c}
            value={c}
            // The animated pill marks the active item, so drop the toggle's own bg states
            className={cn(
              'relative h-auto px-3 py-1.5',
              'hover:bg-transparent data-[state=on]:bg-transparent',
              active ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {active && (
              <motion.span
                layoutId={pillId}
                className="absolute inset-0 mx-1 my-1 rounded-lg bg-background shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="font-xs relative font-mono">{c}</span>
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
