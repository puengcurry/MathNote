'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { uploadImage } from '@/lib/notes'
import TagEditor from '@/components/TagEditor'

// ★ min-w-0을 추가하여 좁은 화면에서도 input이 삐져나가지 않게 설정
const INPUT = 'flex-1 min-w-0 h-11 px-4 text-[15px] bg-[#fafafa] border border-[#e4e4e4] rounded-xl outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300'
const LABEL = 'text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 block'

export default function WritePage() {
  const router = useRouter()
  const [folder, setFolder] = useState('')
  const [subFolder, setSubFolder] = useState('')
  const [problemText, setProblemText] = useState('')
  const [problemImage, setProblemImage] = useState<File | null>(null)
  const [steps, setSteps] = useState(['', '', '', '', ''])
  const [tags, setTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!folder.trim() || (!problemText.trim() && !problemImage)) {
      alert('폴더와 문제 내용을 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      // 1. 현재 익명 로그인된 유저 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('로그인 세션을 찾을 수 없습니다. 잠시 후 다시 시도해주세요.')
      }

      const problem_img_url = problemImage ? await uploadImage(problemImage) : null
      
      // 2. insert 시 user_id를 포함하여 저장 (본인 데이터 보호의 핵심)
      const { error } = await supabase.from('notes').insert([{
        user_id: user.id, // ★ 익명 유저 ID 추가
        folder: folder.trim(),
        sub_folder: subFolder.trim() || null,
        problem_text: problemText,
        problem_img_url,
        tags,
        step1: steps[0], step2: steps[1], step3: steps[2],
        step4: steps[3], step5: steps[4],
      }])
      
      if (error) throw error
      router.push('/notes')
    } catch (e: any) {
      alert('저장 실패: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    // 하단 고정 버튼 공간을 위해 pb-32 추가
    <div className="max-w-xl mx-auto px-6 py-8 pb-32 space-y-6">
      
      {/* 1. 폴더 섹션 */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <label className={LABEL}>폴더 위치</label>
        <div className="flex gap-2">
          <input type="text" placeholder="예: 미분" value={folder}
            onChange={e => setFolder(e.target.value)} className={INPUT} />
          <input type="text" placeholder="세부 단원 (선택)" value={subFolder}
            onChange={e => setSubFolder(e.target.value)} className={INPUT} />
        </div>
      </section>

      {/* 2. 문제 섹션 */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <label className={LABEL}>문제 내용</label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 h-11 px-4 bg-[#fafafa] border border-[#e4e4e4] rounded-xl cursor-pointer active:scale-[0.98] transition-transform">
            <span className="text-sm font-medium text-gray-500">📷 사진 찍기 / 첨부</span>
            {problemImage && <span className="text-sm text-gray-700 truncate flex-1 text-right">{problemImage.name}</span>}
            <input type="file" accept="image/*" className="hidden"
              onChange={e => setProblemImage(e.target.files?.[0] ?? null)} />
          </label>
          <textarea placeholder="문제의 핵심 텍스트를 적어보세요." value={problemText}
            onChange={e => setProblemText(e.target.value)} rows={4}
            className="w-full px-4 py-3 text-[15px] bg-[#fafafa] border border-[#e4e4e4] rounded-xl outline-none focus:border-gray-400 transition-colors resize-none placeholder:text-gray-300 leading-relaxed" />
        </div>
      </section>

      {/* 3. 태그 섹션 */}
      <TagEditor tags={tags} setTags={setTags} />

      {/* 4. 풀이 흐름 섹션 */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <label className={LABEL}>풀이 흐름 (Thinking Process)</label>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-300 w-4 text-right shrink-0">{i + 1}</span>
              <input type="text" placeholder={`${i + 1}단계 아이디어`} value={step}
                onChange={e => { const s = [...steps]; s[i] = e.target.value; setSteps(s) }}
                className={INPUT} />
            </div>
          ))}
        </div>
      </section>

      {/* ★ 하단 고정 저장 버튼 (진짜 앱 같은 경험) */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 z-50"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 text-[15px] font-bold bg-gray-900 text-white rounded-xl active:scale-[0.96] transition-all disabled:opacity-40 shadow-lg shadow-gray-200"
        >
          {saving ? '노트 저장 중...' : '오늘의 오답 저장하기'}
        </button>
      </div>

    </div>
  )
}