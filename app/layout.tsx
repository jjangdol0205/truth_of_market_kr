import type { Metadata } from "next";
import "./globals.css";
import TopNav from "./components/TopNav";
import DisableCopy from "@/components/DisableCopy";
import FloatingShopButton from "@/components/FloatingShopButton";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Truth of Market | 투자의 진실",
  description: "AI 기반 심층 데이터 주식 분석 플랫폼",
};

import { GoogleTagManager } from '@next/third-parties/google';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <GoogleTagManager gtmId="GTM-W9538SHJ" />
      <body className={`bg-toss-bg text-zinc-100 antialiased tracking-tight`}>
        <DisableCopy />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <TopNav />

          {/* Main Content */}
          <main className="flex-grow p-6">
            {children}
          </main>

          <FloatingShopButton />
          
          {/* Footer */}
          <footer className="border-t border-toss-border py-6 text-center text-xs text-zinc-500 font-medium">
            © 2026 Truth of Market. 본 정보는 투자 참고용이며 투자 결과에 대한 법적 책임을 지지 않습니다.
          </footer>
        </div>
      </body>
    </html>
  );
}