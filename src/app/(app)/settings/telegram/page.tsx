'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Send, RefreshCw } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/fetch'

type LinkStatus = { linked: boolean }
type LinkCode = { code: string; deepLink: string | null; expiresInMinutes: number }

export default function TelegramPage() {
  const t = useTranslations('settings.telegram')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<LinkStatus>({
    queryKey: ['telegram-link'],
    queryFn: () => apiFetch<LinkStatus>('/api/telegram/link'),
  })

  const mutation = useMutation({
    mutationFn: () => apiFetch<LinkCode>('/api/telegram/link', { method: 'POST' }),
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['telegram-link'] })

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 max-w-2xl mx-auto w-full">
      <h1 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t('title')}
      </h1>

      {isLoading ? (
        <Skeleton className="h-32 rounded-xl" />
      ) : data?.linked ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-background px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{t('linkedTitle')}</p>
              <p className="text-xs text-muted-foreground">{t('linkedDescription')}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-background px-4 py-4">
          <p className="text-sm text-muted-foreground">{t('notLinkedDescription')}</p>

          {mutation.data ? (
            <div className="flex flex-col gap-2">
              {mutation.data.deepLink && (
                <Button asChild>
                  <a href={mutation.data.deepLink} target="_blank" rel="noopener noreferrer">
                    <Send className="h-4 w-4" />
                    {t('openInTelegram')}
                  </a>
                </Button>
              )}
              <code className="truncate rounded-lg border border-border bg-muted px-3 py-2 text-xs font-mono">
                /start {mutation.data.code}
              </code>
              <p className="text-xs text-muted-foreground">
                {t('expiresIn', { minutes: mutation.data.expiresInMinutes })}
              </p>
              <Button variant="outline" size="sm" onClick={refresh} className="gap-1.5 self-start">
                <RefreshCw className="h-3.5 w-3.5" />
                {t('checkStatus')}
              </Button>
            </div>
          ) : (
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="self-start">
              {mutation.isPending ? t('generating') : t('generateCode')}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
