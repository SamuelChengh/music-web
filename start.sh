#!/bin/bash

echo "🎵 启动 TheH 音乐..."

# 启动后端代理服务
echo "📡 启动代理服务..."
cd "$(dirname "$0")/server"
node index.js &
SERVER_PID=$!

# 等待服务启动
sleep 2

# 启动前端开发服务器
echo "🎨 启动前端服务..."
cd "$(dirname "$0")"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 服务已启动！"
echo "   前端: http://localhost:5173"
echo "   代理: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止服务"

# 捕获退出信号
trap "kill $SERVER_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

# 保持脚本运行
wait
