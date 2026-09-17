import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Category, 
  Content, 
  Episode, 
  Plan, 
  Banner, 
  WatchHistory 
} from '../types/database';

// 1. Categories
export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetch failed:', e);
    }
  }
  return [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find(c => c.slug === slug) || null;
}

export async function ensureCategory(name: string): Promise<Category> {
  const cleanName = name.trim();
  const slug = cleanName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const categories = await getCategories();
  const existing = categories.find(
    c => c.name.toLowerCase() === cleanName.toLowerCase() || c.slug === slug
  );
  if (existing) return existing;

  const newCategory = {
    name: cleanName,
    slug: slug || `cat-${Date.now()}`,
    sort_order: categories.length + 1,
    is_active: true,
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(newCategory)
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase ensureCategory error:', e);
    }
  }
  throw new Error("Supabase não configurado ou erro ao criar categoria");
}

// 2. Contents
export async function getContents(filters?: {
  categorySlug?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  search?: string;
  limit?: number;
}): Promise<Content[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('contents').select('*, category:categories(*)').eq('is_published', true);
      
      if (filters?.categorySlug) {
        const cat = await getCategoryBySlug(filters.categorySlug);
        if (cat) query = query.eq('category_id', cat.id);
      }
      if (filters?.isFeatured !== undefined) {
        query = query.eq('is_featured', filters.isFeatured);
      }
      if (filters?.isTrending !== undefined) {
        query = query.eq('is_trending', filters.isTrending);
      }
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase getContents error:', e);
    }
  }
  return [];
}

export async function getContentBySlug(slug: string): Promise<Content | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('contents')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .single();
      if (!error && data) {
        const episodes = await getEpisodesByContentId(data.id);
        return { ...data, episodes };
      }
    } catch (e) {
      console.warn('Supabase getContentBySlug error:', e);
    }
  }
  return null;
}

// 3. Episodes
export async function getEpisodesByContentId(contentId: string): Promise<Episode[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('content_id', contentId)
        .order('season_number', { ascending: true })
        .order('episode_number', { ascending: true });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase episodes error:', e);
    }
  }
  return [];
}

// 4. Banners
export async function getBanners(): Promise<Banner[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*, content:contents(*)')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase banners error:', e);
    }
  }
  return [];
}

// 5. Plans
export async function getPlans(): Promise<Plan[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase plans error:', e);
    }
  }
  return [];
}

// 6. Favorites (Minha Lista)
export async function getFavorites(userId: string = 'user-default'): Promise<Content[]> {
  if (isSupabaseConfigured() && userId !== 'user-default') {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('content_id, content:contents(*)')
        .eq('user_id', userId);
      if (!error && data) {
        return data.map(d => d.content as unknown as Content).filter(Boolean);
      }
    } catch (e) {
      console.warn('Supabase getFavorites error:', e);
    }
  }
  return [];
}

export async function toggleFavorite(contentId: string, userId: string = 'user-default'): Promise<boolean> {
  if (isSupabaseConfigured() && userId !== 'user-default') {
    try {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('content_id', contentId)
        .maybeSingle();

      if (data) {
        await supabase.from('favorites').delete().eq('id', data.id);
        return false;
      } else {
        await supabase.from('favorites').insert({ user_id: userId, content_id: contentId });
        return true;
      }
    } catch (e) {
      console.warn('Supabase toggleFavorite error:', e);
    }
  }
  return false;
}

export async function isFavorite(contentId: string, userId: string = 'user-default'): Promise<boolean> {
  const favorites = await getFavorites(userId);
  return favorites.some(f => f.id === contentId);
}

// 7. Watch History (Continuar Assistindo)
export async function getWatchHistory(userId: string = 'user-default'): Promise<WatchHistory[]> {
  if (isSupabaseConfigured() && userId !== 'user-default') {
    try {
      const { data, error } = await supabase
        .from('watch_history')
        .select('*, content:contents(*), episode:episodes(*)')
        .eq('user_id', userId)
        .eq('completed', false)
        .order('last_watched_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase history error:', e);
    }
  }
  return [];
}

export async function saveWatchProgress(
  contentId: string,
  episodeId: string | null,
  progressSeconds: number,
  durationSeconds: number,
  userId: string = 'user-default'
): Promise<void> {
  const percentage = durationSeconds > 0 ? (progressSeconds / durationSeconds) * 100 : 0;
  const completed = percentage > 92;

  if (isSupabaseConfigured() && userId !== 'user-default') {
    try {
      await supabase.from('watch_history').upsert({
        user_id: userId,
        content_id: contentId,
        episode_id: episodeId,
        progress_seconds: Math.floor(progressSeconds),
        duration_seconds: Math.floor(durationSeconds),
        percentage: Number(percentage.toFixed(2)),
        completed,
        last_watched_at: new Date().toISOString()
      }, { onConflict: 'user_id,content_id,episode_id' });
    } catch (e) {
      console.warn('Supabase saveWatchProgress error:', e);
    }
  }
}

// 8. Admin Content Operations
export async function createContent(item: Partial<Content>): Promise<Content> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('contents').insert([item]).select().single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase createContent error:', e);
    }
  }
  throw new Error("Supabase não configurado");
}

export async function updateContent(id: string, updates: Partial<Content>): Promise<Content | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('contents').update(updates).eq('id', id).select().single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase updateContent error:', e);
    }
  }
  return null;
}

export async function deleteContent(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('contents').delete().eq('id', id);
      if (!error) return true;
    } catch (e) {
      console.warn('Supabase deleteContent error:', e);
    }
  }
  return false;
}

export async function bulkUpsertContents(items: Partial<Content>[]): Promise<{ inserted: number; updated: number }> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('contents')
        .upsert(items, { onConflict: 'slug' })
        .select();
      if (!error && data) {
        return { inserted: data.length, updated: 0 };
      }
    } catch (e) {
      console.warn('Supabase bulkUpsert error:', e);
    }
  }
  return { inserted: 0, updated: 0 };
}
