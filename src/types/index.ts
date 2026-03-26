export interface Song {
  rid: number;
  name: string;
  artist: string;
  pic: string;
  lrc?: string;
  url?: string;
  duration?: number;
}

export interface SearchResult {
  rid: number;
  name: string;
  artist: string;
  pic: string;
  lrc?: string;
  url?: string;
}

export interface Artist {
  id: number;
  name: string;
  pic: string;
  tag?: string[];
}

export interface RankItem {
  rid: number;
  name: string;
  artist: string;
  pic: string;
  info?: string;
}

export interface LyricLine {
  time: string;
  lineLyric: string;
}

export interface Banner {
  pic: string;
  name: string;
  url?: string;
}

export interface PlaylistInfo {
  id: string;
  name?: string;
  pic?: string;
  desc?: string;
  creator?: string;
  tags?: string[];
}

export interface AlbumInfo {
  id: string;
  name?: string;
  pic?: string;
  artist?: string;
}

export interface MVItem {
  id: string;
  name: string;
  pic: string;
  artist: string;
}

export interface DJItem {
  id: string;
  name: string;
  pic: string;
  desc?: string;
}

export type QualityLevel = 'exhigh' | 'lossless' | 'hires' | 'standard';

export interface SongUrlResult {
  url: string;
  type: string;
}