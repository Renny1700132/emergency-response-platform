import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const port = Number(process.env.PORT ?? 80);
const backend = new URL(process.env.BACKEND_ORIGIN ?? 'http://backend:3000');
const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.ico', 'image/x-icon'],
  ['.map', 'application/json; charset=utf-8'],
]);

function proxy(request, response) {
  const upstream = http.request(new URL(request.url, backend), {
    method: request.method,
    headers: { ...request.headers, host: backend.host },
  }, (upstreamResponse) => {
    response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
    upstreamResponse.pipe(response);
  });
  upstream.on('error', () => {
    if (!response.headersSent) response.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ code: 'UPSTREAM_UNAVAILABLE', message: '后端服务不可用' }));
  });
  request.pipe(upstream);
}

async function staticFile(request, response) {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const requested = path.resolve(root, `.${pathname}`);
  const safe = requested === root || requested.startsWith(`${root}${path.sep}`);
  let file = safe ? requested : path.join(root, 'index.html');
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    await stat(file);
  } catch {
    file = path.join(root, 'index.html');
  }
  response.writeHead(200, {
    'Content-Type': contentTypes.get(path.extname(file)) ?? 'application/octet-stream',
    'Cache-Control': file.endsWith('index.html') ? 'no-store' : 'public, max-age=31536000, immutable',
  });
  createReadStream(file).pipe(response);
}

http.createServer((request, response) => {
  if (request.url?.startsWith('/api/')) proxy(request, response);
  else staticFile(request, response).catch(() => {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('static host failure');
  });
}).listen(port, '0.0.0.0', () => {
  console.info(JSON.stringify({ event: 'frontend.started', port, backendOrigin: backend.origin }));
});
