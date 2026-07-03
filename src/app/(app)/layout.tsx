import { requireHousehold } from '@/lib/session'
import { AppShell } from '@/components/layout/app-shell'
import { incomeService } from '@/services/income.service'
import { expenseService } from '@/services/expense.service'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireHousehold()
  const householdId = session.user.householdId

  await Promise.all([
    incomeService.syncRecurringIncomes(householdId),
    expenseService.syncRecurringExpenses(householdId),
  ])

  return (
    <AppShell
      user={{
        id: session.user.id,
        name: session.user.name ?? '',
        email: session.user.email ?? '',
        householdId,
      }}
    >
      {children}
    </AppShell>
  )
}
