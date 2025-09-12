
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || ''
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Maximize session persistence
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage, // Use localStorage for maximum persistence
    storageKey: 'supabase.auth.token', // Custom storage key
    flowType: 'pkce' // Use PKCE for better security
  }
})

// Helper function to upload image to Supabase Storage
export const uploadImageToSupabase = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
  const filePath = `pet-images/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('pet-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  // Get the public URL
  const { data } = supabase.storage
    .from('pet-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}
