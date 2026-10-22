import { NextResponse } from 'next/server';
import { createRateLimiter } from '@/lib/rate-limit';
import { handleTelegramUpdate } from '@/lib/telegram/handle-update';

const isRateLimited = createRateLimiter(60_000, 20);

export async function POST(req: Request) {
  const secret = req.headers.get('x-telegram-bot-api-secret-token');
  if (!process.env.TELEGRAM_WEBHOOK_SECRET || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const update = await req.json();
  const chatId = update?.message?.chat?.id;
  if (chatId !== undefined && isRateLimited(String(chatId))) {
    return NextResponse.json({ ok: true });
  }

  try {
    await handleTelegramUpdate(update);
  } catch (e) {
    console.error('[telegram webhook]', e);
  }

  // Always 200 so Telegram doesn't retry-storm us on internal errors.
  return NextResponse.json({ ok: true });
}
