'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadImage, type Note } from '@/lib/notes'
import TagEditor from '@/components/TagEditor'

const INPUT = 'flex-1 h-10 px-3.5 text-sm bg-[#fafafa] border border-[#e4e4e4] rounded-lg outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300'
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
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">{note.folder}</span>
          {note.sub_folder && (
            <span className="text-xs text-gray-400 bg-gray-50 border border-[#e4e4e4] px-2.5 py-1 rounded-md">{note.sub_folder}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
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

function FolderBox({ label, count, selected, onClick, small = false }: {
  label: string; count: number; selected: boolean; onClick: () => void; small?: boolean
}) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center shrink-0 ${small ? 'gap-1' : 'gap-1.5'}`}>
      <div className={`flex items-center justify-center font-semibold rounded-xl transition-colors
        ${small ? 'w-10 h-10 text-sm' : 'w-14 h-14 text-lg'}
        ${selected ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-[#e4e4e4] hover:border-gray-400'}`}>
        {count}
      </div>
      <span className={`font-medium text-center truncate ${small ? 'text-[10px] w-12' : 'text-[11px] w-16'}
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

  useEffect(() => {
    supabase.from('notes').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setNotes(data); setLoading(false) })
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
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-xl mx-auto px-6 py-10">
        {!loading && notes.length > 0 && (
          <div className="mb-8">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-4">전체 {notes.length}문제</p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              <FolderBox label="전체" count={notes.length} selected={!selectedFolder} onClick={() => selectMain(null)} />
              {Object.entries(folderStats).map(([name, count]) => (
                <div key={name} className="flex items-start gap-2 shrink-0">
                  <FolderBox label={name} count={count}
                    selected={selectedFolder === name && !selectedSubFolder}
                    onClick={() => selectMain(name)} />
                  {selectedFolder === name && Object.keys(subFolderStats).length > 0 && (
                    <div className="flex gap-2 pt-2">
                      {Object.entries(subFolderStats).map(([sub, sc]) => (
                        <FolderBox key={sub} label={sub} count={sc} small
                          selected={selectedSubFolder === sub}
                          onClick={() => setSelectedSubFolder(selectedSubFolder === sub ? null : sub)} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {loading ? (
          <p className="text-sm text-gray-300 text-center py-24">불러오는 중...</p>
        ) : filteredNotes.length === 0 ? (
          <p className="text-sm text-gray-300 text-center py-24">저장된 노트가 없습니다.</p>
        ) : (
          filteredNotes.map(note => (
            <NoteCard key={note.id} note={note} onDelete={id => setNotes(prev => prev.filter(n => n.id !== id))} />
          ))
        )}
      </div>
    </div>
  )
}
