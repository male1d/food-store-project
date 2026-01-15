import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

// 1. Сначала определяем настройки роутинга
export const routing = defineRouting({
  locales: ['ru', 'en', 'de'],
  defaultLocale: 'ru'
});

// 2. Экспортируем утилиты через createNavigation
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);