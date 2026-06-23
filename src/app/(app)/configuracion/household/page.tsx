'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Copy, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

type Member = { id: string; name: string | null; email: string | null; createdAt: string }
type Household = { id: string; name: string; members: Member[] }

function initials(name: string | null, email: string | null) {
  const src = name ?? email ?? '?'
  return src.slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
]

function avatarColor(id: string) {
  const n = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

function CopyButton({ text }: { text: string }) {
  const t = useTranslations('settings.household')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 shrink-0">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? t('copied') : t('copyId')}
    </Button>
  )
}

export default function HouseholdPage() {
  const t = useTranslations('settings.household')
  const { data: household, isLoading } = useQuery<Household>({
    queryKey: ['household'],
    queryFn: () => fetch('/api/household').then((r) => r.json()),
  })

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 max-w-2xl mx-auto w-full">
      <h1 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t('title')}
      </h1>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : !household ? null : (
        <>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-background px-4 py-4">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{t('nameLabel')}</p>
              <p className="text-sm font-medium">{household.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">{t('inviteId')}</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg border border-border bg-muted px-3 py-2 text-xs font-mono text-foreground">
                  {household.id}
                </code>
                <CopyButton text={household.id} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1 mb-1">
              {t('members', { count: household.members.length })}
            </p>
            <div className="rounded-xl border border-border bg-background divide-y divide-border">
              {household.members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(member.id)}`}
                  >
                    {initials(member.name, member.email)}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">
                      {member.name ?? t('noName')}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {member.email ?? ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
