import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  ListMusic,
  ChevronUp,
  ChevronDown,
  Trash2,
  BookmarkPlus,
  Play,
  Volume2,
  Music,
  Video,
  X,
} from 'lucide-react';
import { formatTime } from '../utils/formatTime';

interface QueuePanelProps {
  onClose?: () => void;
}

export const QueuePanel: React.FC<QueuePanelProps> = ({ onClose }) => {
  const {
    queue,
    queueIndex,
    isPlaying,
    skipToIndex,
    moveQueueItem,
    removeFromQueue,
    clearQueue,
    saveQueueAsPlaylist,
  } = usePlayer();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSavePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim()) return;
    saveQueueAsPlaylist(playlistName.trim());
    setPlaylistName('');
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowSaveModal(false);
    }, 1200);
  };

  return (
    <div className="bg-dark-900 border border-dark-700/80 rounded-2xl p-5 shadow-2xl flex flex-col h-full max-h-[750px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-dark-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-accent/10 text-cyan-accent rounded-xl">
            <ListMusic size={22} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              طابور التشغيل (Queue)
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-accent/20 text-cyan-accent font-bold">
                {queue.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              أعد ترتيب المقاطع وتنقل بينها بحرية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <>
              <button
                onClick={() => setShowSaveModal(true)}
                className="px-3 py-1.5 bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 border border-violet-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="حفظ الطابور كقائمة تشغيل"
              >
                <BookmarkPlus size={15} />
                <span>حفظ كقائمة</span>
              </button>

              <button
                onClick={clearQueue}
                className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-bold transition-colors"
                title="تفريغ الطابور بالكامل"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-dark-800 rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Queue Items List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2 mt-2">
        {queue.length === 0 ? (
          <div className="text-center py-16 text-slate-400 flex flex-col items-center">
            <ListMusic size={48} className="text-dark-700 mb-3" />
            <p className="font-bold text-white text-sm">طابور التشغيل فارغ</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              اختر أي أغنية أو فيديو من المكتبة لإضافتها إلى الطابور والبدء بالتشغيل
            </p>
          </div>
        ) : (
          queue.map((track, idx) => {
            const isCurrent = idx === queueIndex;

            return (
              <div
                key={`${track.id}_${idx}`}
                onClick={() => skipToIndex(idx)}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer border group ${
                  isCurrent
                    ? 'bg-dark-800/90 border-cyan-500/40 shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                    : 'bg-dark-850/50 hover:bg-dark-800/60 border-dark-750/50'
                }`}
              >
                {/* Reorder Buttons */}
                <div
                  className="flex flex-col items-center gap-0.5 text-slate-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    disabled={idx === 0}
                    onClick={() => moveQueueItem(idx, idx - 1)}
                    className="p-0.5 hover:text-cyan-accent disabled:opacity-20 disabled:hover:text-slate-400 rounded"
                    title="تحريك لأعلى"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <span
                    className={`text-[10px] font-bold ${
                      isCurrent ? 'text-cyan-accent' : 'text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <button
                    disabled={idx === queue.length - 1}
                    onClick={() => moveQueueItem(idx, idx + 1)}
                    className="p-0.5 hover:text-cyan-accent disabled:opacity-20 disabled:hover:text-slate-400 rounded"
                    title="تحريك لأسفل"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>

                {/* Thumbnail */}
                <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-dark-800 flex-shrink-0 border border-dark-700">
                  {track.artworkUri ? (
                    <img
                      src={track.artworkUri}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-cyan-accent">
                      {track.isVideo ? <Video size={18} /> : <Music size={18} />}
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute inset-0 bg-dark-950/60 backdrop-blur-[1px] flex items-center justify-center text-cyan-accent">
                      {isPlaying ? (
                        <Volume2 size={18} className="animate-pulse" />
                      ) : (
                        <Play size={18} className="fill-current" />
                      )}
                    </div>
                  )}
                </div>

                {/* Track Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold truncate ${
                        isCurrent ? 'text-cyan-accent' : 'text-white'
                      }`}
                    >
                      {track.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate mt-0.5">
                    <span className="truncate">{track.artist}</span>
                    <span>•</span>
                    <span className="text-violet-400 font-medium text-[10px]">
                      {track.isVideo ? 'فيديو' : 'صوت'}
                    </span>
                    {track.duration && (
                      <>
                        <span>•</span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {formatTime(track.duration)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromQueue(idx);
                  }}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-70 group-hover:opacity-100"
                  title="إزالة من الطابور"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Save Queue Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h4 className="text-lg font-extrabold text-white mb-2">
              حفظ الطابور كقائمة تشغيل جديدة
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              سيتم حفظ جميع المقاطع الموجودة في الطابور ({queue.length} مقطع) في قائمة
              تشغيل مخصصة يمكنك الرجوع إليها دائماً.
            </p>

            <form onSubmit={handleSavePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  اسم قائمة التشغيل
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سهرات الهدوء والموسيقى"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-accent"
                />
              </div>

              {saveSuccess && (
                <div className="p-2 bg-emerald-500/20 text-emerald-300 text-xs rounded-xl font-bold text-center">
                  تم حفظ قائمة التشغيل بنجاح!
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!playlistName.trim()}
                  className="px-5 py-2 bg-cyan-accent text-dark-950 rounded-xl font-bold text-xs hover:bg-cyan-300 transition-colors disabled:opacity-50"
                >
                  حفظ القائمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
