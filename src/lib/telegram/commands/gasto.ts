import { TelegramLink } from '@prisma/client'
import { categoryRepository } from '@/repositories/category.repository'
import { expenseService } from '@/services/expense.service'
import { telegramLinkService } from '@/services/telegram-link.service'
import { createExpenseSchema } from '@/dtos/expense.dto'
import { formatMoney } from '@/lib/money'
import { sendMessage } from '../client'

const AMOUNT_RE = /^(\d+(?:[.,]\d{1,2})?)\s+(.+)$/

export async function handleGasto(link: TelegramLink, args: string) {
  const chatId = link.telegramChatId
  const match = args.match(AMOUNT_RE)

  if (!match) {
    await sendMessage(chatId, 'Formato: /gasto <monto> <categoría> [descripción]\nEj: /gasto 500 comida delivery')
    return
  }

  const amount = match[1].replace(',', '.')
  const rest = match[2].trim()
  const restLower = rest.toLowerCase()

  const categories = await categoryRepository.findByHousehold(link.householdId)
  const category = categories
    .filter((c) => restLower === c.name.toLowerCase() || restLower.startsWith(`${c.name.toLowerCase()} `))
    .sort((a, b) => b.name.length - a.name.length)[0]

  if (!category) {
    const names = categories.map((c) => `${c.icon} ${c.name}`).join('\n')
    await sendMessage(chatId, `No encontré esa categoría. Elegí una y reintentá:\n${names}`)
    return
  }

  const description = rest.slice(category.name.length).trim() || undefined

  const input = createExpenseSchema.parse({
    amount,
    currency: 'ARS',
    description,
    date: new Date(),
    categoryId: category.id,
    isRecurring: false,
  })

  const expense = await expenseService.create(input, link.householdId, link.userId)
  await telegramLinkService.markLastMovement(link.userId, 'expense', expense.id)

  await sendMessage(
    chatId,
    `✅ Gasto registrado: ${category.icon} ${category.name} — ${formatMoney(amount, 'ARS')}${description ? ` (${description})` : ''}\n\n¿Te equivocaste? Enviá /deshacer`,
  )
}
