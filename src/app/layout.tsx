import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name}｜台灣社會案件後續追蹤`,
    template: `%s｜${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
    ],
  },
  openGraph: {
    title: siteConfig.name,
    description: "台灣社會案件後續追蹤，看哪些案件還在發燒、哪些已被遺忘。",
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "zh_TW",
    images: [{ url: "/hero.png", width: 1600, height: 900 }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: "台灣社會案件後續追蹤，看哪些案件還在發燒、哪些已被遺忘。",
    images: ["/hero.png"],
  },
  robots: { index: true, follow: true },
  verification: {
    google: "44srMm-jZU1De1_DHrjS_WBo5v8w9IkJXZYwemdjodA",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        <header className="border-b border-rule">
          <div className="container-prose flex items-center justify-between py-5">
            <Link href="/" className="flex items-center gap-2 no-underline">
              <Image
                src="/logo.png"
                alt=""
                width={36}
                height={36}
                priority
                className="h-9 w-9 object-contain"
              />
              <span className="font-serif text-xl font-semibold tracking-tight">
                案件溫度計
              </span>
              <span className="ml-1 hidden text-xs text-muted sm:inline">
                Taiwan Case Thermometer
              </span>
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link href="/">案件列表</Link>
              <Link href="/about">關於本站</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="rule-top mt-24">
          <div className="container-prose py-10 text-xs text-muted leading-relaxed">
            <p>
              本站僅整理已公開報導之資訊，不對事實作獨立認定。所有案件以代稱描述當事人，未滿
              18 歲之當事人不揭露足以辨識身分之資訊（兒少法第 69 條）。
            </p>
            <p className="mt-2">
              如發現錯誤或請求下架，請來信反映。© {new Date().getFullYear()} 案件溫度計
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
