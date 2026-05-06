import type { Metadata, Viewport } from "next"; // Viewport 추가
import { Geist } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// ★ 모바일 화면 줌 방지 및 테마 색상 설정
export const viewport: Viewport = {
  themeColor: "#fafafa", // 배경색과 맞춰서 상단바 이질감 제거
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
    // ★ 1. html과 body를 화면 크기에 딱 맞추고 못 움직이게 완전히 잠급니다 (fixed, overflow-hidden)
    <html lang="ko" className={`${geist.variable} fixed inset-0 w-full h-[100dvh] overflow-hidden`}>
      <body className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-[#fafafa] text-gray-900 [-webkit-tap-highlight-color:transparent]">
        
        {/* 전체 앱 레이아웃 컨테이너 */}
        <div className="flex flex-col w-full h-full max-w-xl mx-auto bg-white shadow-sm relative">
          
          {/* ★ 2. Nav를 위쪽에 고정 (shrink-0을 주어 찌그러지지 않게 함) */}
          <header className="shrink-0 z-50">
            <Nav />
          </header>

          {/* ★ 3. 여기가 핵심! 내용물만 여기서 스크롤됩니다. 
              - flex-1: 남은 공간을 모두 차지
              - overflow-y-auto: 내용이 길면 세로 스크롤 허용
              - overscroll-none: 여기서 고무줄 바운스 현상 차단!
              - [&::-webkit-scrollbar]:hidden [scrollbar-width:none]: 스크롤바 그래픽 완벽 제거!
          */}
          <main className="flex-1 overflow-y-auto overscroll-none [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {children}
          </main>
          
        </div>
        
      </body>
    </html>
  );
}