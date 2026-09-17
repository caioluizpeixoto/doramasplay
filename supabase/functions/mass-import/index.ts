// Supabase Edge Function: mass-import
// Secure server-side batch import with Service Role credentials
// Deploy: supabase functions deploy mass-import

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables not configured on Edge Function.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { records } = await req.json();

    if (!records || !Array.isArray(records)) {
      return new Response(
        JSON.stringify({ error: 'Payload must contain an array of records' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Fetch or cache all categories
    const { data: categories, error: catErr } = await supabase
      .from('categories')
      .select('id, name, slug');

    if (catErr) throw catErr;

    const categoryMap = new Map<string, string>();
    categories?.forEach((c: { id: string; name: string; slug: string }) => {
      categoryMap.set(c.name.toLowerCase().trim(), c.id);
      categoryMap.set(c.slug.toLowerCase().trim(), c.id);
    });

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const errors: any[] = [];

    // Filter only records that are ready to import with a valid bunny_video_id
    const importable = records.filter(
      (r: any) => r.bunny_video_id && (r.action === 'INSERT' || r.action === 'UPDATE')
    );

    for (const rec of importable) {
      try {
        const catNameKey = (rec.category_name || 'Doramas').toLowerCase().trim();
        let categoryId = categoryMap.get(catNameKey);

        // Auto-create category if missing
        if (!categoryId) {
          const newSlug = catNameKey
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

          const { data: newCat, error: createCatErr } = await supabase
            .from('categories')
            .insert({
              name: rec.category_name || 'Outros',
              slug: newSlug || `cat-${Date.now()}`,
              is_active: true,
              sort_order: 99,
            })
            .select('id, name')
            .single();

          if (!createCatErr && newCat) {
            categoryId = newCat.id;
            categoryMap.set(catNameKey, newCat.id);
          }
        }

        const payload = {
          title: rec.title,
          slug: rec.slug,
          description: rec.description || '',
          category_id: categoryId || null,
          cover_url: rec.cover_url || '',
          banner_url: rec.banner_url || rec.cover_url || null,
          bunny_video_id: rec.bunny_video_id,
          legacy_id: rec.legacy_id ? String(rec.legacy_id) : null,
          legacy_video_url: rec.legacy_video_url || null,
          legacy_created_at: rec.legacy_created_at || null,
          year: rec.year ? Number(rec.year) : 2024,
          rating: rec.rating ? Number(rec.rating) : 9.0,
          is_trending: Boolean(rec.is_trending),
          is_published: Boolean(rec.bunny_video_id), // ONLY published if bunny_video_id exists
          updated_at: new Date().toISOString(),
        };

        if (rec.action === 'UPDATE' && rec.existing_id) {
          const { error: updateErr } = await supabase
            .from('contents')
            .update(payload)
            .eq('id', rec.existing_id);

          if (updateErr) throw updateErr;
          updated++;
        } else {
          // Upsert with fallback on slug
          const { error: insertErr } = await supabase
            .from('contents')
            .upsert(payload, { onConflict: 'slug' });

          if (insertErr) throw insertErr;
          inserted++;
        }
      } catch (itemErr: any) {
        errors.push({ title: rec.title, error: itemErr.message || itemErr });
      }
    }

    skipped = records.length - (inserted + updated + errors.length);

    return new Response(
      JSON.stringify({
        success: true,
        inserted,
        updated,
        skipped,
        errors,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
