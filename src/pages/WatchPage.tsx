import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getContentBySlug } from '../services/api';
import { Content, Episode } from '../types/database';
import { BunnyPlayer } from '../components/player/BunnyPlayer';
import { useAuth } from '../context/AuthContext';

export const WatchPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isSubscriber } = useAuth();

  const [content, setContent] = useState<Content | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadPlaybackData() {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await getContentBySlug(slug);
        if (data) {
          setContent(data);
          if (data.episodes && data.episodes.length > 0) {
            setCurrentEpisode(data.episodes[0]);
          }
        } else {
          navigate('/404');
        }
      } catch (e) {
        console.error('Failed to load playback data:', e);
      } finally {
        setLoading(false);
      }
    }

    loadPlaybackData();
  }, [slug, navigate]);

  if (loading || !content) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-crimson border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <BunnyPlayer
        content={content}
        currentEpisode={currentEpisode}
        allEpisodes={content.episodes || []}
        onEpisodeChange={(newEp) => setCurrentEpisode(newEp)}
      />
    </div>
  );
};
