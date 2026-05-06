import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '오답 노트 - My Math Note',
    short_name: 'MathNote',
    description: '스마트폰으로 간편하게 기록하는 나만의 수학 오답 노트',
    start_url: '/',
    display: 'standalone',      // 브라우저 주소창을 숨기고 네이티브 앱처럼 띄움
    orientation: 'portrait',    // 스마트폰을 눕혀도 화면이 돌아가지 않고 세로로 고정됨
    background_color: '#f9fafb', // 앱을 처음 켤 때 나오는 로딩 화면의 배경색 (gray-50과 맞춤)
    theme_color: '#ffffff',     // 앱 상단 상태표시줄(시간/배터리 있는 곳) 색상
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',     // 안드로이드에서 동그랗거나 네모난 모양에 맞게 아이콘을 꽉 채워줌
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}