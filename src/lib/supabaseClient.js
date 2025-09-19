import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = 'https://mnknbmtamwhatonzjuao.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ua25ibXRhbXdoYXRvbnpqdWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMjE0NTMsImV4cCI6MjA2Mzc5NzQ1M30.kLKKDlaD7GddCmacYRdOx2QWH23dwoLNQYMz9xcBnPs';

    export const supabase = createClient(supabaseUrl, supabaseAnonKey);