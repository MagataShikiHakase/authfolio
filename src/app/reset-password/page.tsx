'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../libs/supabaseClient'
import { motion } from 'framer-motion'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`, // リンククリック後の遷移先
    })

    if (error) setError(error.message)
    else setMessage('✅ Password reset link has been sent to your email.')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-800 relative overflow-hidden">
      {/* subtle floating circles for depth */}
      <div className="absolute w-64 h-64 bg-green-100 rounded-full blur-3xl top-10 left-10 opacity-40 animate-pulse"></div>
      <div className="absolute w-72 h-72 bg-blue-100 rounded-full blur-3xl bottom-10 right-10 opacity-40 animate-pulse"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-[90%] max-w-md border border-gray-200 relative z-10"
      >
        <h1 className="text-3xl font-semibold mb-6 text-center tracking-wide text-gray-800">
          Reset Password
        </h1>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}
        {message && <p className="text-green-600 text-center mb-3">{message}</p>}

        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
            required
          />

          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white font-medium p-3 rounded-xl shadow-md transition-all duration-300 transform hover:scale-[1.02]"
          >
            Send Reset Link
          </button>
        </form>

        {/* 🔹 loginページへ戻る */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">Remembered your password?</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-2 text-green-600 hover:text-green-500 font-medium transition-all"
          >
            Back to Login →
          </button>
        </div>
      </motion.div>

      <p className="absolute bottom-4 text-sm text-gray-400 z-10">
        © {new Date().getFullYear()} Authfolio
      </p>
    </div>
  )
}
