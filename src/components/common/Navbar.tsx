import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, ShieldCheck, Film, Sparkles, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isSubscriber, signOut, activeProfile, profiles, selectProfile } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Doramas', path: '/doramas' },
    { name: 'Filmes', path: '/filmes' },
    { name: 'Séries', path: '/series' },
    { name: 'Novelas', path: '/novelas' },
    { name: 'Novelinhas', path: '/novelinhas' },
    { name: 'Minha Lista', path: '/minha-lista' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-brand-bg/90 backdrop-blur-md border-b border-brand-border/50 py-3 shadow-lg'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left Side: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-crimson-dark to-crimson flex items-center justify-center shadow-lg shadow-crimson/30 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-display font-extrabold tracking-tight text-white flex items-center">
              Doramas<span className="text-crimson">Play</span>
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-white relative py-1 ${
                    isActive ? 'text-white font-semibold' : 'text-brand-subtext'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-crimson rounded-full animate-in fade-in" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Search, VIP Plans CTA, Profile Menu */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            {searchOpen ? (
              <div className="flex items-center bg-brand-surface/90 border border-brand-border rounded-xl px-3 py-1.5 backdrop-blur-md">
                <Search className="w-4 h-4 text-brand-muted shrink-0 mr-2" />
                <input
                  type="text"
                  placeholder="Títulos, atores, gêneros..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                  className="bg-transparent text-sm text-white placeholder-brand-muted outline-none w-36 sm:w-56"
                  onBlur={() => !searchQuery && setSearchOpen(false)}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-xl text-brand-subtext hover:text-white hover:bg-brand-surface/70 transition-colors"
                title="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </form>

          {/* VIP Plan Pill */}
          {!isSubscriber ? (
            <Link
              to="/planos"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-gold to-gold-hover text-black shadow-md shadow-gold/20 hover:scale-105 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 fill-black" />
              <span>Assinar VIP</span>
            </Link>
          ) : (
            <Link
              to="/planos"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-surface/80 border border-gold/40 text-gold hover:border-gold transition-colors"
            >
              <Sparkles className="w-3 h-3 fill-gold" />
              <span>Plano Ativo</span>
            </Link>
          )}

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-brand-surface/60 transition-colors"
            >
              <img
                src={activeProfile?.avatar_url || user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt="Avatar"
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand-border/80"
              />
              <ChevronDown className="w-3.5 h-3.5 text-brand-muted hidden sm:block" />
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 mt-3 w-60 rounded-2xl bg-brand-surface border border-brand-border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
                onMouseLeave={() => setProfileOpen(false)}
              >
                {/* User Info Header */}
                <div className="px-3 py-2 border-b border-brand-border/60 mb-2">
                  <p className="text-sm font-bold text-white truncate">{activeProfile?.name || user?.name || 'Dorameiro'}</p>
                  <p className="text-xs text-brand-muted truncate">{user?.email || 'Conectado'}</p>
                </div>

                {/* Profiles switcher */}
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
                  Alternar Perfis
                </div>
                {profiles.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      selectProfile(p);
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-brand-card text-xs text-brand-text transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <img src={p.avatar_url || ''} alt={p.name} className="w-5 h-5 rounded-md object-cover" />
                      <span>{p.name}</span>
                    </div>
                    {activeProfile?.id === p.id && <Check className="w-3.5 h-3.5 text-crimson" />}
                  </button>
                ))}

                <div className="h-px bg-brand-border/60 my-2" />

                {/* Links */}
                <Link
                  to="/minha-lista"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-brand-text hover:bg-brand-card hover:text-white transition-colors"
                >
                  <Film className="w-4 h-4 text-brand-muted" />
                  Minha Lista
                </Link>

                <Link
                  to="/historico"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-brand-text hover:bg-brand-card hover:text-white transition-colors"
                >
                  <Bell className="w-4 h-4 text-brand-muted" />
                  Histórico de Exibição
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gold hover:bg-gold/10 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-gold" />
                    Painel Admin
                  </Link>
                )}

                <div className="h-px bg-brand-border/60 my-2" />

                <button
                  onClick={() => {
                    signOut();
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-crimson hover:bg-crimson/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair da Conta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
