import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('[resources] Supabase env vars are not fully configured.');
}

export const supabaseAdmin = createClient(
  supabaseUrl ?? 'http://localhost:54321',
  supabaseServiceRoleKey ?? 'missing-service-role-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);
