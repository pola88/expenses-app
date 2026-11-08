-- Backfill de "recurringPeriod" para instancias recurrentes creadas antes del fix.
-- Correr DESPUÉS de `npm run db:push` (que agrega la columna + el unique).
-- No borra datos: si hay duplicados, solo la instancia más vieja recibe el período.

-- 1) Revisar duplicados existentes (mismo template + mismo mes). Si aparecen filas,
--    son ingresos/gastos contados dos veces en el saldo: revisarlos y borrarlos a mano.
SELECT 'Income' AS tabla, "recurringSourceId", to_char("date", 'YYYY-MM') AS period,
       count(*) AS cantidad, array_agg(id ORDER BY "createdAt") AS ids
FROM "Income"
WHERE "recurringSourceId" IS NOT NULL
GROUP BY "recurringSourceId", to_char("date", 'YYYY-MM')
HAVING count(*) > 1
UNION ALL
SELECT 'Expense', "recurringSourceId", to_char("date", 'YYYY-MM'),
       count(*), array_agg(id ORDER BY "createdAt")
FROM "Expense"
WHERE "recurringSourceId" IS NOT NULL
GROUP BY "recurringSourceId", to_char("date", 'YYYY-MM')
HAVING count(*) > 1;

-- 2) Backfill: asigna el período a la instancia más vieja de cada (template, mes).
BEGIN;

UPDATE "Income" i
SET "recurringPeriod" = to_char(i."date", 'YYYY-MM')
FROM (
  SELECT DISTINCT ON ("recurringSourceId", to_char("date", 'YYYY-MM')) id
  FROM "Income"
  WHERE "recurringSourceId" IS NOT NULL AND "recurringPeriod" IS NULL
  ORDER BY "recurringSourceId", to_char("date", 'YYYY-MM'), "createdAt"
) first_instance
WHERE i.id = first_instance.id;

UPDATE "Expense" e
SET "recurringPeriod" = to_char(e."date", 'YYYY-MM')
FROM (
  SELECT DISTINCT ON ("recurringSourceId", to_char("date", 'YYYY-MM')) id
  FROM "Expense"
  WHERE "recurringSourceId" IS NOT NULL AND "recurringPeriod" IS NULL
  ORDER BY "recurringSourceId", to_char("date", 'YYYY-MM'), "createdAt"
) first_instance
WHERE e.id = first_instance.id;

COMMIT;
