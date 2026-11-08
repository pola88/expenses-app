import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/repositories/income.repository', () => ({
  incomeRepository: {
    findActiveTemplates: vi.fn(),
    findInstancesForMonth: vi.fn(),
    createRecurringInstances: vi.fn(),
  },
}));

import { incomeRepository } from '@/repositories/income.repository';
import { incomeService } from './income.service';

const repo = vi.mocked(incomeRepository);

const template = (id: string, recurringDay: number) => ({
  id,
  recurringDay,
  amount: { toString: () => '1000.00' },
  currency: 'ARS' as const,
  description: `Template ${id}`,
  userId: 'u1',
});

describe('incomeService.syncRecurringIncomes', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 8, 12)); // 8 nov 2026, hora local
    vi.resetAllMocks();
  });
  afterEach(() => vi.useRealTimers());

  it('crea las instancias faltantes con período, en un solo createMany', async () => {
    repo.findActiveTemplates.mockResolvedValue([template('a', 5), template('b', 25)] as never);
    repo.findInstancesForMonth.mockResolvedValue([{ recurringSourceId: 'a' }] as never);

    await incomeService.syncRecurringIncomes('h1');

    expect(repo.findInstancesForMonth).toHaveBeenCalledWith(['a', 'b'], 2026, 10);
    expect(repo.createRecurringInstances).toHaveBeenCalledTimes(1);
    expect(repo.createRecurringInstances).toHaveBeenCalledWith([
      {
        amount: '1000.00',
        currency: 'ARS',
        description: 'Template b',
        date: new Date(Date.UTC(2026, 10, 25)),
        householdId: 'h1',
        userId: 'u1',
        recurringSourceId: 'b',
        recurringPeriod: '2026-11',
      },
    ]);
  });

  it('no escribe nada si todas las instancias existen', async () => {
    repo.findActiveTemplates.mockResolvedValue([template('a', 5)] as never);
    repo.findInstancesForMonth.mockResolvedValue([{ recurringSourceId: 'a' }] as never);

    await incomeService.syncRecurringIncomes('h1');

    expect(repo.createRecurringInstances).not.toHaveBeenCalled();
  });

  it('no consulta instancias si no hay templates activos', async () => {
    repo.findActiveTemplates.mockResolvedValue([]);

    await incomeService.syncRecurringIncomes('h1');

    expect(repo.findInstancesForMonth).not.toHaveBeenCalled();
    expect(repo.createRecurringInstances).not.toHaveBeenCalled();
  });
});
