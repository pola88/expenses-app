import { TelegramLink } from '@prisma/client'
import { incomeService } from '@/services/income.service'
import { telegramLinkService } from '@/services/telegram-link.service'
import { createIncomeSchema } from '@/dtos/income.dto'
import { formatMoney } from '@/lib/money'
import { sendMessage } from '../client'

const AMOUNT_RE = /^(\d+(?:[.,]\d{1,2})?)\s+(.+)$/

export async function handleIngreso(link: TelegramLink, args: string) {
  const chatId = link.telegramChatId
  const match = args.match(AMOUNT_RE)

  if (!match) {
    await sendMessage(chatId, 'Formato: /ingreso <monto> <descripción>\nEj: /ingreso 50000 freelance')
    return
  }

  const amount = match[1].replace(',', '.')
  const description = match[2].trim()

  const input = createIncomeSchema.parse({
    amount,
    currency: 'ARS',
    description,
    date: new Date(),
    isRecurring: false,
  })

  const income = await incomeService.create(input, link.householdId, link.userId)
  await telegramLinkService.markLastMovement(link.userId, 'income', income.id)

  await sendMessage(
    chatId,
    `✅ Ingreso registrado: ${formatMoney(amount, 'ARS')} (${description})\n\n¿Te equivocaste? Enviá /deshacer`,
  )
}
