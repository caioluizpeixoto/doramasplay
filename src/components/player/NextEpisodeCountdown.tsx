import React, { useEffect, useState } from 'react';
import { Play, X } from 'lucide-react';
import { Episode } from '../../types/database';
import { Button } from '../common/Button';

interface NextEpisodeCountdownProps {
  nextEpisode: Episode;
  onPlayNext: () => void;
  onCancel: () => void;
}

export const NextEpisodeCountdown: React.FC<NextEpisodeCountdownProps> = ({
  nextEpisode,
  onPlayNext,
  onCancel,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onPlayNext();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onPlayNext]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="max-w-lg w-full p-6 rounded-2xl bg-brand-surface border border-brand-border/80 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-crimson font-semibold text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-crimson animate-pulse" />
            <span>Próximo episódio em {secondsLeft} segundos</span>
          </div>

          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-brand-muted hover:text-white transition-colors"
            title="Cancelar reprodução automática"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar Countdown */}
        <div className="w-full h-1.5 bg-brand-border rounded-full overflow-hidden">
          <div
            className="h-full bg-crimson transition-all duration-1000 ease-linear"
            style={{ width: `${(secondsLeft / 10) * 100}%` }}
          />
        </div>

        {/* Next Episode Details Card */}
        <div className="flex gap-4 p-3 rounded-xl bg-brand-card/80 border border-brand-border/60 items-center">
          <img
            src={nextEpisode.thumbnail_url || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80'}
            alt={nextEpisode.title}
            className="w-28 aspect-video rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-crimson">Episódio {nextEpisode.episode_number}</span>
            <h4 className="text-sm font-bold text-white truncate">{nextEpisode.title}</h4>
            <p className="text-xs text-brand-muted line-clamp-1">{nextEpisode.description}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={onPlayNext}
            className="flex-1 shadow-lg shadow-crimson/25"
            icon={<Play className="w-4 h-4 fill-white" />}
          >
            Assistir Agora ({secondsLeft}s)
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={onCancel}
            className="px-6"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};
