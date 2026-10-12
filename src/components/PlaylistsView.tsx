import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Playlist, MediaItem } from '../types/media';
import {
  FolderPlus,
  Play,
  ListPlus,
  Trash2,
  Music,
  Video,
  ArrowRight,
  MoreVertical,
  ListMusic,
  Clock,
} from 'lucide-react';
import { formatTime } from '../utils/formatTime';

export const PlaylistsView: React.FC = () => {
  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    removeTrackFromPlaylist,
    setQueue,
    addToQueue,
    playTrack,
    playNext,
    currentTrack,
    isPlaying,
  } = usePlayer();

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId) || null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const newId = createPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setShowCreateModal(false);
    setSelectedPlaylistId(newId);
  };

  const handlePlayAll = (playlist: Playlist) => {
    if (playlist.items.length === 0) return;
    setQueue(playlist.items, 0, true);
  };

  const handleAddAllToQueue = (playlist: Playlist) => {
    if (playlist.items.length === 0) return;
    playlist.items.forEach((track) => addToQueue(track));
  };

  // If a playlist is selected, show its detail view
  if (selectedPlaylist) {
    return (
      <div className="space-y-5">
        {/* Detail Header */}
        <div className="bg-dark-900 border border-dark-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          <button
            onClick={() => setSelectedPlaylistId(null)}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowRight size={16} />
            <span>العودة إلى كافة قوائم التشغيل</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 flex items-center justify-center text-dark-950 font-black shadow-lg shadow-cyan-500/10">
                <ListMusic size={32} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {selectedPlaylist.name}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>{selectedPlaylist.items.length} مقاطع (صوت وفيديو)</span>
                  <span>•</span>
                  <span>
                    أنشئت في{' '}
                    {new Date(selectedPlaylist.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                disabled={selectedPlaylist.items.length === 0}
                onClick={() => handlePlayAll(selectedPlaylist)}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-violet-500 text-dark-950 rounded-xl text-xs font-black flex items-center gap-2 hover:opacity-95 shadow-md shadow-cyan-500/20 disabled:opacity-40"
              >
                <Play size={16} className="fill-current" />
                <span>تشغيل الكل</span>
              </button>

              <button
                disabled={selectedPlaylist.items.length === 0}
                onClick={() => handleAddAllToQueue(selectedPlaylist)}
                className="px-4 py-2.5 bg-dark-800 hover:bg-dark-750 text-white border border-dark-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-40"
                title="إضافة جميع المقاطع لطابور التشغيل الحالي"
              >
                <ListPlus size={16} />
                <span>إضافة للطابور</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`هل تريد بالتأكيد حذف قائمة "${selectedPlaylist.name}"؟`)) {
                    deletePlaylist(selectedPlaylist.id);
                    setSelectedPlaylistId(null);
                  }
                }}
                className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-colors"
                title="حذف القائمة"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Tracks in selected playlist */}
        <div className="space-y-2">
          {selectedPlaylist.items.length === 0 ? (
            <div className="bg-dark-900 border border-dark-700/80 rounded-2xl p-12 text-center text-slate-400">
              <Music size={40} className="text-dark-700 mx-auto mb-3" />
              <p className="font-bold text-white text-sm">القائمة فارغة</p>
              <p className="text-xs text-slate-500 mt-1">
                تصفح المكتبة وأضف المقاطع الصوتية والفيديوهات إلى هذه القائمة
              </p>
            </div>
          ) : (
            selectedPlaylist.items.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;

              return (
                <div
                  key={`${track.id}_${idx}`}
                  onClick={() => playTrack(track)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer border group ${
                    isCurrent
                      ? 'bg-dark-800/90 border-cyan-500/50 shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                      : 'bg-dark-900 hover:bg-dark-800/80 border-dark-800'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-500 w-5 text-center">
                    {idx + 1}
                  </span>

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
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4
                      className={`text-xs font-bold truncate ${
                        isCurrent ? 'text-cyan-accent' : 'text-white'
                      }`}
                    >
                      {track.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate mt-0.5">
                      <span>{track.artist}</span>
                      <span>•</span>
                      <span className="text-violet-400">{track.genre}</span>
                      <span>•</span>
                      <span className="text-cyan-accent/80 font-medium">
                        {track.isVideo ? 'فيديو' : 'صوت'}
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-1 opacity-70 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => playNext(track)}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-cyan-accent hover:bg-dark-700 rounded-lg transition-colors"
                      title="تشغيل التالي في الطابور"
                    >
                      التالي
                    </button>

                    <button
                      onClick={() => addToQueue(track)}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-cyan-accent hover:bg-dark-700 rounded-lg transition-colors"
                      title="إضافة لطابور التشغيل"
                    >
                      + للطابور
                    </button>

                    <button
                      onClick={() =>
                        removeTrackFromPlaylist(selectedPlaylist.id, track.id)
                      }
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="إزالة من القائمة"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Playlists Index Grid
  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-dark-800">
        <div>
          <h2 className="text-xl font-black text-white">قوائم التشغيل (Playlists)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            نظّم مقاطع الموسيقى والفيديو المفضلة لديك في مجموعات مخصصة
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-dark-950 font-black rounded-xl text-xs flex items-center gap-2 hover:opacity-95 shadow-md shadow-violet-500/20"
        >
          <FolderPlus size={16} />
          <span>قائمة جديدة</span>
        </button>
      </div>

      {/* Grid of Playlists */}
      {playlists.length === 0 ? (
        <div className="bg-dark-900 border border-dark-700/80 rounded-2xl p-16 text-center text-slate-400">
          <ListMusic size={48} className="text-dark-700 mx-auto mb-3" />
          <p className="font-bold text-white text-base">لا توجد قوائم تشغيل حتى الآن</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            أنشئ قائمتك الأولى لتجميع الأغاني والمقاطع المرئية لتشغيلها دفعة واحدة في الطابور!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-5 py-2.5 bg-cyan-accent text-dark-950 font-black rounded-xl text-xs"
          >
            + إنشاء قائمة جديدة
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => setSelectedPlaylistId(playlist.id)}
              className="bg-dark-900 border border-dark-700/80 hover:border-cyan-500/50 p-5 rounded-2xl transition-all duration-200 cursor-pointer hover:shadow-xl hover:shadow-cyan-500/5 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-400/30 border border-dark-700 flex items-center justify-center text-cyan-accent group-hover:scale-105 transition-transform">
                    <ListMusic size={24} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 bg-dark-800 px-2.5 py-1 rounded-full border border-dark-700">
                    {playlist.items.length} مقاطع
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-cyan-accent transition-colors line-clamp-1">
                  {playlist.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Clock size={12} />
                  <span>
                    {new Date(playlist.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </p>
              </div>

              <div
                className="flex items-center justify-between pt-4 mt-4 border-t border-dark-800"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  disabled={playlist.items.length === 0}
                  onClick={() => handlePlayAll(playlist)}
                  className="px-3 py-1.5 bg-cyan-accent/10 hover:bg-cyan-accent/20 text-cyan-accent border border-cyan-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-30"
                >
                  <Play size={13} className="fill-current" />
                  <span>تشغيل</span>
                </button>

                <button
                  disabled={playlist.items.length === 0}
                  onClick={() => handleAddAllToQueue(playlist)}
                  className="px-3 py-1.5 bg-dark-800 hover:bg-dark-750 text-slate-300 border border-dark-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-30"
                >
                  <ListPlus size={13} />
                  <span>للطابور</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`حذف قائمة "${playlist.name}"؟`)) {
                      deletePlaylist(playlist.id);
                    }
                  }}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="حذف"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h4 className="text-lg font-extrabold text-white mb-2">
              إنشاء قائمة تشغيل جديدة
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              أدخل اسماً مميزاً لقائمتك لتنظيم الأغاني والفيديوهات حسب ذوقك.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  اسم القائمة
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="مثال: نغمات القيادة والسفر"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-dark-950 rounded-xl font-bold text-xs disabled:opacity-50"
                >
                  إنشاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
