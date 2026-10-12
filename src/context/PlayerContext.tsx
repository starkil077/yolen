import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  MediaItem,
  Playlist,
  RepeatMode,
  EqualizerPreset,
  VideoAspect,
} from '../types/media';
import { SAMPLE_TRACKS } from '../data/sampleTracks';

interface PlayerContextType {
  currentTrack: MediaItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  queue: MediaItem[];
  queueIndex: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  playbackSpeed: number;
  equalizerPreset: EqualizerPreset;
  sleepTimerSeconds: number;
  videoAspect: VideoAspect;
  visualizerFft: Uint8Array;
  playlists: Playlist[];
  isFullPlayerOpen: boolean;

  // Actions
  setIsFullPlayerOpen: (open: boolean) => void;
  playTrack: (track: MediaItem) => void;
  setQueue: (tracks: MediaItem[], startIndex?: number, autoPlay?: boolean) => void;
  addToQueue: (track: MediaItem) => void;
  playNext: (track: MediaItem) => void;
  removeFromQueue: (index: number) => void;
  moveQueueItem: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  skipToNext: () => void;
  skipToPrevious: () => void;
  skipToIndex: (index: number) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  seekRelative: (offsetSeconds: number) => void;
  cycleRepeatMode: () => void;
  toggleShuffle: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setEqualizerPreset: (preset: EqualizerPreset) => void;
  setSleepTimer: (minutes: number) => void;
  cancelSleepTimer: () => void;
  setVideoAspect: (aspect: VideoAspect) => void;
  cycleVideoAspect: () => void;

  // Playlist actions
  createPlaylist: (name: string, initialItems?: MediaItem[]) => string;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: MediaItem) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  saveQueueAsPlaylist: (name: string) => void;

  // Video element ref binding
  videoRef: React.RefObject<HTMLVideoElement>;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

const PLAYLISTS_STORAGE_KEY = 'pulseplayer_playlists_v1';

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [queue, setQueueState] = useState<MediaItem[]>(SAMPLE_TRACKS);
  const [unshuffledQueue, setUnshuffledQueue] = useState<MediaItem[]>(SAMPLE_TRACKS);
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeedState] = useState<number>(1.0);
  const [equalizerPreset, setEqualizerPresetState] = useState<EqualizerPreset>('flat');
  const [sleepTimerSeconds, setSleepTimerSeconds] = useState<number>(0);
  const [videoAspect, setVideoAspect] = useState<VideoAspect>('fit');
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState<boolean>(false);

  // Audio Visualizer data
  const [visualizerFft, setVisualizerFft] = useState<Uint8Array>(new Uint8Array(32));

  // Media element references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Web Audio Nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const midFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);

  // Playlists persistence
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const stored = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse playlists from localStorage', e);
    }
    // Default demo playlist
    return [
      {
        id: 'pl_favorites',
        name: 'المختارات المفضلة (Top Picks)',
        createdAt: Date.now(),
        items: SAMPLE_TRACKS.slice(0, 4),
      },
      {
        id: 'pl_chill',
        name: 'أجواء الاسترخاء (Chill & Beats)',
        createdAt: Date.now() - 3600000,
        items: SAMPLE_TRACKS.filter((t) => !t.isVideo),
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
    } catch (e) {
      console.warn('Failed to save playlists to localStorage', e);
    }
  }, [playlists]);

  const currentTrack = queue[queueIndex] || null;

  // Active media element helper
  const getActiveMediaElement = useCallback((): HTMLMediaElement | null => {
    if (!currentTrack) return null;
    return currentTrack.isVideo ? videoRef.current : audioRef.current;
  }, [currentTrack]);

  // Handle Play/Pause
  const togglePlayPause = useCallback(() => {
    const media = getActiveMediaElement();
    if (!media) return;

    if (isPlaying) {
      media.pause();
      setIsPlaying(false);
    } else {
      media
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Playback error:', err));
    }
  }, [getActiveMediaElement, isPlaying]);

  // Set Queue
  const setQueue = useCallback(
    (tracks: MediaItem[], startIndex = 0, autoPlay = true) => {
      if (tracks.length === 0) return;
      setUnshuffledQueue(tracks);
      setQueueState(tracks);
      const safeIndex = Math.min(Math.max(0, startIndex), tracks.length - 1);
      setQueueIndex(safeIndex);
      setCurrentTime(0);
      setIsPlaying(autoPlay);
    },
    []
  );

  // Play Track
  const playTrack = useCallback(
    (track: MediaItem) => {
      const existingIdx = queue.findIndex((t) => t.id === track.id);
      if (existingIdx >= 0) {
        setQueueIndex(existingIdx);
        setCurrentTime(0);
        setIsPlaying(true);
      } else {
        const newQueue = [...queue, track];
        setQueueState(newQueue);
        setUnshuffledQueue([...unshuffledQueue, track]);
        setQueueIndex(newQueue.length - 1);
        setCurrentTime(0);
        setIsPlaying(true);
      }
      setIsFullPlayerOpen(true);
    },
    [queue, unshuffledQueue]
  );

  // Add to Queue
  const addToQueue = useCallback(
    (track: MediaItem) => {
      setQueueState((prev) => [...prev, track]);
      setUnshuffledQueue((prev) => [...prev, track]);
    },
    []
  );

  // Play Next
  const playNext = useCallback(
    (track: MediaItem) => {
      setQueueState((prev) => {
        const nextIdx = queueIndex + 1;
        const newQ = [...prev];
        newQ.splice(nextIdx, 0, track);
        return newQ;
      });
      setUnshuffledQueue((prev) => {
        const nextIdx = queueIndex + 1;
        const newQ = [...prev];
        newQ.splice(nextIdx, 0, track);
        return newQ;
      });
    },
    [queueIndex]
  );

  // Remove from Queue
  const removeFromQueue = useCallback(
    (index: number) => {
      setQueueState((prev) => {
        if (index < 0 || index >= prev.length) return prev;
        const updated = [...prev];
        updated.splice(index, 1);

        if (updated.length === 0) {
          setIsPlaying(false);
          setQueueIndex(-1);
        } else if (index === queueIndex) {
          const nextIdx = Math.min(index, updated.length - 1);
          setQueueIndex(nextIdx);
        } else if (index < queueIndex) {
          setQueueIndex((curr) => curr - 1);
        }

        return updated;
      });
    },
    [queueIndex]
  );

  // Move queue item
  const moveQueueItem = useCallback(
    (fromIndex: number, toIndex: number) => {
      setQueueState((prev) => {
        if (
          fromIndex < 0 ||
          fromIndex >= prev.length ||
          toIndex < 0 ||
          toIndex >= prev.length ||
          fromIndex === toIndex
        ) {
          return prev;
        }
        const updated = [...prev];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);

        // Adjust active index
        if (queueIndex === fromIndex) {
          setQueueIndex(toIndex);
        } else if (fromIndex < queueIndex && toIndex >= queueIndex) {
          setQueueIndex((curr) => curr - 1);
        } else if (fromIndex > queueIndex && toIndex <= queueIndex) {
          setQueueIndex((curr) => curr + 1);
        }

        return updated;
      });
    },
    [queueIndex]
  );

  // Clear Queue
  const clearQueue = useCallback(() => {
    const media = getActiveMediaElement();
    if (media) media.pause();
    setQueueState([]);
    setQueueIndex(-1);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [getActiveMediaElement]);

  // Skip To Index
  const skipToIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < queue.length) {
        setQueueIndex(index);
        setCurrentTime(0);
        setIsPlaying(true);
      }
    },
    [queue.length]
  );

  // Skip Next
  const skipToNext = useCallback(() => {
    if (queue.length === 0) return;
    const nextIdx = queueIndex + 1;
    if (nextIdx < queue.length) {
      setQueueIndex(nextIdx);
      setCurrentTime(0);
      setIsPlaying(true);
    } else if (repeatMode === 'all') {
      setQueueIndex(0);
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [queue.length, queueIndex, repeatMode]);

  // Skip Previous
  const skipToPrevious = useCallback(() => {
    if (queue.length === 0) return;
    const media = getActiveMediaElement();
    if (media && media.currentTime > 3) {
      media.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const prevIdx = queueIndex - 1;
    if (prevIdx >= 0) {
      setQueueIndex(prevIdx);
      setCurrentTime(0);
      setIsPlaying(true);
    } else if (repeatMode === 'all') {
      setQueueIndex(queue.length - 1);
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      if (media) media.currentTime = 0;
    }
  }, [getActiveMediaElement, queue.length, queueIndex, repeatMode]);

  // Seek To
  const seekTo = useCallback(
    (time: number) => {
      const media = getActiveMediaElement();
      if (!media) return;
      media.currentTime = time;
      setCurrentTime(time);
    },
    [getActiveMediaElement]
  );

  // Seek Relative
  const seekRelative = useCallback(
    (offsetSeconds: number) => {
      const media = getActiveMediaElement();
      if (!media) return;
      const newTime = Math.max(0, Math.min(media.currentTime + offsetSeconds, media.duration || 0));
      media.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [getActiveMediaElement]
  );

  // Repeat Mode Cycle
  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((curr) => {
      if (curr === 'off') return 'all';
      if (curr === 'all') return 'one';
      return 'off';
    });
  }, []);

  // Shuffle Toggle
  const toggleShuffle = useCallback(() => {
    setIsShuffle((curr) => {
      const next = !curr;
      if (next) {
        const currentItem = queue[queueIndex];
        const rest = queue.filter((_, idx) => idx !== queueIndex);
        // Shuffle rest
        for (let i = rest.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [rest[i], rest[j]] = [rest[j], rest[i]];
        }
        const newQueue = currentItem ? [currentItem, ...rest] : rest;
        setQueueState(newQueue);
        setQueueIndex(0);
      } else {
        const currentItem = queue[queueIndex];
        if (unshuffledQueue.length > 0) {
          setQueueState(unshuffledQueue);
          const foundIdx = unshuffledQueue.findIndex((t) => t.id === currentItem?.id);
          setQueueIndex(foundIdx >= 0 ? foundIdx : 0);
        }
      }
      return next;
    });
  }, [queue, queueIndex, unshuffledQueue]);

  // Playback Speed
  const setPlaybackSpeed = useCallback(
    (speed: number) => {
      setPlaybackSpeedState(speed);
      const media = getActiveMediaElement();
      if (media) media.playbackRate = speed;
    },
    [getActiveMediaElement]
  );

  // Video Aspect
  const cycleVideoAspect = useCallback(() => {
    setVideoAspect((curr) => {
      if (curr === 'fit') return 'cover';
      if (curr === 'cover') return 'fill';
      return 'fit';
    });
  }, []);

  // Sleep Timer
  const setSleepTimer = useCallback((minutes: number) => {
    setSleepTimerSeconds(minutes * 60);
  }, []);

  const cancelSleepTimer = useCallback(() => {
    setSleepTimerSeconds(0);
  }, []);

  useEffect(() => {
    if (sleepTimerSeconds <= 0) return;
    const interval = setInterval(() => {
      setSleepTimerSeconds((curr) => {
        if (curr <= 1) {
          clearInterval(interval);
          setIsPlaying(false);
          const media = getActiveMediaElement();
          if (media) media.pause();
          return 0;
        }
        return curr - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [getActiveMediaElement, sleepTimerSeconds]);

  // Setup Web Audio & Equalizer
  const setEqualizerPreset = useCallback((preset: EqualizerPreset) => {
    setEqualizerPresetState(preset);
    if (!bassFilterRef.current || !midFilterRef.current || !trebleFilterRef.current) return;

    switch (preset) {
      case 'bass':
        bassFilterRef.current.gain.value = 8;
        midFilterRef.current.gain.value = 0;
        trebleFilterRef.current.gain.value = -2;
        break;
      case 'vocal':
        bassFilterRef.current.gain.value = -2;
        midFilterRef.current.gain.value = 6;
        trebleFilterRef.current.gain.value = 2;
        break;
      case 'rock':
        bassFilterRef.current.gain.value = 6;
        midFilterRef.current.gain.value = 3;
        trebleFilterRef.current.gain.value = 5;
        break;
      case 'electronic':
        bassFilterRef.current.gain.value = 7;
        midFilterRef.current.gain.value = 1;
        trebleFilterRef.current.gain.value = 6;
        break;
      case 'acoustic':
        bassFilterRef.current.gain.value = 2;
        midFilterRef.current.gain.value = 4;
        trebleFilterRef.current.gain.value = 4;
        break;
      case 'flat':
      default:
        bassFilterRef.current.gain.value = 0;
        midFilterRef.current.gain.value = 0;
        trebleFilterRef.current.gain.value = 0;
        break;
    }
  }, []);

  // Audio Context initialization on first interaction
  const initAudioGraph = useCallback((element: HTMLMediaElement) => {
    if (audioCtxRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaElementSource(element);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const bass = ctx.createBiquadFilter();
      bass.type = 'lowshelf';
      bass.frequency.value = 200;
      bassFilterRef.current = bass;

      const mid = ctx.createBiquadFilter();
      mid.type = 'peaking';
      mid.frequency.value = 1000;
      mid.Q.value = 1;
      midFilterRef.current = mid;

      const treble = ctx.createBiquadFilter();
      treble.type = 'highshelf';
      treble.frequency.value = 3000;
      trebleFilterRef.current = treble;

      source.connect(bass);
      bass.connect(mid);
      mid.connect(treble);
      treble.connect(analyser);
      analyser.connect(ctx.destination);
    } catch (e) {
      // Cross-origin audio or already connected
      console.warn('AudioContext init note:', e);
    }
  }, []);

  // Sync media element source and state when currentTrack changes
  useEffect(() => {
    if (!currentTrack) return;
    const media = currentTrack.isVideo ? videoRef.current : audioRef.current;
    if (!media) return;

    media.src = currentTrack.mediaUri;
    media.playbackRate = playbackSpeed;
    media.load();

    if (isPlaying) {
      media
        .play()
        .then(() => {
          initAudioGraph(media);
          if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
          }
        })
        .catch((e) => console.log('Autoplay error:', e));
    }
  }, [currentTrack, initAudioGraph]);

  // Periodic visualizer and time loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      const media = getActiveMediaElement();
      if (media && !media.paused) {
        setCurrentTime(media.currentTime);
        if (media.duration && !isNaN(media.duration)) {
          setDuration(media.duration);
        }

        if (analyserRef.current) {
          const buffer = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(buffer);
          setVisualizerFft(buffer);
        } else {
          // Synthetic beat waveform if cross-origin stream
          const now = Date.now() / 150;
          const fakeData = new Uint8Array(24);
          for (let i = 0; i < 24; i++) {
            const v = Math.sin(now + i * 0.4) * 0.5 + 0.5;
            fakeData[i] = Math.floor(v * 180 + Math.random() * 60);
          }
          setVisualizerFft(fakeData);
        }
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [getActiveMediaElement]);

  // Media element event handlers
  const onTimeUpdate = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
  };

  const onLoadedMetadata = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    setDuration(e.currentTarget.duration);
  };

  const onEnded = () => {
    if (repeatMode === 'one') {
      const media = getActiveMediaElement();
      if (media) {
        media.currentTime = 0;
        media.play();
      }
    } else {
      skipToNext();
    }
  };

  // Playlists management
  const createPlaylist = useCallback((name: string, initialItems: MediaItem[] = []) => {
    const newId = 'pl_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const newPlaylist: Playlist = {
      id: newId,
      name: name.trim(),
      createdAt: Date.now(),
      items: initialItems,
    };
    setPlaylists((prev) => [newPlaylist, ...prev]);
    return newId;
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists((prev) => prev.filter((pl) => pl.id !== id));
  }, []);

  const addTrackToPlaylist = useCallback((playlistId: string, track: MediaItem) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        if (pl.items.some((item) => item.id === track.id)) return pl;
        return { ...pl, items: [...pl.items, track] };
      })
    );
  }, []);

  const removeTrackFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        return { ...pl, items: pl.items.filter((item) => item.id !== trackId) };
      })
    );
  }, []);

  const saveQueueAsPlaylist = useCallback(
    (name: string) => {
      if (queue.length === 0) return;
      createPlaylist(name, queue);
    },
    [createPlaylist, queue]
  );

  return (
    <PlayerContext.Provider
      value={{
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
        playlists,
        isFullPlayerOpen,
        setIsFullPlayerOpen,
        playTrack,
        setQueue,
        addToQueue,
        playNext,
        removeFromQueue,
        moveQueueItem,
        clearQueue,
        skipToNext,
        skipToPrevious,
        skipToIndex,
        togglePlayPause,
        seekTo,
        seekRelative,
        cycleRepeatMode,
        toggleShuffle,
        setPlaybackSpeed,
        setEqualizerPreset,
        setSleepTimer,
        cancelSleepTimer,
        setVideoAspect,
        cycleVideoAspect,
        createPlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        saveQueueAsPlaylist,
        videoRef,
        audioRef,
      }}
    >
      {children}

      {/* Hidden audio element for audio tracks */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};
