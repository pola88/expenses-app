'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { parseMonthParam, monthToParam } from '@/lib/month'


export function MonthNavigator() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selected = parseMonthParam(searchParams.get('month'))
  const label = selected.toLocaleDateString('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' })

  const navigate = (delta: -1 | 1) => {
    const next = new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth() + delta, 1))
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', monthToParam(next))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground capitalize">
        {label}
      </span>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
