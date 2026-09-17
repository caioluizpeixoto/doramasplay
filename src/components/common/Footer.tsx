import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-brand-surface/40 border-t border-brand-border/40 pt-12 pb-24 lg:pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-crimson flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-display font-extrabold text-white">
                Doramas<span className="text-crimson">Play</span>
              </span>
            </Link>
            <p className="text-xs text-brand-muted leading-relaxed">
              O melhor streaming de entretenimento asiático, doramas coreanos, novelas, séries e filmes em altíssima definição.
            </p>
          </div>

          {/* Col 2: Categorias */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Catálogo</h4>
            <ul className="space-y-2 text-xs text-brand-muted">
              <li><Link to="/doramas" className="hover:text-white transition-colors">Doramas Populares</Link></li>
              <li><Link to="/filmes" className="hover:text-white transition-colors">Filmes Asiáticos</Link></li>
              <li><Link to="/series" className="hover:text-white transition-colors">Séries & K-Dramas</Link></li>
              <li><Link to="/novelas" className="hover:text-white transition-colors">Novelas Orientais</Link></li>
              <li><Link to="/novelinhas" className="hover:text-white transition-colors">Novelinhas Rápidas</Link></li>
            </ul>
          </div>

          {/* Col 3: Plataforma */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Plataforma</h4>
            <ul className="space-y-2 text-xs text-brand-muted">
              <li><Link to="/planos" className="hover:text-white transition-colors">Planos & Assinatura</Link></li>
              <li><Link to="/minha-lista" className="hover:text-white transition-colors">Minha Lista</Link></li>
              <li><Link to="/historico" className="hover:text-white transition-colors">Continuar Assistindo</Link></li>
              <li><Link to="/buscar" className="hover:text-white transition-colors">Busca Avançada</Link></li>
              <li><Link to="/admin" className="hover:text-gold transition-colors">Área do Administrador</Link></li>
            </ul>
          </div>

          {/* Col 4: Informações e Suporte */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Ajuda & Termos</h4>
            <ul className="space-y-2 text-xs text-brand-muted">
              <li><span className="cursor-pointer hover:text-white transition-colors">Central de Ajuda</span></li>
              <li><span className="cursor-pointer hover:text-white transition-colors">Termos de Uso</span></li>
              <li><span className="cursor-pointer hover:text-white transition-colors">Política de Privacidade</span></li>
              <li><span className="cursor-pointer hover:text-white transition-colors">Aviso de Direitos Autorais</span></li>
            </ul>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-brand-muted">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Transmissão Segura Bunny Stream</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-brand-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-muted">
          <p>© {new Date().getFullYear()} DoramasPlay. Todos os direitos reservados.</p>
          <div className="flex items-center gap-1">
            <span>Feito com</span>
            <Heart className="w-3 h-3 text-crimson fill-crimson" />
            <span>para amantes de dramas asiáticos</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
