'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

type Item = {
  id?: string;
  label: string;
  value: string;
};

type MyToggleProps = {
  items: Item[];
  currentValue: string;
  onChange: (value: string) => void;
  className?: string;
};

export function MyToggle({ className, items, currentValue, onChange }: MyToggleProps) {
  // Unique per instance so multiple switches on the same page don't share the animated pill
  const pillId = useId();

  return (
    <ToggleGroup
      type="single"
      value={currentValue}
      // Radix emits '' when clicking the active item; keep one option always selected
      onValueChange={(v) => v && onChange(v)}
      spacing={1}
      className={cn('h-7 rounded-xl bg-muted p-1', className)}
    >
      {items.map((c) => {
        const active = currentValue === c.value;
        return (
          <ToggleGroupItem
            key={c.id ?? c.value}
            value={c.value}
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
            <span className="relative font-mono text-xs">{c.label}</span>
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
