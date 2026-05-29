import { prisma } from '@/lib/prisma'

export const categoryRepository = {
  findByHousehold(householdId: string) {
    return prisma.category.findMany({ where: { householdId }, orderBy: { name: 'asc' } })
  },

  findById(id: string, householdId: string) {
    return prisma.category.findFirst({ where: { id, householdId } })
  },

  create(data: { name: string; icon: string; color: string; householdId: string }) {
    return prisma.category.create({ data })
  },

  update(id: string, householdId: string, data: Partial<{ name: string; icon: string; color: string }>) {
    return prisma.category.update({ where: { id, householdId }, data })
  },

  delete(id: string, householdId: string) {
    return prisma.category.delete({ where: { id, householdId } })
  },
}
