import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Bookmark, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { label: 'Início', path: '/', icon: Home },
    { label: 'Buscar', path: '/buscar', icon: Search },
    { label: 'Minha Lista', path: '/minha-lista', icon: Bookmark },
    { label: 'Perfil', path: user ? '/perfil' : '/login', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-bg/95 backdrop-blur-lg border-t border-brand-border/60 px-6 py-2">
      <nav className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
                isActive ? 'text-crimson font-medium' : 'text-brand-muted hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[11px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
