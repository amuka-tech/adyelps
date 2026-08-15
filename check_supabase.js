require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('roles').select('*').limit(1);
  if (error) {
    console.error('Error fetching from roles:', error);
  } else {
    console.log('Successfully connected, roles data:', data);
  }
}
check();
