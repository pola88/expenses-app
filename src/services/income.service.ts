import { incomeRepository } from '@/repositories/income.repository'
import { CreateIncomeInput, UpdateIncomeInput } from '@/dtos/income.dto'

export const incomeService = {
  async list(householdId: string, filters: { from?: Date; to?: Date } = {}) {
    return incomeRepository.findByHousehold(householdId, filters)
  },

  async getById(id: string, householdId: string) {
    const income = await incomeRepository.findById(id, householdId)
    if (!income) throw new Error('Ingreso no encontrado')
    return income
  },

  async create(input: CreateIncomeInput, householdId: string, userId: string) {
    return incomeRepository.create({ ...input, householdId, userId })
  },

  async update(id: string, input: UpdateIncomeInput, householdId: string) {
    await this.getById(id, householdId)
    return incomeRepository.update(id, householdId, input)
  },

  async delete(id: string, householdId: string) {
    await this.getById(id, householdId)
    return incomeRepository.delete(id, householdId)
  },
}
