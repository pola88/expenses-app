import { prisma } from '@/lib/prisma'
import { telegramLinkRepository } from '@/repositories/telegram-link.repository'

export const telegramLinkService = {
  async findByChatId(chatId: string) {
    return telegramLinkRepository.findByChatId(chatId)
  },

  async isLinked(userId: string) {
    const link = await telegramLinkRepository.findByUserId(userId)
    return !!link
  },

  async generateLinkCode(userId: string) {
    const linkCode = await telegramLinkRepository.createLinkCode(userId)
    return linkCode.code
  },

  async consumeLinkCode(code: string, chatId: string) {
    const linkCode = await telegramLinkRepository.findValidCode(code)
    if (!linkCode) return null

    const user = await prisma.user.findUnique({ where: { id: linkCode.userId } })
    if (!user?.householdId) return null

    await telegramLinkRepository.deleteCode(code)
    return telegramLinkRepository.upsertLink(user.id, user.householdId, chatId)
  },
}
