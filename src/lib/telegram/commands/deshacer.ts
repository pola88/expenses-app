import { TelegramLink } from '@prisma/client';
import { telegramLinkService } from '@/services/telegram-link.service';
import { sendMessage } from '../client';

const LABEL = { expense: 'El gasto', income: 'El ingreso' } as const;

export async function handleDeshacer(link: TelegramLink) {
  const chatId = link.telegramChatId;

  if (!link.lastMovementType || !link.lastMovementId) {
    await sendMessage(chatId, 'No hay nada reciente para deshacer.');
    return;
  }

  const type = await telegramLinkService.undoLastMovement(link);
  if (!type) {
    await sendMessage(chatId, 'No hay nada reciente para deshacer.');
    return;
  }

  await sendMessage(chatId, `🗑️ ${LABEL[type]} se borró.`);
}
