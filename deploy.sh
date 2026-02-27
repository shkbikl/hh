#!/bin/bash

# OpenClaw Web Chat - 一键部署脚本

set -e

echo "🦞 OpenClaw Web Chat - 部署脚本"
echo "================================"

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装"
    echo "请先安装 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Docker 已安装：$(docker --version)"

# 构建镜像
echo ""
echo "🔨 构建 Docker 镜像..."
docker build -t openclaw-web .

# 停止旧容器
echo ""
echo "🛑 停止旧容器（如果有）..."
docker stop openclaw-chat 2>/dev/null || true
docker rm openclaw-chat 2>/dev/null || true

# 运行新容器
echo ""
echo "🚀 启动新容器..."
docker run -d \
  --name openclaw-chat \
  -p 3000:80 \
  --restart unless-stopped \
  openclaw-web

# 等待容器启动
sleep 2

# 检查状态
echo ""
echo "================================"
if docker ps | grep -q openclaw-chat; then
    echo "✅ 部署成功!"
    echo ""
    echo "📱 访问地址：http://localhost:3000"
    echo ""
    echo "🔧 配置："
    echo "   1. 打开网页"
    echo "   2. 点击右上角 ⚙️ 设置"
    echo "   3. 填写 Gateway 地址和 API Key"
    echo ""
    echo "📋 常用命令："
    echo "   查看日志：docker logs openclaw-chat"
    echo "   停止服务：docker stop openclaw-chat"
    echo "   重启服务：docker restart openclaw-chat"
    echo "================================"
else
    echo "❌ 部署失败"
    echo "查看日志：docker logs openclaw-chat"
    exit 1
fi
