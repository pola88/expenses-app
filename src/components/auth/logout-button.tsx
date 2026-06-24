'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground',
        className,
      )}
    >
      <LogOut className="h-4 w-4 shrink-0" />
      Cerrar sesión
    </button>
  )
}
