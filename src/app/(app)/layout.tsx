import { requireHousehold } from '@/lib/session';
import { AppShell } from '@/components/layout/app-shell';
import { ensureRecurringSynced } from '@/services/recurring.service';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireHousehold();
  const householdId = session.user.householdId;

  await ensureRecurringSynced(householdId);

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
  );
}
