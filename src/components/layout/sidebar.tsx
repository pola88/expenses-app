'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Home, List, Wallet, ArrowLeftRight, Settings, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
// import { LanguageToggle } from '@/components/language-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

type Props = {
  user: { name: string; email: string; householdId: string };
};

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function Sidebar({ user }: Props) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const NAV_MAIN = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/transactions', label: t('movements'), icon: List },
    { href: '/income', label: t('incomes'), icon: Wallet },
    { href: '/exchanges', label: t('exchanges'), icon: ArrowLeftRight },
  ];

  const NAV_SYSTEM = [{ href: '/settings', label: t('settings'), icon: Settings }];

  return (
    <aside className="flex h-full w-[220px] flex-col gap-1 border-r border-border bg-muted/40 px-3 py-4">
      <div className="flex items-center gap-2 px-2 pb-4">
        <Wallet className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium">Gastos</span>
      </div>

      <p className="px-2 pt-2 pb-1 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
        {t('principal')}
      </p>
      {NAV_MAIN.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground',
            isActive(href) && 'border border-border bg-background text-foreground'
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </Link>
      ))}

      <p className="px-2 pt-4 pb-1 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
        {t('system')}
      </p>
      {NAV_SYSTEM.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground',
            isActive(href) && 'border border-border bg-background text-foreground'
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </Link>
      ))}

      <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
        {/* <div className="flex justify-end">
          <LanguageToggle />
        </div> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-foreground">
                {initials(user.name || user.email)}
              </span>
              <span className="flex-1 truncate text-left">{user.name || user.email}</span>
              <ChevronUp className="h-3.5 w-3.5 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-[200px]">
            <div className="px-2 py-1.5">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-muted-foreground"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
