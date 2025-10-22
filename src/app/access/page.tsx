'use client'

import { useState } from 'react'
import { supabase } from '@/libs/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AccessPage() {
  const [inputId, setInputId] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!inputId.trim()) {
      setError('IDを入力してください。')
      return
    }

    // Supabase で public_ids テーブルを確認
    const { data, error: fetchError } = await supabase
      .from('public_ids')
      .select('id')
      .eq('id', inputId.trim())
      .single()

    if (fetchError || !data) {
      setError('Invalid ID')
      return
    }

    // 成功したら /view/[id] にリダイレクト
    router.push(`/view/${inputId.trim()}`)
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-80"
      >
        <h2 className="text-black text-xl font-semibold mb-6 text-center">Access</h2>

        <input
          type="text"
          placeholder="Enter a shared ID"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          className="text-black w-full border p-2 rounded mb-4"
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          View
        </button>
      </form>
    </div>
  )
}
