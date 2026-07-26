// ── ASHA EduShield 2.0 — AI Core (Gemini + ElevenLabs + Vision Forensics) ──
// Drop your real keys here. With keys present, live API calls are used.
// Without keys, deterministic on-device analysis + simulated model output is used.
const AI = {
  config: {
    // Keys live server-side in server.js — never shipped to the browser.
    // When served by `node server.js`, /api/* proxies to Gemini + ElevenLabs.
    useProxy: true,
    // Primary model + automatic fall-throughs. `gemini-flash-latest` currently
    // resolves to a preview model with a tiny (20 req) free-tier quota that
    // exhausts fast and returns HTTP 429; the *-lite-latest models have a much
    // larger free quota and still support Vision, so we try them first and fall
    // back down the chain whenever a model is rate-limited or unavailable.
    geminiModel: 'gemini-flash-lite-latest',
    geminiFallbacks: ['gemini-flash-lite-latest', 'gemini-2.0-flash-lite', 'gemini-flash-latest', 'gemini-2.0-flash'],
  },

  // Last error surfaced by a Gemini call (so pages can explain WHY vision failed).
  lastError: null,

  _models() {
    // De-duped list: primary first, then the configured fall-throughs.
    return [this.config.geminiModel, ...(this.config.geminiFallbacks || [])]
      .filter((m, i, a) => m && a.indexOf(m) === i);
  },

  _geminiEndpoint(model) {
    return `/api/gemini?model=${model || this.config.geminiModel}`;
  },

  // POST one Gemini request to a specific model. Returns {ok, text, status, reason}.
  async _gemini(model, parts) {
    try {
      const r = await fetch(this._geminiEndpoint(model), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] })
      });
      let j = null;
      try { j = await r.json(); } catch (e) { /* non-JSON body */ }
      if (!r.ok) {
        const reason = j?.error?.message || `HTTP ${r.status}`;
        return { ok: false, status: r.status, reason, retryable: r.status === 429 || r.status === 404 || r.status === 503 };
      }
      const text = j?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return { ok: false, status: r.status, reason: 'Empty response', retryable: true };
      return { ok: true, text };
    } catch (e) {
      return { ok: false, status: 0, reason: String(e && e.message || e), retryable: false };
    }
  },

  // Text reasoning — real Gemini via server proxy (with model fallback), else simulated
  async analyzeText(prompt, sim) {
    if (!this.config.useProxy) return sim || '(Gemini simulated) ' + prompt.slice(0, 80);
    this.lastError = null;
    for (const model of this._models()) {
      const res = await this._gemini(model, [{ text: prompt }]);
      if (res.ok) return res.text;
      this.lastError = res.reason;
      if (!res.retryable) break;   // network / hard error — no point trying more models
    }
    return sim || 'Gemini offline — using local analysis.';
  },

  // Multimodal image reasoning — real Gemini Vision via server proxy (with model fallback)
  async analyzeImage(base64, prompt, sim) {
    if (!this.config.useProxy) return sim;
    this.lastError = null;
    const parts = [
      { text: prompt },
      { inline_data: { mime_type: 'image/jpeg', data: (base64 || '').split(',')[1] } }
    ];
    for (const model of this._models()) {
      const res = await this._gemini(model, parts);
      if (res.ok) return res.text;
      this.lastError = res.reason;
      if (!res.retryable) break;
    }
    return sim;
  },

  // BCP-47 → ISO-639-1 for ElevenLabs language_code hint
  _langCode(lang) {
    return (lang || 'en-IN').split('-')[0].toLowerCase();
  },

  // Multilingual TTS. lang: 'en-IN' | 'hi-IN' | 'bn-IN' | ...
  // ElevenLabs eleven_multilingual_v2 handles 29+ languages incl. Hindi & Bengali.
  speak(text, lang = 'en-IN') {
    if (this.config.useProxy) { this._eleven(text, lang); return; }
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = 0.95; u.pitch = 1.05;
    // Prefer a native voice matching the requested language (hi/bn/en)
    const code = this._langCode(lang);
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(code + '-'))
               || voices.find(v => v.lang && v.lang.toLowerCase().startsWith(code));
    if (match) u.voice = match;
    window.speechSynthesis.speak(u);
  },

  async _eleven(text, lang = 'en-IN') {
    try {
      const r = await fetch('/api/eleven', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          language_code: this._langCode(lang),
          voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        })
      });
      if (!r.ok) { this._browserSpeak(text, lang); return; }
      const blob = await r.blob();
      if (blob.type.indexOf('audio') === -1) { this._browserSpeak(text, lang); return; }
      new Audio(URL.createObjectURL(blob)).play();
    } catch (e) { this._browserSpeak(text, lang); }
  },

  // Browser speech-synthesis fallback (used if ElevenLabs proxy is unavailable)
  _browserSpeak(text, lang = 'en-IN') {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = 0.95; u.pitch = 1.05;
    const code = this._langCode(lang);
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(code + '-'))
               || voices.find(v => v.lang && v.lang.toLowerCase().startsWith(code));
    if (match) u.voice = match;
    window.speechSynthesis.speak(u);
  }
};
