const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3100;
const UPLOAD_DIR = '/home/admin/.openclaw/workspace/uploads';
const AUTH_TOKEN = '1ab581483035706a8289c7e5f2e8b00b';

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 验证 Token
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  if (token !== AUTH_TOKEN) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }

  // 上传文件
  if (req.method === 'POST' && req.url === '/upload') {
    const boundary = req.headers['content-type']?.split('boundary=')[1];
    if (!boundary) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No boundary' }));
      return;
    }

    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      // 使用 latin1 保持二进制兼容，然后转换文件名编码
      const body = Buffer.concat(chunks).toString('latin1');
      const parts = body.split('--' + boundary);
      
      let filename = '';
      let fileContent = null;
      let mimeType = '';

      for (const part of parts) {
        if (part.includes('Content-Disposition')) {
          const filenameMatch = part.match(/filename="([^"]+)"/);
          const typeMatch = part.match(/Content-Type:\s*([^\r\n]+)/i);
          
          if (filenameMatch) {
            // 将 latin1 转回 utf8 以正确处理中文
            filename = Buffer.from(filenameMatch[1], 'latin1').toString('utf8');
            mimeType = typeMatch ? typeMatch[1] : 'application/octet-stream';
            
            // 提取文件内容
            const headerEnd = part.indexOf('\r\n\r\n');
            if (headerEnd !== -1) {
              const content = part.substring(headerEnd + 4);
              fileContent = content.replace(/\r\n$/, '');
            }
          }
        }
      }

      if (!filename || !fileContent) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No file' }));
        return;
      }

      // 使用原文件名（如果已存在则覆盖）
      const filePath = path.join(UPLOAD_DIR, filename);

      // 保存文件
      fs.writeFileSync(filePath, Buffer.from(fileContent, 'binary'));

      console.log(`[UPLOAD] ${filename} (${(fileContent.length/1024).toFixed(1)} KB)`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        filename: filename,
        path: `uploads/${filename}`,
        size: fileContent.length,
        mimeType
      }));
    });
    return;
  }

  // 列出文件
  if (req.method === 'GET' && req.url === '/files') {
    const files = fs.readdirSync(UPLOAD_DIR).map(name => {
      const stat = fs.statSync(path.join(UPLOAD_DIR, name));
      return {
        name,
        size: stat.size,
        time: stat.mtime
      };
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ files }));
    return;
  }

  // 健康检查
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Upload server running on http://127.0.0.1:${PORT}`);
  console.log(`Upload directory: ${UPLOAD_DIR}`);
});