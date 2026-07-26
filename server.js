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
// Emergency alert channels (all optional — client simulates when a key is absent)
const RESEND_KEY   = process.env.RESEND_KEY   || '';   // https://resend.com  (email, no npm needed)
const ALERT_FROM   = process.env.ALERT_FROM   || 'ASHA Alerts <onboarding@resend.dev>';
const TWILIO_SID   = process.env.TWILIO_SID   || '';   // https://twilio.com  (SMS/WhatsApp)
const TWILIO_TOKEN = process.env.TWILIO_TOKEN || '';
const TWILIO_FROM  = process.env.TWILIO_FROM  || '';   // e.g. +1xxx  (SMS)  or  whatsapp:+1xxx
const PORT = 8080;

if (!GEMINI_KEY || !ELEVEN_KEY) console.warn('⚠  Missing GEMINI_KEY / ELEVEN_KEY in .env — API calls will fail; client falls back to simulated output.');
if (!RESEND_KEY) console.warn('ℹ  No RESEND_KEY in .env — emergency emails will be simulated (add one to send real mail).');

const MIME = { '.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.ico':'image/x-icon' };

function pipe(req, targetOpts, res) {
  const pr = https.request(targetOpts, upstream => {
    res.writeHead(upstream.statusCode, { 'Content-Type': upstream.headers['content-type'] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' });
    upstream.pipe(res);
  });
  pr.on('error', () => res.writeHead(502) && res.end('proxy error'));
  req.pipe(pr);
}

// Collect a JSON request body
function readJson(req) {
  return new Promise(resolve => {
    let b = '';
    req.on('data', c => { b += c; if (b.length > 8e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(b || '{}')); } catch (e) { resolve({}); } });
  });
}

// Fire a single HTTPS POST (JSON or form) and resolve the parsed response
function post(opts, body) {
  return new Promise(resolve => {
    const r = https.request(opts, up => {
      let d = ''; up.on('data', c => d += c);
      up.on('end', () => resolve({ status: up.statusCode, body: d }));
    });
    r.on('error', e => resolve({ status: 0, body: String(e) }));
    r.write(body); r.end();
  });
}

// Send one email via Resend HTTP API (no npm dependency)
async function sendEmail(to, subject, html) {
  if (!RESEND_KEY) return { channel: 'email', to, ok: false, simulated: true };
  const payload = JSON.stringify({ from: ALERT_FROM, to: [to], subject, html });
  const r = await post({
    hostname: 'api.resend.com', path: '/emails', method: 'POST',
    headers: { 'Authorization': 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
  }, payload);
  return { channel: 'email', to, ok: r.status >= 200 && r.status < 300, status: r.status };
}

// Send one SMS or WhatsApp message via Twilio (no npm dependency)
async function sendTwilio(to, text, whatsapp) {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) return { channel: whatsapp ? 'whatsapp' : 'sms', to, ok: false, simulated: true };
  const from = whatsapp ? (TWILIO_FROM.startsWith('whatsapp:') ? TWILIO_FROM : 'whatsapp:' + TWILIO_FROM) : TWILIO_FROM;
  const dest = whatsapp ? (to.startsWith('whatsapp:') ? to : 'whatsapp:' + to) : to;
  const form = `To=${encodeURIComponent(dest)}&From=${encodeURIComponent(from)}&Body=${encodeURIComponent(text)}`;
  const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64');
  const r = await post({
    hostname: 'api.twilio.com', path: `/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(form) }
  }, form);
  return { channel: whatsapp ? 'whatsapp' : 'sms', to, ok: r.status >= 200 && r.status < 300, status: r.status };
}

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  // ── /api/gemini  → generativelanguage.googleapis.com ──
  if (req.url.startsWith('/api/gemini')) {
    const model = new URL('http://x' + req.url).searchParams.get('model') || 'gemini-flash-lite-latest';
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

  // ── /api/alert  → multi-channel emergency dispatch (email / SMS / WhatsApp) ──
  if (req.url.startsWith('/api/alert') && req.method === 'POST') {
    return readJson(req).then(async body => {
      // body: { subject, html, text, recipients:[{name,role,email,phone,channels:['email','sms','whatsapp']}] }
      const recipients = Array.isArray(body.recipients) ? body.recipients : [];
      const results = [];
      for (const rc of recipients) {
        const chans = rc.channels || ['email'];
        if (chans.includes('email') && rc.email)     results.push(await sendEmail(rc.email, body.subject || '🚨 ASHA Emergency Alert', body.html || '<p>Emergency</p>'));
        if (chans.includes('sms') && rc.phone)        results.push(await sendTwilio(rc.phone, body.text || 'ASHA SOS Alert', false));
        if (chans.includes('whatsapp') && rc.phone)   results.push(await sendTwilio(rc.phone, body.text || 'ASHA SOS Alert', true));
      }
      const anyReal = results.some(r => r.ok);
      const allSim  = results.length === 0 || results.every(r => r.simulated);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: anyReal, simulated: allSim, dispatched: results.length, results }));
    });
  }

  // ── Static file server ──
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  // Strip any ?v=… cache-busting query before hitting the filesystem
  filePath = filePath.split('?')[0];
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath)] || 'text/plain',
      // Never let the browser serve a stale copy during development
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(data);
  });
}).listen(PORT, () => console.log(`ASHA proxy server → http://localhost:${PORT}`));
