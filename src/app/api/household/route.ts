import { apiHandler, ok, err } from '@/lib/api'
import { prisma } from '@/lib/prisma'

export const GET = apiHandler(async (_, { householdId }) => {
  const household = await prisma.household.findUnique({
    where: { id: householdId },
    select: {
      id: true,
      name: true,
      members: {
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!household) return err('Household no encontrado', 404)
  return ok(household)
})
