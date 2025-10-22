// src/utils/profile.ts

import { supabase } from '../libs/supabaseClient'

export async function getProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) throw error
    return data
}

export async function updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)

    if (error) throw error
    return data
}