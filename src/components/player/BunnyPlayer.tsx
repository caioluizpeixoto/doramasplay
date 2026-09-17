import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  RotateCw, 
  ArrowLeft, 
  Settings, 
  Subtitles, 
  Layers,
  Sparkles
} from 'lucide-react';
import { Content, Episode } from '../../types/database';
import { getBunnyEmbedUrl } from '../../lib/bunny';
import { saveWatchProgress, getWatchHistory } from '../../services/api';
import { ResumePrompt } from './ResumePrompt';
import { NextEpisodeCountdown } from './NextEpisodeCountdown';

interface BunnyPlayerProps {
  content: Content;
  currentEpisode?: Episode | null;
  allEpisodes?: Episode[];
  onEpisodeChange?: (episode: Episode) => void;
}

export const BunnyPlayer: React.FC<BunnyPlayerProps> = ({
  content,
  currentEpisode,
  allEpisodes = [],
  onEpisodeChange,
}) => {
  const navigate = useNavigate();
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(content.duration ? content.duration * 60 : 3600);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedQuality, setSelectedQuality] = useState<string>('1080p (FHD)');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState<boolean>(true);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);

  // Resume and Countdown States
  const [showResumePrompt, setShowResumePrompt] = useState<boolean>(false);
  const [savedProgressSeconds, setSavedProgressSeconds] = useState<number>(0);
  const [showNextCountdown, setShowNextCountdown] = useState<boolean>(false);

  const activeVideoId = currentEpisode?.bunny_video_id || content.bunny_video_id || 'sample-bunny-video';

  // Check watch history for existing progress on mount
  useEffect(() => {
    async function checkSavedHistory() {
      try {
        const history = await getWatchHistory();
        const record = history.find(h => 
          h.content_id === content.id && 
          (currentEpisode ? h.episode_id === currentEpisode.id : true)
        );

        if (record && record.progress_seconds > 45 && record.percentage < 90) {
          setSavedProgressSeconds(record.progress_seconds);
          setShowResumePrompt(true);
        }
      } catch (e) {
        console.warn('Error fetching saved history:', e);
      }
    }
    checkSavedHistory();
  }, [content.id, currentEpisode]);

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleActivity = () => {
      setControlsVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) setControlsVisible(false);
      }, 3500);
    };

    const el = playerContainerRef.current;
    if (el) {
      el.addEventListener('mousemove', handleActivity);
      el.addEventListener('click', handleActivity);
    }
    return () => {
      clearTimeout(timeout);
      if (el) {
        el.removeEventListener('mousemove', handleActivity);
        el.removeEventListener('click', handleActivity);
      }
    };
  }, [isPlaying]);

  // Periodic watch progress auto-saver (every 10 seconds)
  useEffect(() => {
    if (!isPlaying || currentTime <= 5) return;

    const interval = setInterval(() => {
      saveWatchProgress(
        content.id,
        currentEpisode ? currentEpisode.id : null,
        currentTime,
        duration
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration, content.id, currentEpisode]);

  // Next episode resolution
  const nextEpisode = React.useMemo(() => {
    if (!currentEpisode || allEpisodes.length <= 1) return null;
    const currentIndex = allEpisodes.findIndex(e => e.id === currentEpisode.id);
    if (currentIndex >= 0 && currentIndex < allEpisodes.length - 1) {
      return allEpisodes[currentIndex + 1];
    }
    return null;
  }, [currentEpisode, allEpisodes]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Jump -10s or +10s
  const seekRelative = (seconds: number) => {
    const newTime = Math.min(duration, Math.max(0, currentTime + seconds));
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = Math.floor(secs % 60);
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Resume Handlers
  const handleResumeContinue = () => {
    setCurrentTime(savedProgressSeconds);
    if (videoRef.current) {
      videoRef.current.currentTime = savedProgressSeconds;
      videoRef.current.play();
    }
    setIsPlaying(true);
    setShowResumePrompt(false);
  };

  const handleResumeRestart = () => {
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
    setIsPlaying(true);
    setShowResumePrompt(false);
  };

  const cdnHost = import.meta.env.VITE_BUNNY_STREAM_CDN_HOSTNAME || 'vz-e86e7bad-8b9.b-cdn.net';
  const videoSrc = activeVideoId !== 'sample-bunny-video' 
    ? `https://${cdnHost}/${activeVideoId}/playlist.m3u8`
    : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4";

  // HLS initialization
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported() && videoSrc.includes('.m3u8')) {
      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Ready to play
      });
      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc;
    } else {
      video.src = videoSrc;
    }
  }, [videoSrc]);

  return (
    <div
      ref={playerContainerRef}
      className="relative w-full h-screen bg-black overflow-hidden select-none flex items-center justify-center group"
    >
      {/* Video Source: Bunny Stream Iframe or Interactive HTML5 Player with Bunny Styling */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            setDuration(videoRef.current.duration || duration);
            if (videoRef.current.currentTime >= (videoRef.current.duration - 15) && nextEpisode && !showNextCountdown) {
              setShowNextCountdown(true);
            }
          }
        }}
        onEnded={() => {
          if (nextEpisode) {
            setShowNextCountdown(true);
          }
        }}
        autoPlay
        playsInline
      />

      {/* Top Bar Overlay */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between z-20 transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/content/${content.slug}`)}
            className="p-2.5 rounded-full bg-brand-surface/70 hover:bg-brand-surface text-white border border-brand-border/60 backdrop-blur-md transition-all hover:scale-105"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-base sm:text-xl font-bold font-display text-white line-clamp-1">
              {content.title}
            </h2>
            {currentEpisode && (
              <p className="text-xs sm:text-sm text-brand-muted">
                T{currentEpisode.season_number} : Ep.{currentEpisode.episode_number} — {currentEpisode.title}
              </p>
            )}
          </div>
        </div>

        {/* Quality and Bunny Stream Badge */}
        <div className="hidden sm:flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-card/80 border border-brand-border text-brand-subtext backdrop-blur-md">
            <Layers className="w-3.5 h-3.5 text-crimson" />
            <span>Bunny Stream • {selectedQuality}</span>
          </span>
        </div>
      </div>

      {/* Bottom Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20 transition-opacity duration-300 space-y-3 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Timeline Slider */}
        <div className="relative flex items-center group/progress cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              const val = Number(e.target.value);
              setCurrentTime(val);
              if (videoRef.current) videoRef.current.currentTime = val;
            }}
            className="w-full h-1.5 group-hover/progress:h-2.5 bg-white/25 rounded-lg appearance-none cursor-pointer accent-crimson transition-all"
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left Controls: Play/Pause, Seek 10s, Volume, Time */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-full bg-crimson hover:bg-crimson-hover text-white shadow-lg shadow-crimson/30 hover:scale-110 active:scale-95 transition-all"
              title={isPlaying ? 'Pausar' : 'Reproduzir'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
            </button>

            <button
              onClick={() => seekRelative(-10)}
              className="p-2 text-white/80 hover:text-white transition-colors"
              title="Voltar 10 segundos"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => seekRelative(10)}
              className="p-2 text-white/80 hover:text-white transition-colors"
              title="Avançar 10 segundos"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={() => {
                  const muted = !isMuted;
                  setIsMuted(muted);
                  if (videoRef.current) videoRef.current.muted = muted;
                }}
                className="p-1.5 text-white/80 hover:text-white"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setVolume(val);
                  setIsMuted(val === 0);
                  if (videoRef.current) {
                    videoRef.current.volume = val;
                    videoRef.current.muted = false;
                  }
                }}
                className="w-16 sm:w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-crimson hidden sm:block"
              />
            </div>

            {/* Time Stamp */}
            <div className="text-xs font-semibold text-brand-subtext tracking-wider">
              <span>{formatTime(currentTime)}</span>
              <span className="mx-1 text-brand-muted">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Speed, Subtitles, Quality, Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Speed Selector */}
            <button
              onClick={() => {
                const speeds = [0.75, 1, 1.25, 1.5, 2];
                const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                const nextSpeed = speeds[nextIdx];
                setPlaybackSpeed(nextSpeed);
                if (videoRef.current) videoRef.current.playbackRate = nextSpeed;
              }}
              className="px-2 py-1 rounded text-xs font-bold text-white hover:bg-brand-surface/70 transition-colors"
              title="Velocidade de reprodução"
            >
              {playbackSpeed}x
            </button>

            {/* Subtitles Button */}
            <button
              onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                subtitlesEnabled ? 'text-crimson' : 'text-white/70 hover:text-white'
              }`}
              title="Legendas"
            >
              <Subtitles className="w-5 h-5" />
            </button>

            {/* Settings / Quality Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-2 text-white/80 hover:text-white transition-colors"
                title="Configurações de Qualidade"
              >
                <Settings className="w-5 h-5" />
              </button>

              {showSettingsMenu && (
                <div className="absolute right-0 bottom-12 w-44 rounded-xl bg-brand-surface border border-brand-border p-2 shadow-2xl space-y-1 text-xs z-30">
                  <p className="px-2 py-1 font-bold text-brand-muted uppercase text-[10px]">Qualidade de Vídeo</p>
                  {['4K Ultra HD', '1080p (FHD)', '720p (HD)', 'Automático'].map(q => (
                    <button
                      key={q}
                      onClick={() => {
                        setSelectedQuality(q);
                        setShowSettingsMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors ${
                        selectedQuality === q ? 'bg-crimson text-white font-bold' : 'text-brand-subtext hover:bg-brand-card hover:text-white'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-white/80 hover:text-white transition-colors"
              title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* "Continuar de onde parou?" Resume Prompt Modal */}
      {showResumePrompt && (
        <ResumePrompt
          progressSeconds={savedProgressSeconds}
          onContinue={handleResumeContinue}
          onRestart={handleResumeRestart}
        />
      )}

      {/* 10-Second Auto-Next Countdown Modal */}
      {showNextCountdown && nextEpisode && (
        <NextEpisodeCountdown
          nextEpisode={nextEpisode}
          onPlayNext={() => {
            setShowNextCountdown(false);
            if (onEpisodeChange) {
              onEpisodeChange(nextEpisode);
            }
          }}
          onCancel={() => setShowNextCountdown(false)}
        />
      )}
    </div>
  );
};
