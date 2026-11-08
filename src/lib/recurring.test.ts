import { describe, expect, it } from 'vitest';
import { planRecurringInstances, recurringPeriod } from './recurring';

describe('recurringPeriod', () => {
  it('formatea YYYY-MM con mes 0-based', () => {
    expect(recurringPeriod(2026, 0)).toBe('2026-01');
    expect(recurringPeriod(2026, 10)).toBe('2026-11');
  });
});

describe('planRecurringInstances', () => {
  const t = (id: string, recurringDay: number | null) => ({ id, recurringDay });

  it('planifica una instancia por template sin instancia en el mes', () => {
    const planned = planRecurringInstances([t('a', 5), t('b', 20)], new Set(), 2026, 10);

    expect(planned).toHaveLength(2);
    expect(planned[0].date.toISOString()).toBe('2026-11-05T00:00:00.000Z');
    expect(planned[1].date.toISOString()).toBe('2026-11-20T00:00:00.000Z');
    expect(planned.every((p) => p.period === '2026-11')).toBe(true);
  });

  it('omite templates que ya tienen instancia', () => {
    const planned = planRecurringInstances([t('a', 5), t('b', 20)], new Set(['a']), 2026, 10);
    expect(planned.map((p) => p.template.id)).toEqual(['b']);
  });

  it('ajusta el día al último del mes', () => {
    const [feb] = planRecurringInstances([t('a', 31)], new Set(), 2026, 1);
    expect(feb.date.toISOString()).toBe('2026-02-28T00:00:00.000Z');

    const [leap] = planRecurringInstances([t('a', 31)], new Set(), 2028, 1);
    expect(leap.date.toISOString()).toBe('2028-02-29T00:00:00.000Z');

    const [nov] = planRecurringInstances([t('a', 31)], new Set(), 2026, 10);
    expect(nov.date.toISOString()).toBe('2026-11-30T00:00:00.000Z');
  });

  it('ignora templates sin recurringDay', () => {
    expect(planRecurringInstances([t('a', null)], new Set(), 2026, 10)).toEqual([]);
  });

  it('cruza bien el cambio de año', () => {
    const [dec] = planRecurringInstances([t('a', 15)], new Set(), 2026, 11);
    expect(dec.period).toBe('2026-12');
    expect(dec.date.toISOString()).toBe('2026-12-15T00:00:00.000Z');
  });
});
