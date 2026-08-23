import { telegramLinkService } from '@/services/telegram-link.service'
import { parseCommand } from './parser'
import { sendMessage } from './client'
import { handleStart } from './commands/start'
import { handleGasto } from './commands/gasto'
import { handleCategorias } from './commands/categorias'

type TelegramUpdate = {
  message?: {
    chat: { id: number }
    text?: string
  }
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  const message = update.message
  if (!message?.text) return

  const chatId = String(message.chat.id)
  const { command, args } = parseCommand(message.text)

  if (command === '/start') {
    await handleStart(chatId, args)
    return
  }

  const link = await telegramLinkService.findByChatId(chatId)
  if (!link) {
    await sendMessage(
      chatId,
      'Tu cuenta no está vinculada. Generá un código en Configuración > Telegram y enviá /start <código>.',
    )
    return
  }

  try {
    switch (command) {
      case '/gasto':
        await handleGasto(link, args)
        break
      case '/categorias':
        await handleCategorias(link)
        break
      default:
        await sendMessage(chatId, 'Comando no reconocido. Usá /gasto o /categorias.')
    }
  } catch (e) {
    console.error('[telegram] command error', e)
    await sendMessage(chatId, 'Uy, algo salió mal procesando eso. Probá de nuevo.')
  }
}
