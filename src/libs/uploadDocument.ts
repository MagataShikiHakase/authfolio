// src/libs/uploadDocument.ts
import { supabase } from '@/libs/supabaseClient'

export async function uploadDocument(file: File, userId: string) {
  const folderPath = `documents/${userId}`
  const filePath = `${folderPath}/${file.name}`

  // ① 既存ファイル確認
  const { data: existingFiles, error: listError } = await supabase.storage
    .from('documents')
    .list(`${userId}/`, { limit: 100 })

  if (listError) throw listError

  const fileExists = existingFiles?.some(f => f.name === file.name)

  // ② もし同名ファイルがあれば確認ダイアログを出す
  if (fileExists) {
    const shouldOverwrite = window.confirm(
      `File:「${file.name}」already exists. Do you want to replace it？`
    )
    if (!shouldOverwrite) {
      alert('Upload has been canceled.')
      return null
    }
  }

  // ③ Supabase Storage にアップロード（上書き可能にする）
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true, // ← YESの時だけ上書きOKにする
    })

  if (error) throw error

  // ④ 公開URLを取得
  const { data: publicUrlData } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath)

  const publicUrl = publicUrlData?.publicUrl

  // ⑤ DBにレコードを作成（上書き時は古いレコードを消す or updateでも可）
  const { error: insertError } = await supabase.from('documents').upsert([
    {
      user_id: userId,
      document_name: file.name,
      document_url: publicUrl,
    },
  ])

  if (insertError) throw insertError

  return publicUrl
}
