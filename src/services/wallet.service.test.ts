import { beforeEach, describe, expect, it, vi } from 'vitest';

const { calls, prismaMock, repoMock } = vi.hoisted(() => {
  const calls: string[] = [];
  const prismaMock = {
    income: { groupBy: vi.fn() },
    expense: { groupBy: vi.fn() },
    currencyExchange: { groupBy: vi.fn() },
  };
  const repoMock = (name: string, rows: unknown[] = []) => ({
    findByHousehold: vi.fn(async () => {
      calls.push(name);
      return rows;
    }),
  });
  return { calls, prismaMock, repoMock };
});

vi.mock('@/services/recurring.service', () => ({
  ensureRecurringSynced: vi.fn(async () => {
    calls.push('sync');
  }),
}));

const groupBy = (name: string, rows: unknown[]) =>
  vi.fn(async () => {
    calls.push(name);
    return rows;
  });

const dec = (v: string) => ({ toString: () => v });

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

vi.mock('@/repositories/income.repository', () => ({ incomeRepository: repoMock('incomes') }));
vi.mock('@/repositories/expense.repository', () => ({ expenseRepository: repoMock('expenses') }));
vi.mock('@/repositories/exchange.repository', () => ({
  exchangeRepository: repoMock('exchanges'),
}));

import { ensureRecurringSynced } from '@/services/recurring.service';
import { getWalletBalance, getWalletSummary } from './wallet.service';

describe('wallet.service', () => {
  beforeEach(() => {
    calls.length = 0;
    vi.mocked(ensureRecurringSynced).mockClear();

    prismaMock.income.groupBy = groupBy('incomeSums', [
      { currency: 'ARS', _sum: { amount: dec('100000.10') } },
      { currency: 'USD', _sum: { amount: dec('500') } },
    ]);
    prismaMock.expense.groupBy = groupBy('expenseSums', [
      { currency: 'ARS', _sum: { amount: dec('30000.05') } },
      { currency: 'USD', _sum: { amount: null } },
    ]);
    prismaMock.currencyExchange.groupBy = vi.fn(async (args: { by: string[] }) => {
      calls.push('exchangeSums');
      // 100 USD → 120.000 ARS
      return args.by[0] === 'fromCurrency'
        ? [{ fromCurrency: 'USD', _sum: { fromAmount: dec('100') } }]
        : [{ toCurrency: 'ARS', _sum: { toAmount: dec('120000') } }];
    });
  });

  describe('getWalletBalance', () => {
    it('sincroniza recurrentes antes de calcular (fix: /saldo de Telegram)', async () => {
      await getWalletBalance('h1');

      expect(ensureRecurringSynced).toHaveBeenCalledWith('h1');
      expect(calls[0]).toBe('sync');
      expect(calls.slice(1)).not.toContain('sync');
    });

    it('suma ingresos, resta gastos y aplica cambios por moneda, sin perder precisión', async () => {
      const balance = await getWalletBalance('h1');

      // ARS: 100000.10 − 30000.05 + 120000 = 190000.05
      // USD: 500 − 0 − 100 = 400
      expect(balance).toEqual({ ARS: '190000.05', USD: '400.00' });
    });
  });

  describe('getWalletSummary', () => {
    it('sincroniza una sola vez y antes de cualquier lectura', async () => {
      await getWalletSummary('h1', new Date(Date.UTC(2026, 10, 1)));

      expect(ensureRecurringSynced).toHaveBeenCalledTimes(1);
      expect(calls[0]).toBe('sync');
      expect(calls.filter((c) => c === 'sync')).toHaveLength(1);
    });
  });
});
