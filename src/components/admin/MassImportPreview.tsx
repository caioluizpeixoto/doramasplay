import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Database } from 'lucide-react';
import { DetailedAnalysisSummary } from '../../services/importService';
import { Button } from '../common/Button';

interface MassImportPreviewProps {
  summary: DetailedAnalysisSummary;
  onConfirmImport: () => void;
  importing: boolean;
}

export const MassImportPreview: React.FC<MassImportPreviewProps> = ({
  summary,
  onConfirmImport,
  importing,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border text-center">
          <p className="text-[11px] font-semibold text-brand-muted uppercase">Total Encontrado</p>
          <p className="text-xl font-bold text-white mt-1">{summary.totalLegacy}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border text-center">
          <p className="text-[11px] font-semibold text-emerald-400 uppercase">Com Bunny ID</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{summary.totalMatched}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border text-center">
          <p className="text-[11px] font-semibold text-crimson uppercase">Sem Bunny ID</p>
          <p className="text-xl font-bold text-crimson mt-1">{summary.totalWithoutBunny}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border text-center">
          <p className="text-[11px] font-semibold text-sky-400 uppercase">Novos Títulos</p>
          <p className="text-xl font-bold text-sky-400 mt-1">{summary.totalNew}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border text-center">
          <p className="text-[11px] font-semibold text-gold uppercase">Atualizações</p>
          <p className="text-xl font-bold text-gold mt-1">{summary.totalUpdates}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border text-center">
          <p className="text-[11px] font-semibold text-amber-500 uppercase">Existentes</p>
          <p className="text-xl font-bold text-amber-500 mt-1">{summary.totalExisting}</p>
        </div>
      </div>

      {/* Confirmation Banner */}
      <div className="p-4 rounded-2xl bg-brand-surface/90 border border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Pronto para Importar</h4>
          <p className="text-xs text-brand-muted">
            {summary.totalNew + summary.totalUpdates} registros válidos com Bunny Video ID prontos para upsert sem duplicações.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={onConfirmImport}
          disabled={importing || (summary.totalNew + summary.totalUpdates === 0)}
          icon={<Database className="w-4 h-4" />}
          className="w-full sm:w-auto shadow-xl shadow-crimson/25"
        >
          {importing ? 'Importando...' : 'Importar para Supabase'}
        </Button>
      </div>

      {/* Table Preview */}
      <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden">
        <div className="px-5 py-3.5 border-b border-brand-border/60 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Pré-visualização dos Registros</h4>
          <span className="text-xs text-brand-muted">Exibindo primeiros 50 itens</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-brand-subtext">
            <thead className="bg-brand-bg/80 text-brand-muted uppercase text-[10px] border-b border-brand-border/60">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Bunny Video ID</th>
                <th className="px-4 py-3">Método de Cruzamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {summary.records.slice(0, 50).map((rec: any, i: number) => (
                <tr key={i} className="hover:bg-brand-card/40 transition-colors">
                  <td className="px-4 py-3">
                    {rec.status === 'PRONTO PARA IMPORTAR' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Novo
                      </span>
                    )}
                    {rec.status === 'JÁ EXISTE' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gold/15 text-gold border border-gold/30">
                        Atualização
                      </span>
                    )}
                    {rec.status === 'SEM BUNNY ID' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-crimson/15 text-crimson border border-crimson/30">
                        <XCircle className="w-3 h-3" /> Sem Bunny
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-white max-w-[200px] truncate">
                    {rec.title}
                  </td>
                  <td className="px-4 py-3">{rec.category_name}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-brand-muted">
                    {rec.bunny_video_id || '—'}
                  </td>
                  <td className="px-4 py-3">
                    {rec.match_method === 'video_url' && (
                      <span className="text-emerald-400">1. URL Legada = Antiga</span>
                    )}
                    {rec.match_method === 'vimeo_id' && (
                      <span className="text-sky-400">2. Vimeo ID = Antiga</span>
                    )}
                    {rec.match_method === 'title_category' && (
                      <span className="text-gold">3. Fallback: Título + Cat.</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
