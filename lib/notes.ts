import { supabase } from '@/lib/supabase'

export type Note = {
  id: string
  folder: string
  sub_folder: string | null
  problem_img_url: string | null
  problem_text: string | null
  tags: string[]
  step1: string | null
  step2: string | null
  step3: string | null
  step4: string | null
  step5: string | null
  created_at: string
}

export const PRESET_TAGS = ['접근 못함', '계산 실수', '조건 해석', '시간 부족']

export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const name = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`
  const { error } = await supabase.storage.from('math_images').upload(name, file)
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from('math_images').getPublicUrl(name)
  return publicUrl
}
