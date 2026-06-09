# Expense App — Contexto del Proyecto

## Resumen del producto

App de finanzas personales compartida para manejar gastos, ingresos y cambios de moneda (ARS / USD). Orientada al contexto argentino con soporte para múltiples ingresos, cambio MEP/blue, y wallet calculada en tiempo real.

---

## Decisiones tomadas

### Producto
- Multi-ingreso: recurrente (con día del mes) y variable (único)
- Monedas: ARS y USD. Siempre separadas, nunca consolidadas en una sola
- Tipo de cambio: **manual** al registrar cada operación
- Wallet: **calculada** desde cero (suma de movimientos), nunca persistida
- Usuarios: **compartido** via Household. Todo movimiento pertenece al household y guarda el userId de quien lo cargó
- Categorías: por household, no globales

### Tech stack
- Next.js App Router + TypeScript
- Prisma + PostgreSQL
- NextAuth v5 (Credentials, JWT strategy, PrismaAdapter)
- TanStack Query (client fetching + cache invalidation)
- Zustand (estado global UI si se necesita)
- React Hook Form + Zod (formularios y validación)
- shadcn/ui + TailwindCSS
- Framer Motion (animaciones)
- Sonner (toasts)
- decimal.js (aritmética monetaria — nunca usar `number` para plata)

### Arquitectura
- Patrón: Repository → Service → API Route → Client
- Repositories: solo queries Prisma, sin lógica
- Services: lógica de negocio, validan ownership antes de update/delete
- API Routes: usan `apiHandler` wrapper (auth + error handling centralizado)
- DTOs: Zod schemas para validación de input
- `householdId` siempre viene de la sesión JWT, nunca del body del request

---

## Modelo de datos (Prisma)

```prisma
model Household {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())

  members    User[]
  categories Category[]
  incomes    Income[]
  expenses   Expense[]
  exchanges  CurrencyExchange[]
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  passwordHash  String?
  createdAt     DateTime  @default(now())

  householdId String?
  household   Household? @relation(fields: [householdId], references: [id])

  accounts  Account[]
  sessions  Session[]
  incomes   Income[]
  expenses  Expense[]
  exchanges CurrencyExchange[]
}

enum Currency { ARS USD }

model Category {
  id          String    @id @default(cuid())
  name        String
  icon        String
  color       String
  householdId String
  household   Household @relation(fields: [householdId], references: [id])
  expenses    Expense[]
}

model Income {
  id           String   @id @default(cuid())
  amount       Decimal  @db.Decimal(18, 2)
  currency     Currency
  description  String
  date         DateTime
  isRecurring  Boolean  @default(false)
  recurringDay Int?
  createdAt    DateTime @default(now())
  householdId  String
  userId       String
  household    Household @relation(fields: [householdId], references: [id])
  user         User      @relation(fields: [userId], references: [id])
}

model Expense {
  id          String   @id @default(cuid())
  amount      Decimal  @db.Decimal(18, 2)
  currency    Currency
  description String
  date        DateTime
  createdAt   DateTime @default(now())
  householdId String
  userId      String
  categoryId  String
  household   Household @relation(fields: [householdId], references: [id])
  user        User      @relation(fields: [userId], references: [id])
  category    Category  @relation(fields: [categoryId], references: [id])
}

model CurrencyExchange {
  id           String   @id @default(cuid())
  fromCurrency Currency
  toCurrency   Currency
  fromAmount   Decimal  @db.Decimal(18, 2)
  toAmount     Decimal  @db.Decimal(18, 2)
  exchangeRate Decimal  @db.Decimal(10, 4)
  date         DateTime
  createdAt    DateTime @default(now())
  householdId  String
  userId       String
  household    Household        @relation(fields: [householdId], references: [id])
  user         User             @relation(fields: [userId], references: [id])
}

// NextAuth tables: Account, Session, VerificationToken (estándar PrismaAdapter)
```

---

## Estructura de carpetas

```
src/
├── app/
│   ├── (auth)/layout.tsx      ← shell centrado para auth
│   ├── (auth)/login/page.tsx  ✅
│   ├── (auth)/register/page.tsx ✅
│   ├── (app)/layout.tsx       ← shell con sidebar/bottom nav
│   ├── (app)/page.tsx         ✅  ← dashboard
│   ├── (app)/movimientos/     ✅  ← lista filtrable con filtros tipo+moneda
│   ├── (app)/ingresos/        ✅  ← lista con totales + filtro recurrente
│   ├── (app)/cambios/         ✅  ← historial de cambios
│   ├── (app)/configuracion/
│   │   ├── categorias/        ← CRUD categorías (PENDIENTE)
│   │   └── household/         ← miembros (PENDIENTE)
│   └── api/
│       ├── auth/[...nextauth]/route.ts  ✅
│       ├── auth/register/route.ts       ✅
│       ├── expenses/route.ts            ✅
│       ├── expenses/[id]/route.ts       ✅
│       ├── incomes/route.ts             ✅
│       ├── incomes/[id]/route.ts        ✅
│       ├── exchanges/route.ts           ✅
│       ├── exchanges/[id]/route.ts      ✅
│       ├── categories/route.ts          ✅
│       ├── categories/[id]/route.ts     ✅
│       └── wallet/route.ts             ✅
│
├── services/
│   ├── wallet.service.ts    ✅  (getWalletBalance + getWalletSummary)
│   ├── income.service.ts    ✅
│   ├── expense.service.ts   ✅
│   └── exchange.service.ts  ✅
│
├── repositories/
│   ├── income.repository.ts    ✅
│   ├── expense.repository.ts   ✅
│   ├── exchange.repository.ts  ✅
│   └── category.repository.ts  ✅
│
├── dtos/
│   ├── auth.dto.ts      ✅
│   ├── expense.dto.ts   ✅
│   ├── income.dto.ts    ✅
│   └── exchange.dto.ts  ✅
│
├── lib/
│   ├── prisma.ts    ✅
│   ├── auth.ts      ✅
│   ├── session.ts   ✅
│   ├── api.ts       ✅  (apiHandler wrapper)
│   └── money.ts     ✅  (formatMoney, formatRate)
│
├── types/
│   └── next-auth.d.ts   ✅
│
└── components/
    ├── layout/
    │   ├── app-shell.tsx    ✅
    │   ├── sidebar.tsx      ✅  (desktop)
    │   └── bottom-nav.tsx   ✅  (mobile, opción C — pill bar + FAB central)
    ├── wallet/
    │   └── wallet-badge.tsx ✅  (sidebar widget con balance USD/ARS)
    ├── quick-add/
    │   ├── quick-add-sheet.tsx  ✅  (bottom sheet con tabs)
    │   ├── expense-form.tsx     ✅
    │   ├── income-form.tsx      ✅
    │   └── exchange-form.tsx    ✅
    └── providers.tsx  ✅  (QueryClient + Toaster)
```

---

## Lo que está implementado ✅

1. **Schema Prisma completo** — todas las tablas incluyendo NextAuth
2. **NextAuth v5** — Credentials provider, JWT strategy, PrismaAdapter
3. **Middleware** — protección de rutas, redirect a /login
4. **Repositories** — expenses, incomes, exchanges, categories (solo Prisma queries)
5. **Services** — expenses, incomes, exchanges, wallet (lógica + ownership validation)
6. **DTOs** — validación Zod para todos los inputs
7. **API Routes** — CRUD completo para expenses, incomes, exchanges, categories + GET wallet + GET stats/categories + GET stats/monthly
8. **App Shell** — layout responsive con sidebar desktop / bottom nav mobile
9. **Sidebar** — desktop con nav + wallet badge siempre visible
10. **Bottom Nav** — mobile pill bar con FAB central (opción C)
11. **QuickAddSheet** — bottom sheet con tabs Gasto / Ingreso / Cambio
12. **ExpenseForm** — formulario con monto, moneda, categoría, descripción
13. **WalletBadge** — widget del sidebar con balance en tiempo real
14. **Providers** — TanStack Query + Sonner
15. **Dashboard page** — WalletCard + MonthSummary + ExpensesByCategory (pie) + MonthlyEvolution (bar 6 meses) + MovementList
16. **Auth pages** — `/login` y `/register` con RHF + Zod + NextAuth signIn; registro crea o se une a household
17. **IncomeForm** — monto, moneda, descripción, tipo variable/recurrente con selector de día
18. **ExchangeForm** — fromCurrency/Amount, toCurrency/Amount, exchangeRate con cálculo automático visual + botón invertir
19. **Página /movimientos** — lista unificada con filtros por tipo (gasto/ingreso/cambio) y moneda (ARS/USD)
20. **Página /ingresos** — lista con totales ARS/USD + filtros + gestión de templates recurrentes (editar/pausar/reanudar)
21. **Página /cambios** — historial de cambios con rate y dirección
22. **Configuración/categorías** — CRUD completo (ícono, color, nombre) con confirmación de borrado
23. **Configuración/household** — ver miembros con avatar, copiar ID de invitación
24. **i18n** — next-intl integrado con language toggle
25. **Ingresos recurrentes** — modelo de templates + auto-sync mensual vía `syncRecurringIncomes` (llamado desde wallet query)

---

## Modelo de ingresos recurrentes

Los ingresos recurrentes usan un modelo de **template + instancias**:

- **Template**: `Income` con `isRecurring: true` y `recurringDay`. Actúa como configuración. Se puede pausar (`recurringActive: false`) o reanudar.
- **Instancia**: `Income` con `isRecurring: false` y `recurringSourceId` apuntando al template. Es el ingreso real del mes.
- **Auto-sync**: `incomeService.syncRecurringIncomes(householdId)` crea la instancia del mes actual si no existe. Se llama automáticamente al consultar la wallet. No requiere confirmación manual del usuario.

---

## Lo que falta implementar ⏳

### Prioridad media

1. **Gastos recurrentes** — el modelo solo soporta `isRecurring` en `Income`, no en `Expense`. Requiere migración de Prisma + mismo patrón template/instancia
2. **Totales en /movimientos** — mostrar totales ARS/USD cuando el filtro está en "gasto" o "ingreso"

### Prioridad baja (V2)

3. Bot de Telegram
4. API pública para n8n


## Variables de entorno necesarias

```bash
DATABASE_URL="postgresql://..."
AUTH_SECRET=""          # openssl rand -base64 32
AUTH_URL="http://localhost:3000"
```

---

## Reglas críticas del proyecto

- **Nunca usar `number` para montos** — siempre `Decimal` (Prisma) o `decimal.js` (servicios)
- **`householdId` siempre de la sesión** — nunca del body del request
- **Wallet siempre calculada** — nunca persistir un "saldo actual"
- **Exchanges no tienen PATCH** — se borran y recargan (trazabilidad)
- **DELETE de categoría** — bloquear si tiene gastos asociados (FK error de Prisma)
- **`apiHandler` wrapper** — todas las API routes lo usan, nunca manejar auth/errors inline
- **Ownership check en services** — `getById(id, householdId)` antes de cualquier update/delete
