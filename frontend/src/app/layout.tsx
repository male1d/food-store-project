import type { Metadata } from "next";
import "./css/globals.css";

export const metadata: Metadata = {
  title: "mix market",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        {children}
      </body>
    </html>
  );
}
