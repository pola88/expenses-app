import { incomeRepository } from '@/repositories/income.repository'
import { CreateIncomeInput, UpdateIncomeInput } from '@/dtos/income.dto'
import { daysInMonth } from '@/lib/date'
import { NotFoundError } from '@/lib/errors'

export const incomeService = {
  async list(householdId: string, filters: { from?: Date; to?: Date } = {}) {
    return incomeRepository.findByHousehold(householdId, filters)
  },

  async listTemplates(householdId: string) {
    return incomeRepository.findAllTemplates(householdId)
  },

  async getById(id: string, householdId: string) {
    const income = await incomeRepository.findById(id, householdId)
    if (!income) throw new NotFoundError('Ingreso no encontrado')
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

    const existing = await incomeRepository.findInstancesForMonth(
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
        return incomeRepository.create({
          amount: template.amount.toString(),
          currency: template.currency,
          description: template.description,
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
