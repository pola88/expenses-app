'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, List, Wallet, Settings, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/',              label: 'Inicio',   icon: Home },
  { href: '/movimientos',   label: 'Gastos',   icon: List },
  null,
  { href: '/ingresos',      label: 'Ingresos', icon: Wallet },
  { href: '/configuracion', label: 'Config',   icon: Settings },
]

export function BottomNav({ onQuickAdd }: { onQuickAdd: () => void }) {
  const pathname = usePathname()
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav className="border-t border-border bg-background px-4 pb-4 pt-2">
      <div className="flex items-center gap-1 rounded-2xl bg-muted/60 p-1">
        {NAV_ITEMS.map((item) => {
          if (!item) {
            return (
              <button key="fab" onClick={onQuickAdd}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background mx-auto"
                aria-label="Agregar movimiento">
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
    </nav>
  )
}
