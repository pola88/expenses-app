'use client';

import type { Movement } from '@/types/movement';
import { ItemExpense } from './item/expense';
import { ItemIncome } from './item/income';
import { ItemExchange } from './item/exchange';

export function MovementItem({ movement }: { movement: Movement }) {
  if (movement.type === 'expense') {
    return <ItemExpense movement={movement} />;
  }

  if (movement.type === 'income') {
    return <ItemIncome movement={movement} />;
  }

  return <ItemExchange movement={movement} />;
}
