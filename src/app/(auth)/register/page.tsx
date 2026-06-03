'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { registerSchema, RegisterInput } from '@/dtos/auth.dto'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type HouseholdMode = 'create' | 'join'

export default function RegisterPage() {
  const t = useTranslations('auth.register')
  const router = useRouter()
  const [mode, setMode] = useState<HouseholdMode>('create')
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null)

    const payload: RegisterInput = {
      name: data.name,
      email: data.email,
      password: data.password,
      ...(mode === 'create' && data.householdName ? { householdName: data.householdName } : {}),
      ...(mode === 'join' && data.householdId ? { householdId: data.householdId } : {}),
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const body = await res.json()
      setServerError(body.error ?? 'Error')
      return
    }

    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setServerError(t('sessionError'))
      router.push('/login')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="rounded-2xl border bg-background p-6 shadow-sm">
      <h1 className="text-xl font-semibold mb-1">{t('title')}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t('subtitle')}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">{t('name')}</Label>
          <Input id="name" placeholder={t('namePlaceholder')} autoComplete="name" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('emailPlaceholder')}
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">{t('password')}</Label>
          <Input
            id="password"
            type="password"
            placeholder={t('passwordPlaceholder')}
            autoComplete="new-password"
            {...register('password')}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <Label>{t('household')}</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors text-left ${
                mode === 'create'
                  ? 'border-foreground bg-muted font-medium'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {t('createNew')}
            </button>
            <button
              type="button"
              onClick={() => setMode('join')}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors text-left ${
                mode === 'join'
                  ? 'border-foreground bg-muted font-medium'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {t('joinExisting')}
            </button>
          </div>

          {mode === 'create' && (
            <div className="flex flex-col gap-1.5">
              <Input
                placeholder={t('householdNamePlaceholder')}
                {...register('householdName')}
              />
              {errors.householdName && (
                <p className="text-xs text-destructive">{errors.householdName.message}</p>
              )}
            </div>
          )}

          {mode === 'join' && (
            <div className="flex flex-col gap-1.5">
              <Input placeholder={t('householdIdPlaceholder')} {...register('householdId')} />
              {errors.householdId && (
                <p className="text-xs text-destructive">{errors.householdId.message}</p>
              )}
            </div>
          )}
        </div>

        {serverError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full mt-1">
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('hasAccount')}{' '}
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          {t('login')}
        </Link>
      </p>
    </div>
  )
}
