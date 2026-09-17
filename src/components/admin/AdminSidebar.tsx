import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Film, 
  Layers, 
  Tv, 
  Image as ImageIcon, 
  UploadCloud, 
  CreditCard, 
  ArrowLeft,
  ShieldCheck 
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Conteúdos', path: '/admin/contents', icon: Film },
    { label: 'Categorias', path: '/admin/categories', icon: Layers },
    { label: 'Episódios', path: '/admin/episodes', icon: Tv },
    { label: 'Banners Home', path: '/admin/banners', icon: ImageIcon },
    { label: 'Importação em Massa', path: '/admin/import', icon: UploadCloud },
    { label: 'Planos & Assinaturas', path: '/admin/plans', icon: CreditCard },
  ];

  return (
    <aside className="w-64 bg-brand-surface border-r border-brand-border/60 min-h-screen flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        {/* Admin Header */}
        <div className="flex items-center gap-3 px-3 py-2 border-b border-brand-border/50 pb-4">
          <div className="w-9 h-9 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-display">Painel de Controle</h2>
            <p className="text-[11px] text-gold font-medium">Administrador Master</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-crimson text-white shadow-lg shadow-crimson/20'
                    : 'text-brand-muted hover:text-white hover:bg-brand-card/70'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Back to Client Site */}
      <div className="pt-4 border-t border-brand-border/60">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-brand-subtext hover:text-white hover:bg-brand-card transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o Streaming</span>
        </Link>
      </div>
    </aside>
  );
};
