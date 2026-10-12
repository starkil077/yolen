export interface MediaItem {
  id: string;
  title: string;
  artist: string;
  mediaUri: string;
  artworkUri?: string;
  duration?: number; // in seconds
  isVideo: boolean;
  genre: string;
  isLocal?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  createdAt: number;
  items: MediaItem[];
}

export type RepeatMode = 'off' | 'all' | 'one';

export type EqualizerPreset =
  | 'flat'
  | 'bass'
  | 'vocal'
  | 'electronic'
  | 'rock'
  | 'acoustic';

export type VideoAspect = 'fit' | 'cover' | 'fill';

export type ActiveTab = 'all' | 'audio' | 'video' | 'playlists' | 'queue';
