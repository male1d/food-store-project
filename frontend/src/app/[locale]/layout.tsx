import type { Metadata } from "next";
import "./globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Header from "@/components/header"; 
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "mix market",
  description: "Доставка продуктов питания",
};

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Получаем сообщения
  const messages = await getMessages();

  return (
    // Добавляем suppressHydrationWarning чтобы расширения браузера не ломали верстку
    <html lang={locale} suppressHydrationWarning>
      <body className="max-w-[1440px] mx-auto bg-[#FFFFFF]">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            <Header />
            <main>{children}</main>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}