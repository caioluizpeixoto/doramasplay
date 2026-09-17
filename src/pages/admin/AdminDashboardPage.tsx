import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  CreditCard, 
  Film, 
  PlayCircle, 
  DollarSign, 
  UserPlus, 
  Plus, 
  UploadCloud,
  Eye,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { StatCard } from '../../components/admin/StatCard';
import { Button } from '../../components/common/Button';
import { getContents } from '../../services/api';
import { Content } from '../../types/database';

export const AdminDashboardPage: React.FC = () => {
  const [contents, setContents] = useState<Content[]>([]);

  useEffect(() => {
    getContents().then(setContents);
  }, []);

  return (
    <div className="flex min-h-screen bg-brand-bg">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
              Dashboard Geral
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted mt-1">
              Visão consolidada de audiência, assinaturas e títulos no DoramasPlay.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/admin/contents">
              <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
                Novo Conteúdo
              </Button>
            </Link>

            <Link to="/admin/import">
              <Button variant="secondary" size="md" icon={<UploadCloud className="w-4 h-4" />}>
                Importação em Massa
              </Button>
            </Link>
          </div>
        </div>

        {/* Top 6 KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <StatCard
            title="Total de Usuários"
            value="1.428"
            change="+14.2% no mês"
            icon={<Users className="w-5 h-5 text-sky-400" />}
            subtitle="Base ativa"
          />

          <StatCard
            title="Assinantes Ativos VIP"
            value="942"
            change="+22.8% no mês"
            icon={<CreditCard className="w-5 h-5 text-emerald-400" />}
            subtitle="Taxa de conversão 66%"
          />

          <StatCard
            title="Receita Recorrente (MRR)"
            value="R$ 38.450"
            change="+19.4% no mês"
            icon={<DollarSign className="w-5 h-5 text-gold" />}
            subtitle="Planos mensais e anuais"
          />

          <StatCard
            title="Total de Conteúdos"
            value={contents.length || '238'}
            change="+8 adicionados hoje"
            icon={<Film className="w-5 h-5 text-crimson" />}
            subtitle="No catálogo"
          />

          <StatCard
            title="Reproduções Realizadas"
            value="45.890"
            change="+31.5%"
            icon={<PlayCircle className="w-5 h-5 text-purple-400" />}
            subtitle="Minutos assistidos: 1.8M"
          />

          <StatCard
            title="Novos Cadastros"
            value="+312"
            change="Últimos 30 dias"
            icon={<UserPlus className="w-5 h-5 text-amber-400" />}
            subtitle="Crescimento contínuo"
          />
        </div>

        {/* Split Section: Top Viewed Titles & Recently Added */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Viewed Titles */}
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center justify-between">
              <span>Vídeos Mais Vistos (Ranking)</span>
              <span className="text-xs text-brand-muted font-normal">Últimos 7 dias</span>
            </h3>

            <div className="space-y-3">
              {contents.slice(0, 5).map((content, idx) => (
                <div
                  key={content.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-brand-card/60 border border-brand-border/40 hover:border-crimson/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-sm font-black text-crimson text-center">#{idx + 1}</span>
                    <img
                      src={content.cover_url}
                      alt={content.title}
                      className="w-10 h-14 object-cover rounded-lg shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">{content.title}</h4>
                      <p className="text-xs text-brand-muted">{content.category?.name || 'Dorama'} • {content.year}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-400">{(12400 - idx * 1800).toLocaleString('pt-BR')} plays</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Added Contents */}
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Conteúdos Adicionados Recentemente</h3>
              <Link to="/admin/contents" className="text-xs font-semibold text-crimson hover:underline">
                Ver todos
              </Link>
            </div>

            <div className="space-y-3">
              {contents.slice(0, 5).map(content => (
                <div
                  key={content.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-brand-card/60 border border-brand-border/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={content.cover_url}
                      alt={content.title}
                      className="w-10 h-14 object-cover rounded-lg shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">{content.title}</h4>
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                        <CheckCircle className="w-3 h-3" /> Publicado
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/content/${content.slug}`}
                    target="_blank"
                    className="p-2 text-brand-muted hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
