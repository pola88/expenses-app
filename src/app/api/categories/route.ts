import { apiHandler, ok } from '@/lib/api'
import { categoryRepository } from '@/repositories/category.repository'
import { z } from 'zod'

const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  icon: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
})

export const GET = apiHandler(async (_, { householdId }) => {
  return ok(await categoryRepository.findByHousehold(householdId))
})

export const POST = apiHandler(async (req, { householdId }) => {
  const input = createCategorySchema.parse(await req.json())
  return ok(await categoryRepository.create({ ...input, householdId }), 201)
})
