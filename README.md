# TheH 音乐

在线音乐播放器，集搜索、播放、榜单、歌手、歌词、下载于一体。

## 功能特性

- ✅ 搜索歌曲/歌手
- ✅ 精选歌曲/歌单
- ✅ 排行榜（18个榜单分类）
- ✅ 歌手列表/详情
- ✅ 在线播放（高音质/无损/HiRes）
- ✅ 逐行歌词显示
- ✅ 歌曲下载
- ✅ 深色/浅色主题切换
- ✅ 5种主题颜色
- ✅ 移动端响应式适配
- ✅ API接口隐藏

## 快速开始

### 方式一：一键启动

```bash
./start.sh
```

### 方式二：手动启动

**1. 启动后端代理服务**
```bash
cd server
npm install
node index.js
```

**2. 启动前端开发服务器**（新终端）
```bash
npm install
npm run dev
```

## 访问地址

- 前端：http://localhost:5173
- 后端代理：http://localhost:3001

## 技术栈

- 前端：Vue 3 + TypeScript + Vite + Tailwind CSS
- 后端：Node.js + Express

## 项目结构

```
music-web/
├── src/
│   ├── api/          # API 请求封装
│   ├── components/   # 组件
│   ├── views/       # 页面
│   ├── stores/       # 状态管理
│   └── router/       # 路由
├── server/          # 后端代理服务
└── start.sh         # 启动脚本
```

## API 接口

本项目使用第三方 API，所有请求通过后端代理转发以隐藏接口地址。

## 免责声明

本项目仅供个人学习使用，请支持正版音乐。
