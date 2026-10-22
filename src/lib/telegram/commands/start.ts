import { telegramLinkService } from '@/services/telegram-link.service';
import { sendMessage } from '../client';

export async function handleStart(chatId: string, args: string) {
  const code = args.split(/\s+/)[0];
  if (!code) {
    await sendMessage(
      chatId,
      'Enviá /start seguido del código que generaste en Configuración > Telegram.'
    );
    return;
  }

  const link = await telegramLinkService.consumeLinkCode(code, chatId);
  if (!link) {
    await sendMessage(chatId, 'Código inválido o vencido. Generá uno nuevo desde la app.');
    return;
  }

  await sendMessage(
    chatId,
    [
      '¡Listo! Tu cuenta quedó vinculada.',
      '',
      'Comandos disponibles:',
      '/gasto <monto> <categoría> [descripción]',
      '/ingreso <monto> <descripción>',
      '/saldo — ver balance actual',
      '/resumen — resumen del mes',
      '/categorias — ver categorías',
      '/deshacer — borrar el último movimiento cargado',
    ].join('\n')
  );
}
