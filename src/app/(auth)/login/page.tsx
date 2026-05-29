'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { loginSchema, LoginInput } from '@/dtos/auth.dto'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginInput) => {
    setAuthError(null)
    const result = await signIn('credentials', { ...data, redirect: false })
    if (result?.error) {
      setAuthError('Email o contraseña incorrectos')
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="rounded-2xl border bg-background p-6 shadow-sm">
      <h1 className="text-xl font-semibold mb-1">Iniciar sesión</h1>
      <p className="text-sm text-muted-foreground mb-6">Ingresá con tu cuenta</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="vos@ejemplo.com"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        {authError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {authError}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full mt-1">
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿No tenés cuenta?{' '}
        <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
          Registrate
        </Link>
      </p>
    </div>
  )
}
