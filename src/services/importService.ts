import { 
  LegacyImportItem, 
  BunnyMigrationItem, 
  MatchedImportRecord, 
  ImportRecordStatus,
  ImportRecordAction,
  Content 
} from '../types/database';
import { getContents, getCategories, ensureCategory, bulkUpsertContents } from './api';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface DetailedAnalysisSummary {
  totalLegacy: number;
  totalBunny: number;
  totalMatched: number;
  totalWithoutBunny: number;
  totalExisting: number;
  totalNew: number;
  totalUpdates: number;
  totalErrors: number;
  totalWithValidCategory: number;
  totalWithoutCategory: number;
  records: MatchedImportRecord[];
}

export type ImportPreviewSummary = DetailedAnalysisSummary;

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'sem-titulo';
}

/**
 * Robust CSV parser that handles quotes, escaped characters, and newlines
 */
export function parseCSV(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let currentLine = '';
  let insideQuotes = false;

  const cleanText = text.replace(/^\uFEFF/, '').trim(); // Remove UTF-8 BOM if present

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
      currentLine = '';
      if (char === '\r' && cleanText[i + 1] === '\n') i++; // Skip \r\n
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  if (lines.length < 2) return [];

  // Parse header row
  const parseRow = (line: string): string[] => {
    const values: string[] = [];
    let curVal = '';
    let inQ = false;
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') {
        inQ = !inQ;
      } else if (c === ',' && !inQ) {
        values.push(curVal.trim().replace(/^["']|["']$/g, '').trim());
        curVal = '';
      } else {
        curVal += c;
      }
    }
    values.push(curVal.trim().replace(/^["']|["']$/g, '').trim());
    return values;
  };

  const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, ''));
  const results: Record<string, string>[] = [];

  for (let k = 1; k < lines.length; k++) {
    const values = parseRow(lines[k]);
    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      obj[header] = values[idx] || '';
    });
    results.push(obj);
  }

  return results;
}

/**
 * Parse Legacy Catalog JSON or CSV
 */
export function parseLegacyCatalog(content: string): LegacyImportItem[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const rawList = Array.isArray(parsed) ? parsed : [parsed];
      return rawList.map(item => ({
        id: item.id || item.legacy_id,
        titulo: item.titulo || item.title || item.name || '',
        categoria: item.categoria || item.category || 'Doramas',
        capa: item.capa || item.cover_url || item.image_url || '',
        video_url: item.video_url || item.url || '',
        vimeo_id: item.vimeo_id,
        ano: item.ano || item.year,
        nota: item.nota || item.rating,
        em_alta: item.em_alta !== undefined ? item.em_alta : item.is_trending,
        tipo_video: item.tipo_video,
        video_provider: item.video_provider,
        created_at: item.created_at || item.legacy_created_at,
        description: item.description || item.sinopse || '',
      }));
    } catch (e) {
      throw new Error(`Erro ao interpretar JSON do catálogo legado: ${(e as Error).message}`);
    }
  }

  // Otherwise parse as CSV
  const rows = parseCSV(trimmed);
  return rows.map(r => ({
    id: r.id || r.legacy_id,
    titulo: r.titulo || r.title || r.name || '',
    categoria: r.categoria || r.category || 'Doramas',
    capa: r.capa || r.cover_url || r.image_url || '',
    video_url: r.video_url || r.url || '',
    vimeo_id: r.vimeo_id,
    ano: r.ano || r.year,
    nota: r.nota || r.rating,
    em_alta: r.em_alta === 'true' || r.em_alta === '1',
    tipo_video: r.tipo_video,
    video_provider: r.video_provider,
    created_at: r.created_at,
    description: r.description || r.sinopse || '',
  }));
}

/**
 * Parse Bunny Migration CSV or JSON
 */
export function parseBunnyMigration(content: string): BunnyMigrationItem[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const rawList = Array.isArray(parsed) ? parsed : [parsed];
      return rawList.map(item => ({
        titulo: item.titulo || item.title || '',
        categoria: item.categoria || item.category || '',
        url_antiga: item.url_antiga || item.original_url || item.source_url || '',
        bunny_video_id: item.bunny_video_id || item.video_id || item.id || '',
        status: item.status || 'success',
        data: item.data || item.created_at || '',
      }));
    } catch (e) {
      throw new Error(`Erro ao interpretar arquivo do Bunny Stream: ${(e as Error).message}`);
    }
  }

  // Parse as CSV
  const rows = parseCSV(trimmed);
  return rows.map(r => ({
    titulo: r.titulo || r.title || '',
    categoria: r.categoria || r.category || '',
    url_antiga: r.url_antiga || r.original_url || r.source_url || '',
    bunny_video_id: r.bunny_video_id || r.video_id || r.id || '',
    status: r.status || 'success',
    data: r.data || r.created_at || '',
  }));
}

/**
 * Normalize string for comparison ONLY (removes accents, extra spaces, symbols, lowercase)
 * Preserves original string in memory!
 */
export function normalizeForComparison(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]/g, '')       // keep only alphanumeric
    .trim();
}

/**
 * Clean URL for reliable comparison
 */
export function cleanUrlForComparison(url: string): string {
  if (!url) return '';
  return url
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
    .split('?')[0]; // strip query parameters
}

/**
 * Generates unique slug from title without collisions
 */
export function generateUniqueSlug(title: string, existingSlugs: Set<string>): string {
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'sem-titulo';

  let slug = baseSlug;
  let counter = 2;
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  existingSlugs.add(slug);
  return slug;
}

/**
 * Cross-match Legacy Catalog with Bunny Migration files with 3-level priority matching
 */
export async function crossMatchCatalogs(
  legacyData: LegacyImportItem[],
  bunnyData: BunnyMigrationItem[]
): Promise<DetailedAnalysisSummary> {
  const existingContents = await getContents();
  const existingCategories = await getCategories();

  // Create lookups for existing contents in Supabase/store
  const existingSlugs = new Set(existingContents.map(c => c.slug));
  const existingBunnyMap = new Map<string, Content>();
  const existingLegacyIdMap = new Map<string, Content>();
  const existingLegacyUrlMap = new Map<string, Content>();
  const existingTitleCatMap = new Map<string, Content>();

  existingContents.forEach(c => {
    if (c.bunny_video_id) existingBunnyMap.set(c.bunny_video_id.toLowerCase().trim(), c);
    if (c.legacy_id) existingLegacyIdMap.set(String(c.legacy_id).toLowerCase().trim(), c);
    if (c.legacy_video_url) existingLegacyUrlMap.set(cleanUrlForComparison(c.legacy_video_url), c);
    const key = `${normalizeForComparison(c.title)}_${c.category_id}`;
    existingTitleCatMap.set(key, c);
  });

  // Build Bunny Stream lookup indexes
  // Priority 1: Map by clean url_antiga
  const bunnyByUrl = new Map<string, BunnyMigrationItem>();
  // Priority 2: Map by vimeo_id contained in url_antiga or direct id
  const bunnyByVimeo = new Map<string, BunnyMigrationItem>();
  // Priority 3 (fallback): Map by normalized title + normalized category
  const bunnyByTitleCat = new Map<string, BunnyMigrationItem>();
  // Priority 3b: Map by normalized title only
  const bunnyByTitleOnly = new Map<string, BunnyMigrationItem>();

  bunnyData.forEach(item => {
    const rawUrl = item.url_antiga || item.original_url || item.source_url || '';
    if (rawUrl) {
      const cleanUrl = cleanUrlForComparison(rawUrl);
      if (cleanUrl) bunnyByUrl.set(cleanUrl, item);

      // Check if URL ends with or contains numbers representing Vimeo ID
      const vimeoMatch = rawUrl.match(/\b(\d{6,12})\b/);
      if (vimeoMatch) {
        bunnyByVimeo.set(vimeoMatch[1], item);
      }
    }

    const title = item.titulo || item.title || '';
    const cat = item.categoria || item.category || '';
    if (title) {
      const normTitle = normalizeForComparison(title);
      const normCat = normalizeForComparison(cat);
      if (normCat) {
        bunnyByTitleCat.set(`${normTitle}_${normCat}`, item);
      }
      bunnyByTitleOnly.set(normTitle, item);
    }
  });

  const records: MatchedImportRecord[] = [];
  let totalMatched = 0;
  let totalWithoutBunny = 0;
  let totalExisting = 0;
  let totalNew = 0;
  let totalUpdates = 0;
  let totalErrors = 0;
  let totalWithValidCategory = 0;
  let totalWithoutCategory = 0;

  // Track slugs in current batch
  const batchSlugs = new Set<string>(existingSlugs);

  for (const legacy of legacyData) {
    const originalTitle = (legacy.titulo || legacy.title || legacy.name || '').trim();
    if (!originalTitle) {
      totalErrors++;
      continue;
    }

    const categoryName = (legacy.categoria || legacy.category || 'Doramas').trim();
    if (categoryName) {
      totalWithValidCategory++;
    } else {
      totalWithoutCategory++;
    }

    const legacyVideoUrl = (legacy.video_url || legacy.url || '').trim();
    const vimeoId = legacy.vimeo_id ? String(legacy.vimeo_id).trim() : '';
    const legacyId = legacy.id ? String(legacy.id).trim() : '';

    let matchedBunnyVideoId = '';
    let matchMethod: 'video_url' | 'vimeo_id' | 'title_category' | 'direct' | 'none' = 'none';

    // ---------------------------------------------------------------
    // 1ª PRIORIDADE: catalogo.video_url === migracao.url_antiga
    // ---------------------------------------------------------------
    if (legacyVideoUrl) {
      const cleanUrl = cleanUrlForComparison(legacyVideoUrl);
      if (bunnyByUrl.has(cleanUrl)) {
        const matched = bunnyByUrl.get(cleanUrl)!;
        matchedBunnyVideoId = (matched.bunny_video_id || matched.video_id || matched.id || '').trim();
        matchMethod = 'video_url';
      }
    }

    // ---------------------------------------------------------------
    // 2ª PRIORIDADE: catalogo.vimeo_id === migracao.url_antiga
    // ---------------------------------------------------------------
    if (!matchedBunnyVideoId && vimeoId) {
      if (bunnyByVimeo.has(vimeoId)) {
        const matched = bunnyByVimeo.get(vimeoId)!;
        matchedBunnyVideoId = (matched.bunny_video_id || matched.video_id || matched.id || '').trim();
        matchMethod = 'vimeo_id';
      }
    }

    // ---------------------------------------------------------------
    // 3ª PRIORIDADE (Fallback): titulo normalizado + categoria normalizada
    // ---------------------------------------------------------------
    if (!matchedBunnyVideoId) {
      const normTitle = normalizeForComparison(originalTitle);
      const normCat = normalizeForComparison(categoryName);
      const titleCatKey = `${normTitle}_${normCat}`;

      if (bunnyByTitleCat.has(titleCatKey)) {
        const matched = bunnyByTitleCat.get(titleCatKey)!;
        matchedBunnyVideoId = (matched.bunny_video_id || matched.video_id || matched.id || '').trim();
        matchMethod = 'title_category';
      } else if (bunnyByTitleOnly.has(normTitle)) {
        const matched = bunnyByTitleOnly.get(normTitle)!;
        matchedBunnyVideoId = (matched.bunny_video_id || matched.video_id || matched.id || '').trim();
        matchMethod = 'title_category';
      }
    }

    // Direct check: if record already has bunny_video_id populated
    if (!matchedBunnyVideoId && (legacy as any).bunny_video_id) {
      matchedBunnyVideoId = String((legacy as any).bunny_video_id).trim();
      matchMethod = 'direct';
    }

    // Generate unique slug
    const slug = generateUniqueSlug(originalTitle, batchSlugs);

    // Check if this record already exists in database
    let existingRecord: Content | undefined;
    if (matchedBunnyVideoId && existingBunnyMap.has(matchedBunnyVideoId.toLowerCase())) {
      existingRecord = existingBunnyMap.get(matchedBunnyVideoId.toLowerCase());
    } else if (legacyId && existingLegacyIdMap.has(legacyId.toLowerCase())) {
      existingRecord = existingLegacyIdMap.get(legacyId.toLowerCase());
    } else if (legacyVideoUrl && existingLegacyUrlMap.has(cleanUrlForComparison(legacyVideoUrl))) {
      existingRecord = existingLegacyUrlMap.get(cleanUrlForComparison(legacyVideoUrl));
    }

    // Determine status & action
    let status: ImportRecordStatus;
    let action: ImportRecordAction;

    if (!matchedBunnyVideoId) {
      totalWithoutBunny++;
      status = 'SEM BUNNY ID';
      action = 'SKIP';
    } else {
      totalMatched++;
      if (existingRecord) {
        totalExisting++;
        totalUpdates++;
        status = 'JÁ EXISTE';
        action = 'UPDATE';
      } else {
        totalNew++;
        status = 'PRONTO PARA IMPORTAR';
        action = 'INSERT';
      }
    }

    const yearNum = legacy.ano || legacy.year ? Number(legacy.ano || legacy.year) : 2024;
    const ratingNum = legacy.nota || legacy.rating ? Number(legacy.nota || legacy.rating) : 9.0;
    const isTrending = legacy.em_alta === true || legacy.em_alta === 1 || legacy.em_alta === 'true';

    records.push({
      title: originalTitle, // PRESERVE ORIGINAL TITLE
      original_title: originalTitle,
      slug,
      category_name: categoryName,
      cover_url: legacy.capa || legacy.cover_url || legacy.image_url || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
      description: legacy.description || legacy.sinopse || '',
      bunny_video_id: matchedBunnyVideoId,
      legacy_id: legacyId || undefined,
      legacy_video_url: legacyVideoUrl || undefined,
      vimeo_id: vimeoId || undefined,
      year: isNaN(yearNum) ? 2024 : yearNum,
      rating: isNaN(ratingNum) ? 9.0 : ratingNum,
      is_trending: isTrending,
      legacy_created_at: legacy.created_at,
      match_method: matchMethod,
      status,
      action,
      existing_id: existingRecord?.id,
    });
  }

  return {
    totalLegacy: legacyData.length,
    totalBunny: bunnyData.length,
    totalMatched,
    totalWithoutBunny,
    totalExisting,
    totalNew,
    totalUpdates,
    totalErrors,
    totalWithValidCategory,
    totalWithoutCategory,
    records,
  };
}

/**
 * Execute batch import in chunks (e.g. 50 items) with progress callback
 */
export async function executeBatchMigration(
  records: MatchedImportRecord[],
  onProgress?: (processed: number, total: number, message: string) => void
): Promise<{ inserted: number; updated: number; skipped: number; errors: any[] }> {
  // Only process records that have bunny_video_id and are INSERT or UPDATE
  const importable = records.filter(r => r.bunny_video_id && (r.action === 'INSERT' || r.action === 'UPDATE'));
  const total = importable.length;

  if (total === 0) {
    return { inserted: 0, updated: 0, skipped: records.length, errors: [] };
  }

  // Pre-load or ensure all categories exist
  const uniqueCategories = Array.from(new Set(importable.map(r => r.category_name.trim()).filter(Boolean)));
  const categoryMap = new Map<string, string>();

  for (const catName of uniqueCategories) {
    const cat = await ensureCategory(catName);
    categoryMap.set(catName.toLowerCase(), cat.id);
  }

  const BATCH_SIZE = 50;
  let insertedTotal = 0;
  let updatedTotal = 0;
  const allErrors: any[] = [];

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const chunk = importable.slice(i, i + BATCH_SIZE);
    const chunkIndex = Math.floor(i / BATCH_SIZE) + 1;
    const totalChunks = Math.ceil(total / BATCH_SIZE);

    if (onProgress) {
      onProgress(
        i,
        total,
        `Importando lote ${chunkIndex} de ${totalChunks} (${i} de ${total} títulos)...`
      );
    }

    // Attempt Supabase Edge Function if available
    let handledByEdgeFunction = false;
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.functions.invoke('mass-import', {
          body: { records: chunk }
        });
        if (!error && data && data.success) {
          insertedTotal += data.inserted || 0;
          updatedTotal += data.updated || 0;
          if (data.errors) allErrors.push(...data.errors);
          handledByEdgeFunction = true;
        }
      } catch (edgeErr) {
        console.warn('Edge Function mass-import not deployed or unreachable, using client batching fallback:', edgeErr);
      }
    }

    // Fallback: direct Supabase Client / Local Mock Batching
    if (!handledByEdgeFunction) {
      const payload: Partial<Content>[] = chunk.map(r => ({
        id: r.existing_id || undefined,
        title: r.title,
        slug: r.slug,
        description: r.description,
        category_id: categoryMap.get(r.category_name.toLowerCase()) || 'cat-1',
        cover_url: r.cover_url,
        banner_url: r.banner_url || r.cover_url,
        bunny_video_id: r.bunny_video_id,
        legacy_id: r.legacy_id,
        legacy_video_url: r.legacy_video_url,
        legacy_created_at: r.legacy_created_at,
        year: r.year || 2024,
        rating: r.rating || 9.0,
        duration: 60,
        classification: '14',
        country: 'Coreia do Sul',
        language: 'Legendado',
        is_trending: r.is_trending,
        is_featured: false,
        is_published: Boolean(r.bunny_video_id),
      }));

      const res = await bulkUpsertContents(payload);
      insertedTotal += res.inserted;
      updatedTotal += res.updated;
    }

    // Small delay to prevent network congestion
    await new Promise(res => setTimeout(res, 80));
  }

  const processedCount = insertedTotal + updatedTotal;
  if (onProgress) {
    onProgress(total, total, `Concluído! ${processedCount} títulos importados.`);
  }

  return {
    inserted: insertedTotal,
    updated: updatedTotal,
    skipped: records.length - processedCount,
    errors: allErrors,
  };
}

/**
 * Generate CSV Report string from import records
 */
export function generateMigrationCsvReport(records: MatchedImportRecord[]): string {
  const headers = [
    'ID Legado',
    'Título Original',
    'Categoria',
    'Bunny Video ID',
    'URL Antiga',
    'Método de Correspondência',
    'Status',
    'Ação Executada',
    'Slug Gerado',
    'Data'
  ];

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = records.map(r => [
    escapeCsv(r.legacy_id || ''),
    escapeCsv(r.title),
    escapeCsv(r.category_name),
    escapeCsv(r.bunny_video_id || ''),
    escapeCsv(r.legacy_video_url || ''),
    escapeCsv(r.match_method),
    escapeCsv(r.status),
    escapeCsv(r.action),
    escapeCsv(r.slug),
    escapeCsv(new Date().toISOString())
  ].join(','));

  return [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
}

/**
 * Trigger browser file download for the CSV report
 */
export function downloadCsvReport(records: MatchedImportRecord[]) {
  const csvContent = generateMigrationCsvReport(records);
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  link.setAttribute('download', `relatorio_migracao_doramasplay_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
