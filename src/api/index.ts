import axios from 'axios';
import { encrypt, decrypt } from '../utils/crypto';

const API_BASE = '';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase() || 'GET';
  const url = config.url?.split('?')[0] || '';
  const params = config.params || {};
  
  const encryptedData = encrypt({ endpoint: url, params });
  config.url = `/api?data=${encodeURIComponent(encryptedData)}`;
  config.params = {};
  
  return config;
});

api.interceptors.response.use((response) => {
  const encryptedData = response.data;
  if (typeof encryptedData === 'string' && encryptedData.startsWith('U2FsdGVkX1')) {
    try {
      const decrypted = decrypt<{ code: number; data: unknown; msg?: string }>(encryptedData);
      return { ...response, data: decrypted };
    } catch (e) {
      return response;
    }
  }
  return response;
});

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

export interface Song {
  rid: number;
  name: string;
  artist: string;
  pic: string;
  lrc?: string;
  url?: string;
  duration?: number;
}

export interface Playlist {
  id: number;
  name: string;
  creator: string;
  pic: string;
  playCount: number;
  songCount: number;
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

export async function searchSongs(keyword: string, page = 1, limit = 30): Promise<SearchResult[]> {
  const { data } = await api.get(`/search`, { params: { name: keyword, page, limit, class: '单曲' } });
  return data.data || [];
}

export async function getHotSearch(): Promise<string[]> {
  const { data } = await api.get(`/hotsearch`);
  return data.data || [];
}

export async function getRecommendList(name: string = '伤感', page = 1, limit = 30): Promise<Playlist[]> {
  const { data } = await api.get(`/recommend`, { params: { name, page, limit } });
  return data.data || [];
}

export async function getNewList(page = 1, limit = 99): Promise<Playlist[]> {
  const { data } = await api.get(`/newlist`, { params: { page, limit } });
  return data.data || [];
}

export async function getRankList(name: string = '热歌榜', page = 1, limit = 99): Promise<RankItem[]> {
  const { data } = await api.get(`/rank`, { params: { name, page, limit } });
  return data.data || [];
}

export async function getRankTags(): Promise<{ name: string; pic: string }[]> {
  const { data } = await api.get(`/ranktags`);
  return data.data || [];
}

export async function getArtistList(page = 1, limit = 30): Promise<Artist[]> {
  const { data } = await api.get(`/artistlist`, { params: { page, limit } });
  return data.data || [];
}

export async function getArtistInfo(name: string, page = 1, limit = 60): Promise<Artist[]> {
  const { data } = await api.get(`/artistinfo`, { params: { name, pn: page, rn: limit } });
  return data.data || [];
}

export async function getArtistSongs(artistId: number, page = 1, limit = 30): Promise<Song[]> {
  const { data } = await api.get(`/artistsongs`, { params: { id: artistId, page, limit } });
  return data.data || [];
}

export async function getSongUrl(songId: number, level: string = 'exhigh', format: string = 'json'): Promise<{ url: string; type: string }> {
  const { data } = await api.get(`/song`, { params: { id: songId, level, format } });
  return { url: data.data?.url || '', type: level };
}

export async function getLyric(songId: number, format: string = 'lineLyric'): Promise<LyricLine[]> {
  const { data } = await api.get(`/lyric`, { params: { id: songId, format } });
  return data.data || [];
}

export async function getBanner(): Promise<{ pic: string; name: string; url?: string }[]> {
  const { data } = await api.get(`/banner`);
  return data.data || [];
}

export async function getPlaylistInfo(id: string): Promise<any> {
  const { data } = await api.get(`/playlist`, { params: { id } });
  return data.data || {};
}

export async function getPlaylistSongs(id: string): Promise<Song[]> {
  const { data } = await api.get(`/playlistsongs`, { params: { id } });
  return data.data || [];
}

export async function getAlbumInfo(id: string): Promise<any> {
  const { data } = await api.get(`/album`, { params: { id } });
  return data.data || {};
}

export async function getAlbumSongs(id: string): Promise<Song[]> {
  const { data } = await api.get(`/albumsongs`, { params: { id } });
  return data.data || [];
}

export async function searchMV(keyword: string, page = 1): Promise<any[]> {
  const { data } = await api.get(`/searchmv`, { params: { keyword, page } });
  return data.data || [];
}

export async function getMVUrl(id: string): Promise<string> {
  const { data } = await api.get(`/mv`, { params: { id } });
  return data.data?.url || '';
}

export async function getDJList(page = 1): Promise<any[]> {
  const { data } = await api.get(`/djlist`, { params: { page } });
  return data.data || [];
}

export default api;