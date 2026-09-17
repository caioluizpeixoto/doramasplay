import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-24 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-brand-surface border border-brand-border flex items-center justify-center mx-auto text-crimson shadow-2xl">
          <Film className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-sm font-bold uppercase tracking-widest text-crimson">Erro 404</span>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white">
            Cena não encontrada
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted max-w-sm mx-auto leading-relaxed">
            O dorama, série ou página que você está procurando pode ter sido removido ou está temporariamente indisponível.
          </p>
        </div>

        <Link to="/" className="inline-block">
          <Button variant="primary" size="lg" icon={<Home className="w-4 h-4" />}>
            Voltar para o Início
          </Button>
        </Link>
      </div>
    </div>
  );
};
