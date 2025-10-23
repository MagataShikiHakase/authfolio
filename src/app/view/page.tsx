/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// src/app/view/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/libs/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
//import { Plus, X, User, Lock, Home } from 'lucide-react'

export default function PublicPortfolioPage() {
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [sections, setSections] = useState<Record<string, any[]>>({})
  const [contact, setContact] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [pageLoaded, setPageLoaded] = useState(false)
  const [showNameMenu, setShowNameMenu] = useState(false)
  const [showAssistiveMenu, setShowAssistiveMenu] = useState(false)
  const [publicSettings, setPublicSettings] = useState({
    about: false,
    skills: false,
    certificates: false,
    awards: false,
    projects: false,
    achievements: false,
    documents: false,
    contacts: false,
  })
  const [createdPublicId, setCreatedPublicId] = useState<string | null>(null)

  const handleCreatePublicId = async () => {
    if (!user) return alert('ユーザーが未ログインです。')

    const { data, error } = await supabase.from('public_ids').insert([
      {
        user_id: user.id,
        show_about: publicSettings.about,
        show_skills: publicSettings.skills,
        show_certificates: publicSettings.certificates,
        show_awards: publicSettings.awards,
        show_projects: publicSettings.projects,
        show_achievements: publicSettings.achievements,
        show_documents: publicSettings.documents,
        show_contacts: publicSettings.contacts,
      },
    ]).select().single()

    if (error) {
      console.error(error)
      alert('ID作成に失敗しました。')
    } else {
      setCreatedPublicId(data.id)
    }
  }

const buttonClass =
  'min-w-[80px] sm:min-w-[130px] h-[40px] border border-gray-500 text-lg tracking-wide flex items-center justify-center transition hover:bg-black hover:text-white shadow-md hover:shadow-lg hover:scale-105 duration-300';


  // ダークモード保持
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') setDarkMode(true)
  }, [])
  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // スクロール
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        alert('ログインが必要です')
        return
      }

      const { data: userInfo } = await supabase.from('users').select('*').eq('id', user.id).single()
      const { data: setting } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single()
      const { data: contactData } = await supabase.from('contact_links').select('*').eq('user_id', user.id).single()

      const tables = ['about_me', 'skills', 'certificates', 'awards', 'projects', 'achievements', 'documents']
      const fetched: Record<string, any[]> = {}
      for (const table of tables) {
        const toggleKey = `show_${table === 'about_me' ? 'about' : table}`
        if (setting?.[toggleKey]) {
          const { data } = await supabase.from(table).select('*').eq('user_id', user.id)
          fetched[table] = data || []
        }
      }

      setUser(userInfo)
      setSettings(setting)
      setSections(fetched)
      setContact(contactData)
      setPublicSettings({
      about: setting?.show_about ?? false,
      skills: setting?.show_skills ?? false,
      certificates: setting?.show_certificates ?? false,
      awards: setting?.show_awards ?? false,
      projects: setting?.show_projects ?? false,
      achievements: setting?.show_achievements ?? false,
      documents: setting?.show_documents ?? false,
      contacts: setting?.show_contacts ?? false,
    })
      setLoading(false)
      setTimeout(() => setPageLoaded(true), 300)
    }

    fetchData()
  }, [])

  if (loading) return <p className="text-center mt-10">Loading...</p>
  if (!user || !settings) return <p>No data</p>

  const topButtons = [
    { name: 'About Me', show: settings.show_about },
    { name: 'Skills', show: settings.show_skills },
    { name: 'Certificates', show: settings.show_certificates },
    { name: 'Awards', show: settings.show_awards },
  ].filter((b) => b.show)

  const bottomButtons = [
    { name: 'Projects', show: settings.show_projects },
    { name: 'Achievements', show: settings.show_achievements },
    { name: 'Documents', show: settings.show_documents },
    { name: 'Contact/Links', show: settings.show_contacts },
  ].filter((b) => b.show)

  const allButtons = [...topButtons, ...bottomButtons]
  const scrollSections = [
    { id: 'intro', label: 'Intro' },
    ...allButtons.map((b) => ({ id: b.name.toLowerCase().replace(/\s|\//g, ''), label: b.name })),
  ]

  return (
    <AnimatePresence>
      {!pageLoaded && (
        <motion.div
          className="fixed inset-0 bg-black z-50"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
      )}

      <motion.main
        key={darkMode ? 'dark' : 'light'}
        className={`transition-colors duration-500 ${
          darkMode ? 'bg-[#1a1a1a] text-gray-100' : 'bg-[#fdfaf8] text-black'
        } font-['Italiana'] min-h-screen`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* ダークモードトグル */}
        <div className="fixed top-7 right-5 z-50">
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="border border-gray-400 px-3 py-1 rounded text-sm hover:bg-white-200 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? 'Light' : 'Dark'}
          </button>
        </div>
        <header className="fixed top-8 left-10 z-50 text-left">
  {/* hover範囲を親div全体に含める */}
  <div
    className="relative inline-block group"
    onMouseEnter={() => setShowNameMenu(true)}
    onMouseLeave={() => setShowNameMenu(false)}
  >
    {/* 名前ボタン */}
    <button onClick={() => scrollToSection('intro')} className="text-2xl text-left">
      <p>{user.first_name}</p>
      <p>{user.last_name}</p>
    </button>

    {/* メニュー */}
    <AnimatePresence>
      {showNameMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="name-menu absolute top-full left-0 mt-3 min-w-[180px]
                     backdrop-blur-md bg-black/80 shadow-lg border border-gray-700
                     rounded-xl overflow-hidden flex flex-col z-50"
        >
          {scrollSections
            .filter((s) => s.id !== 'intro')
            .map(({ id, label }) => (
              <button
                key={id}
                onClick={() => {
                  scrollToSection(id)
                  setShowNameMenu(false)
                }}
                className="block w-full text-left px-5 py-3 text-white hover:bg-white/10 transition-colors"
              >
                {label}
              </button>
            ))}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
</header>



        {/* スクロールセクション */}
        <div className="snap-y snap-mandatory h-screen overflow-y-scroll scroll-smooth">
          {scrollSections.map(({ id, label }) => (
            <section
              key={id}
              id={id}
              className="snap-start h-screen flex flex-col justify-center items-center px-8 text-center relative"
            >
              {/* intro セクション */}
              {/* intro セクション */}
  {id === 'intro' && (
    <>
    <div className="absolute inset-0 before:absolute before:content-[''] before:left-0 before:top-0 before:w-1/2 before:h-[53%] before:bg-[#808080]" />
    <div className="absolute inset-0 before:absolute before:content-[''] before:right-0 before:top-[83px] before:w-1/2 before:h-[53%] before:bg-[#383c3c]" />
      {/* 右上ボタン */}
<div className="absolute top-6 right-20 flex gap-4 hidden md:flex">
  {topButtons.map((b) => (
    <button
      key={b.name}
      onClick={() => scrollToSection(b.name.toLowerCase().replace(/\s|\//g, ''))}
      className={buttonClass}
    >
      {b.name}
    </button>
  ))}
</div>


      {/* 中央の白い箱 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex flex-col items-center"
      >
        <div className="bg-white text-black px-12 py-12 rounded-2xl shadow-lg -translate-y-13">
          <h1 className="text-6xl mb-4">
            {user.first_name} {user.last_name}
          </h1>
          <p className="text-xl mb-8">{user.major_occupation}</p>
        </div>
      </motion.div>

      {/* 左下のボタン */}
<div className="absolute bottom-24 left-6 flex gap-4 -translate-y-67 z-30 hidden md:flex">
  {bottomButtons.map((b) => (
    <button
      key={b.name}
      onClick={() => scrollToSection(b.name.toLowerCase().replace(/\s|\//g, ''))}
      className={buttonClass}
    >
      {b.name}
    </button>
  ))}
</div>

      {/* Hello 以下 */}
      <div className="mt-36 text-center translate-y-12">
        <h2 className="text-5xl mb-6">Hello.</h2>
        <p className="max-w-2xl mx-auto text-lg leading-relaxed">{user.description}</p>
      </div>
    </>
  )}




              {/* その他セクション */}
              {id !== 'intro' && (
                <motion.div initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}>
                  <h2 className="text-4xl mb-6">{label}</h2>

                  {id === 'aboutme' &&
                    sections.about_me?.map((a) => (
                      <p key={a.id} className="max-w-2xl mx-auto leading-relaxed">
                        {a.description}
                      </p>
                    ))}

                  {id === 'skills' &&
                    sections.skills?.map((s) => (
                      <div key={s.id} className="mb-4">
                        <p className="font-bold">{s.skill_name}</p>
                        <p>{s.description}</p>
                      </div>
                    ))}

                  {id === 'certificates' &&
                    sections.certificates?.map((p) => (
                      <div key={p.id}>
                        <p className="font-bold">{p.certificate_name}</p>
                        <p>{p.description}</p>
                      </div>
                    ))}

                  {id === 'awards' &&
                    sections.awards?.map((p) => (
                      <div key={p.id}>
                        <p className="font-bold">{p.award_name}</p>
                        <p>{p.description}</p>
                      </div>
                    ))}

                  {id === 'projects' &&
                    sections.projects?.map((p) => (
                      <div key={p.id}>
                        <p className="font-bold">{p.project_name}</p>
                        <p>{p.description}</p>
                      </div>
                    ))}

                  {id === 'achievements' &&
                    sections.achievements?.map((p) => (
                      <div key={p.id}>
                        <p className="font-bold">{p.achievement_name}</p>
                        <p>{p.description}</p>
                      </div>
                    ))}

                  { id === 'documents' && (
  <div className="flex flex-wrap justify-center gap-4">
    {sections.documents
      ?.filter((d) => d.is_public)
      .map((d) => (
        <button
          key={d.id}
          onClick={() => window.open(d.document_url, '_blank')}
          className="border px-6 py-2 hover:bg-black hover:text-white transition"
        >
          Download {d.document_name}
        </button>
      ))}

    {sections.documents?.filter((d) => d.is_public).length === 0 && (
      <p className="text-gray-500 mt-4">No public documents available.</p>
    )}
  </div>
)}

                  {id === 'contactlinks' && contact && (
                    <ul className="space-y-2">
                      {contact.email && <li>Email: {contact.email}</li>}
                      {contact.phone && <li>Phone: {contact.phone}</li>}
                      {contact.github_url && <li>GitHub: {contact.github_url}</li>}
                      {contact.linkedin_url && <li>LinkedIn: {contact.linkedin_url}</li>}
                    </ul>
                  )}
                </motion.div>
              )}
            </section>
          ))}
        </div>
        {/* AssistiveTouch ボタン */}
<div className="fixed bottom-10 right-10 z-50">
  {/* メインの丸ボタン */}
  <div className="relative">
    <button
      onClick={() => setShowAssistiveMenu((prev) => !prev)}
      className="w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition"
    >
      ☰
    </button>

    {/* メニュー展開部分 */}
    {showAssistiveMenu && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute bottom-16 right-0 bg-white text-black border rounded-xl shadow-lg p-4 w-60"
      >
        <h3 className="font-semibold mb-3 text-center">Assistive Menu</h3>

        <div className="space-y-2">
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="w-full border px-3 py-2 rounded hover:bg-black hover:text-white transition"
          >
            Dashboard
          </button>
          <button
            onClick={() => (window.location.href = '/account')}
            className="w-full border px-3 py-2 rounded hover:bg-black hover:text-white transition"
          >
            Account
          </button>
        </div>

        <hr className="my-3" />

        <div className="space-y-2">
          <p className="text-sm font-medium">Access Level</p>
          {[
  'about',
  'skills',
  'certificates',
  'awards',
  'projects',
  'achievements',
  'documents',
  'contacts',
].map((key) => (
  <div key={key} className="flex items-center justify-between">
    <span>{key}</span>
    <input
      type="checkbox"
      checked={publicSettings[key]}
      onChange={async (e) => {
        const newValue = e.target.checked

        // 1. state を更新
        setPublicSettings((prev) => ({
          ...prev,
          [key]: newValue,
        }))

        setSettings((prev: any) => ({ ...prev, [`show_${key}`]: newValue }))

        // 2. DB に即時反映
        if (user) {
          const column = `show_${key}` // user_settings のカラム名
          const { error } = await supabase
            .from('user_settings')
            .update({ [column]: newValue })
            .eq('user_id', user.id)

          if (error) {
            console.error(`Failed to update ${column}`, error)
            alert(`Failed to update: ${key}`)
          }
        }
      }}
    />
  </div>
))}

        </div>

        <button
          onClick={handleCreatePublicId}
          className="mt-4 w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Create a shareable ID
        </button>

        {createdPublicId && (
          <div className="mt-3 text-xs break-all">
            <p>Please share this ID with the person you want to give access to:</p>
            <code className="block bg-gray-100 p-2 rounded mt-1">
              {createdPublicId}
            </code>
            <p className="mt-1 text-red-500">
              ※ If you change the visibility settings, you’ll need to generate a new ID.
            </p>
          </div>
        )}
      </motion.div>
    )}
  </div>
</div>

      </motion.main>
    </AnimatePresence>
  )
}
