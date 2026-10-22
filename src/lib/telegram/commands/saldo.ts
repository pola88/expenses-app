import { TelegramLink } from '@prisma/client';
import { getWalletBalance } from '@/services/wallet.service';
import { formatMoney } from '@/lib/money';
import { sendMessage } from '../client';

export async function handleSaldo(link: TelegramLink) {
  const balance = await getWalletBalance(link.householdId);

  await sendMessage(
    link.telegramChatId,
    `💰 Saldo actual\n${formatMoney(balance.ARS, 'ARS')}\n${formatMoney(balance.USD, 'USD')}`
  );
}
