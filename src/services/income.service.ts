import { incomeRepository } from '@/repositories/income.repository'
import { CreateIncomeInput, UpdateIncomeInput } from '@/dtos/income.dto'

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

export const incomeService = {
  async list(householdId: string, filters: { from?: Date; to?: Date } = {}) {
    return incomeRepository.findByHousehold(householdId, filters)
  },

  async listTemplates(householdId: string) {
    return incomeRepository.findAllTemplates(householdId)
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

  async stopRecurring(id: string, householdId: string) {
    await this.getById(id, householdId)
    return incomeRepository.update(id, householdId, { recurringActive: false })
  },

  async resumeRecurring(id: string, householdId: string) {
    await this.getById(id, householdId)
    return incomeRepository.update(id, householdId, { recurringActive: true })
  },

  async delete(id: string, householdId: string) {
    await this.getById(id, householdId)
    return incomeRepository.delete(id, householdId)
  },

  async syncRecurringIncomes(householdId: string) {
    const templates = await incomeRepository.findActiveTemplates(householdId)
    if (templates.length === 0) return

    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()

    for (const template of templates) {
      const existing = await incomeRepository.findInstanceForMonth(template.id, year, month)
      if (existing) continue

      const day = Math.min(template.recurringDay!, daysInMonth(year, month))
      await incomeRepository.create({
        amount: template.amount.toString(),
        currency: template.currency,
        description: template.description,
        date: new Date(year, month, day),
        isRecurring: false,
        householdId,
        userId: template.userId,
        recurringSourceId: template.id,
      })
    }
  },
}
