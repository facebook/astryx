import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('apps/storybook/dist');
const port = 6006;

const contentTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

http
  .createServer((req, res) => {
    const urlPath = req.url.split('?')[0];
    const filePath = path.join(dir, urlPath === '/' ? 'index.html' : urlPath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, {
        'Content-Type': contentTypes[ext] || 'application/octet-stream',
      });
      res.end(data);
    });
  })
  .listen(port, () => {
    console.log(`Storybook server running on http://localhost:${port}`);
  });
