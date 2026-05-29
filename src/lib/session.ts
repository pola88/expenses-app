import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function requireSession() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return session
}

export async function requireHousehold() {
  const session = await requireSession()
  if (!session.user.householdId) redirect('/onboarding')
  return session as typeof session & {
    user: typeof session.user & { householdId: string }
  }
}
