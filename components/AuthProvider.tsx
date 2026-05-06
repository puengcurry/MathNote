'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        await supabase.auth.signInAnonymously()
      }
    }
    initializeAuth()
  }, [])

  return <>{children}</>
}