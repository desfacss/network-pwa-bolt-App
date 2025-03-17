import { createClient } from '@supabase/supabase-js'
import { REACT_APP_SUPABASE_ANON_KEY, REACT_APP_SUPABASE_BASE_URL } from './AppConfig'

// const supabaseUrl = 'https://ilhpsnitewtlcrjbptyw.supabase.co'
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsaHBzbml0ZXd0bGNyamJwdHl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc1ODYxMzUsImV4cCI6MjAzMzE2MjEzNX0.qPJXvkzv8IEPDFL6gDfSceDoeh6mSg4lle2-KoOKx3U'

const options = {
    realtime: {
        log_level: 'info',
    },
}

export const supabase = createClient(REACT_APP_SUPABASE_BASE_URL, REACT_APP_SUPABASE_ANON_KEY, options)
