import { apiHandler, ok, err } from '@/lib/api'
import { categoryRepository } from '@/repositories/category.repository'
import { z } from 'zod'

const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  icon: z.string().min(1).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

type Params = { params: Promise<{ id: string }> }

export const PATCH = (req: Request, { params }: Params) =>
  apiHandler(async (req, { householdId }) => {
    const { id } = await params
    const input = updateCategorySchema.parse(await req.json())
    return ok(await categoryRepository.update(id, householdId, input))
  })(req)

export const DELETE = (req: Request, { params }: Params) =>
  apiHandler(async (_, { householdId }) => {
    const { id } = await params
    const existing = await categoryRepository.findById(id, householdId)
    if (!existing) return err('Categoría no encontrada', 404)
    await categoryRepository.delete(id, householdId)
    return ok({ deleted: true })
  })(req)
