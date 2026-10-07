import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const config = JSON.parse(await readFile(path.join(root, 'vercel.json')));
function match(source, pathname) {
  const pattern = source.split('/').map(part => part === ':path*' ? '(.*)' : part.startsWith(':') ? '([^/]+)' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('/');
  return pathname.match(new RegExp(`^${pattern}/?$`));
}
export function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch { res.writeHead(400).end(); return; }
    for (const rule of config.redirects || []) {
      const result = match(rule.source, pathname);
      if (!result) continue;
      let destination = rule.destination;
      for (const [i, key] of [...rule.source.matchAll(/:([\w]+)(?:\*)?/g)].entries()) destination = destination.replace(key[0], result[i + 1]);
      res.writeHead(rule.permanent ? 308 : 307, { Location: destination + url.search }).end();
      return;
    }
    for (const rule of config.rewrites || []) {
      if (match(rule.source, pathname)) { pathname = rule.destination; break; }
    }
    if (pathname === '/') pathname = '/index.html';
    const filename = path.resolve(root, 'dist', `.${pathname}`);
    if (!filename.startsWith(path.join(root, 'dist') + path.sep)) { res.writeHead(403).end(); return; }
    try {
      const content = await readFile(filename);
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
      res.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream' }).end(content);
    } catch { res.writeHead(404).end('Not found'); }
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createServer().listen(4173, '127.0.0.1', () => console.log('PSC built preview: http://127.0.0.1:4173'));
}
