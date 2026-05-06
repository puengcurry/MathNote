'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

type Note = {
  id: string
  folder: string
  tags: string[]
  created_at: string
}

export default function StatsPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) // 에러 상태 추가

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('id, folder, tags, created_at')

        if (error) throw error
        if (data) setNotes(data)
      } catch (err) {
        console.error('Error fetching notes:', err)
        setError('데이터를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [])

  // 데이터가 변경될 때만 연산하도록 useMemo 사용
  const { total, thisMonth, thisWeek, sortedTags, maxCount } = useMemo(() => {
    const totalCount = notes.length
    
    // 날짜 계산
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7))
    startOfWeek.setHours(0, 0, 0, 0)

    const monthCount = notes.filter(n => new Date(n.created_at) >= startOfMonth).length
    const weekCount  = notes.filter(n => new Date(n.created_at) >= startOfWeek).length

    // 태그 집계
    const tagCount = notes.reduce((acc, note) => {
      ;(note.tags ?? []).forEach(tag => { 
        acc[tag] = (acc[tag] || 0) + 1 
      })
      return acc
    }, {} as Record<string, number>)

    const sorted = Object.entries(tagCount).sort((a, b) => b[1] - a[1])
    const max = sorted[0]?.[1] ?? 1

    return { 
      total: totalCount, 
      thisMonth: monthCount, 
      thisWeek: weekCount, 
      sortedTags: sorted, 
      maxCount: max 
    }
  }, [notes]) // notes가 변경될 때만 재계산

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-xl mx-auto px-6 py-10">

        {loading ? (
          <p className="text-sm text-gray-300 text-center py-24">불러오는 중...</p>
        ) : error ? (
          <p className="text-sm text-red-400 text-center py-24">{error}</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-gray-300 text-center py-24">저장된 노트가 없습니다.</p>
        ) : (
          <div className="space-y-10">

            {/* 요약 */}
            <section>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-4">요약</p>
              <div className="grid grid-cols-3 divide-x divide-[#e4e4e4] bg-white border border-[#e4e4e4] rounded-xl overflow-hidden">
                {[
                  { label: '전체', value: total },
                  { label: '이번 달', value: thisMonth },
                  { label: '이번 주', value: thisWeek },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col items-center justify-center py-6 gap-1">
                    <span className="text-2xl font-semibold text-gray-900 tabular-nums">{value}</span>
                    <span className="text-xs text-gray-400">{label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 틀린 이유 막대 그래프 */}
            <section>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-4">틀린 이유</p>
              {sortedTags.length === 0 ? (
                <p className="text-sm text-gray-300">태그가 없습니다.</p>
              ) : (
                <div className="bg-white border border-[#e4e4e4] rounded-xl overflow-hidden">
                  {sortedTags.map(([tag, count], i) => (
                    <div
                      key={tag}
                      className={`flex items-center gap-4 px-5 py-4 ${
                        i < sortedTags.length - 1 ? 'border-b border-[#f0f0f0]' : ''
                      }`}
                    >
                      {/* 태그명 */}
                      <span className="text-sm text-gray-700 w-28 shrink-0 truncate">{tag}</span>

                      {/* 막대 */}
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(count / maxCount) * 100}%`,
                            backgroundColor: '#1f2937',
                          }}
                        />
                      </div>

                      {/* 횟수 */}
                      <span className="text-sm text-gray-400 tabular-nums w-8 text-right shrink-0">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        )}

      </div>
    </div>
  )
}