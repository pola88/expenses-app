import { expenseRepository, ExpenseFilters } from '@/repositories/expense.repository'
import { CreateExpenseInput, UpdateExpenseInput } from '@/dtos/expense.dto'

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

export const expenseService = {
  async list(householdId: string, filters: ExpenseFilters = {}) {
    return expenseRepository.findByHousehold(householdId, filters)
  },

  async listTemplates(householdId: string) {
    return expenseRepository.findAllTemplates(householdId)
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

    for (const template of templates) {
      const existing = await expenseRepository.findInstanceForMonth(template.id, year, month)
      if (existing) continue

      const day = Math.min(template.recurringDay!, daysInMonth(year, month))
      await expenseRepository.create({
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
    }
  },
}
