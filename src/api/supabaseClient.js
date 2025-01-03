import { createClient } from '@supabase/supabase-js'

const options = {
    realtime: {
        log_level: 'info',
    },
}

export const supabase = createClient(process.env.REACT_APP_SUPABASE_BASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY, options)


//   // services/api/supabase.js
//   /**
//    * Supabase client configuration and API utilities
//    */
//    import { createClient } from '@supabase/supabase-js';
  
//    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
//    const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
   
//    export const supabase = createClient(supabaseUrl, supabaseKey);
   
//    // Utility function for handling Supabase errors
//    export const handleSupabaseError = (error: any) => {
//      console.error('Supabase Error:', error);
//      throw new Error(error.message || 'An error occurred with the database');
//    };