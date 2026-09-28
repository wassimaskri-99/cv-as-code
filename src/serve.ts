import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { distDir } from './paths';

// A tiny static server for dist/, so the tests hit the site the way GitHub Pages serves it.
const port = Number(process.env.PORT ?? 4173);

const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let file = normalize(join(distDir, decodeURIComponent(url.pathname)));
  if (!file.startsWith(distDir)) {
    res.writeHead(403).end();
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) {
    res.writeHead(404).end('Not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(port, () => {
  console.log(`Serving dist/ on http://localhost:${String(port)}`);
});
