import { requireHousehold } from '@/lib/session'
import { AppShell } from '@/components/layout/app-shell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireHousehold()
  return (
    <AppShell
      user={{
        id: session.user.id,
        name: session.user.name ?? '',
        email: session.user.email ?? '',
        householdId: session.user.householdId,
      }}
    >
      {children}
    </AppShell>
  )
}
