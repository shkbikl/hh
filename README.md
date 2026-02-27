# OpenClaw Web Chat

基于浏览器的 OpenClaw 聊天界面，无需安装 APP。

## 特点

- ✅ 响应式设计（手机/电脑自适应）
- ✅ WebSocket 实时通信
- ✅ 对话历史本地存储
- ✅ 支持 Markdown 渲染
- ✅ 深色模式
- ✅ PWA 支持（可安装到桌面）

## 快速开始

### 方式 1：Docker 部署（推荐）

```bash
cd web-chat
docker build -t openclaw-web .
docker run -d -p 3000:80 openclaw-web
```

访问：http://localhost:3000

### 方式 2：Node.js 运行

```bash
npm install
npm run build
npm run serve
```

### 方式 3：直接打开

```bash
# 直接打开 index.html（功能受限）
open index.html
```

## 配置

编辑 `config.js`:

```javascript
const CONFIG = {
  // OpenClaw Gateway WebSocket 地址
  gatewayUrl: 'wss://你的域名.com/ws',
  
  // API Key
  apiKey: '你的 API Key',
  
  // App 名称
  appName: 'OpenClaw Chat',
};
```

## 部署

### Nginx

```nginx
server {
    listen 80;
    server_name chat.your-domain.com;
    
    location / {
        root /path/to/web-chat/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /ws {
        proxy_pass http://your-gateway:port/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Vercel / Netlify

直接部署 `dist` 文件夹即可。

## 技术栈

- Vue 3 + Vite
- Tailwind CSS
- WebSocket
- Marked (Markdown 渲染)
- Day.js (时间格式化)
