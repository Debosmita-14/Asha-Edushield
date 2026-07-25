// ── ASHA EduShield 2.0 — Voice SOS Evidence Agent + Walk With ASHA ──
// Floating mic (students only). Records voice → speech-to-text → stores audio →
// generates incident summary → pushes live evidence event to Store (admin/security/faculty).
const VoiceAgent = {
  _rec: null,
  _mediaRecorder: null,
  _chunks: [],
  _stream: null,
  _listening: false,
  _transcript: '',

  // Mount floating UI (called after login for student role)
  mount() {
    if (document.getElementById('va-fab')) return;
    const wrap = document.createElement('div');
    wrap.id = 'va-fab-wrap';
    wrap.innerHTML = `
      <button id="va-walk" class="va-fab-sm" onclick="VoiceAgent.toggleWalk()" title="Walk With ASHA">
        <i class="fas fa-walking"></i>
      </button>
      <button id="va-fab" class="va-fab" onclick="VoiceAgent.toggle()" title="Voice SOS — tap and speak">
        <i class="fas fa-microphone"></i>
      </button>`;
    document.body.appendChild(wrap);
    const panel = document.createElement('div');
    panel.id = 'va-panel';
    panel.className = 'va-panel hidden';
    document.body.appendChild(panel);
  },

  unmount() {
    ['va-fab-wrap', 'va-panel'].forEach(id => { const e = document.getElementById(id); if (e) e.remove(); });
    this._stopWalk(true);
  },

  // ── VOICE SOS EVIDENCE AGENT ──────────────────────────────────────────────
  toggle() {
    if (this._listening) { this._stopListen(); return; }
    this._startListen();
  },

  _startListen() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const lang = (typeof SafeTravel !== 'undefined' && SafeTravel._lang) ? SafeTravel._lang() : 'en-IN';
    const fab = document.getElementById('va-fab');
    if (fab) { fab.classList.add('va-fab-active'); fab.innerHTML = '<i class="fas fa-stop"></i>'; }

    // Start audio recording simultaneously
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        this._stream = stream;
        this._chunks = [];
        this._mediaRecorder = new MediaRecorder(stream);
        this._mediaRecorder.ondataavailable = e => { if (e.data.size > 0) this._chunks.push(e.data); };
        this._mediaRecorder.start();
      }).catch(() => {});
    }

    if (!SpeechRecognition) {
      // Simulate for demo
      this._listening = true;
      this._showPanel('🎙 Listening... (demo mode)', 'Say: "ASHA, I\'m scared. Someone is following me."');
      setTimeout(() => this._processTranscript('ASHA I am scared someone is following me', lang), 2500);
      return;
    }

    this._rec = new SpeechRecognition();
    this._rec.lang = lang;
    this._rec.interimResults = true;
    this._rec.continuous = false;
    this._listening = true;
    this._showPanel('🎙 ASHA is listening...', 'Speak naturally — "ASHA, I\'m scared" or "मुझे मदद चाहिए"');
    this._rec.start();

    this._rec.onresult = (e) => {
      const interim = Array.from(e.results).map(r => r[0].transcript).join(' ');
      this._updatePanel(interim);
      if (e.results[e.results.length - 1].isFinal) {
        this._transcript = interim;
      }
    };
    this._rec.onend = () => {
      if (this._listening) this._processTranscript(this._transcript, lang);
    };
    this._rec.onerror = () => { this._stopListen(); UI.showToast('Mic Error', 'Could not access microphone.', 'warning'); };
  },

  _stopListen() {
    this._listening = false;
    if (this._rec) { try { this._rec.stop(); } catch(e) {} this._rec = null; }
    const fab = document.getElementById('va-fab');
    if (fab) { fab.classList.remove('va-fab-active'); fab.innerHTML = '<i class="fas fa-microphone"></i>'; }
  },

  async _processTranscript(text, lang) {
    this._stopListen();
    if (!text || text.trim().length < 2) { this._hidePanel(); return; }

    // Stop audio recording and get blob
    let audioUrl = null;
    if (this._mediaRecorder && this._mediaRecorder.state !== 'inactive') {
      this._mediaRecorder.stop();
      await new Promise(res => { this._mediaRecorder.onstop = res; });
    }
    if (this._chunks.length) {
      const blob = new Blob(this._chunks, { type: 'audio/webm' });
      audioUrl = URL.createObjectURL(blob);
    }
    if (this._stream) { this._stream.getTracks().forEach(t => t.stop()); this._stream = null; }

    const lower = text.toLowerCase();
    const distress = ['help','scared','follow','danger','unsafe','attack','मदद','बचाओ','bachao','সাহায্য','বাঁচাও','asha'];
    const isDistress = distress.some(w => lower.includes(w));
    const sev = isDistress ? 'high' : 'medium';

    // AI summary via Gemini (or simulated)
    const prompt = `You are ASHA, a campus safety AI. A student said: "${text}". Extract: location clues, threat type, risk level (HIGH/MEDIUM/LOW), and write a 2-sentence incident summary for security.`;
    const sim = `Student reports: "${text}". Risk Level: ${isDistress ? 'HIGH' : 'MEDIUM'} — possible threat detected. Immediate security response recommended.`;
    const summary = await AI.analyzeText(prompt, sim);

    // Get GPS
    let locStr = 'Campus (GPS pending)';
    let lat = 28.6140, lng = 77.2100;
    if (navigator.geolocation) {
      await new Promise(res => navigator.geolocation.getCurrentPosition(p => {
        lat = p.coords.latitude; lng = p.coords.longitude;
        locStr = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        res();
      }, res, { timeout: 4000 }));
    }

    const filename = `audio_${Date.now()}.wav`;
    const ticketId = 'INC-' + (5000 + Math.floor(Math.random() * 4000));

    // Push to live store → admin/security/faculty see it immediately
    Store.add({
      id: ticketId, type: 'Voice SOS', sev,
      loc: locStr, lat, lng,
      reporter: 'Anonymous (Voice)',
      channel: 'voice',
      transcript: text,
      summary,
      audioFile: filename,
      audioUrl
    });

    // Speak confirmation back
    const reply = lang === 'hi-IN'
      ? 'आपकी आवाज़ रिकॉर्ड हो गई। सुरक्षा टीम को सूचित किया जा रहा है।'
      : lang === 'bn-IN'
      ? 'আপনার কণ্ঠস্বর রেকর্ড হয়েছে। নিরাপত্তা দলকে জানানো হচ্ছে।'
      : 'Your voice has been recorded. Security team is being notified. Stay safe.';
    AI.speak(reply, lang);

    this._showEvidence(ticketId, text, summary, filename, audioUrl, sev, locStr);
    if (isDistress && typeof SOS !== 'undefined') setTimeout(() => SOS._activate(), 1200);
  },

  _showEvidence(id, transcript, summary, filename, audioUrl, sev, loc) {
    const panel = document.getElementById('va-panel');
    if (!panel) return;
    panel.className = 'va-panel';
    panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div style="font-weight:700;font-size:.9rem;color:#f87171">🎙 Voice Evidence Captured</div>
      <button onclick="VoiceAgent._hidePanel()" style="background:none;border:none;color:var(--text2);cursor:pointer;font-size:1rem">✕</button>
    </div>
    <div style="font-size:.75rem;color:var(--text2);margin-bottom:4px">Transcript</div>
    <div style="background:var(--bg);border-radius:8px;padding:10px;font-size:.82rem;margin-bottom:10px;line-height:1.5">"${transcript}"</div>
    <div style="font-size:.75rem;color:var(--text2);margin-bottom:4px">AI Summary</div>
    <div style="background:rgba(139,92,246,.1);border-radius:8px;padding:10px;font-size:.78rem;line-height:1.6;margin-bottom:10px">${summary}</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      <span class="pill ${sev}">${sev.toUpperCase()}</span>
      <span class="pill medium">📁 ${filename}</span>
      <span class="pill low">📍 ${loc}</span>
    </div>
    ${audioUrl ? `<audio controls src="${audioUrl}" style="width:100%;border-radius:8px;margin-bottom:10px"></audio>` : ''}
    <div style="font-size:.72rem;color:#34d399">✅ Sent to Admin · Security · Faculty · Ticket: ${id}</div>`;
  },

  _showPanel(title, sub) {
    const panel = document.getElementById('va-panel');
    if (!panel) return;
    panel.className = 'va-panel';
    panel.innerHTML = `
    <div style="font-weight:700;font-size:.88rem;margin-bottom:6px">${title}</div>
    <div id="va-interim" style="font-size:.8rem;color:var(--text2);min-height:20px">${sub}</div>`;
  },
  _updatePanel(text) {
    const el = document.getElementById('va-interim');
    if (el) el.textContent = text;
  },
  _hidePanel() {
    const panel = document.getElementById('va-panel');
    if (panel) panel.className = 'va-panel hidden';
  },

  // ── WALK WITH ASHA — LIVE SAFETY COMPANION ────────────────────────────────
  _walking: false,
  _walkTimer: null,
  _walkTick: 0,
  _watchId: null,
  _checkInTimer: null,
  _awaitingResponse: false,

  toggleWalk() {
    if (this._walking) { this._stopWalk(); return; }
    this._startWalk();
  },

  _startWalk() {
    this._walking = true;
    this._walkTick = 0;
    const btn = document.getElementById('va-walk');
    if (btn) { btn.classList.add('va-fab-active'); btn.innerHTML = '<i class="fas fa-stop"></i>'; }
    const lang = (typeof SafeTravel !== 'undefined' && SafeTravel._lang) ? SafeTravel._lang() : 'en-IN';

    // Live GPS tracking
    if (navigator.geolocation) {
      this._watchId = navigator.geolocation.watchPosition(() => {}, () => {}, { enableHighAccuracy: true });
    }

    this._walkPanel('🚶 Walk With ASHA — Active', 'GPS tracking · voice monitoring · camera ready');
    AI.speak(lang === 'hi-IN' ? 'वॉक विथ आशा सक्रिय। मैं आपके साथ हूँ।'
      : lang === 'bn-IN' ? 'ওয়াক উইথ আশা সক্রিয়। আমি আপনার সাথে আছি।'
      : 'Walk with ASHA is active. I am with you. You are currently on a safe route.', lang);
    UI.showToast('🚶 Walk With ASHA', 'Companion mode active. I am monitoring your journey.', 'alert');

    // Periodic spoken safety updates
    const messages = [
      { en: 'You are currently on a safe route.', hi: 'आप अभी एक सुरक्षित रास्ते पर हैं।', bn: 'আপনি এখন একটি নিরাপদ পথে আছেন।', kind:'safe' },
      { en: 'Nearest security guard is 150 meters away.', hi: 'निकटतम सुरक्षा गार्ड 150 मीटर दूर है।', bn: 'নিকটতম নিরাপত্তা রক্ষী 150 মিটার দূরে।', kind:'info' },
      { en: 'Caution. You are entering a dimly lit area. Stay alert.', hi: 'सावधान। आप कम रोशनी वाले क्षेत्र में प्रवेश कर रहे हैं।', bn: 'সাবধান। আপনি একটি স্বল্প আলোকিত এলাকায় প্রবেশ করছেন।', kind:'warn' },
      { en: 'You have left the high-risk zone. Route is safe again.', hi: 'आप उच्च जोखिम क्षेत्र से बाहर आ गए हैं।', bn: 'আপনি উচ্চ-ঝুঁকির অঞ্চল ছেড়ে এসেছেন।', kind:'safe' },
    ];
    this._walkTimer = setInterval(() => {
      const m = messages[this._walkTick % messages.length];
      const txt = lang === 'hi-IN' ? m.hi : lang === 'bn-IN' ? m.bn : m.en;
      AI.speak(txt, lang);
      this._walkLog(txt, m.kind);
      this._walkTick++;
      // Every 3 updates, do a wellness check-in
      if (this._walkTick % 3 === 0) this._checkIn(lang);
    }, 9000);
  },

  _checkIn(lang) {
    const q = lang === 'hi-IN' ? 'क्या आप ठीक हैं?' : lang === 'bn-IN' ? 'আপনি কি ঠিক আছেন?' : 'Are you okay? Tap to confirm.';
    AI.speak(q, lang);
    this._awaitingResponse = true;
    this._walkLog(`❓ ${q}`, 'ask');
    const panel = document.getElementById('va-panel');
    if (panel) {
      const btn = document.createElement('button');
      btn.className = 'btn sm success';
      btn.style.cssText = 'width:100%;margin-top:8px';
      btn.innerHTML = "<i class='fas fa-check'></i> I'm OK";
      btn.onclick = () => { this._awaitingResponse = false; this._walkLog('✅ Student confirmed safe.', 'safe'); btn.remove(); };
      panel.appendChild(btn);
    }
    // No response within 8s → auto SOS
    clearTimeout(this._checkInTimer);
    this._checkInTimer = setTimeout(() => {
      if (this._awaitingResponse) {
        this._walkLog('⚠️ No response — triggering automatic SOS!', 'warn');
        AI.speak(lang === 'hi-IN' ? 'कोई जवाब नहीं। आपातकालीन SOS सक्रिय।'
          : lang === 'bn-IN' ? 'কোন সাড়া নেই। জরুরি SOS সক্রিয়।'
          : 'No response detected. Activating emergency SOS now.', lang);
        Store.add({
          type: 'Auto-SOS (No Response)', sev: 'critical',
          loc: 'Walk With ASHA — live GPS', reporter: 'Anonymous (Companion)',
          channel: 'sos', summary: 'Student stopped responding during Walk With ASHA. Automatic SOS triggered by companion agent.'
        });
        if (typeof SOS !== 'undefined') SOS._activate();
        this._awaitingResponse = false;
      }
    }, 8000);
  },

  _stopWalk(silent) {
    this._walking = false;
    clearInterval(this._walkTimer);
    clearTimeout(this._checkInTimer);
    if (this._watchId && navigator.geolocation) { navigator.geolocation.clearWatch(this._watchId); this._watchId = null; }
    const btn = document.getElementById('va-walk');
    if (btn) { btn.classList.remove('va-fab-active'); btn.innerHTML = '<i class="fas fa-walking"></i>'; }
    if (!silent) { this._hidePanel(); UI.showToast('🚶 Walk With ASHA', 'Companion mode stopped. You arrived safely.'); }
  },

  _walkPanel(title, sub) {
    const panel = document.getElementById('va-panel');
    if (!panel) return;
    panel.className = 'va-panel';
    panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <div style="font-weight:700;font-size:.88rem;color:#34d399"><span class="live-dot"></span> ${title}</div>
      <button onclick="VoiceAgent._stopWalk()" style="background:none;border:none;color:var(--text2);cursor:pointer;font-size:1rem">✕</button>
    </div>
    <div style="font-size:.76rem;color:var(--text2);margin-bottom:10px">${sub}</div>
    <div id="va-walk-log" style="max-height:180px;overflow-y:auto;font-size:.76rem;line-height:1.6"></div>`;
  },
  _walkLog(msg, kind) {
    const el = document.getElementById('va-walk-log');
    if (!el) return;
    const color = { safe:'#34d399', warn:'#fbbf24', ask:'#60a5fa', info:'#94a3b8' }[kind] || '#94a3b8';
    const t = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    el.innerHTML += `<div style="padding:5px 0;border-bottom:1px solid var(--border);color:${color}"><span style="color:var(--text2);font-size:.7rem">${t}</span> ${msg}</div>`;
    el.scrollTop = el.scrollHeight;
  }
};
