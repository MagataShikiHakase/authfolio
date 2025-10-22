// src/app/signup/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '../../libs/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 1️⃣ Supabase Authでユーザー作成
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    const user = data.user
    if (!user) {
      setError('User creation failed.')
      return
    }

    // 2️⃣ users テーブルにユーザー情報を挿入
    const { error: userInsertError } = await supabase.from('users').insert([
      {
        id: user.id, // auth.users.id と揃える
        email: email,
        first_name: '',
        last_name: '',
        phone: '',
        linkedin_url: '',
        github_url: '',
        major_occupation: '',
      },
    ])

    if (userInsertError) {
      console.error('users insert error:', userInsertError)
      setError('Failed to create user record.')
      return
    }

    // 3️⃣ profiles テーブルにプロフィール情報を挿入
    const { error: profileInsertError } = await supabase.from('profiles').insert([
      {
        user_id: user.id,
        username: username,
        avatar_url: '',
      },
    ])

    if (profileInsertError) {
      console.error('profiles insert error:', profileInsertError)
      setError('Failed to create profile record.')
      return
    }

    // 4️⃣ 成功したらダッシュボードへ
    router.push('/dashboard')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-80">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
        >
          Sign Up
        </button>
      </form>
    </div>
  )
}
