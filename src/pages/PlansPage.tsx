import React, { useState } from 'react';
import { Check, Sparkles, Shield, Zap, CreditCard, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { showToast } from '../components/common/Toast';

export const PlansPage: React.FC = () => {
  const { user, isSubscriber, subscribeToPlan } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'plan-1',
      name: 'Mensal Premium',
      period: 'por mês',
      price: '19,90',
      description: 'Ideal para quem deseja flexibilidade total e sem fidelidade.',
      popular: false,
      badge: 'Flexível',
      features: [
        'Acesso completo a todos os doramas e filmes',
        'Resolução Full HD (1080p)',
        'Assista em até 2 telas simultâneas',
        'Sem nenhum anúncio ou interrupção',
        'Cancele quando quiser a qualquer momento',
      ],
    },
    {
      id: 'plan-2',
      name: 'Trimestral VIP',
      period: 'a cada 3 meses',
      price: '49,90',
      description: 'O equilíbrio perfeito entre economia e benefícios de alto nível.',
      popular: true,
      badge: 'Mais Popular',
      features: [
        'Acesso completo a todo o catálogo',
        'Resolução 4K Ultra HD + HDR',
        'Assista em até 3 telas simultâneas',
        'Sem anúncios',
        'Lançamentos antecipados e estreias VIP',
        'Economia de mais de 15% comparado ao mensal',
      ],
    },
    {
      id: 'plan-3',
      name: 'Anual Diamond',
      period: 'por ano (apenas R$ 12,49/mês)',
      price: '149,90',
      description: 'A experiência definitiva com a maior economia do ano.',
      popular: false,
      badge: 'Melhor Custo-Benefício',
      features: [
        'Acesso irrestrito a todos os conteúdos (+18 inclusive)',
        'Resolução máxima 4K Ultra HD & Dolby Áudio',
        'Assista em até 4 telas simultâneas em alta velocidade',
        'Sem anúncios',
        'Download offline para assistir no celular/tablet',
        'Suporte prioritário via WhatsApp VIP',
      ],
    },
  ];

  const handleSelectPlan = async (planId: string) => {
    try {
      setLoadingPlan(planId);
      await subscribeToPlan(planId);
      showToast('Assinatura VIP ativada com sucesso! Aproveite.');
    } catch {
      showToast('Erro ao processar assinatura', 'error');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20 space-y-12">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold/15 text-gold border border-gold/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Experiência Sem Limites</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight leading-tight">
          Escolha o seu plano <span className="text-crimson">DoramasPlay</span>
        </h1>

        <p className="text-xs sm:text-base text-brand-muted leading-relaxed max-w-xl mx-auto">
          Assista aos doramas mais apaixonantes, novelas completas e lançamentos em 4K. Cancele quando quiser com segurança.
        </p>
      </div>

      {/* Plans Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {plans.map(plan => {
          const isCurrentActive = isSubscriber && user?.subscription?.plan_id === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-b from-brand-surface via-brand-card to-brand-surface border-2 border-crimson shadow-2xl shadow-crimson/15 scale-[1.02] z-10'
                  : 'bg-brand-surface/80 border border-brand-border/70 hover:border-brand-border shadow-xl'
              }`}
            >
              {/* Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md ${
                  plan.popular
                    ? 'bg-crimson text-white shadow-crimson/40'
                    : 'bg-brand-card text-gold border border-gold/40'
                }`}>
                  {plan.badge}
                </span>
              </div>

              {/* Plan Header */}
              <div className="space-y-4 pt-2">
                <div>
                  <h3 className="text-xl font-bold font-display text-white">{plan.name}</h3>
                  <p className="text-xs text-brand-muted mt-1 min-h-[32px]">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-brand-subtext font-semibold">R$</span>
                    <span className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
                      {plan.price}
                    </span>
                  </div>
                  <span className="text-xs text-brand-muted">{plan.period}</span>
                </div>

                <div className="h-px bg-brand-border/60 my-4" />

                {/* Benefits List */}
                <ul className="space-y-3">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-brand-subtext">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? 'text-crimson' : 'text-emerald-500'}`} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div className="pt-8">
                {isCurrentActive ? (
                  <Button
                    variant="outline"
                    size="lg"
                    disabled
                    className="w-full border-gold/50 text-gold font-bold"
                  >
                    Plano Ativo Atual
                  </Button>
                ) : (
                  <Button
                    variant={plan.popular ? 'primary' : 'secondary'}
                    size="lg"
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loadingPlan === plan.id}
                    className="w-full"
                  >
                    {loadingPlan === plan.id ? 'Ativando...' : 'Assinar Agora'}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security & Gateways Guarantee */}
      <div className="p-6 rounded-2xl bg-brand-surface/40 border border-brand-border/50 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-around gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3 text-xs text-brand-subtext">
          <Lock className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Pagamento 100% criptografado e seguro</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-brand-subtext">
          <CreditCard className="w-5 h-5 text-gold shrink-0" />
          <span>Pix, Cartão de Crédito e Boleto Bancário</span>
        </div>
      </div>
    </div>
  );
};
