'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Home, List, Wallet, Settings, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LanguageToggle } from '@/components/language-toggle'

export function BottomNav({ onQuickAdd }: { onQuickAdd: () => void }) {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)

  const NAV_ITEMS = [
    { href: '/',              label: t('home'),     icon: Home },
    { href: '/movimientos',   label: t('expenses'), icon: List },
    null,
    { href: '/ingresos',      label: t('incomes'), icon: Wallet },
    { href: '/configuracion', label: t('config'),  icon: Settings },
  ]

  return (
    <nav className="border-t border-border bg-background px-4 pb-4 pt-2">
      <div className="flex items-center gap-1 rounded-2xl bg-muted/60 p-1">
        {NAV_ITEMS.map((item, i) => {
          if (!item) {
            return (
              <button key="fab" onClick={onQuickAdd}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background mx-auto"
                aria-label={t('addMovement')}>
                <Plus className="h-5 w-5" />
              </button>
            )
          }
          const { href, label, icon: Icon } = item
          return (
            <Link key={href} href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] text-muted-foreground transition-colors',
                isActive(href) && 'bg-background text-foreground border border-border'
              )}>
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          )
        })}
      </div>
      <div className="flex justify-end mt-1">
        <LanguageToggle />
      </div>
    </nav>
  )
}
