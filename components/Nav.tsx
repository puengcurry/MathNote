'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/',       label: '작성' },
  { href: '/notes',  label: '목록' },
  { href: '/stats',  label: '통계' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-[#e4e4e4]">
      <div className="max-w-xl mx-auto px-6 h-12 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900 tracking-tight">오답 노트</span>
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  active
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
