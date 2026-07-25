// js/pages/safetravel.js
var Pages = Pages || {};

Pages.safeTravel = function (el) {
  el.innerHTML = `
  <div style="max-width:700px">
    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
        <div>
          <div style="font-weight:700;font-size:1rem;margin-bottom:4px">Safe Travel Mode</div>
          <div style="color:var(--text2);font-size:.82rem">Women's Safety Agent monitors your journey in real-time via GPS</div>
        </div>
        <button id="travel-toggle" class="btn success" onclick="SafeTravel.toggle()">
          <i class="fas fa-play"></i> Activate
        </button>
      </div>
      <div id="travel-status" style="margin-top:14px;padding:14px;background:var(--bg3);border-radius:10px;font-size:.85rem;color:var(--text2)">
        🟡 Safe Travel Mode is OFF. Activate to start real-time monitoring.
      </div>
    </div>
    <div class="two-col" style="margin-bottom:0">
      <div class="card">
        <div class="card-title">Set Route</div>
        <div class="form-row"><label>From</label><input type="text" value="Campus Main Gate" readonly style="background:var(--bg)"></div>
        <div class="form-row"><label>To</label><input type="text" id="dest-input" placeholder="Enter destination..."></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn sm" onclick="SafeTravel.getRoute()"><i class="fas fa-route"></i> Safe Route</button>
          <button class="btn sm ghost" onclick="SafeTravel.requestEscort()"><i class="fas fa-walking"></i> Escort</button>
        </div>
        <div id="route-result" style="margin-top:12px"></div>
      </div>
      <div class="card">
        <div class="card-title">Check-in Points</div>
        <div id="checkins"></div>
      </div>
    </div>
    <div class="card" style="margin-top:0">
      <div class="card-title">Unsafe Zone Alerts — Risk Prediction Agent</div>
      <div id="unsafe-zones"></div>
    </div>
    <div class="card">
      <div class="card-title">ElevenLabs Voice Assistant</div>
      <div style="background:var(--bg3);border-radius:12px;padding:16px;font-size:.85rem;line-height:1.7;border-left:3px solid #8b5cf6">
        <div style="font-size:.78rem;color:#a78bfa;font-weight:700;margin-bottom:8px">🔊 Multilingual Voice SOS — ElevenLabs Integration</div>
        Say <strong>"Help me"</strong> or <strong>"मुझे मदद चाहिए"</strong> or <strong>"আমাকে সাহায্য করুন"</strong> to trigger voice SOS.<br>
        Voice is transcribed → classified by Gemini Flash → escalated if distress detected.
      </div>
      <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
        <button class="btn sm" style="background:linear-gradient(135deg,#8b5cf6,#6366f1)" onclick="SafeTravel.voiceSOS()">
          <i class="fas fa-microphone"></i> Voice SOS (Demo)
        </button>
        <button class="btn sm ghost" onclick="SafeTravel.voiceAssist()">
          <i class="fas fa-volume-up"></i> Voice Assistant
        </button>
      </div>
    </div>
  </div>`;

  SafeTravel.renderCheckins();
  SafeTravel.renderZones();
};

const SafeTravel = {
  _active: false,

  toggle() {
    this._active = !this._active;
    const btn = document.getElementById('travel-toggle');
    const status = document.getElementById('travel-status');
    if (this._active) {
      btn.innerHTML = '<i class="fas fa-stop"></i> Deactivate';
      btn.className = 'btn danger';
      status.innerHTML = '🟢 <strong style="color:#10b981">Safe Travel Mode ACTIVE</strong> — Women\'s Safety Agent monitoring your GPS. Security team notified. Check-in reminders enabled.';
      UI.showToast('Safe Travel Active', 'Your journey is being monitored. Stay safe! 💚');
    } else {
      btn.innerHTML = '<i class="fas fa-play"></i> Activate';
      btn.className = 'btn success';
      status.innerHTML = '🟡 Safe Travel Mode is OFF. Activate to start real-time monitoring.';
      UI.showToast('Safe Travel Deactivated', 'Monitoring stopped.');
    }
  },

  getRoute() {
    const dest = document.getElementById('dest-input').value || 'your destination';
    document.getElementById('route-result').innerHTML = `
    <div style="background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.25);border-radius:10px;padding:12px;font-size:.83rem">
      <div style="color:#34d399;font-weight:700;margin-bottom:6px">✅ Safe Route Found</div>
      <strong>To:</strong> ${dest}<br>
      <strong>Distance:</strong> 1.2 km · <strong>ETA:</strong> ~14 min walking<br>
      <strong>Safety Score:</strong> 92/100 — Well-lit, patrolled route<br>
      <strong>Avoid:</strong> Parking Lot A (incident reported 1hr ago)
    </div>`;
    UI.showToast('Safe Route', `Route to ${dest} calculated. 2 checkpoints set.`);
  },

  requestEscort() {
    const guards = DATA.guards.filter(g => g.status === 'Available');
    const guard = guards[0] || DATA.guards[3];
    const eta = Math.floor(Math.random() * 4) + 3;
    let countdown = eta * 60;
    document.getElementById('route-result').innerHTML = `
    <div style="background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.35);border-radius:12px;padding:14px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
        <div style="font-size:1.4rem">🛡</div>
        <div>
          <div style="font-weight:700;font-size:.9rem">${guard.name} assigned as escort</div>
          <div style="font-size:.75rem;color:var(--text2)">Guard #${guard.id.slice(1)} · ${guard.zone}</div>
        </div>
        <span class="pill low" style="margin-left:auto">En Route</span>
      </div>
      <div style="font-size:.78rem;color:var(--text2);margin-bottom:4px">Live ETA</div>
      <div style="font-size:1.6rem;font-weight:900;color:#60a5fa" id="st-escort-eta">${eta}:00</div>
      <div class="progress-bar" style="margin-top:8px"><div class="progress-fill" id="st-escort-bar" style="width:0%;background:#3b82f6;transition:width 1s linear"></div></div>
      <div style="font-size:.76rem;color:var(--text2);margin-top:10px">📍 Tracking your GPS · 📞 Ext. 4${guard.id.slice(1)}21 · CCTV activated</div>
    </div>`;
    guard.status = 'Dispatched';
    const total = eta * 60;
    const iv = setInterval(() => {
      countdown--;
      const etaEl = document.getElementById('st-escort-eta');
      const barEl = document.getElementById('st-escort-bar');
      if (!etaEl) { clearInterval(iv); return; }
      const m = Math.floor(countdown/60), s = countdown%60;
      etaEl.textContent = `${m}:${s.toString().padStart(2,'0')}`;
      if (barEl) barEl.style.width = ((total-countdown)/total*100) + '%';
      if (countdown <= 0) { clearInterval(iv); etaEl.textContent='Arrived'; etaEl.style.color='#34d399'; UI.showToast('🛡 Escort Arrived',`${guard.name} is here.`,'alert'); }
    }, 1000);
    UI.showToast('Escort Requested', `${guard.name} assigned. ETA ${eta} minutes.`, 'alert');
  },

  _checkins: [
    { name: 'Campus Gate', status: 'passed', time: '10:02 AM' },
    { name: 'Market Road Junction', status: 'pending', time: '—' },
    { name: 'Destination', status: 'pending', time: '—' },
  ],

  checkIn(idx) {
    const c = this._checkins[idx];
    if (!c || c.status === 'passed') return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          c.status = 'passed';
          c.time = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
          this.renderCheckins();
          UI.showToast('✅ Checked In', `${c.name} — GPS confirmed (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`, 'alert');
        },
        () => {
          c.status = 'passed';
          c.time = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
          this.renderCheckins();
          UI.showToast('✅ Checked In', `${c.name} — check-in logged.`, 'alert');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      c.status = 'passed';
      c.time = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
      this.renderCheckins();
      UI.showToast('✅ Checked In', `${c.name} — logged.`, 'alert');
    }
  },

  renderCheckins() {
    const el = document.getElementById('checkins');
    if (!el) return;
    el.innerHTML = this._checkins.map((c, i) => `
      <div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--border)">
        <div style="width:32px;height:32px;border-radius:50%;background:${c.status==='passed'?'rgba(16,185,129,.2)':'var(--bg3)'};display:flex;align-items:center;justify-content:center;font-size:.85rem;color:${c.status==='passed'?'#10b981':'#64748b'};font-weight:700;flex-shrink:0">${c.status==='passed'?'✓':i+1}</div>
        <div style="flex:1">
          <div style="font-size:.88rem;font-weight:600">${c.name}</div>
          <div style="font-size:.75rem;color:var(--text2)">${c.time}</div>
        </div>
        ${c.status==='passed'
          ? `<span class="pill low">passed</span>`
          : `<button class="btn sm" onclick="SafeTravel.checkIn(${i})"><i class="fas fa-map-pin"></i> Check In</button>`}
      </div>`).join('');
  },

  renderZones() {
    const el = document.getElementById('unsafe-zones');
    if (!el) return;
    const zones = [
      { name: 'Parking Lot A', risk: 'high', reason: 'Harassment report 1hr ago', time: 'Night: 8PM–6AM' },
      { name: 'Back Gate Road', risk: 'medium', reason: 'Poor lighting, isolated', time: 'All hours' },
      { name: 'Hostel 3 Corridor', risk: 'high', reason: 'Ragging incident 14min ago', time: 'Evening: 6PM–10PM' },
    ];
    el.innerHTML = zones.map(z => `
      <div style="display:flex;align-items:center;gap:14px;padding:12px;background:var(--bg3);border-radius:10px;margin-bottom:10px;border-left:3px solid ${UI.sevColor(z.risk)}">
        <i class="fas fa-exclamation-triangle" style="color:${UI.sevColor(z.risk)};font-size:1.1rem;flex-shrink:0"></i>
        <div style="flex:1">
          <div style="font-weight:600;font-size:.88rem">${z.name}</div>
          <div style="font-size:.76rem;color:var(--text2);margin-top:2px">${z.reason} · ${z.time}</div>
        </div>
        ${UI.pill(z.risk)}
      </div>`).join('');
  },

  _recognition: null,
  _listening: false,

  voiceSOS() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      UI.showToast('Voice SOS', 'Simulating: "Help me" → DISTRESS detected → Escalating...', 'alert');
      setTimeout(() => { UI.showToast('🚨 SOS Triggered', 'Voice classified as DISTRESS. Guard #3 notified.', 'alert'); SOS._activate && SOS._activate(); }, 1500);
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = 'en-IN'; rec.interimResults = false; rec.maxAlternatives = 1;
    UI.showToast('🎙 Listening...', 'Say "Help me" or "मुझे मदद चाहिए" now.', '');
    rec.start();
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript.toLowerCase();
      const distressWords = ['help','मदद','সাহায্য','bachao','emergency','unsafe','scared','danger'];
      const isDistress = distressWords.some(w => transcript.includes(w));
      if (isDistress) {
        UI.showToast('🚨 Distress Detected', `"${transcript}" → Escalating to SOS!`, 'alert');
        setTimeout(() => { if (typeof SOS !== 'undefined') SOS._activate(); }, 800);
        this._speak('Emergency SOS activated. Help is on the way.');
      } else {
        UI.showToast('🎙 Heard', `"${transcript}" — No distress detected.`, '');
      }
    };
    rec.onerror = () => UI.showToast('Mic Error', 'Could not access microphone.', 'warning');
  },

  voiceAssist() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      UI.showToast('Voice Assistant', 'Say: "I feel unsafe walking from Hostel A to Library" — ASHA responds with safe route.', '');
      setTimeout(() => this._speak('I have found a safe route for you. The well-lit path via Admin Block is recommended. Security has been notified.'), 500);
      return;
    }
    if (this._listening) {
      this._recognition && this._recognition.stop();
      this._listening = false;
      UI.showToast('Voice Assistant', 'Stopped listening.', '');
      return;
    }
    const rec = new SpeechRecognition();
    this._recognition = rec;
    rec.lang = 'en-IN'; rec.interimResults = false; rec.continuous = false;
    this._listening = true;
    UI.showToast('🎙 ASHA Listening...', 'Describe your safety concern.', '');
    rec.start();
    rec.onresult = (e) => {
      this._listening = false;
      const q = e.results[0][0].transcript;
      UI.showToast('🤖 ASHA Processing...', `"${q}"`, '');
      setTimeout(() => {
        const lower = q.toLowerCase();
        let reply = 'I am here to help. Please describe your concern and I will assist you.';
        if (lower.includes('unsafe') || lower.includes('scared') || lower.includes('follow')) {
          reply = 'I understand you feel unsafe. I am alerting the nearest security guard and activating safe travel mode. Stay in a well-lit area.';
          this.toggle && document.getElementById('travel-toggle') && this.toggle();
        } else if (lower.includes('route') || lower.includes('walk') || lower.includes('hostel') || lower.includes('library')) {
          reply = 'I found a safe route for you. Take the main road via Admin Block — it is well-lit and patrolled. Estimated 12 minutes walking.';
        } else if (lower.includes('escort')) {
          reply = 'Requesting a security escort for you now. A guard will meet you in 4 minutes.';
          this.requestEscort();
        }
        this._speak(reply);
        UI.showToast('🔊 ASHA', reply.substring(0, 80) + '...', '');
      }, 600);
    };
    rec.onerror = () => { this._listening = false; UI.showToast('Mic Error', 'Could not access microphone.', 'warning'); };
    rec.onend = () => { this._listening = false; };
  },

  _speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-IN'; utt.rate = 0.95; utt.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const female = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'));
    if (female) utt.voice = female;
    window.speechSynthesis.speak(utt);
  }
};
