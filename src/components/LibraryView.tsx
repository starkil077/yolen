import React, { useRef, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { MediaItem, ActiveTab } from '../types/media';
import {
  Search,
  FolderOpen,
  Link,
  Shuffle,
  Play,
  ListPlus,
  BookmarkPlus,
  Music,
  Video,
  X,
  Plus,
  Volume2,
} from 'lucide-react';
import { formatTime } from '../utils/formatTime';

interface LibraryViewProps {
  tracks: MediaItem[];
  activeTab: ActiveTab;
  onTabSelect: (tab: ActiveTab) => void;
  onAddStreamClick: () => void;
  onAddToPlaylistClick: (track: MediaItem) => void;
  onImportFiles: (files: FileList) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  tracks,
  activeTab,
  onTabSelect,
  onAddStreamClick,
  onAddToPlaylistClick,
  onImportFiles,
}) => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    playNext,
    addToQueue,
    setQueue,
  } = usePlayer();

  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter tracks by query and active tab
  const filteredTracks = tracks.filter((t) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'audio' && !t.isVideo) ||
      (activeTab === 'video' && t.isVideo);

    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.genre.toLowerCase().includes(q);

    return matchesTab && matchesQuery;
  });

  const handleShuffleAll = () => {
    if (filteredTracks.length === 0) return;
    const shuffled = [...filteredTracks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setQueue(shuffled, 0, true);
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Picker */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,video/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onImportFiles(e.target.files);
          }
        }}
      />

      {/* Search Bar & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن أغنية، فيديو أو فنان أو نمط موسيقي..."
            className="w-full bg-dark-900 border border-dark-700/80 rounded-2xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent/50 shadow-inner"
          />
          <Search
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-accent pointer-events-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-3 bg-dark-850 hover:bg-dark-800 text-slate-200 border border-dark-700 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all flex-shrink-0"
            title="استيراد ملفات صوت وفيديو من جهازك"
          >
            <FolderOpen size={16} className="text-cyan-accent" />
            <span>استيراد ملف</span>
          </button>

          <button
            onClick={onAddStreamClick}
            className="px-3.5 py-3 bg-dark-850 hover:bg-dark-800 text-slate-200 border border-dark-700 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all flex-shrink-0"
            title="إضافة رابط بث مباشر MP3 / MP4"
          >
            <Link size={16} className="text-violet-400" />
            <span>رابط مباشر</span>
          </button>

          <button
            onClick={handleShuffleAll}
            className="p-3 bg-gradient-to-r from-cyan-400 to-sky-500 text-dark-950 font-black rounded-2xl text-xs flex items-center justify-center transition-all shadow-md shadow-cyan-500/20 active:scale-95 flex-shrink-0"
            title="تشغيل الكل عشوائياً في الطابور"
          >
            <Shuffle size={16} />
          </button>
        </div>
      </div>

      {/* Filter Tabs Chips */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'audio', label: 'موسيقى وصوتيات' },
          { id: 'video', label: 'فيديوهات' },
          { id: 'playlists', label: 'قوائم التشغيل' },
          { id: 'queue', label: 'طابور التشغيل' },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabSelect(tab.id as ActiveTab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 border ${
                isSelected
                  ? 'bg-cyan-accent text-dark-950 border-cyan-accent shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                  : 'bg-dark-900 text-slate-300 border-dark-800 hover:border-dark-700 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tracks Counter */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
        <span>{filteredTracks.length} مقطع متوفر</span>
        <span className="text-[11px] text-slate-500">
          انقر للتشغيل أو استخدم الخيارات لإدارة الطابور
        </span>
      </div>

      {/* Tracks Grid / List */}
      {filteredTracks.length === 0 ? (
        <div className="bg-dark-900 border border-dark-700/80 rounded-2xl p-16 text-center text-slate-400">
          <Search size={40} className="text-dark-700 mx-auto mb-3" />
          <p className="font-bold text-white text-sm">لا توجد مقاطع مطابقة</p>
          <p className="text-xs text-slate-500 mt-1">
            جرب البحث بكلمات أخرى أو أضف ملفات ورابط بث جديدة
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTracks.map((track) => {
            const isCurrent = currentTrack?.id === track.id;

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className={`flex items-center justify-between gap-3 p-3 rounded-2xl transition-all cursor-pointer border group ${
                  isCurrent
                    ? 'bg-dark-800 border-cyan-500/50 shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                    : 'bg-dark-900 hover:bg-dark-850 border-dark-800 hover:border-dark-700'
                }`}
              >
                {/* Artwork & Basic Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-dark-800 flex-shrink-0 border border-dark-700">
                    {track.artworkUri ? (
                      <img
                        src={track.artworkUri}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cyan-accent">
                        {track.isVideo ? <Video size={24} /> : <Music size={24} />}
                      </div>
                    )}

                    {/* Video/Audio Badge */}
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-black/75 rounded text-[9px] font-black tracking-wide text-cyan-accent">
                      {track.isVideo ? 'فيديو' : 'صوت'}
                    </div>

                    {isCurrent && (
                      <div className="absolute inset-0 bg-dark-950/60 backdrop-blur-[1px] flex items-center justify-center text-cyan-accent">
                        {isPlaying ? (
                          <Volume2 size={20} className="animate-pulse" />
                        ) : (
                          <Play size={20} className="fill-current" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4
                      className={`text-sm font-bold truncate ${
                        isCurrent ? 'text-cyan-accent' : 'text-white'
                      }`}
                    >
                      {track.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 truncate mt-1">
                      <span className="truncate">{track.artist}</span>
                      <span>•</span>
                      <span className="text-violet-400 font-medium text-[11px]">
                        {track.genre}
                      </span>
                    </div>
                    {track.duration && (
                      <span className="text-[11px] font-mono text-slate-500 mt-0.5 inline-block">
                        {formatTime(track.duration)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div
                  className="flex items-center gap-1 opacity-80 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => playNext(track)}
                    className="px-2.5 py-1.5 bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-cyan-accent rounded-xl text-xs font-bold transition-colors hidden sm:inline-block"
                    title="تشغيل التالي في الطابور"
                  >
                    التالي
                  </button>

                  <button
                    onClick={() => addToQueue(track)}
                    className="p-2 bg-dark-800 hover:bg-cyan-accent/20 text-slate-300 hover:text-cyan-accent border border-dark-700 rounded-xl text-xs font-bold transition-colors"
                    title="إضافة لطابور التشغيل"
                  >
                    <ListPlus size={16} />
                  </button>

                  <button
                    onClick={() => onAddToPlaylistClick(track)}
                    className="p-2 bg-dark-800 hover:bg-violet-600/20 text-slate-300 hover:text-violet-400 border border-dark-700 rounded-xl text-xs font-bold transition-colors"
                    title="إضافة لقائمة تشغيل"
                  >
                    <BookmarkPlus size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
