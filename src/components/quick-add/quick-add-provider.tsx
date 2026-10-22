'use client';

import { createContext, useContext, useState } from 'react';

type QuickAddContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const QuickAddContext = createContext<QuickAddContextValue | null>(null);

export function QuickAddProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<boolean>(false);
  return <QuickAddContext.Provider value={{ open, setOpen }}>{children}</QuickAddContext.Provider>;
}

export function useQuickAdd() {
  const ctx = useContext(QuickAddContext);
  if (!ctx) throw new Error('useQuickAdd must be used within QuickAddProvider');
  return ctx;
}
