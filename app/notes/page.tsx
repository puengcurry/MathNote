'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { type Note } from '@/lib/notes'

export default function PracticePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>(['', '', '', '', ''])

  useEffect(() => {
    if (!params?.id) {
      setLoading(false)
      return
    }
    const fetchNote = async () => {
      const { data, error } = await supabase.from('notes').select('*').eq('id', params.id).single()
      if (error) {
        alert('노트를 불러오는 데 실패했습니다.')
        router.back()
      } else {
        setNote(data)
      }
      setLoading(false)
    }
    fetchNote()
  }, [params, router])

  if (loading) return <p>불러오는 중...</p>
  if (!note) return <p>노트를 찾을 수 없습니다.</p>

  const steps = [note.step1, note.step2, note.step3, note.step4, note.step5].filter(Boolean)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAnswers = [...answers]
    newAnswers[currentStep] = e.target.value
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1)
  }

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  return (
    <div>
      <h1>{note.folder} - {note.sub_folder}</h1>
      <p>{note.problem_text}</p>
      <img src={note.problem_img_url ?? ''} alt="문제 이미지" />
      <div>
        <p>{steps[currentStep]}</p>
        <input type="text" value={answers[currentStep]} onChange={handleChange} />
        <div>
          <button onClick={handlePrev} disabled={currentStep === 0}>이전</button>
          <button onClick={handleNext} disabled={currentStep === steps.length - 1}>다음</button>
        </div>
      </div>
    </div>
  )
}
