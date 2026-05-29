import { exchangeRepository } from '@/repositories/exchange.repository'
import { CreateExchangeInput } from '@/dtos/exchange.dto'

export const exchangeService = {
  async list(householdId: string, filters: { from?: Date; to?: Date } = {}) {
    return exchangeRepository.findByHousehold(householdId, filters)
  },

  async getById(id: string, householdId: string) {
    const exchange = await exchangeRepository.findById(id, householdId)
    if (!exchange) throw new Error('Cambio no encontrado')
    return exchange
  },

  async create(input: CreateExchangeInput, householdId: string, userId: string) {
    return exchangeRepository.create({ ...input, householdId, userId })
  },

  async delete(id: string, householdId: string) {
    await this.getById(id, householdId)
    return exchangeRepository.delete(id, householdId)
  },
}
