import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testCover() {
  const { data } = await supabase.from('contents').select('cover_url').limit(1).single();
  if (data && data.cover_url) {
    console.log('Testando URL:', data.cover_url);
    try {
      const res = await fetch(data.cover_url);
      console.log('Status HTTP:', res.status, res.statusText);
    } catch (e) {
      console.log('Erro de fetch:', e);
    }
  }
}

testCover();
