// src/utils/auth.ts

import { supabase } from '../libs/supabaseClient'

export async function signUp(email: string, password: string, username: string) {
    // 1️⃣ Supabase Authでユーザー作成
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })

    if (authError) throw authError

    // 2️⃣ profilesテーブルにレコード追加
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
            id: authData.user?.id,  // AuthのユーザーID
            username,
    })

    if (profileError) throw profileError

    return profileData
}

export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) throw error
    return data.user
}