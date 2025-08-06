const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// For development/testing, create a mock client if env vars are missing
if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Missing Supabase environment variables. Using mock client for development.');
  
  // Create a mock supabase client for development
  const mockSupabase = {
    from: (table) => ({
      insert: async (data) => ({ data, error: null }),
      select: async () => ({ data: [], error: null }),
      update: async (data) => ({ data, error: null }),
      delete: async () => ({ data: [], error: null })
    })
  };
  
  module.exports = mockSupabase;
} else {
  const supabase = createClient(supabaseUrl, supabaseKey);
  module.exports = supabase;
}