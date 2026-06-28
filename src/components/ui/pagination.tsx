'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const t = useTranslations('common')

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        aria-label={t('prev')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t('pageOf', { current: page + 1, total: totalPages })}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        aria-label={t('next')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
