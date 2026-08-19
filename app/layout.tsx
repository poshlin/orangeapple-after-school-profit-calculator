import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "橘子蘋果｜安親班合作收益試算器",
  description: "現場輸入生源、課程與設備條件，立即估算季收益、年度收益與回本時間。",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
