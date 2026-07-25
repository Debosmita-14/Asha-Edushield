// ── ASHA EduShield 2.0 — API Proxy Server ──
// Keeps Gemini + ElevenLabs keys server-side. Run: node server.js
// Serves static files on port 8080 AND proxies /api/* calls.
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Minimal .env loader (no dependencies)
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n').forEach(line => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  });
} catch (e) { /* no .env — rely on real env vars */ }

const GEMINI_KEY   = process.env.GEMINI_KEY   || '';
const ELEVEN_KEY   = process.env.ELEVEN_KEY   || '';
const ELEVEN_VOICE = process.env.ELEVEN_VOICE || 'EXAVITQu4vr4xnSDxMaL';
const PORT = 8080;

if (!GEMINI_KEY || !ELEVEN_KEY) console.warn('⚠  Missing GEMINI_KEY / ELEVEN_KEY in .env — API calls will fail; client falls back to simulated output.');

const MIME = { '.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.ico':'image/x-icon' };

function pipe(req, targetOpts, res) {
  const pr = https.request(targetOpts, upstream => {
    res.writeHead(upstream.statusCode, { 'Content-Type': upstream.headers['content-type'] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' });
    upstream.pipe(res);
  });
  pr.on('error', () => res.writeHead(502) && res.end('proxy error'));
  req.pipe(pr);
}

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  // ── /api/gemini  → generativelanguage.googleapis.com ──
  if (req.url.startsWith('/api/gemini')) {
    const model = new URL('http://x' + req.url).searchParams.get('model') || 'gemini-1.5-flash';
    return pipe(req, {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, res);
  }

  // ── /api/eleven  → api.elevenlabs.io ──
  if (req.url.startsWith('/api/eleven')) {
    return pipe(req, {
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${ELEVEN_VOICE}`,
      method: 'POST',
      headers: { 'xi-api-key': ELEVEN_KEY, 'Content-Type': 'application/json' }
    }, res);
  }

  // ── Static file server ──
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'text/plain' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`ASHA proxy server → http://localhost:${PORT}`));
