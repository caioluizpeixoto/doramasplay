import React from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { Button } from '../common/Button';

interface ResumePromptProps {
  progressSeconds: number;
  onContinue: () => void;
  onRestart: () => void;
}

export const ResumePrompt: React.FC<ResumePromptProps> = ({
  progressSeconds,
  onContinue,
  onRestart,
}) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-brand-surface border border-brand-border/80 text-center shadow-2xl space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-crimson/20 border border-crimson/40 text-crimson flex items-center justify-center mx-auto shadow-lg shadow-crimson/10">
          <Play className="w-7 h-7 fill-crimson ml-0.5" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold font-display text-white">Continuar de onde parou?</h3>
          <p className="text-sm text-brand-subtext">
            Você já havia começado a assistir este título e parou aos{' '}
            <span className="text-white font-semibold">{formatTime(progressSeconds)}</span>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={onContinue}
            className="flex-1 shadow-lg shadow-crimson/25"
            icon={<Play className="w-4 h-4 fill-white" />}
          >
            Continuar
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={onRestart}
            className="flex-1"
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Assistir do início
          </Button>
        </div>
      </div>
    </div>
  );
};
