/**
 * Query keys de la wallet. Todas cuelgan de `wallet.all`, así un
 * `invalidateQueries({ queryKey: walletKeys.all })` refresca saldo y resumen mensual.
 */
export const walletKeys = {
  all: ['wallet'] as const,
  balance: (householdId: string) => [...walletKeys.all, 'balance', householdId] as const,
  month: (householdId: string, month: string | undefined) =>
    [...walletKeys.all, 'month', householdId, month ?? 'current'] as const,
};
