import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CDN_HOST = process.env.VITE_BUNNY_STREAM_CDN_HOSTNAME; // vz-e86e7bad-8b9.b-cdn.net

async function fixCovers() {
  console.log('🔄 Corrigindo URLs das capas...');

  const { data: contents } = await supabase.from('contents').select('id, cover_url');
  
  if (!contents) return;

  let updated = 0;
  for (const video of contents) {
    if (video.cover_url && video.cover_url.includes('vz-preview.b-cdn.net')) {
      // Pega o ID do vídeo da URL antiga
      // Ex: https://vz-preview.b-cdn.net/752485/f95e533e-0010-48ee-a6a9-8390b7987820/thumbnail.jpg
      const parts = video.cover_url.split('/');
      const videoId = parts[parts.length - 2]; 
      
      const newUrl = `https://${CDN_HOST}/${videoId}/thumbnail.jpg`;
      
      await supabase.from('contents').update({ cover_url: newUrl }).eq('id', video.id);
      updated++;
    }
  }
  
  // Atualizar os Banners também
  const { data: banners } = await supabase.from('banners').select('id, content_id');
  if (banners) {
    for (const banner of banners) {
      const { data: c } = await supabase.from('contents').select('cover_url').eq('id', banner.content_id).single();
      if (c) {
        await supabase.from('banners').update({ image_url: c.cover_url }).eq('id', banner.id);
      }
    }
  }

  console.log(`✅ ${updated} capas corrigidas com sucesso!`);
}

fixCovers();
