// ── ASHA EduShield 2.0 — AI Core (Gemini + ElevenLabs + Vision Forensics) ──
// Drop your real keys here. With keys present, live API calls are used.
// Without keys, deterministic on-device analysis + simulated model output is used.
const AI = {
  config: {
    geminiKey: '',                 // <-- paste Gemini API key
    geminiModel: 'gemini-1.5-flash',
    elevenKey: '',                 // <-- paste ElevenLabs key
    elevenVoice: 'EXAVITQu4vr4xnSDxMaL',
  },

  _endpoint() {
    return `https://generativelanguage.googleapis.com/v1beta/models/${this.config.geminiModel}:generateContent?key=${this.config.geminiKey}`;
  },

  // Text reasoning — real Gemini if key set, else simulated
  async analyzeText(prompt, sim) {
    if (!this.config.geminiKey) return sim || '(Gemini simulated) ' + prompt.slice(0, 80);
    try {
      const r = await fetch(this._endpoint(), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const j = await r.json();
      return j.candidates?.[0]?.content?.parts?.[0]?.text || (sim || 'No response');
    } catch (e) { return sim || 'Gemini offline — using local analysis.'; }
  },

  // Multimodal image reasoning — real Gemini Vision if key set
  async analyzeImage(base64, prompt, sim) {
    if (!this.config.geminiKey) return sim;
    try {
      const r = await fetch(this._endpoint(), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { text: prompt },
            { inline_data: { mime_type: 'image/jpeg', data: base64.split(',')[1] } }
          ] }]
        })
      });
      const j = await r.json();
      return j.candidates?.[0]?.content?.parts?.[0]?.text || sim;
    } catch (e) { return sim; }
  },

  speak(text, lang = 'en-IN') {
    if (this.config.elevenKey) { this._eleven(text); return; }
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = 0.96; u.pitch = 1.05;
    window.speechSynthesis.speak(u);
  },

  async _eleven(text) {
    try {
      const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.config.elevenVoice}`, {
        method: 'POST',
        headers: { 'xi-api-key': this.config.elevenKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' })
      });
      const blob = await r.blob();
      new Audio(URL.createObjectURL(blob)).play();
    } catch (e) { /* fallback silent */ }
  }
};
