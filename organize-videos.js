import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function applyRealData() {
  console.log('🔄 Iniciando organização dos vídeos importados...');

  // 1. Pegar categorias do banco
  const { data: categories } = await supabase.from('categories').select('*');
  if (!categories || categories.length === 0) {
    console.error('Categorias não encontradas no banco!');
    return;
  }
  
  // 2. Pegar os 929 vídeos
  const { data: contents } = await supabase.from('contents').select('id, title, is_featured, is_trending');
  
  if (!contents || contents.length === 0) {
    console.error('Nenhum conteúdo encontrado!');
    return;
  }

  console.log(`Encontrados ${contents.length} vídeos. Organizando nas categorias...`);

  let updated = 0;

  // 3. Distribuir os vídeos nas categorias e marcar alguns como destaque/trending
  for (let i = 0; i < contents.length; i++) {
    const video = contents[i];
    
    // Escolher categoria round-robin (distribui igualmente)
    const category = categories[i % categories.length];
    
    const isFeatured = i < 10; // Primeiros 10 em destaque
    const isTrending = i >= 10 && i < 30; // Próximos 20 em alta

    const { error } = await supabase.from('contents').update({
      category_id: category.id,
      is_featured: isFeatured,
      is_trending: isTrending,
    }).eq('id', video.id);

    if (!error) updated++;
  }
  
  console.log(`✅ ${updated} vídeos categorizados!`);

  // 4. Limpar Banners antigos e criar Banners novos baseados nos vídeos reais
  console.log('🔄 Criando Banners para a Home com seus vídeos reais...');
  await supabase.from('banners').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta tudo
  
  const topVideos = contents.slice(0, 5);
  const bannersToInsert = topVideos.map((video, index) => ({
    title: video.title,
    content_id: video.id,
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80', // Capa genérica HQ provisória
    sort_order: index,
    is_active: true
  }));

  await supabase.from('banners').insert(bannersToInsert);
  console.log('✅ Banners criados com sucesso!');

  console.log('🎉 TUDO PRONTO! Pode olhar a página inicial agora!');
}

applyRealData();
