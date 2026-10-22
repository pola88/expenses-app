'use client';

import { Sidebar } from './sidebar';
import { BottomNav } from './bottom-nav';
import { QuickAddSheet } from '@/components/quick-add/quick-add-sheet';
// import { useState } from 'react';

type Props = {
  user: { id: string; name: string; email: string; householdId: string };
  children: React.ReactNode;
};

export function AppShell({ user, children }: Props) {
  // const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <div className="flex h-dvh bg-background">
      <div className="hidden md:flex">
        <Sidebar user={user} />
      </div>
      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</div>
        <div className="md:hidden">
          <BottomNav />
        </div>
      </main>
      <QuickAddSheet />
    </div>
  );
}
