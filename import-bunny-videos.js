import { createClient } from '@supabase/supabase-js';

// No Node 20+, podemos rodar este script usando: node --env-file=.env import-bunny-videos.js
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const BUNNY_LIBRARY_ID = process.env.VITE_BUNNY_STREAM_LIBRARY_ID;
const BUNNY_API_KEY = process.env.BUNNY_STREAM_API_KEY; // PRECISAMOS DESSA CHAVE

if (!BUNNY_API_KEY || BUNNY_API_KEY === 'sua_chave_aqui') {
  console.error("❌ ERRO: Você precisa definir a BUNNY_STREAM_API_KEY no arquivo .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') + '-' + Math.floor(Math.random() * 1000); // add random number to guarantee uniqueness
}

async function importarVideos() {
  let page = 1;
  const itemsPerPage = 100;
  let hasMore = true;
  let total = 0;

  console.log(`Iniciando importação do Bunny.net (Library: ${BUNNY_LIBRARY_ID})...`);

  while (hasMore) {
    try {
      const response = await fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos?page=${page}&itemsPerPage=${itemsPerPage}`, {
        method: 'GET',
        headers: {
          'AccessKey': BUNNY_API_KEY,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API do Bunny: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const videos = data.items;

      if (!videos || videos.length === 0) {
        hasMore = false;
        break;
      }

      const videosParaInserir = videos.map(video => ({
        title: video.title,
        slug: generateSlug(video.title),
        bunny_video_id: video.guid,
        duration: Math.round(video.length / 60), // convertido para minutos
        cover_url: `https://vz-preview.b-cdn.net/${BUNNY_LIBRARY_ID}/${video.guid}/thumbnail.jpg`,
        is_published: true,
      }));

      // Inserir na tabela contents do Supabase
      const { error } = await supabase
        .from('contents')
        .insert(videosParaInserir);

      if (error) {
        console.error(`❌ Erro ao inserir no Supabase (Página ${page}):`, error);
        break;
      }

      total += videos.length;
      console.log(`✅ Página ${page} importada: ${videos.length} vídeos salvos.`);
      
      if (videos.length < itemsPerPage) {
        hasMore = false;
      } else {
        page++;
      }
    } catch (error) {
      console.error('❌ Erro durante o processo:', error);
      break;
    }
  }

  console.log(`🎉 Importação finalizada! Total de vídeos: ${total}`);
}

importarVideos();
