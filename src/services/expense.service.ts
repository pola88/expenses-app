import { expenseRepository, ExpenseFilters } from '@/repositories/expense.repository'
import { categoryRepository } from '@/repositories/category.repository'
import { CreateExpenseInput, UpdateExpenseInput } from '@/dtos/expense.dto'
import { daysInMonth } from '@/lib/date'
import { NotFoundError } from '@/lib/errors'

export const expenseService = {
  async list(householdId: string, filters: ExpenseFilters = {}) {
    return expenseRepository.findByHousehold(householdId, filters)
  },

  async listTemplates(householdId: string) {
    return expenseRepository.findAllTemplates(householdId)
  },

  async getById(id: string, householdId: string) {
    const expense = await expenseRepository.findById(id, householdId)
    if (!expense) throw new NotFoundError('Gasto no encontrado')
    return expense
  },

  async create(input: CreateExpenseInput, householdId: string, userId: string) {
    const category = await categoryRepository.findById(input.categoryId, householdId)
    if (!category) throw new NotFoundError('Categoría no encontrada')
    return expenseRepository.create({ ...input, householdId, userId })
  },

  async update(id: string, input: UpdateExpenseInput, householdId: string) {
    await this.getById(id, householdId)
    if (input.categoryId) {
      const category = await categoryRepository.findById(input.categoryId, householdId)
      if (!category) throw new NotFoundError('Categoría no encontrada')
    }
    return expenseRepository.update(id, householdId, input)
  },

  async stopRecurring(id: string, householdId: string) {
    await this.getById(id, householdId)
    return expenseRepository.update(id, householdId, { recurringActive: false })
  },

  async resumeRecurring(id: string, householdId: string) {
    await this.getById(id, householdId)
    return expenseRepository.update(id, householdId, { recurringActive: true })
  },

  async delete(id: string, householdId: string) {
    await this.getById(id, householdId)
    return expenseRepository.delete(id, householdId)
  },

  async syncRecurringExpenses(householdId: string) {
    const templates = await expenseRepository.findActiveTemplates(householdId)
    if (templates.length === 0) return

    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()

    const existing = await expenseRepository.findInstancesForMonth(
      templates.map((t) => t.id),
      year,
      month,
    )
    const existingIds = new Set(existing.map((i) => i.recurringSourceId))

    const missing = templates.filter((t) => !existingIds.has(t.id))
    if (missing.length === 0) return

    await Promise.all(
      missing.map((template) => {
        const day = Math.min(template.recurringDay!, daysInMonth(year, month))
        return expenseRepository.create({
          amount: template.amount.toString(),
          currency: template.currency,
          description: template.description,
          categoryId: template.categoryId,
          date: new Date(Date.UTC(year, month, day)),
          isRecurring: false,
          householdId,
          userId: template.userId,
          recurringSourceId: template.id,
        })
      }),
    )
  },
}
