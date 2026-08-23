import { TelegramLink } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { telegramLinkRepository } from '@/repositories/telegram-link.repository'
import { expenseService } from '@/services/expense.service'
import { incomeService } from '@/services/income.service'

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

  async markLastMovement(userId: string, type: 'expense' | 'income', id: string) {
    return telegramLinkRepository.setLastMovement(userId, type, id)
  },

  async undoLastMovement(link: TelegramLink) {
    if (!link.lastMovementType || !link.lastMovementId) return null

    const type = link.lastMovementType as 'expense' | 'income'
    try {
      if (type === 'expense') {
        await expenseService.delete(link.lastMovementId, link.householdId)
      } else {
        await incomeService.delete(link.lastMovementId, link.householdId)
      }
    } finally {
      // Clear the pointer even if delete failed (e.g. already removed from the web UI)
      // so /deshacer doesn't keep retrying a stale reference.
      await telegramLinkRepository.clearLastMovement(link.userId)
    }

    return type
  },
}
