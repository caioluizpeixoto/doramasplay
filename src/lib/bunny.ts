// Helpers for Bunny Stream integration

export const BUNNY_CONFIG = {
  defaultLibraryId: import.meta.env.VITE_BUNNY_STREAM_LIBRARY_ID || '345678',
  defaultCdnHostname: import.meta.env.VITE_BUNNY_STREAM_CDN_HOSTNAME || 'iframe.mediadelivery.net',
};

/**
 * Generates an iframe embed URL for a Bunny Stream video
 */
export function getBunnyEmbedUrl(
  videoId: string,
  options?: {
    libraryId?: string;
    autoplay?: boolean;
    startTime?: number; // resume time in seconds
    loop?: boolean;
  }
): string {
  const libId = options?.libraryId || BUNNY_CONFIG.defaultLibraryId;
  const baseUrl = `https://iframe.mediadelivery.net/embed/${libId}/${videoId}`;
  
  const params = new URLSearchParams();
  if (options?.autoplay) params.set('autoplay', 'true');
  if (options?.loop) params.set('loop', 'true');
  if (options?.startTime && options.startTime > 0) {
    params.set('t', Math.floor(options.startTime).toString());
  }
  params.set('preload', 'true');
  params.set('responsive', 'true');

  const query = params.toString();
  return query ? `${baseUrl}?${query}` : baseUrl;
}

/**
 * Generates direct HLS playlist URL for custom video players
 */
export function getBunnyHlsUrl(videoId: string, hostname?: string): string {
  const host = hostname || 'vz-12345.b-cdn.net';
  return `https://${host}/${videoId}/playlist.m3u8`;
}

/**
 * Generates Bunny thumbnail URL
 */
export function getBunnyThumbnailUrl(videoId: string, libraryId?: string): string {
  const libId = libraryId || BUNNY_CONFIG.defaultLibraryId;
  return `https://vz-preview.b-cdn.net/${libId}/${videoId}/thumbnail.jpg`;
}
