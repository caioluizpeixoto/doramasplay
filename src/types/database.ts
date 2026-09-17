// Database and Domain Types for DoramasPlay

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Content {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string;
  category?: Category;
  cover_url: string;
  banner_url: string | null;
  bunny_video_id: string | null;
  year: number | null;
  rating: number | null;
  duration: number | null; // minutes
  classification: string | null; // L, 10, 12, 14, 16, 18
  country: string | null;
  language: string | null;
  is_featured: boolean;
  is_trending: boolean;
  is_published: boolean;
  legacy_id?: string | null;
  legacy_video_url?: string | null;
  legacy_created_at?: string | null;
  created_at: string;
  updated_at: string;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  content_id: string;
  season_number: number;
  episode_number: number;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  bunny_video_id: string | null;
  duration: number | null; // minutes
  is_published: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  is_kids: boolean;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  content_id: string;
  content?: Content;
  created_at: string;
}

export interface WatchHistory {
  id: string;
  user_id: string;
  content_id: string;
  content?: Content;
  episode_id: string | null;
  episode?: Episode;
  progress_seconds: number;
  duration_seconds: number;
  percentage: number;
  completed: boolean;
  last_watched_at: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billing_period: 'monthly' | 'quarterly' | 'yearly';
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan?: Plan;
  status: 'active' | 'canceled' | 'expired' | 'past_due' | 'trialing';
  started_at: string;
  expires_at: string | null;
  provider: string;
  external_subscription_id: string | null;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  image_url: string;
  content_id: string | null;
  content?: Content;
  sort_order: number;
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
}

export interface FeaturedContent {
  id: string;
  content_id: string;
  content?: Content;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'admin' | 'subscriber' | 'free_user';
  subscription?: Subscription;
}

// Mass import types matching catalogo_2160.json & migracao_sucesso.csv
export interface LegacyImportItem {
  id?: string | number;
  titulo?: string;
  title?: string;
  name?: string;
  categoria?: string;
  category?: string;
  capa?: string;
  cover_url?: string;
  image_url?: string;
  video_url?: string;
  url?: string;
  vimeo_id?: string | number;
  ano?: number | string;
  year?: number | string;
  nota?: number | string;
  rating?: number | string;
  em_alta?: boolean | string | number;
  is_trending?: boolean;
  tipo_video?: string;
  video_provider?: string;
  created_at?: string;
  description?: string;
  sinopse?: string;
  slug?: string;
}

export interface BunnyMigrationItem {
  titulo?: string;
  title?: string;
  categoria?: string;
  category?: string;
  url_antiga?: string;
  original_url?: string;
  source_url?: string;
  bunny_video_id?: string;
  video_id?: string;
  id?: string;
  status?: string;
  data?: string;
  duration?: number;
}

export type ImportRecordStatus = 
  | 'PRONTO PARA IMPORTAR'
  | 'JÁ EXISTE'
  | 'SEM BUNNY ID'
  | 'SEM CORRESPONDÊNCIA'
  | 'ERRO';

export type ImportRecordAction = 'INSERT' | 'UPDATE' | 'SKIP';

export interface MatchedImportRecord {
  title: string;
  original_title: string;
  slug: string;
  category_name: string;
  cover_url: string;
  banner_url?: string;
  description: string;
  bunny_video_id: string;
  legacy_id?: string;
  legacy_video_url?: string;
  vimeo_id?: string;
  year?: number;
  rating?: number;
  is_trending: boolean;
  legacy_created_at?: string;
  match_method: 'video_url' | 'vimeo_id' | 'title_category' | 'direct' | 'none';
  status: ImportRecordStatus;
  action: ImportRecordAction;
  existing_id?: string;
  error_message?: string;
}

