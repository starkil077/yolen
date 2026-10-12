import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Music,
  Video,
  ListMusic,
} from 'lucide-react';

interface MiniPlayerProps {
  onOpenQueue: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onOpenQueue }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    setIsFullPlayerOpen,
  } = usePlayer();

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      onClick={() => setIsFullPlayerOpen(true)}
      className="fixed bottom-0 left-0 right-0 z-40 bg-dark-900/95 backdrop-blur-xl border-t border-dark-700/80 shadow-2xl transition-all duration-300 cursor-pointer hover:bg-dark-800/95 group"
    >
      {/* Top micro progress bar */}
      <div className="w-full bg-dark-700/50 h-1 overflow-hidden">
        <div
          className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 h-full transition-all duration-200 shadow-[0_0_8px_rgba(0,229,255,0.6)]"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Track Info & Artwork */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-dark-800 flex-shrink-0 border border-dark-700 shadow-md">
            {currentTrack.artworkUri ? (
              <img
                src={currentTrack.artworkUri}
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-cyan-accent">
                {currentTrack.isVideo ? <Video size={22} /> : <Music size={22} />}
              </div>
            )}
            <div className="absolute bottom-0 right-0 px-1 py-0.5 bg-black/70 rounded-tl text-[9px] font-bold text-cyan-accent">
              {currentTrack.isVideo ? 'فيديو' : 'صوت'}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-100 truncate group-hover:text-cyan-accent transition-colors">
              {currentTrack.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-400 truncate mt-0.5">
              <span>{currentTrack.artist}</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-accent/80 text-[11px] font-medium">
                {currentTrack.genre}
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div
          className="flex items-center gap-2 sm:gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={skipToPrevious}
            className="p-2 text-slate-300 hover:text-white hover:bg-dark-700 rounded-full transition-colors active:scale-95"
            title="السابق"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={togglePlayPause}
            className="p-3 bg-gradient-to-r from-cyan-400 to-violet-600 text-dark-950 font-bold rounded-full shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:shadow-[0_0_22px_rgba(0,229,255,0.7)] transition-all active:scale-95"
            title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
          >
            {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-0.5" />}
          </button>

          <button
            onClick={skipToNext}
            className="p-2 text-slate-300 hover:text-white hover:bg-dark-700 rounded-full transition-colors active:scale-95"
            title="التالي"
          >
            <SkipForward size={20} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenQueue();
            }}
            className="p-2 text-slate-400 hover:text-cyan-accent hover:bg-dark-700 rounded-full transition-colors hidden sm:flex"
            title="طابور التشغيل"
          >
            <ListMusic size={20} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFullPlayerOpen(true);
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-dark-700 rounded-full transition-colors"
            title="تكبير المشغل"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
