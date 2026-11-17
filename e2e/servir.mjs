// Sirve la web exportada (carpeta dist-e2e) con la misma regla que vercel.json: todo lo que no es archivo va a index.html.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('../dist-e2e/', import.meta.url));
const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

createServer(async (req, res) => {
  const ruta = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).split(/[\\/]+/).filter(Boolean).join('/');
  for (const archivo of [ruta, 'index.html']) {
    try {
      if (archivo !== 'index.html' && !extname(archivo)) continue;
      const cuerpo = await readFile(join(raiz, archivo));
      res.writeHead(200, { 'Content-Type': tipos[extname(archivo)] ?? 'application/octet-stream' });
      return res.end(cuerpo);
    } catch {
      // sigue con index.html
    }
  }
  res.writeHead(404).end();
}).listen(4173, '127.0.0.1');
