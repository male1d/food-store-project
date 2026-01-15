// i18n.ts
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './navigation';

export default getRequestConfig(async ({ locale }) => {
  // Проверяем, что входящий locale поддерживается, используя ваш конфиг роутинга
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  try {
    return {
      // Явно указываем TS, что здесь будет строка, 
      // так как проверку выше мы уже прошли
      locale: locale as string, 
      messages: (await import(`./messages/${locale}.json`)).default
    };
  } catch (error) {
    console.error(`Ошибка загрузки перевода для локали: ${locale}`, error);
    notFound();
  }
});