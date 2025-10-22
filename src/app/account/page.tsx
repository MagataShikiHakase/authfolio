
// src/app/account/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/libs/supabaseClient'
import { Eye, EyeOff, Copy, Trash2, Mail } from 'lucide-react'

type SectionSetting = {
  show_about: boolean
  show_skills: boolean
  show_certificates: boolean
  show_awards: boolean
  show_projects: boolean
  show_achievements: boolean
  show_documents: boolean
  show_contacts: boolean
}

type PublicID = {
  id: string
  password: string | null
  user_id: string
  created_at: string
  show_about: boolean
  show_skills: boolean
  show_certificates: boolean
  show_awards: boolean
  show_projects: boolean
  show_achievements: boolean
  show_documents: boolean
  show_contacts: boolean
}

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [settings, setSettings] = useState<SectionSetting | null>(null)
  const [publicIDs, setPublicIDs] = useState<PublicID[]>([])
  const [message, setMessage] = useState('')

  // ========== 初期データ読み込み ==========
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)
      setEmail(user.email || '')

      // username取得
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single()
      if (profileData?.username) setUsername(profileData.username)

      // settings取得
      const { data: settingData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (settingData) setSettings(settingData)

      // public_ids取得
      const { data: publicData } = await supabase
        .from('public_ids')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (publicData) setPublicIDs(publicData)
    }

    loadData()
  }, [])

  // ======= username / email / password 更新関数 =======
  const handleSaveUsername = async () => {
    if (!username.trim()) return alert('Please enter a username.')
    const { error } = await supabase.from('profiles').update({ username }).eq('user_id', user.id)
    if (error) setMessage('❌ Failed to update username.')
    else setMessage('✅ Username updated.')
  }

  const handleSaveEmail = async () => {
    if (!email.trim()) return alert('Please enter an email.')
    const { error } = await supabase.auth.updateUser({ email })
    if (error) setMessage('❌ Failed to update email.')
    else setMessage('✅ Email updated.')
  }

  const handleSavePassword = async () => {
    if (!password.trim()) return alert('Enter password.')
    if (password !== confirmPassword) return alert('Passwords do not match.')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setMessage('❌ Failed to update password.')
    else setMessage('✅ Password updated.')
    setPassword('')
    setConfirmPassword('')
  }

  // ======= 公開設定変更 =======
  const handleVisibilityChange = async (field: keyof SectionSetting, value: boolean) => {
    if (!user) return
    const newSettings = { ...settings, [field]: value }
    setSettings(newSettings)

    const { error } = await supabase
      .from('user_settings')
      .update({ [field]: value })
      .eq('user_id', user.id)

    if (error) setMessage('❌ Failed to update visibility.')
    else setMessage(`✅ ${field.replace('show_', '')} updated.`)
  }

  // ======= 公開パスワード関連 =======
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setMessage('📋 Copied to clipboard!')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this public link?')) return
    const { error } = await supabase.from('public_ids').delete().eq('id', id)
    if (error) return alert('Failed to delete.')
    setPublicIDs(publicIDs.filter((p) => p.id !== id))
    setMessage('🗑️ Deleted successfully.')
  }

  const handleEmailShare = (id: string, password: string | null) => {
    const url = `${window.location.origin}/access`
    const subject = encodeURIComponent('Shared Online Resume Access')
    const body = encodeURIComponent(
      `Here is the shared online resume link:\n${url}\n${id ? `ID: ${id}` : ''}`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  if (!settings)
    return <p className="text-center mt-10 text-gray-600">Loading...</p>

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-6 py-12">
      {/* ===== ナビバー ===== */}
      <nav className="flex justify-center mb-8 gap-6 border-b pb-3">
        {[
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Account', path: '/account' },
          { name: 'View', path: '/view' },
        ].map((item) => (
          <button
            key={item.name}
            onClick={() => (window.location.href = item.path)}
            className={`px-4 py-2 rounded-md font-medium transition ${
              item.path === '/account'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
            }`}
          >
            {item.name}
          </button>
        ))}
      </nav>

      <h1 className="text-4xl font-bold text-center mb-10">Account Settings</h1>

      <div className="max-w-4xl mx-auto space-y-10">
        {/* ===== USER INFO ===== */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Profile</h2>
          <div className="space-y-4">
            {/* Username */}
            <div className="flex gap-3">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg p-2"
              />
              <button
                onClick={handleSaveUsername}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>

            {/* Email */}
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg p-2"
              />
              <button
                onClick={handleSaveEmail}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>

            {/* Password */}
            <div>
              <div className="relative mb-3">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="Confirm password"
              />

              <button
                onClick={handleSavePassword}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Save Password
              </button>
            </div>
          </div>
        </section>

<section>
  <h2 className="text-xl font-semibold mb-4">Auto Delete Shared Links</h2>
  <p className="text-gray-600 mb-3">
    Automatically delete shared public links 30 days after creation.
  </p>

  <div className="flex items-center gap-4">
    {/* <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${
        settings.auto_delete_public_ids ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-800'
      }`}
    >
      {settings.auto_delete_public_ids ? 'Enabled' : 'Disabled'}
    </span> */}

    <button
      onClick={async () => {
        const newValue = !settings.auto_delete_public_ids
        setSettings({ ...settings, auto_delete_public_ids: newValue })

        const { error } = await supabase
          .from('user_settings')
          .update({ auto_delete_public_ids: newValue })
          .eq('user_id', user.id)

        if (error) setMessage('❌ Failed to update auto delete setting.')
        else setMessage(`✅ Auto delete ${newValue ? 'enabled' : 'disabled'}.`)
      }}
      className={`px-4 py-2 rounded-lg font-semibold transition ${
        settings.auto_delete_public_ids
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {settings.auto_delete_public_ids ? 'Disable' : 'Enable'}
    </button>
  </div>
</section>

        {/* ===== 公開パスワード管理 ===== */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">🔑 Public Access Management</h2>

          {publicIDs.length === 0 ? (
            <p className="text-gray-600">No shared links yet.</p>
          ) : (
            <div className="space-y-4">
              {publicIDs.map((p) => (
                <div
                  key={p.id}
                  className="border rounded-lg p-4 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-lg mb-1">Link ID: {p.id}</p>
                    {/* <p className="text-sm text-gray-600">
                      {p.password ? `Password: ${p.password}` : 'No password'}
                    </p> */}
                    <p className="text-xs text-gray-500 mt-1">
                      Visible: {Object.keys(p)
                        .filter((k) => k.startsWith('show_') && p[k as keyof PublicID])
                        .map((k) => k.replace('show_', ''))
                        .join(', ') || 'None'}
                    </p>
                  </div>

                  <div className="flex gap-3 mt-3 sm:mt-0">
                    <button
                      onClick={() => handleCopy(p.password || '')}
                      className="flex items-center gap-1 border px-3 py-1 rounded hover:bg-gray-100"
                    >
                      <Copy size={16} /> Copy
                    </button>

                    <button
                      onClick={() => handleEmailShare(p.id, p.password)}
                      className="flex items-center gap-1 border px-3 py-1 rounded hover:bg-gray-100"
                    >
                      <Mail size={16} /> Email
                    </button>

                    <button
                      onClick={() => handleDelete(p.id)}
                      className="flex items-center gap-1 border px-3 py-1 rounded hover:bg-red-100 text-red-600"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ===== VISIBILITY SETTINGS ===== */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Section Visibility</h2>
          <div className="space-y-4">
            {Object.keys(settings)
              .filter((k) => k.startsWith('show_'))
              .map((key) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-medium capitalize">{key.replace('show_', '')}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleVisibilityChange(key as keyof SectionSetting, true)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        settings[key as keyof SectionSetting]
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 hover:bg-green-100'
                      }`}
                    >
                      Public
                    </button>
                    <button
                      onClick={() => handleVisibilityChange(key as keyof SectionSetting, false)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        !settings[key as keyof SectionSetting]
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 hover:bg-red-100'
                      }`}
                    >
                      Private
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* ===== メッセージ ===== */}
        {message && <p className="text-center text-sm text-gray-700 mt-6">{message}</p>}
      </div>
    </div>
  )
}
