// src/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../libs/supabaseClient'
import { useRouter } from 'next/navigation'
import { uploadDocument } from '../../libs/uploadDocument'

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

type MaybeNew = { _isNew?: boolean }

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  // userInfo is data from users table (editable locally, saved with Save button)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [settings, setSettings] = useState<SectionSetting | null>(null)
  const [contact, setContact] = useState<any>(null)

  // lists
  const [aboutMe, setAboutMe] = useState<any[]>([])
  const [skills, setSkills] = useState<any[]>([])
  const [certificates, setCertificates] = useState<any[]>([])
  const [awards, setAwards] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])

  // loading states for saves
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({})
  const [profileSaving, setProfileSaving] = useState(false)
  const [contactSaving, setContactSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // users table (userInfo)
      let { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single()
      if (!userData) {
        const { data: newUser } = await supabase.from('users').insert([{ id: user.id }]).select().single()
        userData = newUser
      }
      setUserInfo(userData)

      // settings
      let { data: settingData } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single()
      if (!settingData) {
        const { data: newSetting } = await supabase.from('user_settings').insert([{ user_id: user.id }]).select().single()
        settingData = newSetting
      }
      setSettings(settingData)

      // contact_links (single)
      let { data: contactData } = await supabase.from('contact_links').select('*').eq('user_id', user.id).single()
      if (!contactData) {
        const { data: newContact } = await supabase.from('contact_links').insert([{ user_id: user.id }]).select().single()
        contactData = newContact
      }
      setContact(contactData)

      // other tables
      const tables = [
        ['about_me', setAboutMe],
        ['skills', setSkills],
        ['certificates', setCertificates],
        ['awards', setAwards],
        ['projects', setProjects],
        ['achievements', setAchievements],
        ['documents', setDocuments],
      ]
      for (const [table, setter] of tables) {
        const { data } = await supabase.from(table).select('*').eq('user_id', user.id)
        setter(data || [])
      }
    }
    fetchData()
  }, [router])

  // === Toggle (settings) - keep immediate
  // const handleToggle = async (key: keyof SectionSetting, value: boolean) => {
  //   if (!settings || !user) return
  //   const { data, error } = await supabase
  //     .from('user_settings')
  //     .update({ [key]: value })
  //     .eq('user_id', user.id)
  //     .select()
  //     .single()
  //   if (!error) setSettings(data)
  // }
  const handleToggle = async (field: string, value: boolean) => {
  setSettings((prev) => ({ ...prev, [field]: value }));
  await supabase.from('user_settings').update({ [field]: value }).eq('user_id', user.id);
};


  // === Generic helpers for local new items and saving ===

  // Create a local new item (not saved yet)
  const createLocalNew = (setter: any, defaults: any) => {
    const temp = { ...defaults, id: Date.now() * -1, _isNew: true } // negative id = temporary
    setter((prev: any[]) => [temp, ...prev])
  }

  // Save an item: insert if _isNew, otherwise update
  const saveItem = async (table: string, item: any, setter: any) => {
    if (!user) return
    setSavingIds((s) => ({ ...s, [String(item.id)]: true }))

    try {
      if (item._isNew) {
        // insert
        const { data: inserted, error } = await supabase.from(table).insert([{ ...item, user_id: user.id }]).select()
        if (error) throw error
        // replace temp in list with inserted rows (usually one)
        setter((prev: any[]) => {
          return prev.map((p: any) => (p.id === item.id ? inserted[0] : p))
        })
      } else {
        // update
        const { data: updated, error } = await supabase.from(table).update(item).eq('id', item.id).select()
        if (error) throw error
        setter((prev: any[]) => prev.map((p: any) => (p.id === item.id ? updated[0] : p)))
      }
    } catch (err: any) {
      console.error('Save error:', err)
      alert(`Save failed: ${err.message || JSON.stringify(err)}`)
    } finally {
      setSavingIds((s) => {
        const next = { ...s }
        delete next[String(item.id)]
        return next
      })
    }
  }

  // Delete (if local temp just remove, otherwise call DB)
  const handleDelete = async (table: string, item: any, setter: any) => {
    if (item._isNew) {
      setter((prev: any[]) => prev.filter((i: any) => i.id !== item.id))
      return
    }
    const { error } = await supabase.from(table).delete().eq('id', item.id)
    if (error) {
      console.error('Delete error:', error)
      alert('Delete failed')
    } else {
      setter((prev: any[]) => prev.filter((i: any) => i.id !== item.id))
    }
  }

  // === Profile Save (users table) ===
  const saveProfile = async () => {
    if (!userInfo || !user) return
    setProfileSaving(true)
    try {
      const payload: any = {
        first_name: userInfo.first_name || null,
        last_name: userInfo.last_name || null,
        major_occupation: userInfo.major_occupation || null,
        description: userInfo.description || null
        //email: userInfo.email || null,
      }
      const { data, error } = await supabase.from('users').update(payload).eq('id', userInfo.id).select().single()
      if (error) throw error
      setUserInfo(data)
      alert('Profile saved.')
    } catch (err: any) {
      console.error(err)
      alert('Failed to save profile: ' + (err.message || JSON.stringify(err)))
    } finally {
      setProfileSaving(false)
    }
  }

  // === Contacts Save ===
  const saveContacts = async () => {
    if (!contact || !user) return
    setContactSaving(true)
    try {
      const { data, error } = await supabase.from('contact_links').update(contact).eq('id', contact.id).select().single()
      if (error) throw error
      setContact(data)
      alert('Contacts saved.')
    } catch (err: any) {
      console.error(err)
      alert('Failed to save contacts: ' + (err.message || JSON.stringify(err)))
    } finally {
      setContactSaving(false)
    }
  }

  // === Documents upload & delete ===
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const publicUrl = await uploadDocument(file, user.id)
      const { data } = await supabase.from('documents').select('*').eq('user_id', user.id)
      setDocuments(data || [])
      alert('Upload complete.')
    } catch (err: any) {
      console.error(err)
      alert('Upload failed: ' + (err.message || JSON.stringify(err)))
    }
  }

  const handleDeleteDocument = async (id: number) => {
    const { error } = await supabase.from('documents').delete().eq('id', id)
    if (!error) setDocuments((prev) => prev.filter((i) => i.id !== id))
  }

  // Safety
  if (!userInfo || !settings) return <p className="text-center mt-10 text-gray-600">Loading...</p>

  // helper to pick setter by table
  const tableToSetter = (table: string) => {
    switch (table) {
      case 'about_me': return setAboutMe
      case 'skills': return setSkills
      case 'certificates': return setCertificates
      case 'awards': return setAwards
      case 'projects': return setProjects
      case 'achievements': return setAchievements
      case 'documents': return setDocuments
      default: return null
    }
  }

  // render editable list with Save buttons
  const renderEditableList = (section: {
    title: string
    data: any[]
    table: string
    set: any
    toggle: keyof SectionSetting
    fields: { key: string; placeholder: string }[]
  }) => (
    <section key={section.table} className="bg-white shadow p-4 rounded-lg mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-2xl font-semibold">{section.title}</h2>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={(settings as any)[section.toggle]}
            onChange={(e) => handleToggle(section.toggle, e.target.checked)}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-gray-300 peer-checked:bg-blue-500 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
        </label>
      </div>

      {section.data.map((item: any) => (
        <div key={item.id} className="border p-3 rounded mb-3 bg-gray-50">
          {section.fields.map((f) => (
            <div key={f.key} className="mb-2">
              <input
                className="border p-2 w-full rounded"
                placeholder={f.placeholder}
                value={item[f.key] ?? ''}
                onChange={(e) => {
                  const newVal = e.target.value
                  section.set((prev: any[]) => prev.map((p: any) => p.id === item.id ? { ...p, [f.key]: newVal } : p))
                }}
              />
            </div>
          ))}

          <div className="flex items-center gap-3">
            <button
              onClick={() => saveItem(section.table, item, section.set)}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              disabled={!!savingIds[String(item.id)]}
            >
              {item._isNew ? 'Save' : (savingIds[String(item.id)] ? 'Saving...' : 'Save')}
            </button>

            <button
              onClick={() => handleDelete(section.table, item, section.set)}
              className="text-red-500 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={() => {
          const defaults: Record<string, any> = {
            about_me: { description: '' },
            skills: { skill_name: '', description: '' },
            certificates: { certificate_name: '', description: '' },
            awards: { award_name: '', description: '' },
            projects: { project_name: '', description: '', project_url: '' },
            achievements: { achievement_name: '', description: '' },
            documents: { document_name: '', document_url: '' },
          }
          createLocalNew(section.set, defaults[section.table])
        }}
        className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
      >
        + Add {section.title}
      </button>
    </section>
  )

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
   {/* ===== ナビゲーションバー ===== */}
<nav className="relative mb-8 border-b pb-3">
  {/* ======== PC（sm以上）表示 ======== */}
  <div className="hidden sm:flex justify-center items-center gap-6">
    {[
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Account', path: '/account' },
      { name: 'View', path: '/view' },
    ].map((item) => (
      <button
        key={item.name}
        onClick={() => (window.location.href = item.path)}
        className={`px-4 py-2 rounded-md font-medium transition ${
          item.path === '/dashboard'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
        }`}
      >
        {item.name}
      </button>
    ))}

    <button
      onClick={async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
          alert('Logout failed')
          console.error(error)
        } else {
          window.location.href = '/login'
        }
      }}
      className="px-4 py-2 rounded-md bg-gray-500 hover:bg-gray-600 text-white font-medium transition"
    >
      Logout
    </button>
  </div>

  {/* ======== スマホ表示 (ドロップダウン) ======== */}
  <div className="sm:hidden relative">
    <details className="group inline-block">
      <summary className="list-none cursor-pointer px-4 py-2 bg-blue-600 text-white font-medium rounded-md w-max">
        Dashboard
      </summary>
      <div className="absolute mt-2 left-0 bg-white shadow-lg rounded-md border flex flex-col w-40 z-10 overflow-hidden">
        {[
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Account', path: '/account' },
          { name: 'View', path: '/view' },
        ].map((item) => (
          <button
            key={item.name}
            onClick={() => (window.location.href = item.path)}
            className={`text-left px-4 py-2 hover:bg-gray-100 ${
              item.path === '/dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
            }`}
          >
            {item.name}
          </button>
        ))}

        <button
          onClick={async () => {
            const { error } = await supabase.auth.signOut()
            if (error) {
              alert('Logout failed')
              console.error(error)
            } else {
              window.location.href = '/login'
            }
          }}
          className="text-left px-4 py-2 text-red-600 hover:bg-red-50 border-t"
        >
          Logout
        </button>
      </div>
    </details>
  </div>
</nav>



      <h1 className="text-4xl font-bold mb-8 text-center">
        {userInfo.first_name || 'My'}'s Dashboard
      </h1>
      <div className="max-w-3xl mx-auto space-y-10">
        {/* PROFILE */}
        <section className="bg-white shadow p-4 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">Profile</h2>

          {[
            { key: 'first_name', label: 'First Name' },
            { key: 'last_name', label: 'Last Name' },
            { key: 'major_occupation', label: 'Major / Occupation' },
            { key: 'description', label: 'Description' },
          ].map(({ key, label }) => (
            <div key={key} className="mb-3">
              <label className="block text-gray-700 font-medium mb-1">{label}</label>
              <input
                className="border p-2 w-full rounded"
                placeholder={`Enter your ${label}`}
                value={userInfo[key] ?? ''}
                onChange={(e) => setUserInfo((prev: any) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}

          <div className="flex gap-3 mt-2">
            <button
              onClick={saveProfile}
              disabled={profileSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </button>

            <button
              onClick={() => {
                // reset to DB values by reloading userInfo (simple approach)
                (async () => {
                  const { data } = await supabase.from('users').select('*').eq('id', userInfo.id).single()
                  if (data) setUserInfo(data)
                })()
              }}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Reset
            </button>
          </div>
        </section>

        {/* DYNAMIC SECTIONS */}
        {renderEditableList({
          title: 'About Me',
          data: aboutMe,
          table: 'about_me',
          set: setAboutMe,
          toggle: 'show_about',
          fields: [{ key: 'description', placeholder: 'Write about yourself...' }],
        })}

        {renderEditableList({
          title: 'Skills',
          data: skills,
          table: 'skills',
          set: setSkills,
          toggle: 'show_skills',
          fields: [
            { key: 'skill_name', placeholder: 'Skill name' },
            { key: 'description', placeholder: 'Skill description' },
          ],
        })}

        {renderEditableList({
          title: 'Certificates',
          data: certificates,
          table: 'certificates',
          set: setCertificates,
          toggle: 'show_certificates',
          fields: [
            { key: 'certificate_name', placeholder: 'Certificate name' },
            { key: 'description', placeholder: 'Description' },
          ],
        })}

        {renderEditableList({
          title: 'Awards',
          data: awards,
          table: 'awards',
          set: setAwards,
          toggle: 'show_awards',
          fields: [
            { key: 'award_name', placeholder: 'Award name' },
            { key: 'description', placeholder: 'Description' },
          ],
        })}

        {renderEditableList({
          title: 'Projects',
          data: projects,
          table: 'projects',
          set: setProjects,
          toggle: 'show_projects',
          fields: [
            { key: 'project_name', placeholder: 'Project name' },
            { key: 'description', placeholder: 'Description' },
            { key: 'project_url', placeholder: 'Project URL' },
          ],
        })}

        {renderEditableList({
          title: 'Achievements',
          data: achievements,
          table: 'achievements',
          set: setAchievements,
          toggle: 'show_achievements',
          fields: [
            { key: 'achievement_name', placeholder: 'Achievement name' },
            { key: 'description', placeholder: 'Description' },
          ],
        })}

        {/* Documents (upload handled separately) */}
        <section className="bg-white shadow p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-semibold">Documents</h2>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.show_documents || false}
                onChange={(e) => handleToggle('show_documents', e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-300 peer-checked:bg-blue-500 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>

          <input type="file" accept="application/pdf" onChange={handleFileUpload} className="mb-4" />

          {documents.length === 0 ? (
            <p className="text-gray-500">No documents uploaded yet.</p>
          ) : (
            documents.map((doc) => (
            <div
              key={doc.id}
              className="flex justify-between items-center border p-3 rounded mb-2 bg-gray-50"
            >
              <div>
                <p className="font-medium">{doc.document_name}</p>
                <a
                  href={doc.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm underline"
                >
                  View PDF
                </a>
              </div>

              <div className="flex items-center gap-4">
                {/* ✅ 公開/非公開トグル */}
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={doc.is_public || false}
                    onChange={async (e) => {
                      const newValue = e.target.checked
                      // 即時UI反映
                      setDocuments((prev) =>
                        prev.map((d) => (d.id === doc.id ? { ...d, is_public: newValue } : d))
                      )
                      // DB更新
                      const { error } = await supabase
                        .from('documents')
                        .update({ is_public: newValue })
                        .eq('id', doc.id)
                      if (error) {
                        console.error(error)
                        alert('Failed to update visibility')
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-300 peer-checked:bg-blue-500 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
                </label>

                {/* 削除ボタン */}
                <button
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="text-red-500 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))

          )}
        </section>

        {/* CONTACTS */}
{contact && (
  <section className="bg-white shadow p-4 rounded-lg mb-6">
    <div className="flex justify-between items-center mb-3">
      <h2 className="text-2xl font-semibold">Contacts / Links</h2>
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={settings.show_contacts}
          onChange={(e) => handleToggle('show_contacts', e.target.checked)}
          className="sr-only peer"
        />
        <div className="relative w-11 h-6 bg-gray-300 peer-checked:bg-blue-500 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
      </label>
    </div>

    {/* 各リンク入力欄 */}
    {[
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'linkedin_url', label: 'LinkedIn URL', toggle: 'show_linkedin' },
      { key: 'github_url', label: 'GitHub URL', toggle: 'show_github' },
    ].map(({ key, label, toggle }) => (
      <div key={key} className="mb-3">
        <div className="flex justify-between items-center">
          <label className="block text-gray-700 font-medium mb-1">{label}</label>
          {/* トグルスイッチ（Email/Phoneには表示しない） */}
          {toggle && (
            <label className="flex items-center cursor-pointer">
              <input
  type="checkbox"
  checked={!!settings[toggle]} // ← ここを修正
  onChange={(e) => handleToggle(toggle, e.target.checked)}
  className="sr-only peer"
/>

              <div className="relative w-9 h-5 bg-gray-300 peer-checked:bg-blue-500 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          )}
        </div>

        <input
          className="border p-2 w-full rounded"
          placeholder={`Enter your ${label}`}
          value={contact[key] ?? ''}
          onChange={(e) => setContact((prev: any) => ({ ...prev, [key]: e.target.value }))}
        />
      </div>
    ))}

    <div className="flex gap-3">
      <button
        onClick={saveContacts}
        disabled={contactSaving}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {contactSaving ? 'Saving...' : 'Save Contacts'}
      </button>

      <button
        onClick={async () => {
          const { data } = await supabase
            .from('contact_links')
            .select('*')
            .eq('user_id', user.id)
            .single()
          if (data) setContact(data)
        }}
        className="bg-gray-200 px-4 py-2 rounded"
      >
        Reset
      </button>
    </div>
  </section>
)}

      </div>
    </div>
  )
}
