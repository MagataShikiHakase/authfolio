// src/app/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../libs/supabaseClient'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        // ログイン済み → loginページへ
        router.replace('/login')
      } else {
        // 未ログイン → signupページへ
        router.replace('/signup')
      }
    }

    checkUser()
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-lg text-gray-500">Checking authentication...</p>
    </div>
  )
}
