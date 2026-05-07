'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PracticePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [note, setNote] = useState<{
    id: string
    practice_count?: number
    last_practiced_at?: string
    problem_img_url?: string
    problem_text?: string
    step1?: string
    step2?: string
    step3?: string
    step4?: string
    step5?: string
  } | null>(null)
  const [showSolution, setShowSolution] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchNote = async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (error) {
        alert('데이터를 불러오지 못했습니다.')
        router.back()
        return
      }
      if (!isMounted) return

      setNote(data)
      setLoading(false)
    }

    fetchNote()

    return () => {
      isMounted = false
    }
  }, [params.id, router])

  const handleShowSolution = async () => {
    if (showSolution || !note) return

    setShowSolution(true)

    const nextPracticeCount = (note.practice_count || 0) + 1

    setNote({
      ...note,
      practice_count: nextPracticeCount,
      last_practiced_at: new Date().toISOString()
    })

    const { error } = await supabase
      .from('notes')
      .update({ 
        practice_count: nextPracticeCount,
        last_practiced_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (error) {
      console.error('practice_count 업데이트 실패:', error)
    }
  }

  const solutionSteps = useMemo(() => {
    if (!note) return []

    return [note.step1, note.step2, note.step3, note.step4, note.step5]
      .filter(Boolean)
  }, [note])

  if (loading) {
    return (
      <div className="min-h-[calc(100dvh-5rem)] bg-[#fafafa] flex items-center justify-center">
        <p className="text-sm text-gray-400">문제 준비 중...</p>
      </div>
    )
  }

  if (!note) return null

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-[#fafafa]">
      <div className="max-w-xl mx-auto p-6 pb-32 space-y-6">
      
      {/* 헤더 및 뒤로가기 */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          ← 목록으로
        </button>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          복습 모드 (현재 {note.practice_count || 0}회째)
        </span>
      </div>

      {/* 문제 영역 (항상 보임) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-4">
          Question
        </h3>
        {note.problem_img_url && (
          <img 
            src={note.problem_img_url} 
            alt="수학 문제 이미지"
            loading="lazy"
            className="w-full h-auto rounded-lg border border-[#e4e4e4] mb-4 object-contain"
          />
        )}
        {note.problem_text && (
          <p className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap">
            {note.problem_text}
          </p>
        )}
      </div>

      {/* 하단 고정 액션 영역 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 z-50 pb-safe">
        {!showSolution ? (
          <button 
            onClick={handleShowSolution} 
            className="w-full h-12 text-[15px] font-bold bg-gray-900 text-white rounded-xl active:scale-[0.985] transition-all shadow-lg shadow-gray-200"
          >
            정답 및 풀이 확인하기
          </button>
        ) : (
          <button 
            onClick={() => router.back()} 
            className="w-full h-12 text-[15px] font-bold bg-white text-gray-900 border border-gray-200 rounded-xl active:scale-[0.985] transition-all"
          >
            복습 완료 (목록으로)
          </button>
        )}
      </div>

      {/* 정답(풀이) 영역 (버튼 누른 후 보임) */}
      {showSolution && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-[11px] font-bold text-green-600 uppercase tracking-wider mb-4">
            Solution
          </h3>
          <div className="space-y-3">
            {solutionSteps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-xs font-bold text-gray-400 w-4 text-right shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-[15px] text-gray-700 leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
            {!note.step1 && !note.step2 && (
              <p className="text-sm text-gray-400 text-center py-4">저장된 풀이 과정이 없습니다.</p>
            )}
          </div>
        </div>
      )}

      </div>
    </div>
  )
}