import { TelegramLink } from '@prisma/client';
import { categoryRepository } from '@/repositories/category.repository';
import { sendMessage } from '../client';

export async function handleCategorias(link: TelegramLink) {
  const categories = await categoryRepository.findByHousehold(link.householdId);

  if (categories.length === 0) {
    await sendMessage(
      link.telegramChatId,
      'Todavía no hay categorías creadas. Creá alguna desde la app.'
    );
    return;
  }

  const lines = categories.map((c) => `${c.icon} ${c.name}`);
  await sendMessage(link.telegramChatId, lines.join('\n'));
}
