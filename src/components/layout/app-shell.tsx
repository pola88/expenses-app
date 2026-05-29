'use client'

import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'
import { QuickAddSheet } from '@/components/quick-add/quick-add-sheet'
import { useState } from 'react'

type Props = {
  user: { id: string; name: string; householdId: string }
  children: React.ReactNode
}

export function AppShell({ user, children }: Props) {
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  return (
    <div className="flex h-dvh bg-background">
      <div className="hidden md:flex">
        <Sidebar user={user} onQuickAdd={() => setQuickAddOpen(true)} />
      </div>
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </div>
        <div className="md:hidden">
          <BottomNav onQuickAdd={() => setQuickAddOpen(true)} />
        </div>
      </main>
      <QuickAddSheet
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        householdId={user.householdId}
      />
    </div>
  )
}
