import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Film, Lock, Mail, User as UserIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { showToast } from '../components/common/Toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      if (isRegister) {
        await signUp(email, password, name);
        showToast('Cadastro realizado com sucesso! Bem-vindo à DoramasPlay.');
      } else {
        await signIn(email, password);
        showToast('Login efetuado com sucesso!');
      }
      navigate('/');
    } catch (err: any) {
      showToast(err.message || 'Erro ao realizar autenticação', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setLoading(true);
    await signIn('admin@doramasplay.com', 'admin123');
    showToast('Conectado como Administrador Master!');
    navigate('/admin');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-6 sm:p-8 rounded-3xl bg-brand-surface border border-brand-border/80 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-crimson flex items-center justify-center shadow-lg shadow-crimson/30">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black font-display text-white">
              Doramas<span className="text-crimson">Play</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold font-display text-white">
            {isRegister ? 'Crie sua conta VIP' : 'Acesse sua conta'}
          </h2>
          <p className="text-xs text-brand-muted">
            {isRegister
              ? 'Comece agora a assistir aos melhores doramas e séries.'
              : 'Entre para continuar de onde parou e acessar sua lista.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-brand-bg border border-brand-border/60">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isRegister ? 'bg-crimson text-white shadow' : 'text-brand-muted hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              isRegister ? 'bg-crimson text-white shadow' : 'text-brand-muted hover:text-white'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-brand-subtext mb-1">Nome Completo</label>
              <div className="relative flex items-center bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5 focus-within:border-crimson transition-colors">
                <UserIcon className="w-4 h-4 text-brand-muted mr-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-transparent text-sm text-white placeholder-brand-muted outline-none w-full"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-brand-subtext mb-1">E-mail</label>
            <div className="relative flex items-center bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5 focus-within:border-crimson transition-colors">
              <Mail className="w-4 h-4 text-brand-muted mr-2.5" />
              <input
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-transparent text-sm text-white placeholder-brand-muted outline-none w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-subtext mb-1">Senha</label>
            <div className="relative flex items-center bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5 focus-within:border-crimson transition-colors">
              <Lock className="w-4 h-4 text-brand-muted mr-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-transparent text-sm text-white placeholder-brand-muted outline-none w-full"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full shadow-xl shadow-crimson/25 mt-2"
          >
            {loading ? 'Aguarde...' : (isRegister ? 'Criar Conta' : 'Entrar na Plataforma')}
          </Button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="pt-4 border-t border-brand-border/60 text-center space-y-2">
          <p className="text-xs text-brand-muted">Acesso rápido para testes de desenvolvimento:</p>
          <button
            type="button"
            onClick={handleDemoAdmin}
            className="w-full py-2 px-3 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 text-xs font-bold transition-colors"
          >
            Entrar como Administrador Master (Demo)
          </button>
        </div>
      </div>
    </div>
  );
};
