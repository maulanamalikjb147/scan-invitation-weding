import { createClient } from '@supabase/supabase-js'

const supabaseUrl = window.env?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
const supabaseKey = window.env?.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
