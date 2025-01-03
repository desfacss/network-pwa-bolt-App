import { createClient } from '@supabase/supabase-js'

const options = {
    realtime: {
        log_level: 'info',
    },
}

export const supabase = createClient(process.env.REACT_APP_SUPABASE_BASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY, options)