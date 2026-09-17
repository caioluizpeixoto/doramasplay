import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Database, 
  Download, 
  Sparkles, 
  RefreshCw, 
  Search, 
  Filter,
  ArrowRight,
  Layers,
  HelpCircle,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Button } from '../../components/common/Button';
import { 
  parseLegacyCatalog, 
  parseBunnyMigration, 
  crossMatchCatalogs, 
  executeBatchMigration, 
  downloadCsvReport, 
  DetailedAnalysisSummary 
} from '../../services/importService';
// Removido import de samples mockados
import { MatchedImportRecord, ImportRecordStatus } from '../../types/database';
import { showToast } from '../../components/common/Toast';

export const AdminImportPage: React.FC = () => {
  // File inputs state
  const [legacyFileContent, setLegacyFileContent] = useState<string>('');
  const [legacyFileName, setLegacyFileName] = useState<string>('');
  const [bunnyFileContent, setBunnyFileContent] = useState<string>('');
  const [bunnyFileName, setBunnyFileName] = useState<string>('');

  // Processing & Analysis state
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [summary, setSummary] = useState<DetailedAnalysisSummary | null>(null);

  // Table filter & search state
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Batch import & progress state
  const [importing, setImporting] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const [totalToProcess, setTotalToProcess] = useState<number>(0);

  // Final Report state
  const [finalReport, setFinalReport] = useState<{
    inserted: number;
    updated: number;
    skipped: number;
    withoutBunny: number;
    errors: number;
  } | null>(null);

  const legacyInputRef = useRef<HTMLInputElement>(null);
  const bunnyInputRef = useRef<HTMLInputElement>(null);

  // Handle file reader helper
  const handleReadFile = (file: File, type: 'legacy' | 'bunny') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (type === 'legacy') {
        setLegacyFileContent(content);
        setLegacyFileName(file.name);
      } else {
        setBunnyFileContent(content);
        setBunnyFileName(file.name);
      }
      showToast(`Arquivo "${file.name}" carregado com sucesso!`);
    };
    reader.readAsText(file);
  };

  // Load sample data button
  const handleLoadSamples = () => {
    showToast('Amostras foram removidas da produção para segurança.');
  };

  // Run 3-level cross-match analysis
  const handleAnalyze = async () => {
    if (!legacyFileContent.trim() || !bunnyFileContent.trim()) {
      showToast('Por favor, carregue os dois arquivos antes de analisar!', 'error');
      return;
    }

    try {
      setAnalyzing(true);
      setFinalReport(null);

      const legacyItems = parseLegacyCatalog(legacyFileContent);
      const bunnyItems = parseBunnyMigration(bunnyFileContent);

      if (legacyItems.length === 0) {
        showToast('Nenhum item válido encontrado no catálogo antigo', 'error');
        return;
      }
      if (bunnyItems.length === 0) {
        showToast('Nenhum item válido encontrado no arquivo do Bunny', 'error');
        return;
      }

      const result = await crossMatchCatalogs(legacyItems, bunnyItems);
      setSummary(result);
      showToast(`Análise concluída: ${result.totalMatched} correspondências encontradas.`);
    } catch (err: any) {
      showToast(err.message || 'Erro durante a análise dos arquivos', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  // Execute batch migration
  const handleExecuteImport = async () => {
    if (!summary || summary.records.length === 0) return;

    try {
      setImporting(true);
      const importableCount = summary.totalNew + summary.totalUpdates;
      setTotalToProcess(importableCount);
      setProcessedCount(0);
      setProgressPercent(0);

      const result = await executeBatchMigration(
        summary.records,
        (current, total, message) => {
          setProcessedCount(current);
          setProgressPercent(total > 0 ? Math.round((current / total) * 100) : 0);
          setProgressMessage(message);
        }
      );

      setFinalReport({
        inserted: result.inserted,
        updated: result.updated,
        skipped: result.skipped,
        withoutBunny: summary.totalWithoutBunny,
        errors: result.errors.length,
      });

      showToast(`Migração finalizada! ${result.inserted + result.updated} títulos importados.`);
    } catch (e: any) {
      showToast(`Erro na migração: ${e.message}`, 'error');
    } finally {
      setImporting(false);
    }
  };

  // Filtered records for table
  const filteredRecords = React.useMemo(() => {
    if (!summary) return [];
    let list = summary.records;

    if (statusFilter !== 'ALL') {
      list = list.filter(r => r.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(r => 
        r.title.toLowerCase().includes(q) ||
        r.category_name.toLowerCase().includes(q) ||
        (r.bunny_video_id && r.bunny_video_id.toLowerCase().includes(q)) ||
        (r.legacy_video_url && r.legacy_video_url.toLowerCase().includes(q))
      );
    }

    return list;
  }, [summary, statusFilter, searchTerm]);

  return (
    <div className="flex min-h-screen bg-brand-bg">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-gold border border-gold/30">
                Migração Comercial
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Bunny Stream Connect
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
              Migração de Conteúdos em Massa
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted mt-1 max-w-2xl leading-relaxed">
              Cruze o catálogo legado (<strong>catalogo_2160.json</strong>) com os vídeos migrados da Bunny Stream (<strong>migracao_sucesso.csv</strong>). O sistema associa automaticamente o Bunny Video ID de cada título, cria novas categorias e publica apenas os vídeos migrados.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleLoadSamples}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold/15 hover:bg-gold/25 text-gold border border-gold/40 text-xs font-bold transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Carregar Arquivos de Teste</span>
            </button>
          </div>
        </div>

        {/* 2 Separate Upload Dropzones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dropzone 1: catalogo_2160.json */}
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border/80 hover:border-brand-border transition-all flex flex-col justify-between space-y-4 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-crimson flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  1. Catálogo Antigo (catalogo_2160.json)
                </span>
                {legacyFileName && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                    <FileCheck className="w-3 h-3" /> Pronto
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-muted">
                Arquivo contendo títulos, categorias, capas, ano, notas e URLs legadas.
              </p>
            </div>

            {/* Drag & Drop Area */}
            <div
              onClick={() => legacyInputRef.current?.click()}
              className={`p-6 rounded-xl border-2 border-dashed cursor-pointer text-center transition-all ${
                legacyFileContent
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-brand-border/80 hover:border-crimson/60 bg-brand-bg/50 hover:bg-brand-bg'
              }`}
            >
              <input
                ref={legacyInputRef}
                type="file"
                accept=".json,.csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleReadFile(e.target.files[0], 'legacy');
                }}
              />
              <Upload className="w-8 h-8 text-brand-muted mx-auto mb-2" />
              <p className="text-xs font-bold text-white">
                {legacyFileName || 'Clique ou arraste o catalogo_2160.json'}
              </p>
              <p className="text-[10px] text-brand-muted mt-1">Formato JSON ou CSV aceito</p>
            </div>
          </div>

          {/* Dropzone 2: migracao_sucesso.csv */}
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border/80 hover:border-brand-border transition-all flex flex-col justify-between space-y-4 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  2. Migração Bunny (migracao_sucesso.csv)
                </span>
                {bunnyFileName && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                    <FileCheck className="w-3 h-3" /> Pronto
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-muted">
                Planilha CSV gerada pelo Bunny Stream com titulo, categoria, url_antiga e bunny_video_id.
              </p>
            </div>

            {/* Drag & Drop Area */}
            <div
              onClick={() => bunnyInputRef.current?.click()}
              className={`p-6 rounded-xl border-2 border-dashed cursor-pointer text-center transition-all ${
                bunnyFileContent
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-brand-border/80 hover:border-emerald-500/60 bg-brand-bg/50 hover:bg-brand-bg'
              }`}
            >
              <input
                ref={bunnyInputRef}
                type="file"
                accept=".csv,.json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleReadFile(e.target.files[0], 'bunny');
                }}
              />
              <Upload className="w-8 h-8 text-brand-muted mx-auto mb-2" />
              <p className="text-xs font-bold text-white">
                {bunnyFileName || 'Clique ou arraste o migracao_sucesso.csv'}
              </p>
              <p className="text-[10px] text-brand-muted mt-1">Formato CSV ou JSON aceito</p>
            </div>
          </div>
        </div>

        {/* Action Button: Analisar Arquivos */}
        <div className="flex items-center gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={handleAnalyze}
            disabled={analyzing || !legacyFileContent || !bunnyFileContent}
            icon={<RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />}
            className="shadow-xl shadow-crimson/25"
          >
            {analyzing ? 'Analisando e Cruzando...' : 'Analisar arquivos'}
          </Button>
        </div>

        {/* ANÁLISE ANTES DA IMPORTAÇÃO: 9 Métricas */}
        {summary && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Diagnóstico de Análise Pré-Importação
              </h3>
              <span className="text-xs text-brand-muted">Cruzamento em 3 níveis concluído</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border">
                <p className="text-[10px] font-bold text-brand-muted uppercase">Total no Catálogo</p>
                <p className="text-2xl font-black text-white mt-1">{summary.totalLegacy}</p>
                <p className="text-[10px] text-brand-muted mt-1">Registros antigos</p>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border">
                <p className="text-[10px] font-bold text-brand-muted uppercase">Migrados para Bunny</p>
                <p className="text-2xl font-black text-white mt-1">{summary.totalBunny}</p>
                <p className="text-[10px] text-brand-muted mt-1">No arquivo CSV</p>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border">
                <p className="text-[10px] font-bold text-emerald-400 uppercase">Correspondência OK</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">{summary.totalMatched}</p>
                <p className="text-[10px] text-emerald-500/80 mt-1">Com Bunny Video ID</p>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border">
                <p className="text-[10px] font-bold text-crimson uppercase">Sem Bunny ID</p>
                <p className="text-2xl font-black text-crimson mt-1">{summary.totalWithoutBunny}</p>
                <p className="text-[10px] text-crimson/80 mt-1">Não serão publicados</p>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border">
                <p className="text-[10px] font-bold text-sky-400 uppercase">Novos Títulos</p>
                <p className="text-2xl font-black text-sky-400 mt-1">{summary.totalNew}</p>
                <p className="text-[10px] text-sky-400/80 mt-1">Serão inseridos</p>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border">
                <p className="text-[10px] font-bold text-gold uppercase">Atualizações</p>
                <p className="text-2xl font-black text-gold mt-1">{summary.totalUpdates}</p>
                <p className="text-[10px] text-gold/80 mt-1">Já existem no sistema</p>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border">
                <p className="text-[10px] font-bold text-emerald-400 uppercase">Categoria Válida</p>
                <p className="text-2xl font-black text-white mt-1">{summary.totalWithValidCategory}</p>
                <p className="text-[10px] text-brand-muted mt-1">Mapeadas com sucesso</p>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border">
                <p className="text-[10px] font-bold text-amber-500 uppercase">Sem Categoria</p>
                <p className="text-2xl font-black text-white mt-1">{summary.totalWithoutCategory}</p>
                <p className="text-[10px] text-brand-muted mt-1">Padrão 'Doramas'</p>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border">
                <p className="text-[10px] font-bold text-red-500 uppercase">Com Erro</p>
                <p className="text-2xl font-black text-white mt-1">{summary.totalErrors}</p>
                <p className="text-[10px] text-brand-muted mt-1">Sem título ou corrompidos</p>
              </div>
            </div>

            {/* IMPORT ACTION BAR */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-surface via-brand-card to-brand-surface border border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-crimson" />
                  Pronto para Executar a Importação em Lotes
                </h4>
                <p className="text-xs text-brand-muted">
                  {summary.totalNew} novos títulos serão inseridos e {summary.totalUpdates} serão atualizados. Slugs e IDs duplicados serão protegidos.
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleExecuteImport}
                disabled={importing || (summary.totalNew + summary.totalUpdates === 0)}
                icon={<Database className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-xl shadow-crimson/30"
              >
                {importing ? 'Processando Lotes...' : 'Importar conteúdos'}
              </Button>
            </div>

            {/* PROGRESS BAR IN BATCHES */}
            {importing && (
              <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{progressMessage}</span>
                  <span className="font-bold text-crimson">
                    Importando {processedCount} de {totalToProcess} ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-brand-bg rounded-full overflow-hidden p-0.5 border border-brand-border">
                  <div
                    className="h-full bg-gradient-to-r from-crimson to-crimson-hover rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* FINAL REPORT SECTION */}
            {finalReport && (
              <div className="p-6 rounded-2xl bg-brand-surface border border-emerald-500/40 space-y-4 animate-in fade-in shadow-2xl">
                <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Relatório Final da Importação
                  </h4>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => downloadCsvReport(summary.records)}
                    icon={<Download className="w-3.5 h-3.5" />}
                  >
                    Baixar relatório CSV
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-brand-card">
                    <p className="text-xs text-brand-muted">Importados</p>
                    <p className="text-xl font-bold text-emerald-400 mt-1">{finalReport.inserted}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-card">
                    <p className="text-xs text-brand-muted">Atualizados</p>
                    <p className="text-xl font-bold text-gold mt-1">{finalReport.updated}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-card">
                    <p className="text-xs text-brand-muted">Ignorados</p>
                    <p className="text-xl font-bold text-brand-subtext mt-1">{finalReport.skipped}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-card">
                    <p className="text-xs text-brand-muted">Sem Bunny ID</p>
                    <p className="text-xl font-bold text-crimson mt-1">{finalReport.withoutBunny}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-card">
                    <p className="text-xs text-brand-muted">Erros</p>
                    <p className="text-xl font-bold text-white mt-1">{finalReport.errors}</p>
                  </div>
                </div>
              </div>
            )}

            {/* PREVIEW TABLE WITH FILTERS & SEARCH */}
            <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden shadow-xl space-y-4 p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-muted mr-1 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Filtrar:
                  </span>
                  {[
                    { label: 'Todos', val: 'ALL' },
                    { label: 'Pronto para Importar', val: 'PRONTO PARA IMPORTAR' },
                    { label: 'Já Existe', val: 'JÁ EXISTE' },
                    { label: 'Sem Bunny ID', val: 'SEM BUNNY ID' },
                  ].map(tab => (
                    <button
                      key={tab.val}
                      onClick={() => setStatusFilter(tab.val)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        statusFilter === tab.val
                          ? 'bg-crimson text-white'
                          : 'bg-brand-card text-brand-subtext hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => downloadCsvReport(summary.records)}
                    icon={<Download className="w-3.5 h-3.5" />}
                  >
                    Baixar relatório CSV
                  </Button>

                  <div className="relative bg-brand-bg border border-brand-border rounded-xl px-2.5 py-1 flex items-center">
                    <Search className="w-3.5 h-3.5 text-brand-muted mr-1.5" />
                    <input
                      type="text"
                      placeholder="Pesquisar título..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="bg-transparent text-xs text-white outline-none w-36 sm:w-44"
                    />
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-brand-subtext">
                  <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] border-b border-brand-border/60">
                    <tr>
                      <th className="px-4 py-3">Capa</th>
                      <th className="px-4 py-3">Título Original</th>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3">Bunny Video ID</th>
                      <th className="px-4 py-3">URL Antiga</th>
                      <th className="px-4 py-3">Correspondência</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/40">
                    {filteredRecords.slice(0, 50).map((rec, i) => (
                      <tr key={i} className="hover:bg-brand-card/40 transition-colors">
                        {/* Capa */}
                        <td className="px-4 py-2.5">
                          <img
                            src={rec.cover_url}
                            alt={rec.title}
                            className="w-9 h-12 object-cover rounded-lg border border-brand-border"
                          />
                        </td>

                        {/* Title */}
                        <td className="px-4 py-2.5 max-w-[220px]">
                          <span className="font-bold text-white line-clamp-1">{rec.title}</span>
                          <span className="text-[10px] text-brand-muted font-mono">{rec.slug}</span>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-2.5 font-semibold text-brand-text">
                          {rec.category_name}
                        </td>

                        {/* Bunny Video ID */}
                        <td className="px-4 py-2.5 font-mono text-[11px]">
                          {rec.bunny_video_id ? (
                            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              {rec.bunny_video_id}
                            </span>
                          ) : (
                            <span className="text-crimson font-sans text-[10px]">Sem Bunny ID</span>
                          )}
                        </td>

                        {/* URL Antiga */}
                        <td className="px-4 py-2.5 max-w-[150px] truncate text-[11px] text-brand-muted" title={rec.legacy_video_url}>
                          {rec.legacy_video_url || rec.vimeo_id ? `${rec.legacy_video_url || `Vimeo: ${rec.vimeo_id}`}` : '—'}
                        </td>

                        {/* Match Method */}
                        <td className="px-4 py-2.5">
                          {rec.match_method === 'video_url' && (
                            <span className="text-emerald-400 text-[10px] font-semibold">1. video_url = url_antiga</span>
                          )}
                          {rec.match_method === 'vimeo_id' && (
                            <span className="text-sky-400 text-[10px] font-semibold">2. vimeo_id = url_antiga</span>
                          )}
                          {rec.match_method === 'title_category' && (
                            <span className="text-gold text-[10px] font-semibold">3. Título + Categoria</span>
                          )}
                          {rec.match_method === 'none' && (
                            <span className="text-brand-muted text-[10px]">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-2.5">
                          {rec.status === 'PRONTO PARA IMPORTAR' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                              <CheckCircle2 className="w-3 h-3" /> PRONTO
                            </span>
                          )}
                          {rec.status === 'JÁ EXISTE' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gold/15 text-gold border border-gold/30">
                              JÁ EXISTE (UPDATE)
                            </span>
                          )}
                          {rec.status === 'SEM BUNNY ID' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-crimson/15 text-crimson border border-crimson/30">
                              <XCircle className="w-3 h-3" /> SEM BUNNY ID
                            </span>
                          )}
                        </td>

                        {/* Ação */}
                        <td className="px-4 py-2.5 text-right font-bold text-[11px]">
                          {rec.action === 'INSERT' && <span className="text-sky-400">CRIAR</span>}
                          {rec.action === 'UPDATE' && <span className="text-gold">ATUALIZAR</span>}
                          {rec.action === 'SKIP' && <span className="text-brand-muted">IGNORAR</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredRecords.length > 50 && (
                <div className="text-center pt-2 text-xs text-brand-muted">
                  Exibindo primeiros 50 de {filteredRecords.length} registros filtrados.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
