import { createClient } from '@supabase/supabase-js'
import { REACT_APP_SUPABASE_ANON_KEY, REACT_APP_SUPABASE_BASE_URL } from './AppConfig'

const options = {
    realtime: {
        log_level: 'info',
    },
}

export const supabase = createClient(REACT_APP_SUPABASE_BASE_URL, REACT_APP_SUPABASE_ANON_KEY, options)
