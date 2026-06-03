'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function setLocale(locale: string) {
  const validLocale = ['es', 'en'].includes(locale) ? locale : 'es'
  const cookieStore = await cookies()
  cookieStore.set('locale', validLocale, { path: '/', maxAge: 60 * 60 * 24 * 365 })
  revalidatePath('/', 'layout')
}
