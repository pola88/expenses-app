import { daysInMonth } from '@/lib/date';

/** Período de una instancia recurrente: "YYYY-MM" (month es 0-based, como Date). */
export function recurringPeriod(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

type Template = { id: string; recurringDay: number | null };

export type PlannedInstance<T extends Template> = {
  template: T;
  date: Date;
  period: string;
};

/**
 * Decide qué instancias hay que crear este mes: una por template activo que
 * todavía no tenga instancia. El día se ajusta al último día del mes (ej. 31 → 30).
 * Función pura: la idempotencia real ante requests concurrentes la garantiza el
 * unique (recurringSourceId, recurringPeriod) en la base.
 */
export function planRecurringInstances<T extends Template>(
  templates: T[],
  existingSourceIds: Set<string | null>,
  year: number,
  month: number
): PlannedInstance<T>[] {
  const period = recurringPeriod(year, month);
  const lastDay = daysInMonth(year, month);

  return templates
    .filter((t) => t.recurringDay !== null && !existingSourceIds.has(t.id))
    .map((template) => ({
      template,
      date: new Date(Date.UTC(year, month, Math.min(template.recurringDay!, lastDay))),
      period,
    }));
}
