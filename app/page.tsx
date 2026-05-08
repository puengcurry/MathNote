'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { uploadImage } from '@/lib/notes'
import TagEditor from '@/components/TagEditor'

const INPUT = 'flex-1 h-10 px-3.5 text-sm bg-white border border-[#e4e4e4] rounded-lg outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300'
const LABEL = 'text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-3'

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
      const problem_img_url = problemImage ? await uploadImage(problemImage) : null
      const { error } = await supabase.from('notes').insert([{
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
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-xl mx-auto px-6 py-10 space-y-8">

        <section>
          <p className={LABEL}>폴더</p>
          <div className="flex gap-3">
            <input type="text" placeholder="예: 함수" value={folder}
              onChange={e => setFolder(e.target.value)} className={INPUT} />
            <input type="text" placeholder="세부 폴더 (선택)" value={subFolder}
              onChange={e => setSubFolder(e.target.value)} className={INPUT} />
          </div>
        </section>

        <section>
          <p className={LABEL}>문제</p>
          <div className="space-y-3">
            <label className="flex items-center gap-3 h-10 px-3.5 bg-white border border-[#e4e4e4] rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
              <span className="text-sm text-gray-400">이미지 첨부</span>
              {problemImage && <span className="text-sm text-gray-700 truncate">{problemImage.name}</span>}
              <input type="file" accept="image/*" className="hidden"
                onChange={e => setProblemImage(e.target.files?.[0] ?? null)} />
            </label>
            <textarea placeholder="문제 텍스트 (선택)" value={problemText}
              onChange={e => setProblemText(e.target.value)} rows={4}
              className="w-full px-3.5 py-3 text-sm bg-white border border-[#e4e4e4] rounded-lg outline-none focus:border-gray-400 transition-colors resize-none placeholder:text-gray-300 leading-relaxed" />
          </div>
        </section>

        <TagEditor tags={tags} setTags={setTags} />

        <section>
          <p className={LABEL}>풀이 흐름</p>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-300 w-4 text-right shrink-0">{i + 1}</span>
                <input type="text" placeholder={`${i + 1}단계`} value={step}
                  onChange={e => { const s = [...steps]; s[i] = e.target.value; setSteps(s) }}
                  className={INPUT} />
              </div>
            ))}
          </div>
        </section>

        <button onClick={handleSave} disabled={saving}
          className="w-full h-11 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 active:bg-black transition-colors disabled:opacity-40">
          {saving ? '저장 중...' : '저장'}
        </button>

      </div>
    </div>
  )
}
