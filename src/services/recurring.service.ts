import { incomeService } from '@/services/income.service';
import { expenseService } from '@/services/expense.service';

/**
 * Genera las instancias del mes de ingresos y gastos recurrentes.
 * Idempotente y seguro ante llamadas concurrentes (unique en DB + skipDuplicates).
 * Debe correr antes de cualquier cálculo de saldo/resumen.
 */
export async function ensureRecurringSynced(householdId: string): Promise<void> {
  await Promise.all([
    incomeService.syncRecurringIncomes(householdId),
    expenseService.syncRecurringExpenses(householdId),
  ]);
}
