
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || ''
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Minimal session persistence using sessionStorage (clears on browser close)
    persistSession: true,
    autoRefreshToken: true, // Prevent mid-session expiry
    detectSessionInUrl: true,
    storage: window.sessionStorage, // Use sessionStorage instead of localStorage
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
      cacheControl: '0', // Explicitly disable caching for uploads
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
