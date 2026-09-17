import React, { useEffect, useState } from 'react';
import { History as HistoryIcon, Play, Trash2 } from 'lucide-react';
import { getWatchHistory } from '../services/api';
import { WatchHistory } from '../types/database';
import { ContinueWatchingCard } from '../components/home/ContinueWatchingCard';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<WatchHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getWatchHistory();
        setHistory(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleClearHistory = () => {
    localStorage.removeItem('doramasplay_history');
    setHistory([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight flex items-center gap-2.5">
            <HistoryIcon className="w-6 h-6 text-crimson" />
            Histórico de Exibição
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Acompanhe onde você parou em cada episódio ou filme.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-muted hover:text-crimson hover:bg-crimson/10 border border-brand-border transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Histórico</span>
          </button>
        )}
      </div>

      {/* Continue Watching Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-48 rounded-xl bg-brand-surface animate-pulse" />
          ))}
        </div>
      ) : history.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {history.map(item => (
            <div key={item.id} className="flex justify-center">
              <ContinueWatchingCard item={item} />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center text-brand-muted">
          Você ainda não possui histórico de reprodução salvo.
        </div>
      )}
    </div>
  );
};
