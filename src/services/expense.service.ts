import { expenseRepository, ExpenseFilters } from '@/repositories/expense.repository'
import { CreateExpenseInput, UpdateExpenseInput } from '@/dtos/expense.dto'

export const expenseService = {
  async list(householdId: string, filters: ExpenseFilters = {}) {
    return expenseRepository.findByHousehold(householdId, filters)
  },

  async getById(id: string, householdId: string) {
    const expense = await expenseRepository.findById(id, householdId)
    if (!expense) throw new Error('Gasto no encontrado')
    return expense
  },

  async create(input: CreateExpenseInput, householdId: string, userId: string) {
    return expenseRepository.create({ ...input, householdId, userId })
  },

  async update(id: string, input: UpdateExpenseInput, householdId: string) {
    await this.getById(id, householdId)
    return expenseRepository.update(id, householdId, input)
  },

  async delete(id: string, householdId: string) {
    await this.getById(id, householdId)
    return expenseRepository.delete(id, householdId)
  },
}
