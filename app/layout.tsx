'use client' // ★ useEffect를 사용하기 위해 클라이언트 컴포넌트로 전환합니다.

import { useEffect } from "react";
import { Geist } from "next/font/google";
import Nav from "@/components/Nav";
import { supabase } from "@/lib/supabase"; // ★ 수파베이스 클라이언트 임포트
import "./globals.css";
import type { Metadata, Viewport } from "next";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// 참고: 'use client' 환경에서는 metadata를 직접 export할 수 없으므로, 
// 실제 프로젝트 환경에 따라 별도의 metadata 파일로 분리하거나 그대로 두셔도 됩니다.
// 여기서는 로직 중심의 수정을 보여드립니다.

export const viewport: Viewport = {
  themeColor: "#fafafa",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // ★ 익명 로그인 로직 추가
  useEffect(() => {
    const initializeAuth = async () => {
      // 1. 현재 세션이 있는지 확인 (이미 로그인된 유저인지)
      const { data: { user } } = await supabase.auth.getUser();

      // 2. 유저 정보가 없다면 자동으로 익명 로그인 실행
      if (!user) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error("익명 로그인 도중 에러가 발생했습니다:", error.message);
        } else {
          console.log("익명 로그인 성공: 새로운 임시 계정이 생성되었습니다.");
        }
      } else {
        console.log("기존 유저 세션을 확인했습니다:", user.id);
      }
    };

    initializeAuth();
  }, []);

  return (
    <html lang="ko" className={`${geist.variable} fixed inset-0 w-full h-[100dvh] overflow-hidden`}>
      <body className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-[#fafafa] text-gray-900 [-webkit-tap-highlight-color:transparent]">
        
        <div className="flex flex-col w-full h-full max-w-xl mx-auto bg-white shadow-sm relative">
          
          <header className="shrink-0 z-50">
            <Nav />
          </header>

          <main className="flex-1 overflow-y-auto overscroll-none [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {children}
          </main>
          
        </div>
        
      </body>
    </html>
  );
}