import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/dtos/auth.dto'

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { name, email, password, householdName, householdId } = parsed.data
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return NextResponse.json({ error: 'No se pudo crear la cuenta' }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      name, email, passwordHash,
      household: householdId
        ? { connect: { id: householdId } }
        : householdName ? { create: { name: householdName } } : undefined,
    },
  })
  return NextResponse.json({ id: user.id }, { status: 201 })
}
