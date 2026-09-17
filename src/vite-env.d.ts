/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_BUNNY_STREAM_LIBRARY_ID?: string;
  readonly VITE_BUNNY_STREAM_CDN_HOSTNAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
