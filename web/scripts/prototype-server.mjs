import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const assets = {
  '/': ['dvadmin.html', 'text/html; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
};
const port = Number(process.env.PROTOTYPE_PORT || 8211);
const server = createServer(async (request, response) => {
  const asset = assets[new URL(request.url, 'http://localhost').pathname];
  if (!asset) { response.writeHead(404); response.end('Not found'); return; }
  try {
    response.writeHead(200, { 'Content-Type': asset[1], 'Cache-Control': 'no-store' });
    response.end(await readFile(new URL('../../docs/prototypes/' + asset[0], import.meta.url)));
  } catch { response.writeHead(500); response.end('Prototype unavailable'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Prototype: http://127.0.0.1:${port}/ (simulated data only)`));
