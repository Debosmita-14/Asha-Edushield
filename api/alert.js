// Vercel serverless function — multi-channel emergency dispatch (email / SMS / WhatsApp).
// Client calls: POST /api/alert with body:
//   { subject, html, text, recipients:[{name,role,email,phone,channels:['email','sms','whatsapp']}] }
// Each channel is optional; when a provider key is absent that channel is "simulated".
const https = require('https');

const RESEND_KEY   = process.env.RESEND_KEY   || '';
const ALERT_FROM   = process.env.ALERT_FROM   || 'ASHA Alerts <onboarding@resend.dev>';
const TWILIO_SID   = process.env.TWILIO_SID   || '';
const TWILIO_TOKEN = process.env.TWILIO_TOKEN || '';
const TWILIO_FROM  = process.env.TWILIO_FROM  || '';

// Fire a single HTTPS POST (JSON or form) and resolve the parsed response.
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

async function sendEmail(to, subject, html) {
  if (!RESEND_KEY) return { channel: 'email', to, ok: false, simulated: true };
  const payload = JSON.stringify({ from: ALERT_FROM, to: [to], subject, html });
  const r = await post({
    hostname: 'api.resend.com', path: '/emails', method: 'POST',
    headers: { 'Authorization': 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
  }, payload);
  return { channel: 'email', to, ok: r.status >= 200 && r.status < 300, status: r.status };
}

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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const recipients = Array.isArray(body.recipients) ? body.recipients : [];
  const results = [];
  for (const rc of recipients) {
    const chans = rc.channels || ['email'];
    if (chans.includes('email') && rc.email)   results.push(await sendEmail(rc.email, body.subject || '🚨 ASHA Emergency Alert', body.html || '<p>Emergency</p>'));
    if (chans.includes('sms') && rc.phone)      results.push(await sendTwilio(rc.phone, body.text || 'ASHA SOS Alert', false));
    if (chans.includes('whatsapp') && rc.phone) results.push(await sendTwilio(rc.phone, body.text || 'ASHA SOS Alert', true));
  }
  const anyReal = results.some(r => r.ok);
  const allSim  = results.length === 0 || results.every(r => r.simulated);
  res.status(200).json({ ok: anyReal, simulated: allSim, dispatched: results.length, results });
};
