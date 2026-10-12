import React, { useState } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { MediaItem, ActiveTab } from './types/media';
import { SAMPLE_TRACKS } from './data/sampleTracks';
import { LibraryView } from './components/LibraryView';
import { PlaylistsView } from './components/PlaylistsView';
import { QueuePanel } from './components/QueuePanel';
import { MiniPlayer } from './components/MiniPlayer';
import { FullPlayerModal } from './components/FullPlayerModal';
import {
  EqualizerModal,
  SleepTimerModal,
  AddStreamModal,
  AddToPlaylistModal,
} from './components/Modals';
import {
  PlayCircle,
  ListMusic,
  Sliders,
  Timer,
  FolderPlus,
  Sparkles,
} from 'lucide-react';

const MainApp: React.FC = () => {
  const {
    queue,
    currentTrack,
    sleepTimerSeconds,
    addToQueue,
    playTrack,
    createPlaylist,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [tracks, setTracks] = useState<MediaItem[]>(SAMPLE_TRACKS);

  // Modals state
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  const [isAddStreamOpen, setIsAddStreamOpen] = useState(false);
  const [trackToAddToPlaylist, setTrackToAddToPlaylist] = useState<MediaItem | null>(null);

  // Handle local files import
  const handleImportFiles = (files: FileList) => {
    const imported: MediaItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVid = file.type.startsWith('video/');
      const url = URL.createObjectURL(file);
      const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

      const item: MediaItem = {
        id: 'local_' + Date.now().toString(36) + '_' + i,
        title: cleanName,
        artist: 'ملف محلي من الجهاز',
        mediaUri: url,
        artworkUri: '',
        isVideo: isVid,
        genre: isVid ? 'فيديو محلي' : 'صوت محلي',
        isLocal: true,
      };
      imported.push(item);
    }

    if (imported.length > 0) {
      setTracks((prev) => [...imported, ...prev]);
      imported.forEach((t) => addToQueue(t));
      alert(`تم استيراد ${imported.length} مقطع بنجاح وإضافتها إلى طابور التشغيل!`);
    }
  };

  // Handle direct stream URL addition
  const handleAddStream = (url: string, title: string, isVideo: boolean) => {
    const item: MediaItem = {
      id: 'stream_' + Date.now().toString(36),
      title: title || 'رابط بث مباشر',
      artist: 'بث شبكي (Online Stream)',
      mediaUri: url,
      artworkUri: isVideo
        ? 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&q=80'
        : 'https://images.unsplash.com/photo-1445985543469-753ec9585f2b?w=600&q=80',
      isVideo: isVideo,
      genre: 'رابط مباشر',
    };
    setTracks((prev) => [item, ...prev]);
    playTrack(item);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans pb-28">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-dark-900/90 backdrop-blur-xl border-b border-dark-800/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('all')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-violet-600 flex items-center justify-center text-dark-950 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <PlayCircle size={24} className="fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white group-hover:text-cyan-accent transition-colors">
                  PulsePlayer
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-cyan-accent/20 text-cyan-accent border border-cyan-500/30">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:block">
                مشغل الموسيقى والفيديو وقوائم التشغيل القوي
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSleepTimerOpen(true)}
              className={`p-2 rounded-xl transition-colors relative ${
                sleepTimerSeconds > 0
                  ? 'text-amber-accent bg-amber-accent/10 border border-amber-accent/30'
                  : 'text-slate-400 hover:text-white hover:bg-dark-800'
              }`}
              title="مؤقت النوم"
            >
              <Timer size={18} />
              {sleepTimerSeconds > 0 && (
                <span className="absolute -top-1 -right-1 px-1 text-[9px] font-black bg-amber-accent text-dark-950 rounded-full">
                  {Math.ceil(sleepTimerSeconds / 60)}m
                </span>
              )}
            </button>

            <button
              onClick={() => setIsEqualizerOpen(true)}
              className="p-2 text-slate-400 hover:text-violet-400 hover:bg-dark-800 rounded-xl transition-colors"
              title="معدّل الصوت"
            >
              <Sliders size={18} />
            </button>

            <button
              onClick={() =>
                setActiveTab((curr) => (curr === 'queue' ? 'all' : 'queue'))
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                activeTab === 'queue'
                  ? 'bg-cyan-accent text-dark-950 border-cyan-accent font-black shadow-md shadow-cyan-500/20'
                  : 'bg-dark-800 hover:bg-dark-750 text-slate-300 border-dark-700'
              }`}
              title="طابور التشغيل"
            >
              <ListMusic size={16} />
              <span>الطابور ({queue.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Area */}
      <main className="max-w-7xl w-full mx-auto px-4 py-5 flex-1">
        {activeTab === 'playlists' ? (
          <PlaylistsView />
        ) : activeTab === 'queue' ? (
          <div className="max-w-2xl mx-auto">
            <QueuePanel onClose={() => setActiveTab('all')} />
          </div>
        ) : (
          <LibraryView
            tracks={tracks}
            activeTab={activeTab}
            onTabSelect={setActiveTab}
            onAddStreamClick={() => setIsAddStreamOpen(true)}
            onAddToPlaylistClick={(track) => setTrackToAddToPlaylist(track)}
            onImportFiles={handleImportFiles}
          />
        )}
      </main>

      {/* Docked MiniPlayer */}
      <MiniPlayer onOpenQueue={() => setActiveTab('queue')} />

      {/* Fullscreen Player Modal */}
      <FullPlayerModal
        onOpenQueue={() => setActiveTab('queue')}
        onOpenEqualizer={() => setIsEqualizerOpen(true)}
        onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
        onAddToPlaylist={() => {
          if (currentTrack) setTrackToAddToPlaylist(currentTrack);
        }}
      />

      {/* Modals */}
      <EqualizerModal
        isOpen={isEqualizerOpen}
        onClose={() => setIsEqualizerOpen(false)}
      />

      <SleepTimerModal
        isOpen={isSleepTimerOpen}
        onClose={() => setIsSleepTimerOpen(false)}
      />

      <AddStreamModal
        isOpen={isAddStreamOpen}
        onClose={() => setIsAddStreamOpen(false)}
        onAddStream={handleAddStream}
      />

      <AddToPlaylistModal
        track={trackToAddToPlaylist}
        onClose={() => setTrackToAddToPlaylist(null)}
        onCreateNewPlaylist={() => {
          const name = prompt('أدخل اسم قائمة التشغيل الجديدة:');
          if (name && name.trim()) {
            createPlaylist(name.trim(), trackToAddToPlaylist ? [trackToAddToPlaylist] : []);
            alert(`تم إنشاء قائمة "${name}" وإضافة المقطع إليها!`);
          }
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <PlayerProvider>
      <MainApp />
    </PlayerProvider>
  );
}
