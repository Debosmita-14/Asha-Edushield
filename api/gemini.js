// Vercel serverless function — proxies Gemini generateContent, keeping the key server-side.
// Client calls: POST /api/gemini?model=<model>  with body { contents:[...] }
const https = require('https');

const GEMINI_KEY = process.env.GEMINI_KEY || '';

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  if (!GEMINI_KEY) { res.status(500).json({ error: { message: 'GEMINI_KEY not configured on server' } }); return; }

  const model = (req.query && req.query.model) || 'gemini-flash-lite-latest';
  // Vercel parses JSON bodies; re-stringify to forward upstream.
  const payload = JSON.stringify(req.body && Object.keys(req.body).length ? req.body : {});

  const upstream = https.request({
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
  }, up => {
    let d = ''; up.on('data', c => d += c);
    up.on('end', () => {
      res.status(up.statusCode || 502);
      res.setHeader('Content-Type', up.headers['content-type'] || 'application/json');
      res.send(d);
    });
  });
  upstream.on('error', e => res.status(502).json({ error: { message: 'proxy error: ' + e.message } }));
  upstream.write(payload); upstream.end();
};
