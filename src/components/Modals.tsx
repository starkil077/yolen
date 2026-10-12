import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { MediaItem, EqualizerPreset } from '../types/media';
import {
  Sliders,
  Timer,
  Link,
  BookmarkPlus,
  Plus,
  FolderPlus,
  X,
  Check,
  Music,
  Video,
} from 'lucide-react';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({ isOpen, onClose }) => {
  const { equalizerPreset, setEqualizerPreset } = usePlayer();
  if (!isOpen) return null;

  const presets: { id: EqualizerPreset; label: string; desc: string }[] = [
    { id: 'flat', label: 'افتراضي (Flat)', desc: 'توازن طبيعي بدون تعديل' },
    { id: 'bass', label: 'تعزيز البيس (Bass Boost)', desc: 'تقوية الترددات المنخفضة والإيقاع' },
    { id: 'vocal', label: 'إبراز الأصوات (Vocal)', desc: 'توضيح صوت المغني والمؤدي' },
    { id: 'rock', label: 'روك (Rock)', desc: 'إيقاع ناري ونغمات جيتار حادة' },
    { id: 'electronic', label: 'إلكتروني (EDM)', desc: 'حماس وترددات صوتية مرتفعة' },
    { id: 'acoustic', label: 'صوت نقي (Acoustic)', desc: 'هدوء وتفاصيل دقيقة للآلات الموسيقية' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-900 border border-dark-700 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-dark-800">
          <div className="flex items-center gap-2 text-cyan-accent">
            <Sliders size={20} />
            <h3 className="text-base font-extrabold text-white">
              معدّل الصوت (Audio Equalizer)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-400 my-3">
          اختر النمط الصوتي لضبط مرشحات الترددات وفقاً لذوقك:
        </p>

        <div className="space-y-2 max-h-[360px] overflow-y-auto">
          {presets.map((p) => {
            const isSelected = equalizerPreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setEqualizerPreset(p.id)}
                className={`w-full p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-cyan-accent/10 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                    : 'bg-dark-800/60 border-dark-700/80 text-slate-300 hover:bg-dark-800'
                }`}
              >
                <div>
                  <div
                    className={`text-xs font-bold ${
                      isSelected ? 'text-cyan-accent' : 'text-white'
                    }`}
                  >
                    {p.label}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{p.desc}</div>
                </div>
                {isSelected && (
                  <div className="p-1 rounded-full bg-cyan-accent text-dark-950">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-4 mt-3 border-t border-dark-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-accent text-dark-950 font-bold rounded-xl text-xs hover:bg-cyan-300 transition-colors"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
};

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ isOpen, onClose }) => {
  const { sleepTimerSeconds, setSleepTimer, cancelSleepTimer } = usePlayer();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-900 border border-dark-700 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-dark-800">
          <div className="flex items-center gap-2 text-amber-accent">
            <Timer size={20} />
            <h3 className="text-base font-extrabold text-white">
              مؤقت النوم (Sleep Timer)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="my-4">
          {sleepTimerSeconds > 0 ? (
            <div className="p-4 bg-amber-accent/10 border border-amber-accent/30 rounded-2xl text-center mb-4">
              <span className="text-xs text-amber-300 font-bold block mb-1">
                المؤقت نشط حالياً
              </span>
              <span className="text-2xl font-mono font-black text-amber-accent">
                {Math.floor(sleepTimerSeconds / 60)}:
                {(sleepTimerSeconds % 60).toString().padStart(2, '0')}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                سيتوقف التشغيل تلقائياً عند انتهاء الوقت.
              </p>
              <button
                onClick={() => {
                  cancelSleepTimer();
                }}
                className="mt-3 px-4 py-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold hover:bg-rose-500/30"
              >
                إلغاء المؤقت
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mb-4">
              اختر الوقت المطلوب لإيقاف تشغيل الموسيقى أو الفيديو تلقائياً:
            </p>
          )}

          <div className="grid grid-cols-4 gap-2">
            {[15, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setSleepTimer(mins);
                  onClose();
                }}
                className="py-3 bg-dark-800 hover:bg-dark-750 text-white border border-dark-700 rounded-xl text-xs font-bold transition-colors hover:border-amber-accent/50"
              >
                {mins} دقيقة
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-dark-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

interface AddStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStream: (url: string, title: string, isVideo: boolean) => void;
}

export const AddStreamModal: React.FC<AddStreamModalProps> = ({
  isOpen,
  onClose,
  onAddStream,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [isVideo, setIsVideo] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onAddStream(url.trim(), title.trim() || 'بث مباشر خارجي', isVideo);
    setUrl('');
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-900 border border-dark-700 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-dark-800">
          <div className="flex items-center gap-2 text-violet-400">
            <Link size={20} />
            <h3 className="text-base font-extrabold text-white">
              إضافة رابط بث أو ملف مباشر
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 my-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              رابط الوسائط (MP3 / MP4 / HLS / WebM)
            </label>
            <input
              type="url"
              required
              placeholder="https://example.com/audio-stream.mp3"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              عنوان المقطع (اختياري)
            </label>
            <input
              type="text"
              placeholder="مثال: إذاعة بث هادئة أو مقطع تعليمي"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              نوع الوسائط
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsVideo(false)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  !isVideo
                    ? 'bg-cyan-accent text-dark-950 border-cyan-accent font-black'
                    : 'bg-dark-800 text-slate-400 border-dark-700'
                }`}
              >
                <Music size={16} />
                <span>صوت (Audio)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVideo(true)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  isVideo
                    ? 'bg-violet-500 text-white border-violet-500 font-black'
                    : 'bg-dark-800 text-slate-400 border-dark-700'
                }`}
              >
                <Video size={16} />
                <span>فيديو (Video)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!url.trim()}
              className="px-5 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-dark-950 font-black rounded-xl text-xs disabled:opacity-50"
            >
              إضافة وتشغيل
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AddToPlaylistModalProps {
  track: MediaItem | null;
  onClose: () => void;
  onCreateNewPlaylist: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  track,
  onClose,
  onCreateNewPlaylist,
}) => {
  const { playlists, addTrackToPlaylist } = usePlayer();
  const [addedPlaylistId, setAddedPlaylistId] = useState<string | null>(null);

  if (!track) return null;

  const handleSelect = (playlistId: string) => {
    addTrackToPlaylist(playlistId, track);
    setAddedPlaylistId(playlistId);
    setTimeout(() => {
      onClose();
      setAddedPlaylistId(null);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-900 border border-dark-700 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-dark-800">
          <div className="flex items-center gap-2 text-cyan-accent">
            <BookmarkPlus size={20} />
            <h3 className="text-base font-extrabold text-white">
              إضافة إلى قائمة تشغيل
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="my-3">
          <p className="text-xs text-slate-400 mb-1">المقطع المحدد:</p>
          <div className="p-2.5 bg-dark-800 rounded-xl text-xs font-bold text-cyan-accent truncate">
            {track.title}
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            onCreateNewPlaylist();
          }}
          className="w-full py-2.5 mb-3 bg-dark-800 hover:bg-dark-750 text-white border border-dark-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors text-violet-400"
        >
          <Plus size={16} />
          <span>+ إنشاء قائمة جديدة</span>
        </button>

        <p className="text-xs text-slate-400 mb-2">اختر قائمة تشغيل:</p>

        <div className="space-y-2 max-h-[240px] overflow-y-auto">
          {playlists.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              لا توجد قوائم تشغيل حتى الآن
            </div>
          ) : (
            playlists.map((pl) => {
              const isAlreadyAdded = pl.items.some((item) => item.id === track.id);
              const isJustAdded = addedPlaylistId === pl.id;

              return (
                <button
                  key={pl.id}
                  disabled={isAlreadyAdded || isJustAdded}
                  onClick={() => handleSelect(pl.id)}
                  className={`w-full p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                    isJustAdded
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : isAlreadyAdded
                      ? 'bg-dark-850 border-dark-800 text-slate-500 cursor-not-allowed'
                      : 'bg-dark-800/80 border-dark-700 text-slate-200 hover:bg-dark-800 hover:border-cyan-500/50'
                  }`}
                >
                  <span className="text-xs font-bold truncate">{pl.name}</span>
                  <span className="text-[10px] text-slate-400">
                    {isJustAdded
                      ? 'تمت الإضافة!'
                      : isAlreadyAdded
                      ? 'موجود بالفعل'
                      : `${pl.items.length} مقاطع`}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="pt-3 mt-3 border-t border-dark-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
