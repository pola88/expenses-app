import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

const LINK_CODE_TTL_MS = 10 * 60 * 1000

export const telegramLinkRepository = {
  findByChatId(chatId: string) {
    return prisma.telegramLink.findUnique({ where: { telegramChatId: chatId } })
  },

  findByUserId(userId: string) {
    return prisma.telegramLink.findUnique({ where: { userId } })
  },

  upsertLink(userId: string, householdId: string, chatId: string) {
    return prisma.telegramLink.upsert({
      where: { userId },
      create: { userId, householdId, telegramChatId: chatId },
      update: { telegramChatId: chatId },
    })
  },

  createLinkCode(userId: string) {
    const code = randomBytes(16).toString('hex')
    return prisma.telegramLinkCode.create({
      data: { code, userId, expiresAt: new Date(Date.now() + LINK_CODE_TTL_MS) },
    })
  },

  findValidCode(code: string) {
    return prisma.telegramLinkCode.findFirst({
      where: { code, expiresAt: { gt: new Date() } },
    })
  },

  deleteCode(code: string) {
    return prisma.telegramLinkCode.delete({ where: { code } }).catch(() => null)
  },
}
