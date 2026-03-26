const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const API_BASE = 'https://kw-api.cenguigui.cn';

function fetchFromAPI(pathAndQuery) {
  return new Promise((resolve, reject) => {
    const fullUrl = pathAndQuery.startsWith('http') ? pathAndQuery : API_BASE + pathAndQuery;
    
    const req = https.get(fullUrl, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          resolve({ code: 500, error: 'Parse error', raw: data });
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('请求错误:', err.message);
      resolve({ code: 500, error: err.message });
    });
    
    req.on('timeout', () => {
      console.error('请求超时');
      req.destroy();
      resolve({ code: 500, error: 'timeout' });
    });
  });
}

function parseQuery(url) {
  const match = url.match(/\?(.*)$/);
  if (match && match[1]) {
    const params = new URLSearchParams(match[1]);
    const obj = {};
    for (const [key, value] of params) {
      obj[key] = value;
    }
    return obj;
  }
  return {};
}

function buildQueryString(params) {
  const filtered = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return filtered.length > 0 ? '?' + filtered.join('&') : '';
}

function normalizeSong(song) {
  return {
    rid: parseInt(song.rid) || song.rid,
    name: song.name || song.Name || '',
    artist: song.artist || song.Artist || '',
    pic: song.pic || song.PIC || '',
    lrc: song.lrc || song.LRC || '',
    url: song.url || song.URL || '',
    duration: song.duration || song.Duration || 0
  };
}

function normalizeArtist(artist) {
  return {
    id: parseInt(artist.id || artist.ID || artist.artistid) || 0,
    name: artist.name || artist.Name || '',
    pic: artist.pic || artist.PIC || ''
  };
}

function formatLyricTime(seconds) {
  const sec = parseFloat(seconds);
  const m = Math.floor(sec / 60);
  const s = (sec % 60).toFixed(2);
  return `${m}:${s.padStart(5, '0')}`;
}

app.use(async (req, res, next) => {
  const url = req.url;
  
  if (url.startsWith('/search')) {
    const params = parseQuery(url);
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    
    const query = `?name=${encodeURIComponent(params.name)}&page=${page}&limit=${limit}`;
    const result = await fetchFromAPI(query);
    
    if (result && result.code === 200 && result.data) {
      const data = Array.isArray(result.data) ? result.data : [result.data];
      return res.json({
        code: 200,
        data: data.map(song => ({
          rid: song.rid,
          name: song.name,
          artist: song.artist,
          pic: song.pic,
          duration: song.duration
        }))
      });
    }
    return res.json({ code: 404, msg: '未找到结果', data: [] });
  }
  
  if (url.startsWith('/hotsearch')) {
    const result = await fetchFromAPI('/?type=searchKey');
    if (result.code === 200 && result.data && result.data.hots) {
      result.data = result.data.hots.map(item => item.name);
    }
    return res.json(result);
  }
  
  if (url.startsWith('/recommend')) {
    const params = parseQuery(url);
    const query = buildQueryString({
      name: params.name || '伤感',
      type: 'rcmlist',
      page: params.page,
      limit: params.limit
    });
    const result = await fetchFromAPI('/' + query);
    if (result.code === 200) {
      if (Array.isArray(result.data)) {
        result.data = result.data.map(normalizeSong);
      } else if (result.data && Array.isArray(result.data.musicList)) {
        result.data = result.data.musicList.map(normalizeSong);
      } else if (result.data && Array.isArray(result.data.list)) {
        result.data = result.data.list.map(normalizeSong);
      }
    }
    return res.json(result);
  }
  
  if (url.startsWith('/newlist')) {
    const params = parseQuery(url);
    const query = buildQueryString({
      type: 'new',
      page: params.page,
      limit: params.limit
    });
    const result = await fetchFromAPI('/' + query);
    if (result.code === 200 && Array.isArray(result.data)) {
      result.data = result.data.map(normalizeSong);
    }
    return res.json(result);
  }
  
  if (url.startsWith('/rank')) {
    const params = parseQuery(url);
    const query = buildQueryString({
      name: params.name || '热歌榜',
      type: 'rank',
      page: params.page,
      limit: params.limit
    });
    const result = await fetchFromAPI('/' + query);
    if (result && result.code === 200 && result.data) {
      if (Array.isArray(result.data)) {
        result.data = result.data.map(song => ({
          rid: song.rid || song.MUSICRID?.replace('MUSIC_', '') || 0,
          name: song.name || song.SONGNAME || '',
          artist: song.artist || song.ARTIST || '',
          pic: song.pic || song.PICPATH || '',
          info: song.PlayCnt ? `${(parseInt(song.PlayCnt) / 10000).toFixed(1)}万播放` : ''
        }));
      } else if (result.data.musicList && Array.isArray(result.data.musicList)) {
        result.data = result.data.musicList.map(song => ({
          rid: parseInt(song.rid) || song.MUSICRID?.replace('MUSIC_', '') || 0,
          name: song.name || song.songname || song.SONGNAME || '',
          artist: song.artist || song.aartist || song.ARTIST || '',
          pic: song.pic || song.pic120 || song.PICPATH || '',
          info: song.PlayCnt ? `${(parseInt(song.PlayCnt) / 10000).toFixed(1)}万播放` : ''
        }));
      } else if (result.data.songList && Array.isArray(result.data.songList)) {
        result.data = result.data.songList.map(song => ({
          rid: parseInt(song.rid) || song.MUSICRID?.replace('MUSIC_', '') || 0,
          name: song.name || song.songname || song.SONGNAME || '',
          artist: song.artist || song.aartist || song.ARTIST || '',
          pic: song.pic || song.pic120 || song.PICPATH || '',
          info: song.PlayCnt ? `${(parseInt(song.PlayCnt) / 10000).toFixed(1)}万播放` : ''
        }));
      }
    }
    return res.json(result || { code: 500, data: [] });
  }
  
  if (url.startsWith('/ranktags')) {
    const result = await fetchFromAPI('/?name=tag&type=rank');
    if (result.code === 200 && result.data) {
      if (result.data.tag) {
        result.data = result.data.tag;
      }
    }
    return res.json(result);
  }
  
  if (url.startsWith('/artistlist')) {
    const params = parseQuery(url);
    const query = buildQueryString({
      type: 'artist',
      page: params.page,
      limit: params.limit
    });
    const result = await fetchFromAPI('/' + query);
    if (result.code === 200 && result.data) {
      if (Array.isArray(result.data)) {
        result.data = result.data.map(normalizeArtist);
      } else if (result.data.artistList) {
        result.data = result.data.artistList.map(a => ({
          id: a.id || 0,
          name: a.name || a.aartist || '',
          pic: a.pic || a.pic300 || ''
        }));
      }
    }
    return res.json(result);
  }
  
  if (url.startsWith('/artistinfo')) {
    const params = parseQuery(url);
    const query = buildQueryString({
      name: params.name || '',
      type: 'artistInfo',
      pn: params.pn,
      rn: params.rn
    });
    const result = await fetchFromAPI('/' + query);
    if (result.code === 200 && result.data) {
      if (Array.isArray(result.data)) {
        result.data = result.data.map(normalizeArtist);
      } else if (result.data.artistList) {
        result.data = result.data.artistList.map(a => ({
          id: a.id || 0,
          name: a.name || a.aartist || '',
          pic: a.pic || a.pic300 || ''
        }));
      }
    }
    return res.json(result);
  }
  
  if (url.startsWith('/artistsongs')) {
    const params = parseQuery(url);
    const query = buildQueryString({
      id: params.id,
      type: 'artistMusic',
      page: params.page,
      limit: params.limit
    });
    const result = await fetchFromAPI('/' + query);
    if (result && result.code === 200 && result.data) {
      if (Array.isArray(result.data)) {
        result.data = result.data.map(song => ({
          rid: song.rid || song.MUSICRID?.replace('MUSIC_', '') || 0,
          name: song.name || song.SONGNAME || '',
          artist: song.artist || song.ARTIST || '',
          pic: song.pic || song.PICPATH || '',
          duration: song.duration || song.DURATION || 0
        }));
      } else if (result.data.musicList && Array.isArray(result.data.musicList)) {
        result.data = result.data.musicList.map(song => ({
          rid: parseInt(song.rid) || song.MUSICRID?.replace('MUSIC_', '') || 0,
          name: song.name || song.songname || song.SONGNAME || '',
          artist: song.artist || song.aartist || song.ARTIST || '',
          pic: song.pic || song.pic120 || song.PICPATH || '',
          duration: song.duration || song.DURATION || 0
        }));
      } else if (result.data.songList && Array.isArray(result.data.songList)) {
        result.data = result.data.songList.map(song => ({
          rid: parseInt(song.rid) || song.MUSICRID?.replace('MUSIC_', '') || 0,
          name: song.name || song.songname || song.SONGNAME || '',
          artist: song.artist || song.aartist || song.ARTIST || '',
          pic: song.pic || song.pic120 || song.PICPATH || '',
          duration: song.duration || song.DURATION || 0
        }));
      }
    }
    return res.json(result || { code: 500, data: [] });
  }
  
  if (url.startsWith('/song')) {
    const params = parseQuery(url);
    const query = buildQueryString({
      id: params.id,
      type: 'song',
      level: params.level || 'exhigh',
      format: params.format || 'json'
    });
    try {
      const result = await fetchFromAPI('/' + query);
      if (result && result.code === 200 && result.data && result.data.url) {
        return res.json(result);
      } else if (result && result.error) {
        console.log('/song API error:', result.error);
        return res.json({ code: 404, data: { url: '' }, msg: '无法获取播放地址' });
      } else {
        console.log('/song API 返回格式异常:', JSON.stringify(result).substring(0, 300));
        return res.json({ code: 200, data: { url: '' } });
      }
    } catch (e) {
      console.error('/song 处理错误:', e);
      return res.json({ code: 500, data: { url: '' }, msg: '服务器错误' });
    }
  }
  
  if (url.startsWith('/lyric')) {
    const params = parseQuery(url);
    const query = buildQueryString({
      id: params.id,
      type: 'lyr',
      format: params.format || 'lineLyric'
    });
    const result = await fetchFromAPI('/' + query);
    if (result.code === 200 && result.data) {
      if (typeof result.data === 'string') {
        const lines = result.data.split('\n').filter(line => line.trim());
        result.data = lines.map(line => {
          const match = line.match(/\[(\d{2}):(\d{2}\.\d+)\](.*)/);
          if (match) {
            return { time: `${match[1]}:${match[2]}`, lineLyric: match[3].trim() };
          }
          return { time: '00:00', lineLyric: line };
        });
      } else if (result.data.lrclist) {
        result.data = result.data.lrclist.map(item => ({
          time: formatLyricTime(item.time),
          lineLyric: item.lineLyric || ''
        }));
      }
    }
    return res.json(result);
  }
  
  if (url.startsWith('/banner')) {
    const result = await fetchFromAPI('/?type=banner');
    return res.json(result);
  }
  
  next();
});

app.get('/download', async (req, res) => {
  try {
    const { url, filename } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }
    
    const decodedUrl = decodeURIComponent(url);
    
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename || 'song.mp3')}"`);
    res.setHeader('Content-Type', 'audio/mpeg');
    
    https.get(decodedUrl, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        const redirectUrl = response.headers.location;
        https.get(redirectUrl, (redirectResponse) => {
          res.setHeader('Content-Type', redirectResponse.headers['content-type'] || 'audio/mpeg');
          redirectResponse.pipe(res);
        });
      } else {
        response.pipe(res);
      }
    }).on('error', (error) => {
      res.status(500).json({ error: error.message });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎵 Music Proxy Server running at http://localhost:${PORT}`);
  console.log(`   API requests hidden - all traffic proxied through server\n`);
});