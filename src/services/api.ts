import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Category, 
  Content, 
  Episode, 
  Plan, 
  Banner, 
  WatchHistory 
} from '../types/database';
import { 
  MOCK_CATEGORIES, 
  MOCK_CONTENTS, 
  MOCK_EPISODES, 
  MOCK_BANNERS, 
  MOCK_PLANS, 
  MOCK_CONTINUE_WATCHING 
} from './mockData';

// LocalStorage keys for mock persistence
const LS_CONTENTS = 'doramasplay_contents';
const LS_FAVORITES = 'doramasplay_favorites';
const LS_HISTORY = 'doramasplay_history';
const LS_BANNERS = 'doramasplay_banners';

function getLocalContents(): Content[] {
  try {
    const data = localStorage.getItem(LS_CONTENTS);
    if (!data) {
      localStorage.setItem(LS_CONTENTS, JSON.stringify(MOCK_CONTENTS));
      return MOCK_CONTENTS;
    }
    return JSON.parse(data);
  } catch {
    return MOCK_CONTENTS;
  }
}

function saveLocalContents(contents: Content[]) {
  localStorage.setItem(LS_CONTENTS, JSON.stringify(contents));
}

// 1. Categories
export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase fetch failed, using fallback:', e);
    }
  }
  return MOCK_CATEGORIES;
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

  const newCategory: Category = {
    id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: cleanName,
    slug: slug || `cat-${Date.now()}`,
    sort_order: categories.length + 1,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: newCategory.name,
          slug: newCategory.slug,
          sort_order: newCategory.sort_order,
          is_active: true,
        })
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase ensureCategory error:', e);
    }
  }

  MOCK_CATEGORIES.push(newCategory);
  return newCategory;
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
        // Need to match category slug
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
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getContents error, using fallback:', e);
    }
  }

  // Fallback to local memory / LocalStorage
  let list = getLocalContents();

  if (filters?.categorySlug) {
    const cat = MOCK_CATEGORIES.find(c => c.slug === filters.categorySlug);
    if (cat) {
      list = list.filter(c => c.category_id === cat.id);
    }
  }
  if (filters?.isFeatured !== undefined) {
    list = list.filter(c => c.is_featured === filters.isFeatured);
  }
  if (filters?.isTrending !== undefined) {
    list = list.filter(c => c.is_trending === filters.isTrending);
  }
  if (filters?.search) {
    const query = filters.search.toLowerCase();
    list = list.filter(c => 
      c.title.toLowerCase().includes(query) ||
      (c.description && c.description.toLowerCase().includes(query))
    );
  }
  if (filters?.limit) {
    list = list.slice(0, filters.limit);
  }

  // Attach category object for display
  return list.map(c => ({
    ...c,
    category: MOCK_CATEGORIES.find(cat => cat.id === c.category_id)
  }));
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
      console.warn('Supabase getContentBySlug error, using fallback:', e);
    }
  }

  const list = getLocalContents();
  const content = list.find(c => c.slug === slug);
  if (!content) return null;

  const category = MOCK_CATEGORIES.find(cat => cat.id === content.category_id);
  const episodes = MOCK_EPISODES[content.id] || [];

  return {
    ...content,
    category,
    episodes
  };
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
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase episodes error:', e);
    }
  }

  return MOCK_EPISODES[contentId] || [
    {
      id: `ep-gen-1-${contentId}`,
      content_id: contentId,
      season_number: 1,
      episode_number: 1,
      title: 'Episódio 1: Estreia',
      description: 'O início emocionante desta história cheia de mistério e romance.',
      thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      bunny_video_id: 'default-bunny-sample',
      duration: 65,
      is_published: true,
      created_at: new Date().toISOString(),
    }
  ];
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
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase banners error:', e);
    }
  }

  return MOCK_BANNERS.map(b => ({
    ...b,
    content: MOCK_CONTENTS.find(c => c.id === b.content_id)
  }));
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
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase plans error:', e);
    }
  }
  return MOCK_PLANS;
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

  try {
    const raw = localStorage.getItem(LS_FAVORITES);
    const ids: string[] = raw ? JSON.parse(raw) : ['content-1', 'content-2'];
    const all = getLocalContents();
    return all.filter(c => ids.includes(c.id));
  } catch {
    return [];
  }
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

  try {
    const raw = localStorage.getItem(LS_FAVORITES);
    let ids: string[] = raw ? JSON.parse(raw) : ['content-1', 'content-2'];
    const index = ids.indexOf(contentId);
    let isFav = false;
    if (index >= 0) {
      ids.splice(index, 1);
      isFav = false;
    } else {
      ids.push(contentId);
      isFav = true;
    }
    localStorage.setItem(LS_FAVORITES, JSON.stringify(ids));
    return isFav;
  } catch {
    return false;
  }
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
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase history error:', e);
    }
  }

  try {
    const raw = localStorage.getItem(LS_HISTORY);
    if (raw) {
      return JSON.parse(raw);
    }
    localStorage.setItem(LS_HISTORY, JSON.stringify(MOCK_CONTINUE_WATCHING));
    return MOCK_CONTINUE_WATCHING;
  } catch {
    return MOCK_CONTINUE_WATCHING;
  }
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
      return;
    } catch (e) {
      console.warn('Supabase saveWatchProgress error:', e);
    }
  }

  try {
    const history = await getWatchHistory(userId);
    const content = (await getContentBySlug('')) || MOCK_CONTENTS.find(c => c.id === contentId) || MOCK_CONTENTS[0];
    const episode = episodeId ? (MOCK_EPISODES[contentId]?.find(e => e.id === episodeId) || null) : null;

    const existingIdx = history.findIndex(h => h.content_id === contentId && h.episode_id === episodeId);
    const updatedRecord: WatchHistory = {
      id: existingIdx >= 0 ? history[existingIdx].id : `wh-${Date.now()}`,
      user_id: userId,
      content_id: contentId,
      content,
      episode_id: episodeId,
      episode: episode || undefined,
      progress_seconds: Math.floor(progressSeconds),
      duration_seconds: Math.floor(durationSeconds),
      percentage: Number(percentage.toFixed(2)),
      completed,
      last_watched_at: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      history[existingIdx] = updatedRecord;
    } else {
      history.unshift(updatedRecord);
    }

    localStorage.setItem(LS_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save progress locally:', e);
  }
}

// 8. Admin Content Operations
export async function createContent(item: Partial<Content>): Promise<Content> {
  const newContent: Content = {
    id: `content-${Date.now()}`,
    title: item.title || 'Sem título',
    slug: item.slug || `slug-${Date.now()}`,
    description: item.description || '',
    category_id: item.category_id || 'cat-1',
    cover_url: item.cover_url || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
    banner_url: item.banner_url || null,
    bunny_video_id: item.bunny_video_id || null,
    year: item.year || new Date().getFullYear(),
    rating: item.rating || 9.0,
    duration: item.duration || 60,
    classification: item.classification || '14',
    country: item.country || 'Coreia do Sul',
    language: item.language || 'Legendado',
    is_featured: item.is_featured ?? false,
    is_trending: item.is_trending ?? false,
    is_published: item.is_published ?? true,
    legacy_id: item.legacy_id || null,
    legacy_video_url: item.legacy_video_url || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('contents').insert([newContent]).select().single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase createContent error:', e);
    }
  }

  const all = getLocalContents();
  all.unshift(newContent);
  saveLocalContents(all);
  return newContent;
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

  const all = getLocalContents();
  const index = all.findIndex(c => c.id === id);
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  saveLocalContents(all);
  return all[index];
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

  const all = getLocalContents();
  const filtered = all.filter(c => c.id !== id);
  saveLocalContents(filtered);
  return true;
}

export async function bulkUpsertContents(items: Partial<Content>[]): Promise<{ inserted: number; updated: number }> {
  let inserted = 0;
  let updated = 0;

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
      console.warn('Supabase bulkUpsert error, falling back:', e);
    }
  }

  const current = getLocalContents();
  const map = new Map<string, Content>();
  current.forEach(c => map.set(c.slug, c));

  for (const item of items) {
    if (!item.slug) continue;
    if (map.has(item.slug)) {
      const existing = map.get(item.slug)!;
      map.set(item.slug, { ...existing, ...item, updated_at: new Date().toISOString() });
      updated++;
    } else {
      const newItem: Content = {
        id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: item.title || 'Sem título',
        slug: item.slug,
        description: item.description || '',
        category_id: item.category_id || 'cat-1',
        cover_url: item.cover_url || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
        banner_url: item.banner_url || null,
        bunny_video_id: item.bunny_video_id || null,
        year: item.year || 2024,
        rating: item.rating || 9.2,
        duration: item.duration || 60,
        classification: item.classification || '14',
        country: item.country || 'Coreia do Sul',
        language: item.language || 'Legendado',
        is_featured: item.is_featured ?? false,
        is_trending: item.is_trending ?? false,
        is_published: item.is_published ?? true,
        legacy_id: item.legacy_id || null,
        legacy_video_url: item.legacy_video_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      map.set(item.slug, newItem);
      inserted++;
    }
  }

  saveLocalContents(Array.from(map.values()));
  return { inserted, updated };
}
