import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  let language = await requestLocale;

  // Fallback: read from x-locale header set by middleware
  if (!language || !(locales as readonly string[]).includes(language)) {
    const headersList = await headers();
    language = headersList.get('x-locale') ?? defaultLocale;
  }

  if (!(locales as readonly string[]).includes(language)) {
    language = defaultLocale;
  }

  const messages = (await import(`../messages/${language}.json`)).default;

  return { locale: language, messages };
});
