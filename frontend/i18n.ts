import { getRequestConfig } from 'next-intl/server';
import { routing } from './src/navigation';

export default getRequestConfig(async ({ locale }) => {
  const isIncluded = routing.locales.includes(locale as any);
  const activeLocale = locale && isIncluded ? locale : routing.defaultLocale;

  return {
    locale: activeLocale,
    messages: (await import(`./src/messages/${activeLocale}.json`)).default
  };
});

