// 1. 'use client' 삭제 (기본 서버 컴포넌트로 회귀)
import { Geist } from "next/font/google";
import Nav from "@/components/Nav";
import AuthProvider from "@/components/AuthProvider"; // ★ 새로 만든 거 임포트
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// ★ Metadata와 Viewport는 서버 컴포넌트인 여기서 안전하게 유지됩니다.
export const viewport: Viewport = {
  themeColor: "#fafafa",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "오답 노트",
  description: "수학 오답 노트",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MathNote",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geist.variable} fixed inset-0 w-full h-[100dvh] overflow-hidden`}>
      <body className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-[#fafafa] text-gray-900 [-webkit-tap-highlight-color:transparent]">
        {/* ★ AuthProvider로 감싸서 앱 전체에서 로그인이 작동하게 합니다. */}
        <AuthProvider> 
          <div className="flex flex-col w-full h-full max-w-xl mx-auto bg-white shadow-sm relative">
            <header className="shrink-0 z-50">
              <Nav />
            </header>

            <main className="flex-1 overflow-y-auto overscroll-none [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              {children}
            </main>
          </div>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
