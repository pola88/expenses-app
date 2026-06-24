import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Tag, Users, ChevronRight } from 'lucide-react'
import { requireHousehold } from '@/lib/session'
import { LogoutButton } from '@/components/auth/logout-button'

export default async function SettingsPage() {
  const [session, t] = await Promise.all([
    requireHousehold(),
    getTranslations('settings'),
  ])

  const { name, email } = session.user
  const ini = (name || email || '?')
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()

  const items = [
    {
      href: '/settings/categories',
      icon: Tag,
      label: t('categoriesLabel'),
      description: t('categoriesDescription'),
    },
    {
      href: '/settings/household',
      icon: Users,
      label: t('householdLabel'),
      description: t('householdDescription'),
    },
  ]

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 max-w-2xl mx-auto w-full">
      <h1 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t('title')}
      </h1>

      <div className="flex flex-col gap-2">
        {items.map(({ href, icon: Icon, label, description }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-xl border border-border bg-background px-4 py-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </div>
            <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
          {t('accountLabel')}
        </p>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
            {ini}
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-medium truncate">{name ?? ''}</span>
            <span className="text-xs text-muted-foreground truncate">{email ?? ''}</span>
          </div>
        </div>
        <LogoutButton className="rounded-xl border border-border bg-background px-4 py-4 hover:bg-muted/50" />
      </div>
    </div>
  )
}
