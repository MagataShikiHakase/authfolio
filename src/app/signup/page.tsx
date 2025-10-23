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

    // Supabase Authでユーザー作成
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

    // users テーブルに挿入
    const { error: userInsertError } = await supabase.from('users').insert([
      {
        id: user.id,
        email,
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

    // profiles テーブルに挿入
    const { error: profileInsertError } = await supabase.from('profiles').insert([
      {
        user_id: user.id,
        username,
        avatar_url: '',
      },
    ])

    if (profileInsertError) {
      console.error('profiles insert error:', profileInsertError)
      setError('Failed to create profile record.')
      return
    }

    // 成功したらダッシュボードへ
    router.push('/dashboard')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-800">
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-[90%] max-w-md border border-gray-200">
        <h1 className="text-3xl font-semibold mb-6 text-center tracking-wide text-gray-800">
          Create Your Account
        </h1>

        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-3 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium p-3 rounded-xl shadow-md transition-all duration-300 transform hover:scale-[1.02]"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center text-gray-600">
          <p>Already have an account?</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-2 text-blue-600 hover:text-blue-500 font-medium transition-all"
          >
            Log in →
          </button>
        </div>
      </div>

      <p className="absolute bottom-4 text-sm text-gray-400">
        © {new Date().getFullYear()} Authfolio
      </p>
    </div>
  )
}
