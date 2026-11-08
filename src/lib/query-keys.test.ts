import { describe, expect, it } from 'vitest';
import { walletKeys } from './query-keys';

const startsWith = (key: readonly unknown[], prefix: readonly unknown[]) =>
  prefix.every((part, i) => key[i] === part);

describe('walletKeys', () => {
  // Regresión: el resumen mensual usaba ['wallet-month', ...] y no se invalidaba con ['wallet'].
  it('todas las keys se invalidan con walletKeys.all', () => {
    expect(startsWith(walletKeys.balance('h1'), walletKeys.all)).toBe(true);
    expect(startsWith(walletKeys.month('h1', '2026-11'), walletKeys.all)).toBe(true);
    expect(startsWith(walletKeys.month('h1', undefined), walletKeys.all)).toBe(true);
  });

  it('distingue meses y households', () => {
    expect(walletKeys.month('h1', '2026-10')).not.toEqual(walletKeys.month('h1', '2026-11'));
    expect(walletKeys.month('h1', '2026-11')).not.toEqual(walletKeys.month('h2', '2026-11'));
  });
});
