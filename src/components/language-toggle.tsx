'use client'

import { useLocale } from 'next-intl'
import { setLocale } from '@/actions/locale'
import { Button } from '@/components/ui/button'

export function LanguageToggle() {
  const locale = useLocale()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-xs font-medium text-muted-foreground hover:text-foreground"
      onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
    >
      {locale === 'es' ? 'EN' : 'ES'}
    </Button>
  )
}
