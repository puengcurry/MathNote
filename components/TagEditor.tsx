'use client'

import { useState } from 'react'
import { PRESET_TAGS } from '@/lib/notes'

const pill = 'h-7 px-3 text-xs rounded-full border transition-colors'

export default function TagEditor({
  tags,
  setTags,
}: {
  tags: string[]
  setTags: (tags: string[]) => void
}) {
  const [custom, setCustom] = useState('')

  const toggle = (tag: string) =>
    setTags(tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag])

  const add = () => {
    const t = custom.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setCustom('')
  }

  const customTags = tags.filter(t => !PRESET_TAGS.includes(t))

  return (
    <div>
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2.5">틀린 이유</p>
      <div className="flex flex-wrap gap-2 mb-2.5">
        {PRESET_TAGS.map(tag => (
          <button key={tag} onClick={() => toggle(tag)}
            className={`${pill} ${tags.includes(tag)
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-500 border-[#e4e4e4] hover:border-gray-400'}`}>
            {tag}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="직접 입력 후 Enter"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          className="flex-1 h-9 px-3.5 text-sm bg-white border border-[#e4e4e4] rounded-lg outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300"
        />
        <button onClick={add}
          className="h-9 px-4 text-sm text-gray-500 bg-white border border-[#e4e4e4] rounded-lg hover:border-gray-400 transition-colors">
          추가
        </button>
      </div>
      {customTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {customTags.map(tag => (
            <span key={tag}
              className="inline-flex items-center gap-1.5 h-7 px-3 text-xs bg-gray-900 text-white rounded-full">
              {tag}
              <button onClick={() => toggle(tag)} className="opacity-50 hover:opacity-100">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
