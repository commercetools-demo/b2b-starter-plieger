import { getRequestConfig } from 'next-intl/server';
import { getSession } from '@/lib/session';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async () => {
  const session = await getSession();
  const rawLocale = session.locale ?? defaultLocale;
  const locale = (locales as readonly string[]).includes(rawLocale) ? rawLocale : defaultLocale;

  const messages =
    locale === 'de'
      ? (await import('../messages/de.json')).default
      : (await import('../messages/en.json')).default;

  return { locale, messages };
});
