import React from 'react';
import { Episode } from '../../types/database';
import { EpisodeItem } from './EpisodeItem';

interface SeasonSelectorProps {
  contentSlug: string;
  episodes: Episode[];
  onSelectEpisode: (episode: Episode) => void;
}

export const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  contentSlug,
  episodes,
  onSelectEpisode,
}) => {
  const [selectedSeason, setSelectedSeason] = React.useState<number>(1);

  // Group episodes by season
  const seasonsMap = React.useMemo(() => {
    const map = new Map<number, Episode[]>();
    episodes.forEach(ep => {
      const season = ep.season_number || 1;
      if (!map.has(season)) map.set(season, []);
      map.get(season)!.push(ep);
    });
    return map;
  }, [episodes]);

  const seasonNumbers = Array.from(seasonsMap.keys()).sort((a, b) => a - b);
  const currentEpisodes = seasonsMap.get(selectedSeason) || episodes;

  if (episodes.length === 0) {
    return (
      <div className="py-8 text-center text-brand-muted text-sm">
        Nenhum episódio cadastrado para este título ainda.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Season Tabs */}
      <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {seasonNumbers.map(seasonNum => (
            <button
              key={seasonNum}
              onClick={() => setSelectedSeason(seasonNum)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                selectedSeason === seasonNum
                  ? 'bg-crimson text-white shadow-lg shadow-crimson/25'
                  : 'bg-brand-surface text-brand-subtext hover:text-white hover:bg-brand-card'
              }`}
            >
              Temporada {seasonNum}
            </button>
          ))}
        </div>

        <span className="text-xs text-brand-muted shrink-0 hidden sm:inline-block">
          {currentEpisodes.length} {currentEpisodes.length === 1 ? 'Episódio' : 'Episódios'}
        </span>
      </div>

      {/* Episode Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentEpisodes.map(ep => (
          <EpisodeItem
            key={ep.id}
            contentSlug={contentSlug}
            episode={ep}
            onWatch={() => onSelectEpisode(ep)}
          />
        ))}
      </div>
    </div>
  );
};
