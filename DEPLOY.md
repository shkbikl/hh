# 🚀 OpenClaw Web Chat - 部署指南

## 方式 1：Docker 部署（推荐）⭐

### 构建镜像

```bash
cd web-chat
docker build -t openclaw-web .
```

### 运行容器

```bash
docker run -d \
  --name openclaw-chat \
  -p 3000:80 \
  --restart unless-stopped \
  openclaw-web
```

访问：http://localhost:3000

### 部署到服务器

```bash
# 推送镜像到 Registry（可选）
docker tag openclaw-web your-registry/openclaw-web:latest
docker push your-registry/openclaw-web:latest

# 在服务器上拉取并运行
docker pull your-registry/openclaw-web:latest
docker run -d -p 80:80 --name openclaw-chat openclaw-web
```

---

## 方式 2：Nginx 直接部署

### 1. 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 2. 复制文件

```bash
sudo cp -r web-chat/* /var/www/html/
```

### 3. 配置 Nginx

```bash
sudo cp web-chat/nginx.conf /etc/nginx/conf.d/openclaw.conf
sudo nginx -t
sudo systemctl restart nginx
```

访问：http://your-server-ip

---

## 方式 3：Vercel / Netlify 部署

### Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
cd web-chat
vercel --prod
```

### Netlify

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 部署
cd web-chat
netlify deploy --prod
```

---

## 方式 4：GitHub Pages

1. 将 `web-chat` 目录推送到 GitHub 仓库
2. 进入 Settings → Pages
3. 选择 `main` 分支和 `/` 根目录
4. 访问：`https://your-username.github.io/repo-name`

---

## 配置说明

部署前编辑 `config.js`:

```javascript
const DEFAULT_CONFIG = {
  // 修改为你的 Gateway 地址
  gatewayUrl: 'wss://你的域名.com/ws',
  
  // 修改为你的 API Key
  apiKey: 'sk-你的 API Key',
  
  // App 名称
  appName: 'OpenClaw Chat',
};
```

**或者**在网页上点击 ⚙️ 设置按钮配置。

---

## HTTPS 配置（生产环境必须）

### 使用 Let's Encrypt

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d chat.your-domain.com
```

### 或使用 Cloudflare Tunnel

```bash
# 安装 cloudflared
docker run -d \
  --name cloudflared \
  cloudflare/cloudflared:latest \
  tunnel --no-autoupdate run --token YOUR_TOKEN
```

---

## 环境变量（可选）

使用 Docker 时可通过环境变量配置：

```bash
docker run -d \
  -p 3000:80 \
  -e GATEWAY_URL="wss://your-domain.com/ws" \
  -e API_KEY="your-api-key" \
  openclaw-web
```

---

## 故障排除

### 1. 连接失败

检查：
- Gateway 地址是否正确
- API Key 是否有效
- 防火墙是否开放端口
- WebSocket 是否支持（Nginx 配置）

### 2. 页面空白

检查浏览器控制台错误，确保：
- 所有文件正确上传
- 路径配置正确
- 没有 CORS 问题

### 3. Docker 容器无法启动

```bash
# 查看日志
docker logs openclaw-chat

# 重启容器
docker restart openclaw-chat
```

---

## 性能优化

### 启用 CDN

将静态文件托管到 CDN：
- Cloudflare
- 阿里云 CDN
- 腾讯云 CDN

### 启用 HTTP/2

```nginx
server {
    listen 443 ssl http2;
    # ...
}
```

---

## 监控

### 健康检查

```bash
curl http://your-domain.com/health
```

### 日志

```bash
# Nginx 访问日志
tail -f /var/log/nginx/access.log

# Nginx 错误日志
tail -f /var/log/nginx/error.log

# Docker 日志
docker logs -f openclaw-chat
```

---

**部署完成后，访问网页配置 Gateway 地址和 API Key 即可开始使用！**
