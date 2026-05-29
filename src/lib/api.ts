import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { auth } from '@/lib/auth'

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function validationError(error: ZodError) {
  return NextResponse.json(
    { error: 'Validation error', details: error.flatten() },
    { status: 400 }
  )
}

export function apiHandler(
  handler: (req: Request, ctx: { householdId: string; userId: string }) => Promise<NextResponse>
) {
  return async (req: Request) => {
    try {
      const session = await auth()

      if (!session?.user?.id) {
        return err('No autenticado', 401)
      }

      if (!session.user.householdId) {
        return err('Sin household asignado', 403)
      }

      return await handler(req, {
        householdId: session.user.householdId,
        userId: session.user.id,
      })
    } catch (e) {
      if (e instanceof ZodError) return validationError(e)

      const message = e instanceof Error ? e.message : 'Error interno'

      if (message.includes('no encontrado')) return err(message, 404)

      console.error('[API Error]', e)
      return err('Error interno del servidor', 500)
    }
  }
}
