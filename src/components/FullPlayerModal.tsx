import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Shuffle,
  Repeat,
  Repeat1,
  Maximize,
  Sliders,
  Timer,
  ListMusic,
  BookmarkPlus,
  Gauge,
  Tv,
  Music,
  Video as VideoIcon,
} from 'lucide-react';
import { formatTime } from '../utils/formatTime';
import { AudioVisualizer } from './AudioVisualizer';
import { VideoAspect } from '../types/media';

interface FullPlayerModalProps {
  onOpenQueue: () => void;
  onOpenEqualizer: () => void;
  onOpenSleepTimer: () => void;
  onAddToPlaylist: () => void;
}

export const FullPlayerModal: React.FC<FullPlayerModalProps> = ({
  onOpenQueue,
  onOpenEqualizer,
  onOpenSleepTimer,
  onAddToPlaylist,
}) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    queue,
    queueIndex,
    repeatMode,
    isShuffle,
    playbackSpeed,
    equalizerPreset,
    sleepTimerSeconds,
    videoAspect,
    visualizerFft,
    isFullPlayerOpen,
    setIsFullPlayerOpen,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    seekTo,
    seekRelative,
    cycleRepeatMode,
    toggleShuffle,
    setPlaybackSpeed,
    cycleVideoAspect,
    videoRef,
  } = usePlayer();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekVal, setSeekVal] = useState(0);

  if (!isFullPlayerOpen || !currentTrack) return null;

  const displayedTime = isSeeking ? seekVal : currentTime;
  const progressPercent = duration > 0 ? (displayedTime / duration) * 100 : 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSeeking(true);
    setSeekVal(Number(e.target.value));
  };

  const handleSliderCommit = () => {
    seekTo(seekVal);
    setIsSeeking(false);
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP not supported or failed:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-dark-950/95 backdrop-blur-2xl flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] opacity-25"
          style={{ backgroundColor: '#00E5FF' }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[140px] opacity-25"
          style={{ backgroundColor: '#8B5CF6' }}
        />
      </div>

      {/* Top Header Bar */}
      <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 flex items-center justify-between">
        <button
          onClick={() => setIsFullPlayerOpen(false)}
          className="p-2.5 text-slate-400 hover:text-white hover:bg-dark-800 rounded-2xl transition-colors"
          title="تصغير المشغل"
        >
          <X size={24} />
        </button>

        <div className="text-center">
          <span className="text-[11px] font-black uppercase tracking-widest text-cyan-accent block">
            {currentTrack.isVideo ? 'مشغل الفيديو السينمائي' : 'مشغل الصوت عالي الدقة'}
          </span>
          <span className="text-xs font-bold text-slate-300">
            مقطع {queueIndex + 1} من {queue.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenSleepTimer}
            className={`p-2.5 rounded-2xl transition-colors relative ${
              sleepTimerSeconds > 0
                ? 'text-amber-accent bg-amber-accent/10'
                : 'text-slate-400 hover:text-white hover:bg-dark-800'
            }`}
            title="مؤقت النوم"
          >
            <Timer size={20} />
            {sleepTimerSeconds > 0 && (
              <span className="absolute -top-1 -right-1 px-1 text-[9px] font-bold bg-amber-accent text-dark-950 rounded-full">
                {Math.ceil(sleepTimerSeconds / 60)}m
              </span>
            )}
          </button>

          <button
            onClick={onOpenEqualizer}
            className="p-2.5 text-slate-400 hover:text-violet-400 hover:bg-dark-800 rounded-2xl transition-colors"
            title="معدّل الصوت"
          >
            <Sliders size={20} />
          </button>

          <button
            onClick={onOpenQueue}
            className="p-2.5 text-slate-400 hover:text-cyan-accent hover:bg-dark-800 rounded-2xl transition-colors relative"
            title="طابور التشغيل"
          >
            <ListMusic size={20} />
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-bold bg-cyan-accent text-dark-950 rounded-full">
              {queue.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Stage */}
      <div className="max-w-2xl w-full mx-auto px-4 flex-1 flex flex-col justify-center items-center py-2 sm:py-6">
        {currentTrack.isVideo ? (
          // Video Player Stage
          <div className="w-full relative rounded-2xl overflow-hidden bg-black border border-dark-800 shadow-2xl group aspect-video">
            <video
              ref={videoRef}
              playsInline
              onClick={togglePlayPause}
              className={`w-full h-full cursor-pointer ${
                videoAspect === 'cover'
                  ? 'object-cover'
                  : videoAspect === 'fill'
                  ? 'object-fill'
                  : 'object-contain'
              }`}
            />

            {/* Video overlay controls badge */}
            <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10">
              <button
                onClick={cycleVideoAspect}
                className="text-[11px] font-bold text-cyan-accent hover:text-white px-2 py-0.5 rounded bg-white/10"
                title="تغيير نسبة العرض (Fit / Cover / Fill)"
              >
                {videoAspect === 'cover'
                  ? 'تكبير/قص'
                  : videoAspect === 'fill'
                  ? 'ملء الشاشة'
                  : 'احتواء'}
              </button>

              <button
                onClick={togglePiP}
                className="text-slate-300 hover:text-white p-1"
                title="تشغيل في نافذة عائمة (PiP)"
              >
                <Tv size={16} />
              </button>
            </div>
          </div>
        ) : (
          // Audio Stage with Spinning/Glowing Artwork and Real-time Visualizer
          <div className="w-full flex flex-col items-center">
            <div className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-3xl overflow-hidden bg-dark-900 border-2 border-dark-700/80 shadow-[0_0_50px_rgba(0,229,255,0.15)] mb-6 group">
              {currentTrack.artworkUri ? (
                <img
                  src={currentTrack.artworkUri}
                  alt={currentTrack.title}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isPlaying ? 'scale-105' : 'scale-100'
                  }`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-cyan-accent bg-gradient-to-br from-dark-900 via-dark-800 to-dark-950">
                  <Music size={80} />
                </div>
              )}

              {/* Glowing ring overlay */}
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl" />
            </div>

            {/* Real-time Frequency Waveform Visualizer */}
            <div className="w-full max-w-md px-4 mb-2">
              <AudioVisualizer fftData={visualizerFft} barCount={32} height={48} />
            </div>
          </div>
        )}

        {/* Track Metadata */}
        <div className="w-full flex items-center justify-between gap-4 mt-4 pt-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-black text-white truncate">
              {currentTrack.title}
            </h2>
            <div className="flex items-center gap-2 text-sm text-slate-400 mt-1 truncate">
              <span>{currentTrack.artist}</span>
              <span>•</span>
              <span className="text-cyan-accent text-xs font-bold">
                {currentTrack.genre}
              </span>
              <span>•</span>
              <span className="text-violet-400 text-xs font-bold">
                {currentTrack.isVideo ? 'فيديو سينمائي' : 'صوتيات'}
              </span>
            </div>
          </div>

          <button
            onClick={onAddToPlaylist}
            className="p-3 bg-dark-800 hover:bg-violet-600/20 text-slate-300 hover:text-violet-400 border border-dark-700 rounded-2xl transition-colors flex-shrink-0"
            title="إضافة لقائمة تشغيل"
          >
            <BookmarkPlus size={22} />
          </button>
        </div>

        {/* Scrubber / Progress Bar */}
        <div className="w-full mt-4 space-y-1.5">
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={displayedTime}
              onChange={handleSliderChange}
              onMouseUp={handleSliderCommit}
              onTouchEnd={handleSliderCommit}
              className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{formatTime(displayedTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Primary Controls Deck */}
        <div className="flex items-center justify-between w-full max-w-lg mt-4 px-2">
          <button
            onClick={toggleShuffle}
            className={`p-2.5 rounded-full transition-colors ${
              isShuffle
                ? 'text-cyan-accent bg-cyan-accent/15'
                : 'text-slate-400 hover:text-white'
            }`}
            title="خلط عشوائي"
          >
            <Shuffle size={20} />
          </button>

          <button
            onClick={() => seekRelative(-10)}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-dark-800 rounded-full transition-colors"
            title="رجوع 10 ثواني"
          >
            <RotateCcw size={22} />
          </button>

          <button
            onClick={skipToPrevious}
            className="p-3 text-slate-200 hover:text-white hover:bg-dark-800 rounded-full transition-colors"
            title="المقطع السابق"
          >
            <SkipBack size={26} />
          </button>

          {/* Giant Neon Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="p-5 bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-600 text-dark-950 font-black rounded-full shadow-[0_0_30px_rgba(0,229,255,0.5)] hover:shadow-[0_0_45px_rgba(0,229,255,0.8)] transition-all active:scale-95"
            title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
          >
            {isPlaying ? (
              <Pause size={30} className="fill-current" />
            ) : (
              <Play size={30} className="fill-current ml-1" />
            )}
          </button>

          <button
            onClick={skipToNext}
            className="p-3 text-slate-200 hover:text-white hover:bg-dark-800 rounded-full transition-colors"
            title="المقطع التالي"
          >
            <SkipForward size={26} />
          </button>

          <button
            onClick={() => seekRelative(10)}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-dark-800 rounded-full transition-colors"
            title="تقديم 10 ثواني"
          >
            <RotateCw size={22} />
          </button>

          <button
            onClick={cycleRepeatMode}
            className={`p-2.5 rounded-full transition-colors ${
              repeatMode !== 'off'
                ? 'text-cyan-accent bg-cyan-accent/15'
                : 'text-slate-400 hover:text-white'
            }`}
            title="تكرار"
          >
            {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>
        </div>
      </div>

      {/* Bottom Auxiliary Bar: Speed, Sound preset, and Queue quick access */}
      <div className="max-w-4xl w-full mx-auto p-4 flex items-center justify-between border-t border-dark-800/80 text-xs">
        {/* Speed toggle */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-bold hidden sm:inline">السرعة:</span>
          {[0.75, 1.0, 1.25, 1.5, 2.0].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                playbackSpeed === spd
                  ? 'bg-cyan-accent text-dark-950'
                  : 'bg-dark-850 text-slate-400 hover:text-white'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Equalizer preset indicator */}
        <button
          onClick={onOpenEqualizer}
          className="px-3 py-1 bg-dark-850 hover:bg-dark-800 border border-dark-700 rounded-lg text-slate-300 font-bold flex items-center gap-1.5"
        >
          <Sliders size={13} className="text-violet-400" />
          <span>
            {equalizerPreset === 'bass'
              ? 'Bass Boost'
              : equalizerPreset === 'vocal'
              ? 'Vocal'
              : equalizerPreset === 'rock'
              ? 'Rock'
              : equalizerPreset === 'electronic'
              ? 'Electronic'
              : 'Flat'}
          </span>
        </button>

        {/* Queue quick link */}
        <button
          onClick={onOpenQueue}
          className="px-3.5 py-1.5 bg-cyan-accent/10 hover:bg-cyan-accent/20 text-cyan-accent border border-cyan-500/30 rounded-xl font-bold flex items-center gap-2"
        >
          <ListMusic size={16} />
          <span>طابور التشغيل ({queue.length})</span>
        </button>
      </div>
    </div>
  );
};
