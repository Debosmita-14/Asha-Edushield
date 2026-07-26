// Vercel serverless function — proxies ElevenLabs text-to-speech, returns audio bytes.
// Client calls: POST /api/eleven  with body { text, model_id, language_code, voice_settings }
const https = require('https');

const ELEVEN_KEY   = process.env.ELEVEN_KEY   || '';
const ELEVEN_VOICE = process.env.ELEVEN_VOICE || 'EXAVITQu4vr4xnSDxMaL';

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  if (!ELEVEN_KEY) { res.status(500).json({ error: 'ELEVEN_KEY not configured on server' }); return; }

  const payload = JSON.stringify(req.body && Object.keys(req.body).length ? req.body : {});

  const upstream = https.request({
    hostname: 'api.elevenlabs.io',
    path: `/v1/text-to-speech/${ELEVEN_VOICE}`,
    method: 'POST',
    headers: { 'xi-api-key': ELEVEN_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
  }, up => {
    const chunks = [];
    up.on('data', c => chunks.push(c));
    up.on('end', () => {
      res.status(up.statusCode || 502);
      res.setHeader('Content-Type', up.headers['content-type'] || 'audio/mpeg');
      res.send(Buffer.concat(chunks));
    });
  });
  upstream.on('error', e => res.status(502).json({ error: 'proxy error: ' + e.message }));
  upstream.write(payload); upstream.end();
};
