'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Home, List, Wallet, ArrowLeftRight, Settings, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WalletBadge } from '@/components/wallet/wallet-badge'
import { LanguageToggle } from '@/components/language-toggle'
import { Button } from '@/components/ui/button'

type Props = {
  user: { name: string; householdId: string }
  onQuickAdd: () => void
}

export function Sidebar({ user, onQuickAdd }: Props) {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)

  const NAV_MAIN = [
    { href: '/',            label: t('home'),      icon: Home },
    { href: '/movimientos', label: t('movements'), icon: List },
    { href: '/ingresos',    label: t('incomes'),   icon: Wallet },
    { href: '/cambios',     label: t('exchanges'), icon: ArrowLeftRight },
  ]

  const NAV_SYSTEM = [
    { href: '/configuracion', label: t('settings'), icon: Settings },
  ]

  return (
    <aside className="flex h-full w-[220px] flex-col border-r border-border bg-muted/40 px-3 py-4 gap-1">
      <div className="flex items-center gap-2 px-2 pb-4">
        <Wallet className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium">Gastos</span>
      </div>

      <Button onClick={onQuickAdd} className="mb-2 w-full justify-start gap-2" size="sm">
        <Plus className="h-4 w-4" /> {t('add')}
      </Button>

      <p className="px-2 pt-2 pb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {t('principal')}
      </p>
      {NAV_MAIN.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href}
          className={cn(
            'flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground',
            isActive(href) && 'bg-background text-foreground border border-border'
          )}>
          <Icon className="h-4 w-4 shrink-0" />{label}
        </Link>
      ))}

      <p className="px-2 pt-4 pb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {t('system')}
      </p>
      {NAV_SYSTEM.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href}
          className={cn(
            'flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground',
            isActive(href) && 'bg-background text-foreground border border-border'
          )}>
          <Icon className="h-4 w-4 shrink-0" />{label}
        </Link>
      ))}

      <div className="mt-auto pt-4 border-t border-border flex flex-col gap-2">
        <WalletBadge householdId={user.householdId} />
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
      </div>
    </aside>
  )
}
