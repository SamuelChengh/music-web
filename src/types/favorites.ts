export interface FavoriteSong {
  rid: number;          // 歌曲ID
  name: string;         // 歌曲名称
  artist: string;       // 艺术家名称
  pic: string;          // 专辑封面URL
  addedAt: number;      // 添加时间戳（用于排序）
}