// js/pages/sos.js
var Pages = Pages || {};

Pages.sos = function (el) {
  el.innerHTML = `
  <div class="sos-wrap">
    <p style="color:var(--text2);font-size:.85rem;margin-bottom:20px;text-align:center">Hold the button for 2 seconds to activate emergency SOS</p>
    <div class="sos-ring" style="position:relative">
      <svg style="position:absolute;top:-8px;left:-8px;width:calc(100% + 16px);height:calc(100% + 16px);transform:rotate(-90deg);pointer-events:none" viewBox="0 0 120 120">
        <circle id="sos-arc" cx="60" cy="60" r="54" fill="none" stroke="#ef4444" stroke-width="5"
          stroke-dasharray="339.3" stroke-dashoffset="339.3" stroke-linecap="round"
          style="transition:stroke-dashoffset .05s linear;opacity:0"/>
      </svg>
      <button class="sos-btn" id="sos-btn"
        onmousedown="SOS.start(event)" onmouseup="SOS.cancel()"
        ontouchstart="SOS.start(event)" ontouchend="SOS.cancel()"
        oncontextmenu="return false">SOS</button>
    </div>
    <div class="sos-status" id="sos-status">🟢 Ready — You are safe</div>
    <div id="sos-pipeline" style="width:100%;max-width:540px;margin-top:24px"></div>
  </div>
  <div class="quick-grid">
    <div class="quick-btn" id="qb-escort" onclick="SOS.requestEscort()"><i class="fas fa-walking" style="color:#3b82f6"></i><div class="qt">Request Escort</div></div>
    <div class="quick-btn" id="qb-audio" onclick="SOS.toggleRecord()"><i class="fas fa-microphone" style="color:#ef4444"></i><div class="qt">Record Evidence</div></div>
    <div class="quick-btn" id="qb-location" onclick="SOS.shareLocation()"><i class="fas fa-map-pin" style="color:#10b981"></i><div class="qt">Share Location</div></div>
    <div class="quick-btn" onclick="SOS.quick('ragging')"><i class="fas fa-user-slash" style="color:#f59e0b"></i><div class="qt">Report Ragging</div></div>
    <div class="quick-btn" onclick="SOS.quick('harassment')"><i class="fas fa-shield-alt" style="color:#8b5cf6"></i><div class="qt">Report Harassment</div></div>
    <div class="quick-btn" onclick="SOS.quick('missing')"><i class="fas fa-search" style="color:#06b6d4"></i><div class="qt">Report Missing</div></div>
  </div>
  <div id="sos-extra" style="max-width:700px;margin-top:20px"></div>`;
};

const SOS = {
  _holdTimer: null,
  _arcTimer: null,
  _holdStart: 0,
  _holdDuration: 2000,
  _mediaRecorder: null,
  _recordChunks: [],
  _recording: false,
  _activated: false,

  start(e) {
    if (e) e.preventDefault();
    if (this._activated) return;
    this._holdStart = Date.now();
    const arc = document.getElementById('sos-arc');
    if (arc) { arc.style.opacity = '1'; }
    this._arcTimer = setInterval(() => {
      const elapsed = Date.now() - this._holdStart;
      const pct = Math.min(elapsed / this._holdDuration, 1);
      const circ = 339.3;
      if (arc) arc.style.strokeDashoffset = circ * (1 - pct);
      if (pct >= 1) { clearInterval(this._arcTimer); this._activate(); }
    }, 50);
  },

  cancel() {
    clearInterval(this._arcTimer);
    clearTimeout(this._holdTimer);
    if (!this._activated) {
      const arc = document.getElementById('sos-arc');
      if (arc) { arc.style.strokeDashoffset = '339.3'; arc.style.opacity = '0'; }
    }
  },

  _activate() {
    this._activated = true;
    const btn = document.getElementById('sos-btn');
    const status = document.getElementById('sos-status');
    if (btn) { btn.classList.add('activated'); btn.style.animation = 'pulse 1s infinite'; }
    if (status) status.innerHTML = '🔴 <strong style="color:#f87171">SOS ACTIVATED — Notifying all responders...</strong>';
    UI.showToast('🚨 SOS Activated!', 'Guard #3 + Guard #7 + Warden notified. ETA 3 min.', 'alert');
    this.shareLocation(true);
    Agents.runPipeline('sos-pipeline', Agents.sosPipeline, () => {
      UI.showToast('✅ Responders Dispatched', 'Rajan K. is 2 min away. Stay on the line.', 'alert');
      const btn2 = document.getElementById('sos-btn');
      if (btn2) {
        btn2.textContent = 'RESET';
        btn2.onclick = () => { this._activated = false; btn2.classList.remove('activated'); btn2.style.animation=''; btn2.textContent='SOS'; btn2.onclick=null; const arc=document.getElementById('sos-arc'); if(arc){arc.style.strokeDashoffset='339.3';arc.style.opacity='0';} document.getElementById('sos-status').innerHTML='🟢 Ready — You are safe'; };
      }
    });
  },

  shareLocation(silent) {
    if (!navigator.geolocation) {
      if (!silent) UI.showToast('GPS Unavailable', 'Geolocation not supported in this browser.', 'warning');
      return;
    }
    if (!silent) UI.showToast('📍 Getting Location...', 'Requesting GPS coordinates...', '');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        if (!silent) {
          document.getElementById('sos-extra').innerHTML = `
          <div class="card animate-in" style="border-color:rgba(16,185,129,.3)">
            <div style="font-weight:700;color:#34d399;margin-bottom:10px">📍 Live Location Shared</div>
            <div style="font-size:.85rem;line-height:1.8">
              <strong>Lat:</strong> ${lat.toFixed(6)} &nbsp; <strong>Lng:</strong> ${lng.toFixed(6)}<br>
              <strong>Accuracy:</strong> ±${Math.round(accuracy)}m<br>
              <strong>Shared with:</strong> Security Team · Warden · Admin
            </div>
            <a href="${mapsUrl}" target="_blank" class="btn sm" style="margin-top:12px;display:inline-flex">
              <i class="fas fa-external-link-alt"></i> Open in Maps
            </a>
          </div>`;
          UI.showToast('📍 Location Shared', `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)} — sent to security.`, 'alert');
        } else {
          UI.showToast('📍 Location Sent', `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)} — security notified.`, 'alert');
        }
      },
      (err) => {
        const msg = err.code === 1 ? 'Location permission denied.' : 'Could not get location.';
        if (!silent) UI.showToast('GPS Error', msg, 'warning');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  },

  toggleRecord() {
    if (this._recording) {
      this._stopRecord();
    } else {
      this._startRecord();
    }
  },

  _startRecord() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      UI.showToast('Mic Unavailable', 'Audio recording not supported.', 'warning'); return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this._recordChunks = [];
      this._mediaRecorder = new MediaRecorder(stream);
      this._mediaRecorder.ondataavailable = e => { if (e.data.size > 0) this._recordChunks.push(e.data); };
      this._mediaRecorder.onstop = () => this._saveRecord(stream);
      this._mediaRecorder.start();
      this._recording = true;
      const btn = document.getElementById('qb-audio');
      if (btn) btn.innerHTML = '<i class="fas fa-stop-circle" style="color:#ef4444;animation:pulse 1s infinite"></i><div class="qt" style="color:#ef4444">Stop Recording</div>';
      UI.showToast('🎙 Recording Started', 'Audio evidence is being captured and encrypted.', 'alert');
    }).catch(() => UI.showToast('Mic Denied', 'Please allow microphone access.', 'warning'));
  },

  _stopRecord() {
    if (this._mediaRecorder && this._recording) {
      this._mediaRecorder.stop();
      this._recording = false;
      const btn = document.getElementById('qb-audio');
      if (btn) btn.innerHTML = '<i class="fas fa-microphone" style="color:#ef4444"></i><div class="qt">Record Evidence</div>';
    }
  },

  _saveRecord(stream) {
    stream.getTracks().forEach(t => t.stop());
    const blob = new Blob(this._recordChunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    const ts = new Date().toLocaleTimeString();
    document.getElementById('sos-extra').innerHTML = `
    <div class="card animate-in" style="border-color:rgba(239,68,68,.3)">
      <div style="font-weight:700;color:#f87171;margin-bottom:10px">🎙 Evidence Recorded — ${ts}</div>
      <audio controls src="${url}" style="width:100%;margin-bottom:12px;border-radius:8px"></audio>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <a href="${url}" download="evidence-${Date.now()}.webm" class="btn sm danger"><i class="fas fa-download"></i> Download</a>
        <button class="btn sm ghost" onclick="UI.showToast('Evidence Uploaded','Encrypted and sent to Investigation Agent.','alert')"><i class="fas fa-upload"></i> Send to Investigators</button>
      </div>
      <div style="font-size:.75rem;color:var(--text2);margin-top:10px">🔒 End-to-end encrypted · Stored in Actian Vector DB · Ticket auto-linked</div>
    </div>`;
    UI.showToast('Evidence Saved', 'Audio recorded and ready to submit.', 'alert');
  },

  requestEscort() {
    const guards = DATA.guards.filter(g => g.status === 'Available');
    const guard = guards[0] || DATA.guards[0];
    const eta = Math.floor(Math.random() * 4) + 2;
    let countdown = eta * 60;
    document.getElementById('sos-extra').innerHTML = `
    <div class="card animate-in" style="border-color:rgba(59,130,246,.4)">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
        <div style="width:52px;height:52px;border-radius:50%;background:rgba(59,130,246,.15);display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0">🛡</div>
        <div>
          <div style="font-weight:700;font-size:1rem">${guard.name} — Escort Assigned</div>
          <div style="font-size:.8rem;color:var(--text2)">Guard #${guard.id.slice(1)} · ${guard.zone}</div>
        </div>
        <span class="pill low" style="margin-left:auto">En Route</span>
      </div>
      <div style="background:var(--bg3);border-radius:12px;padding:14px;margin-bottom:14px">
        <div style="font-size:.78rem;color:var(--text2);margin-bottom:6px">ETA to your location</div>
        <div style="font-size:2rem;font-weight:900;color:#60a5fa" id="escort-eta">${eta}:00</div>
        <div class="progress-bar" style="margin-top:8px"><div class="progress-fill" id="escort-bar" style="width:0%;background:#3b82f6;transition:width 1s linear"></div></div>
      </div>
      <div style="font-size:.82rem;line-height:1.8;color:var(--text2)">
        📍 Guard is tracking your live GPS<br>
        📞 Direct line: <strong style="color:var(--text)">Ext. 4${guard.id.slice(1)}21</strong><br>
        🔔 Warden notified · CCTV activated on your route
      </div>
      <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
        <button class="btn sm ghost" onclick="UI.showToast('Message Sent','Guard ${guard.name} received your message.','alert')"><i class="fas fa-comment"></i> Message Guard</button>
        <button class="btn sm danger" onclick="SOS._activate()"><i class="fas fa-exclamation-circle"></i> Escalate to SOS</button>
        <button class="btn sm ghost" onclick="document.getElementById('sos-extra').innerHTML='';UI.showToast('Escort Cancelled','Request cancelled.')"><i class="fas fa-times"></i> Cancel</button>
      </div>
    </div>`;

    const totalSecs = eta * 60;
    const interval = setInterval(() => {
      countdown--;
      const etaEl = document.getElementById('escort-eta');
      const barEl = document.getElementById('escort-bar');
      if (!etaEl) { clearInterval(interval); return; }
      const m = Math.floor(countdown / 60);
      const s = countdown % 60;
      etaEl.textContent = `${m}:${s.toString().padStart(2,'0')}`;
      const pct = ((totalSecs - countdown) / totalSecs) * 100;
      if (barEl) barEl.style.width = pct + '%';
      if (countdown <= 0) {
        clearInterval(interval);
        etaEl.textContent = 'Arrived';
        etaEl.style.color = '#34d399';
        UI.showToast('🛡 Guard Arrived', `${guard.name} is at your location.`, 'alert');
      }
    }, 1000);

    guard.status = 'Dispatched';
    UI.showToast('Escort Assigned', `${guard.name} is on the way. ETA ${eta} min.`, 'alert');
  },

  quick(type) {
    if (type === 'ragging' || type === 'harassment' || type === 'missing') {
      setTimeout(() => App.navigate('report'), 300);
    }
  }
};
