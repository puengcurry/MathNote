'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadImage, type Note } from '@/lib/notes'
import TagEditor from '@/components/TagEditor'

const INPUT = 'flex-1 min-w-0 h-10 px-3.5 text-sm bg-[#fafafa] border border-[#e4e4e4] rounded-lg outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300'
const SUBLABEL = 'text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2.5'

function NoteCard({ note, onDelete }: { note: Note; onDelete: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [folder, setFolder] = useState(note.folder)
  const [subFolder, setSubFolder] = useState(note.sub_folder ?? '')
  const [problemText, setProblemText] = useState(note.problem_text ?? '')
  const [tags, setTags] = useState<string[]>(note.tags ?? [])
  const [newImage, setNewImage] = useState<File | null>(null)
  const [imgUrl, setImgUrl] = useState(note.problem_img_url)
  const [steps, setSteps] = useState([
    note.step1 ?? '', note.step2 ?? '', note.step3 ?? '', note.step4 ?? '', note.step5 ?? '',
  ])

  const handleUpdate = async () => {
    if (!folder.trim()) { alert('폴더명을 입력해주세요.'); return }
    setSaving(true)
    try {
      const problem_img_url = newImage ? await uploadImage(newImage) : imgUrl
      const { error } = await supabase.from('notes').update({
        folder: folder.trim(), sub_folder: subFolder.trim() || null,
        problem_text: problemText, problem_img_url, tags,
        step1: steps[0], step2: steps[1], step3: steps[2], step4: steps[3], step5: steps[4],
      }).eq('id', note.id)
      if (error) throw error
      setImgUrl(problem_img_url)
      setNewImage(null)
      setIsEditing(false)
    } catch (e: any) {
      alert('수정 실패: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('삭제할까요?')) return
    const { error } = await supabase.from('notes').delete().eq('id', note.id)
    if (error) alert('삭제 실패: ' + error.message)
    else onDelete(note.id)
  }

  const viewSteps = [note.step1, note.step2, note.step3, note.step4, note.step5].filter(Boolean)

  if (isEditing) {
    return (
      <div className="bg-white border border-[#e4e4e4] rounded-xl p-5 mb-3">
        <p className={`${SUBLABEL} mb-5`}>수정</p>
        <div className="space-y-5">
          <div>
            <p className={SUBLABEL}>폴더</p>
            <div className="flex gap-2">
              <input type="text" value={folder} onChange={e => setFolder(e.target.value)} className={INPUT} />
              <input type="text" value={subFolder} placeholder="세부 폴더 (선택)"
                onChange={e => setSubFolder(e.target.value)} className={INPUT} />
            </div>
          </div>
          <div>
            <p className={SUBLABEL}>문제 이미지</p>
            {imgUrl && !newImage && (
              <div className="mb-2.5">
                <img src={imgUrl} alt="" className="w-full h-auto rounded-lg border border-[#e4e4e4] mb-2" />
                <button onClick={() => setImgUrl(null)} className="text-xs text-red-400 hover:text-red-600">이미지 제거</button>
              </div>
            )}
            <label className="flex items-center h-10 px-3.5 bg-[#fafafa] border border-[#e4e4e4] rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
              <span className="text-sm text-gray-400">{newImage ? newImage.name : '이미지 교체'}</span>
              <input type="file" accept="image/*" className="hidden"
                onChange={e => setNewImage(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <div>
            <p className={SUBLABEL}>문제 텍스트</p>
            <textarea value={problemText} onChange={e => setProblemText(e.target.value)} rows={4}
              className="w-full px-3.5 py-3 text-sm bg-[#fafafa] border border-[#e4e4e4] rounded-lg outline-none focus:border-gray-400 transition-colors resize-none leading-relaxed" />
          </div>
          <TagEditor tags={tags} setTags={setTags} />
          <div>
            <p className={SUBLABEL}>풀이 흐름</p>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-300 w-4 text-right shrink-0">{i + 1}</span>
                  <input type="text" value={step} placeholder={`${i + 1}단계`}
                    onChange={e => { const s = [...steps]; s[i] = e.target.value; setSteps(s) }}
                    className={INPUT} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={handleUpdate} disabled={saving}
            className="flex-1 h-10 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40">
            {saving ? '저장 중...' : '저장'}
          </button>
          <button onClick={() => setIsEditing(false)}
            className="flex-1 h-10 text-sm text-gray-500 bg-white border border-[#e4e4e4] rounded-lg hover:border-gray-400 transition-colors">
            취소
          </button>
        </div>
        <button onClick={handleDelete}
          className="w-full mt-2 h-10 text-sm text-red-400 bg-white border border-red-100 rounded-lg hover:border-red-300 hover:text-red-600 transition-colors">
          삭제
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#e4e4e4] rounded-xl p-5 mb-3">
      <div className="flex items-center justify-between mb-4">
        {/* ★ 폴더 영역 말줄임표 처리 */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-3">
          <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md shrink-0">{note.folder}</span>
          {note.sub_folder && (
            <span className="text-xs text-gray-400 bg-gray-50 border border-[#e4e4e4] px-2.5 py-1 rounded-md truncate max-w-[120px]">{note.sub_folder}</span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-300 tabular-nums">
            {new Date(note.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
          </span>
          <button onClick={() => setIsEditing(true)} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">수정</button>
        </div>
      </div>
      {imgUrl && <img src={imgUrl} alt="" className="w-full h-auto rounded-lg border border-[#e4e4e4] mb-4" />}
      {note.problem_text && (
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">{note.problem_text}</p>
      )}
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {note.tags.map(tag => (
            <span key={tag} className="h-6 px-2.5 inline-flex items-center text-xs text-gray-500 border border-[#e4e4e4] rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
      {viewSteps.length > 0 && (
        <div>
          <button onClick={() => setIsOpen(!isOpen)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            {isOpen ? '풀이 접기 ↑' : '풀이 보기 ↓'}
          </button>
          {isOpen && (
            <div className="mt-3 pt-3 border-t border-[#f0f0f0] space-y-2.5">
              {viewSteps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-xs text-gray-300 tabular-nums mt-0.5 shrink-0">{i + 1}.</span>
                  <p className="text-sm text-gray-600 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FolderBox({ label, count, selected, onClick }: {
  label: string; count: number; selected: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center shrink-0 gap-1.5 active:scale-[0.97] transition">
      <div className={`flex items-center justify-center font-semibold rounded-xl transition-colors w-14 h-14 text-lg
        ${selected ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-[#e4e4e4] hover:border-gray-400'}`}>
        {count}
      </div>
      <span className={`font-medium text-center truncate text-[11px] w-16
        ${selected ? 'text-gray-900' : 'text-gray-400'}`} title={label}>
        {label}
      </span>
    </button>
  )
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedSubFolder, setSelectedSubFolder] = useState<string | null>(null)

  // ★ 에러 핸들링이 추가된 useEffect
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          alert('데이터를 불러오지 못했습니다: ' + error.message)
        } else if (data) {
          setNotes(data)
        }
      } catch (err: any) {
        alert('네트워크 에러: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchNotes()
  }, [])

  const folderStats = notes.reduce((acc, n) => {
    const f = n.folder || '미분류'; acc[f] = (acc[f] || 0) + 1; return acc
  }, {} as Record<string, number>)

  const subFolderStats = selectedFolder
    ? notes.filter(n => (n.folder || '미분류') === selectedFolder)
        .reduce((acc, n) => { if (n.sub_folder) acc[n.sub_folder] = (acc[n.sub_folder] || 0) + 1; return acc }, {} as Record<string, number>)
    : {}

  const filteredNotes = notes.filter(n => {
    if (!selectedFolder) return true
    if ((n.folder || '미분류') !== selectedFolder) return false
    return !selectedSubFolder || n.sub_folder === selectedSubFolder
  })

  const selectMain = (f: string | null) => { setSelectedFolder(f); setSelectedSubFolder(null) }

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-[#fafafa]"> {/* 헤더 높이만큼 뺌 */}
      <div className="max-w-xl mx-auto px-6 py-8 pb-24"> {/* 하단 여백 확보 */}
        {!loading && notes.length > 0 && (
          <div className="mb-8">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-4">전체 {notes.length}문제</p>
            
            {/* 1층: 메인 폴더 스크롤 */}
            <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              <FolderBox label="전체" count={notes.length} selected={!selectedFolder} onClick={() => selectMain(null)} />
              {Object.entries(folderStats).map(([name, count]) => (
                <FolderBox key={name} label={name} count={count}
                  selected={selectedFolder === name}
                  onClick={() => selectMain(name)} />
              ))}
            </div>

            {/* 2층: 세부 폴더 랩핑 영역 */}
            {selectedFolder && Object.keys(subFolderStats).length > 0 && (
              <div className="mt-3 p-3 bg-white border border-[#e4e4e4] rounded-xl flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSubFolder(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !selectedSubFolder ? 'bg-gray-800 text-white' : 'bg-[#fafafa] text-gray-500 border border-[#e4e4e4] hover:border-gray-400'
                  }`}
                >
                  전체 ({folderStats[selectedFolder]})
                </button>
                {Object.entries(subFolderStats).map(([sub, sc]) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubFolder(selectedSubFolder === sub ? null : sub)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors max-w-[150px] truncate ${
                      selectedSubFolder === sub ? 'bg-gray-800 text-white' : 'bg-[#fafafa] text-gray-500 border border-[#e4e4e4] hover:border-gray-400'
                    }`}
                  >
                    {sub} <span className="opacity-60 ml-0.5 font-normal">{sc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-24">불러오는 중...</p>
        ) : filteredNotes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-24">저장된 노트가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map(note => (
              <NoteCard key={note.id} note={note} onDelete={id => setNotes(prev => prev.filter(n => n.id !== id))} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}