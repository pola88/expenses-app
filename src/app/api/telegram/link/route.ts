import { apiHandler, ok } from '@/lib/api'
import { telegramLinkService } from '@/services/telegram-link.service'

export const GET = apiHandler(async (_req, { userId }) => {
  return ok({ linked: await telegramLinkService.isLinked(userId) })
})

export const POST = apiHandler(async (_req, { userId }) => {
  const code = await telegramLinkService.generateLinkCode(userId)
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
  const deepLink = botUsername ? `https://t.me/${botUsername}?start=${code}` : null
  return ok({ code, deepLink, expiresInMinutes: 10 })
})
