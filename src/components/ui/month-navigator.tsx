'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseMonthParam, monthToParam } from '@/lib/month';

export function MonthNavigator() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selected = parseMonthParam(searchParams.get('month'));
  const month = selected.toLocaleDateString('es-AR', {
    month: 'long',
    timeZone: 'UTC',
  });
  const label = `${month} ${selected.getUTCFullYear()}`;

  const navigate = (delta: -1 | 1) => {
    const next = new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth() + delta, 1));
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', monthToParam(next));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between lg:w-80">
      <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="bg-white!">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-xl font-semibold tracking-widest text-muted-foreground capitalize uppercase">
        {label}
      </span>
      <Button variant="outline" size="icon" onClick={() => navigate(1)} className="bg-white!">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
