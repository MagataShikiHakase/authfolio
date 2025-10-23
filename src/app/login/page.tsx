'use client'

import { useState } from 'react'
import { signIn } from '../../utils/auth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-800">
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-[90%] max-w-md border border-gray-200">
        <h1 className="text-3xl font-semibold mb-6 text-center tracking-wide text-gray-800">
          Welcome Back
        </h1>

        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
            required
          />

          {/* 🔹 パスワードリセットリンク */}
          <div className="text-right -mt-2">
            <button
              type="button"
              onClick={() => router.push('/reset-password')}
              className="text-sm text-green-600 hover:text-green-500 transition-all"
            >
              Forgot your password?
            </button>
          </div>

          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white font-medium p-3 rounded-xl shadow-md transition-all duration-300 transform hover:scale-[1.02]"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-gray-600">
          <p>Don’t have an account?</p>
          <button
            onClick={() => router.push('/signup')}
            className="mt-2 text-green-600 hover:text-green-500 font-medium transition-all"
          >
            Create one →
          </button>
        </div>
      </div>

      <p className="absolute bottom-4 text-sm text-gray-400">
        © {new Date().getFullYear()} Authfolio
      </p>
    </div>
  )
}
