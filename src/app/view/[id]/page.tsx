'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/libs/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'

export default function SharedPortfolioPage() {
  const { id } = useParams() // URLの:id部分を取得
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [sections, setSections] = useState<Record<string, any[]>>({})
  const [contact, setContact] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [pageLoaded, setPageLoaded] = useState(false)
  const [showMenu, setShowMenu] = useState(false)


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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // ① public_idsから共有設定取得
      const { data: publicData, error } = await supabase
        .from('public_ids')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !publicData) {
        alert('この共有IDは存在しません。')
        return
      }

      // ② 対応するユーザー情報取得
      const { data: userInfo } = await supabase.from('users').select('*').eq('id', publicData.user_id).single()
      const { data: contactData } = await supabase.from('contact_links').select('*').eq('user_id', publicData.user_id).single()

      // ③ 各テーブルをboolに従って取得
      const tables = ['about_me', 'skills', 'certificates', 'awards', 'projects', 'achievements', 'documents']
      const fetched: Record<string, any[]> = {}
      for (const table of tables) {
        const key = `show_${table === 'about_me' ? 'about' : table}`
        if (publicData[key]) {
          const { data } = await supabase.from(table).select('*').eq('user_id', publicData.user_id)
          fetched[table] = data || []
        }
      }

      setUser(userInfo)
      setContact(contactData)
      setSettings(publicData)
      setSections(fetched)

      setLoading(false)
      setTimeout(() => setPageLoaded(true), 300)
    }

    fetchData()
  }, [id])

  if (loading) return <p className="text-center mt-10">Loading...</p>
  if (!user || !settings) return <p>No data</p>

  // 表示ボタン生成（boolで絞る）
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

        {/* 左上 名前 */}
        <header
          className="fixed top-8 left-10 z-50 text-left group"
          onMouseEnter={() => setShowMenu(true)}
          onMouseLeave={() => setShowMenu(false)}
        >
          <button
            onClick={() => scrollToSection('intro')}
            className="text-2xl text-left"
          >
            <p>{user.first_name}</p>
            <p>{user.last_name}</p>
          </button>

          {/* hover時に表示されるセクションボタン */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mt-3 flex flex-col gap-2"
              >
                {allButtons.map((b) => (
                  <button
                    key={b.name}
                    onClick={() =>
                      scrollToSection(b.name.toLowerCase().replace(/\s|\//g, ''))
                    }
                    className="text-sm border border-gray-400 px-3 py-1 hover:bg-black hover:text-white transition rounded"
                  >
                    {b.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* セクション */}
        <div className="snap-y snap-mandatory h-screen overflow-y-scroll scroll-smooth">
          {scrollSections.map(({ id, label }) => (
            <section key={id} id={id} className="snap-start h-screen flex flex-col justify-center items-center px-8 text-center relative">
              {id === 'intro' && (
                <>
                  {/* 背景2色部分 — show_intro_bgがtrueのときのみ描画 */}
    {settings.show_intro_bg && (
      <>
        {/* 左半分 */}
        <div
          className="absolute top-0 left-0 h-full w-1/2"
          style={{ 
            height: '53%',
            backgroundColor: settings.intro_bg_color_left }}
        ></div>

        {/* 右半分 */}
        <div
          className="absolute top-0 right-0 h-full w-1/2"
          style={{ 
            height: '53%',
            top: '83px',
            backgroundColor: settings.intro_bg_color_right }}
        ></div>
      </>
    )}
                  {/* 右上ボタン */}
                  <div className="absolute top-6 right-20 flex gap-4 hidden md:flex z-20">
                    {topButtons.map((b) => (
                      <button key={b.name} onClick={() => scrollToSection(b.name.toLowerCase().replace(/\s|\//g, ''))} className={buttonClass}>
                        {b.name}
                      </button>
                    ))}
                  </div>

                  {/* 白い箱 */}
                  <div className="bg-white text-black px-12 py-12 rounded-2xl shadow-lg -translate-y-13">
                    <h1 className="text-6xl mb-4">{user.first_name} {user.last_name}</h1>
                    <p className="text-xl mb-8">{user.major_occupation}</p>
                  </div>

                  {/* 左下ボタン */}
                  <div className="absolute bottom-24 left-6 flex gap-4 -translate-y-67 hidden md:flex">
                    {bottomButtons.map((b) => (
                      <button key={b.name} onClick={() => scrollToSection(b.name.toLowerCase().replace(/\s|\//g, ''))} className={buttonClass}>
                        {b.name}
                      </button>
                    ))}
                  </div>

                  {/* Hello */}
                  <div className="mt-36 text-center translate-y-12">
                    <h2 className="text-5xl mb-6">Hello.</h2>
                    <p className="max-w-2xl mx-auto text-lg leading-relaxed">{user.description}</p>
                  </div>
                </>
              )}

              {/* 各セクション */}
              {id !== 'intro' && (
                <motion.div initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}>
                  <h2 className="text-4xl mb-6">{label}</h2>

                  {id === 'aboutme' &&
                    sections.about_me?.map((a) => <p key={a.id} className="max-w-2xl mx-auto">{a.description}</p>)}

                  {id === 'skills' &&
                    sections.skills?.map((s) => (
                      <div key={s.id} className="mb-4">
                        <p className="font-bold">{s.skill_name}</p>
                        <p>{s.description}</p>
                      </div>
                    ))}

                    {id === 'certificates' &&
                    sections.certificates?.map((s) => (
                      <div key={s.id} className="mb-4">
                        <p className="font-bold">{s.certificate_name}</p>
                        <p>{s.description}</p>
                      </div>
                    ))}

                    {id === 'awards' &&
                    sections.awards?.map((s) => (
                      <div key={s.id} className="mb-4">
                        <p className="font-bold">{s.award_name}</p>
                        <p>{s.description}</p>
                      </div>
                    ))}

                    {id === 'projects' &&
                    sections.projects?.map((s) => (
                      <div key={s.id} className="mb-4">
                        <p className="font-bold">{s.project_name}</p>
                        <p>{s.description}</p>
                      </div>
                    ))}

                    {id === 'achievements' &&
                    sections.achievements?.map((s) => (
                      <div key={s.id} className="mb-4">
                        <p className="font-bold">{s.achievement_name}</p>
                        <p>{s.description}</p>
                      </div>
                    ))}

                  {id === 'documents' && (
                    <div className="flex flex-wrap justify-center gap-4">
                    {sections.documents?.filter((d) => d.is_public).map((d) => (
                      <button
                        key={d.id}
                        onClick={() => window.open(d.document_url, '_blank')}
                        className="border px-6 py-2 hover:bg-black hover:text-white transition"
                      >
                        Download {d.document_name}
                      </button>
                    ))}
                    </div>
                    )}

                  {id === 'contactlinks' && contact && (
                    <ul className="space-y-2">
                      {contact.email && <li>Email: {contact.email}</li>}
                      {contact.phone && <li>Phone: {contact.phone}</li>}
                      {settings.show_github && contact.github_url && (
      <li>GitHub: <a href={contact.github_url} target="_blank" className="text-blue-600">{contact.github_url}</a></li>
    )}

    {settings.show_linkedin && contact.linkedin_url && (
      <li>LinkedIn: <a href={contact.linkedin_url} target="_blank" className="text-blue-600">{contact.linkedin_url}</a></li>
    )}
                    </ul>
                  )}
                </motion.div>
              )}
            </section>
          ))}
        </div>
      </motion.main>
    </AnimatePresence>
  )
}
