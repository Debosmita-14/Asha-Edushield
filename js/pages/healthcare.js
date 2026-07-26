// js/pages/healthcare.js — Campus Healthcare & Ambulance Emergency Console
Pages = Pages || {};

Pages.healthcare = function (el) {
  const role = App.currentRole;
  if (role === 'admin') {
    Pages._adminHealthcare(el);
  } else if (role === 'security') {
    Pages._securityHealthcare(el);
  } else {
    Pages._userHealthcare(el);
  }
};

// ── 1. STUDENT / WORKER (USER) HEALTHCARE SOS VIEW ─────────────────────────
Pages._userHealthcare = function (el) {
  const me = Profile.me();
  el.innerHTML = `
  <div class="card animate-in" style="border:2px solid rgba(239,68,68,.5);background:linear-gradient(180deg, rgba(239,68,68,.08), transparent)">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px">
      <div>
        <div style="font-size:1.2rem;font-weight:900;color:#f87171;display:flex;align-items:center;gap:8px">
          <i class="fas fa-heart-circle-bolt" style="font-size:1.5rem"></i> Emergency Healthcare SOS Trigger
        </div>
        <div style="font-size:.85rem;color:var(--text2);margin-top:4px">
          Tap any emergency below to immediately send your location & alert to Campus Admin and Ambulance Dispatch.
        </div>
      </div>
      <span class="pill critical" style="font-size:.78rem"><span class="live-dot red"></span> 24/7 Medical Response Active</span>
    </div>

    <!-- PATIENT LOCATION & ROLE DETAILS -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;background:var(--bg3);padding:12px;border-radius:10px;margin-bottom:18px;border:1px solid var(--border)">
      <div>
        <label style="font-size:.75rem;color:var(--text2);display:block;margin-bottom:4px">Patient / Reporter</label>
        <div style="font-weight:700;font-size:.9rem">${me.name} (${me.roll})</div>
      </div>
      <div>
        <label style="font-size:.75rem;color:var(--text2);display:block;margin-bottom:4px">Reporter Category</label>
        <select class="filter-select" id="user-med-role" style="width:100%;font-size:.82rem">
          <option value="Student">Student</option>
          <option value="Campus Worker (Staff)">Campus Worker (Staff/Office)</option>
          <option value="Campus Worker (Canteen)">Campus Worker (Canteen)</option>
          <option value="Campus Worker (Maintenance)">Campus Worker (Maintenance/Electrician)</option>
          <option value="Campus Worker (Guard)">Campus Worker (Security Guard)</option>
          <option value="Faculty Member">Faculty Member</option>
        </select>
      </div>
      <div>
        <label style="font-size:.75rem;color:var(--text2);display:block;margin-bottom:4px">Current Location / Block</label>
        <input type="text" id="user-med-loc" value="${me.hostel || 'Library Block B - 1st Floor'}" placeholder="e.g. Canteen / Hostel 3 / Lab B" style="width:100%;font-size:.82rem;padding:6px 10px">
      </div>
    </div>

    <!-- BIG EMERGENCY SOS BUTTONS -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:14px">
      <button class="btn danger" style="padding:18px;display:flex;flex-direction:column;align-items:center;gap:8px;font-size:1rem;text-align:center;box-shadow:0 4px 20px rgba(239,68,68,.3)" onclick="Healthcare.triggerUserSOS('Heart Pain / Cardiac Emergency', 'Sudden severe chest pain, tightness, left arm discomfort')">
        <i class="fas fa-heart-circle-bolt" style="font-size:2.2rem;color:#fff;animation:pulse 1s infinite"></i>
        <strong>🫀 Sudden Heart Pain</strong>
        <span style="font-size:.75rem;opacity:.9;font-weight:normal">Immediate Cardiac Ambulance Dispatch</span>
      </button>

      <button class="btn" style="padding:18px;display:flex;flex-direction:column;align-items:center;gap:8px;font-size:1rem;background:#d97706;border-color:#b45309;color:#fff;text-align:center;box-shadow:0 4px 20px rgba(217,119,6,.2)" onclick="Healthcare.triggerUserSOS('Severe Breathing Issue / Asthma', 'Acute shortness of breath, severe asthma attack')">
        <i class="fas fa-lungs-virus" style="font-size:2.2rem"></i>
        <strong>🫁 Breathing Difficulty</strong>
        <span style="font-size:.75rem;opacity:.9;font-weight:normal">Oxygen Support Ambulance Dispatch</span>
      </button>

      <button class="btn" style="padding:18px;display:flex;flex-direction:column;align-items:center;gap:8px;font-size:1rem;background:#2563eb;border-color:#1d4ed8;color:#fff;text-align:center" onclick="Healthcare.triggerUserSOS('Accident / Severe Injury', 'Fall, severe bleeding, fracture, machine injury')">
        <i class="fas fa-user-injured" style="font-size:2.2rem"></i>
        <strong>🩸 Trauma / Major Injury</strong>
        <span style="font-size:.75rem;opacity:.9;font-weight:normal">Paramedic & Stretcher Unit Dispatch</span>
      </button>

      <button class="btn" style="padding:18px;display:flex;flex-direction:column;align-items:center;gap:8px;font-size:1rem;background:#7c3aed;border-color:#6d28d9;color:#fff;text-align:center" onclick="Healthcare.triggerUserSOS('Unconscious / Fainted Person', 'Person collapsed, unresponsive student or campus worker')">
        <i class="fas fa-bed-pulse" style="font-size:2.2rem"></i>
        <strong>😵 Fainted / Unconscious</strong>
        <span style="font-size:.75rem;opacity:.9;font-weight:normal">Emergency Doctor & CPR Response</span>
      </button>
    </div>

    <!-- STATUS RESULT AREA FOR STUDENT / WORKER -->
    <div id="user-med-sos-result" style="margin-top:20px"></div>
  </div>

  <div class="two-col">
    <!-- CPR & FIRST AID ASSISTANT -->
    <div class="card">
      <div class="card-title">🧠 Emergency First-Aid Protocol (While Waiting)</div>
      <div style="background:var(--bg3);padding:14px;border-radius:10px;border-left:4px solid #ef4444;font-size:.85rem;line-height:1.7">
        <strong style="color:#f87171">🫀 Sudden Chest Pain Protocol:</strong>
        <ol style="margin-top:8px;padding-left:18px">
          <li><strong>Seat patient upright</strong> against a wall to ease breathing & lessen heart strain.</li>
          <li><strong>Loosen tight clothing</strong> (collar, belt, tie).</li>
          <li><strong>Keep patient calm</strong> & check if they have prescribed heart medicine.</li>
          <li><strong>If patient collapses and stops breathing:</strong> Begin Hands-Only CPR (100–120 chest compressions per minute).</li>
          <li><strong>AED Defibrillator locations:</strong> Block A Security Gate & Main Canteen.</li>
        </ol>
      </div>
    </div>

    <!-- DIRECT EMERGENCY HOTLINES -->
    <div class="card">
      <div class="card-title">📞 Direct Medical Emergency Contacts</div>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="padding:12px;background:var(--bg3);border-radius:10px;border:1px solid var(--border);display:flex;align-items:center;justify-style:space-between">
          <div>
            <div style="font-weight:700;font-size:.9rem">Campus Health Center Desk</div>
            <div style="font-size:.8rem;color:#60a5fa">+91 1800-HEAL-SOS</div>
          </div>
          <a href="tel:+911800432576" class="btn sm"><i class="fas fa-phone"></i> Call Doctor</a>
        </div>
        <div style="padding:12px;background:var(--bg3);border-radius:10px;border:1px solid var(--border);display:flex;align-items:center;justify-style:space-between">
          <div>
            <div style="font-weight:700;font-size:.9rem">National Ambulance Hotline</div>
            <div style="font-size:.8rem;color:#f87171">108 / 112</div>
          </div>
          <a href="tel:108" class="btn sm danger"><i class="fas fa-phone-volume"></i> Call 108</a>
        </div>
      </div>
    </div>
  </div>`;
};

// ── 2. ADMIN HEALTHCARE & AMBULANCE DISPATCH VIEW ──────────────────────────
Pages._adminHealthcare = function (el) {
  el.innerHTML = `
  <div class="stat-grid">
    <div class="stat-card red animate-in">
      <div class="stat-label">Active Medical SOS</div>
      <div class="stat-value" style="color:#f87171" id="med-stat-active">1</div>
      <div class="stat-change down">Requires Admin Dispatch</div>
      <i class="fas fa-heart-pulse stat-icon" style="color:#ef4444"></i>
    </div>
    <div class="stat-card green animate-in">
      <div class="stat-label">Campus Ambulances</div>
      <div class="stat-value" style="color:#34d399">3 Unit(s)</div>
      <div class="stat-change up" id="med-stat-amb-avail">2 Ready / 1 Deployed</div>
      <i class="fas fa-ambulance stat-icon" style="color:#10b981"></i>
    </div>
    <div class="stat-card blue animate-in">
      <div class="stat-label">Medical Officers on Duty</div>
      <div class="stat-value" style="color:#60a5fa">4 Doctors</div>
      <div class="stat-change up">2 Nurses · 1 ICU Paramedic</div>
      <i class="fas fa-user-md stat-icon" style="color:#3b82f6"></i>
    </div>
    <div class="stat-card yellow animate-in">
      <div class="stat-label">Avg Ambulance SLA</div>
      <div class="stat-value" style="color:#fbbf24">2.8m</div>
      <div class="stat-change up">↓ Rapid Response</div>
      <i class="fas fa-kit-medical stat-icon" style="color:#f59e0b"></i>
    </div>
  </div>

  <div class="two-col">
    <!-- LIVE MEDICAL SOS QUEUE FOR ADMIN -->
    <div class="card" style="border-color:rgba(239,68,68,.3)">
      <div class="card-title" style="display:flex;justify-content:space-between;align-items:center">
        <span>🚨 Active Medical Emergencies (Admin Queue)</span>
        <span class="pill critical" id="med-queue-count">Live Sync</span>
      </div>
      <div id="med-sos-queue"></div>
    </div>

    <!-- AMBULANCE FLEET DISPATCH BOARD -->
    <div class="card">
      <div class="card-title" style="display:flex;justify-content:space-between;align-items:center">
        <span>🚑 Campus Ambulance Fleet Dispatch</span>
        <button class="btn sm ghost" onclick="Healthcare.renderAmbulances()"><i class="fas fa-sync"></i> Refresh</button>
      </div>
      <div id="ambulance-board"></div>
    </div>
  </div>

  <div class="two-col">
    <div class="card">
      <div class="card-title">📞 Campus Medical Hotline & External Support</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div style="padding:12px;background:var(--bg3);border-radius:10px;border:1px solid var(--border)">
          <div style="font-size:.78rem;color:var(--text2)">Chief Medical Officer</div>
          <div style="font-weight:700;font-size:1rem;color:#60a5fa;margin:4px 0">+91 1800-HEAL-SOS</div>
          <button class="btn sm" style="width:100%;margin-top:6px" onclick="UI.showToast('Calling Medical Officer','Connecting to Chief Doctor...','alert')"><i class="fas fa-phone"></i> Call Doctor</button>
        </div>
        <div style="padding:12px;background:var(--bg3);border-radius:10px;border:1px solid var(--border)">
          <div style="font-size:.78rem;color:var(--text2)">City Hospital Hotline</div>
          <div style="font-weight:700;font-size:1rem;color:#f87171;margin:4px 0">Emergency: 108</div>
          <button class="btn sm danger" style="width:100%;margin-top:6px" onclick="UI.showToast('Calling 108','Dialing City Hospital Emergency...','alert')"><i class="fas fa-phone-volume"></i> Call 108 Hotline</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🏥 Campus ICU & Bed Occupancy</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;text-align:center">
        <div style="background:var(--bg3);padding:12px;border-radius:8px">
          <div style="font-size:.75rem;color:var(--text2)">Emergency Beds</div>
          <div style="font-size:1.4rem;font-weight:800;color:#34d399;margin-top:2px">4 / 6</div>
        </div>
        <div style="background:var(--bg3);padding:12px;border-radius:8px">
          <div style="font-size:.75rem;color:var(--text2)">Ventilators</div>
          <div style="font-size:1.4rem;font-weight:800;color:#60a5fa;margin-top:2px">1 / 2</div>
        </div>
        <div style="background:var(--bg3);padding:12px;border-radius:8px">
          <div style="font-size:.75rem;color:var(--text2)">Oxygen Cylinders</div>
          <div style="font-size:1.4rem;font-weight:800;color:#34d399;margin-top:2px">18 Ready</div>
        </div>
      </div>
    </div>
  </div>`;

  Healthcare.renderQueue();
  Healthcare.renderAmbulances();
  Healthcare.subscribeStore();
};

// ── 3. SECURITY HEALTHCARE & AMBULANCE OPERATIONS VIEW ──────────────────────
Pages._securityHealthcare = function (el) {
  el.innerHTML = `
  <div class="card">
    <div class="card-title" style="display:flex;justify-content:space-between;align-items:center">
      <span>🚑 Security Ambulance Operations & Fleet Board</span>
      <span class="pill low">Security Control</span>
    </div>
    <div id="ambulance-board"></div>
  </div>
  <div class="card" style="margin-top:20px;border-color:rgba(239,68,68,.3)">
    <div class="card-title">🚨 Active Medical Emergency Logs</div>
    <div id="med-sos-queue"></div>
  </div>`;

  Healthcare.renderQueue();
  Healthcare.renderAmbulances();
  Healthcare.subscribeStore();
};

// ── HEALTHCARE SERVICE ENGINE ──────────────────────────────────────────────
const Healthcare = {
  _unsub: null,

  subscribeStore() {
    if (this._unsub) this._unsub();
    if (typeof Store !== 'undefined') {
      this._unsub = Store.subscribe(() => {
        this.renderQueue();
        this.renderAmbulances();
      });
    }
  },

  // Called when user clicks an emergency SOS button in student/worker view
  triggerUserSOS(emergencyType, hint) {
    const me = Profile.me();
    const roleSelect = document.getElementById('user-med-role');
    const locInput = document.getElementById('user-med-loc');

    const patientRole = roleSelect ? roleSelect.value : 'Student';
    const loc = locInput && locInput.value ? locInput.value.trim() : (me.hostel || 'Library Block B');

    UI.showToast('🚨 MEDICAL SOS ACTIVATED!', `Transmitting ${emergencyType} at ${loc} to Admin...`, 'alert');

    // 1) Push to Store
    const evt = {
      type: `Medical SOS: ${emergencyType}`,
      sev: 'critical',
      channel: 'sos',
      loc: loc,
      reporter: `${me.name} (${patientRole} - ID: ${me.roll})`,
      summary: `URGENT MEDICAL EMERGENCY: ${emergencyType}. Patient: ${me.name} (${patientRole}). Location: ${loc}. Context: ${hint}`,
      medicalType: emergencyType,
      isMedical: true,
      patientType: patientRole
    };

    if (typeof AlertSystem !== 'undefined') {
      AlertSystem.trigger({
        type: `Medical SOS (${emergencyType})`,
        sev: 'critical',
        channel: 'sos',
        summaryHint: `Medical Emergency: ${emergencyType}. Patient is a ${patientRole} at ${loc}. Needs immediate campus ambulance dispatch!`,
        onCard: () => {}
      });
    } else if (typeof Store !== 'undefined') {
      Store.add(evt);
    }

    // 2) Update Student / Worker Active SOS Display
    const resultHost = document.getElementById('user-med-sos-result');
    if (resultHost) {
      resultHost.innerHTML = `
      <div class="card animate-in" style="border:2px solid #ef4444;background:rgba(239,68,68,.1)">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
          <div style="font-weight:900;font-size:1.1rem;color:#f87171;display:flex;align-items:center;gap:8px">
            <span class="live-dot red"></span> 🚨 EMERGENCY MEDICAL SOS SENT TO ADMIN & SECURITY!
          </div>
          <span class="pill critical">STATUS: ADMIN REVIEWING DISPATCH</span>
        </div>

        <div style="margin-top:14px;font-size:.88rem;line-height:1.8;color:var(--text)">
          📍 <strong>Emergency Location:</strong> ${loc}<br>
          👤 <strong>Patient:</strong> ${me.name} (${patientRole} - ID: ${me.roll})<br>
          🚨 <strong>Emergency Type:</strong> <span style="color:#f87171;font-weight:bold">${emergencyType}</span><br>
          📞 <strong>Mobile:</strong> ${me.mobile}<br>
          📡 <strong>Dispatch Status:</strong> Alert received by Admin Control Room. Campus Ambulance assignment in progress.
        </div>

        <div style="margin-top:16px;display:flex;gap:12px;flex-wrap:wrap">
          <a href="tel:+911800432576" class="btn danger sm"><i class="fas fa-phone"></i> Call Campus Doctor Now</a>
          <button class="btn ghost sm" onclick="document.getElementById('user-med-sos-result').innerHTML='';UI.showToast('SOS Cancelled','Medical SOS resolved.')"><i class="fas fa-times"></i> Cancel Emergency</button>
        </div>
      </div>`;
    }
  },

  renderQueue() {
    const el = document.getElementById('med-sos-queue');
    if (!el) return;

    let medicalEvents = [];
    if (typeof Store !== 'undefined') {
      medicalEvents = Store.all().filter(e => e.isMedical || (e.type && e.type.toLowerCase().includes('medical')) || (e.type && e.type.toLowerCase().includes('sos')));
    }

    if (!medicalEvents.length && typeof DATA !== 'undefined' && DATA.incidents) {
      medicalEvents = DATA.incidents.filter(i => i.type.includes('Medical') || i.type === 'SOS').map(i => ({
        id: i.id,
        type: i.type.includes('Medical') ? i.type : 'Medical SOS: Cardiac Pain',
        loc: i.loc,
        reporter: i.reporter,
        sev: i.sev,
        status: i.status,
        ts: Date.now() - 300000,
        summary: 'Patient reported sudden chest pain & dizziness.'
      }));
    }

    const countEl = document.getElementById('med-queue-count');
    if (countEl) countEl.textContent = `${medicalEvents.length} Active`;

    const activeCountEl = document.getElementById('med-stat-active');
    if (activeCountEl) activeCountEl.textContent = medicalEvents.length;

    el.innerHTML = medicalEvents.map(e => `
      <div class="incident-item animate-in" style="border-left-color:#ef4444;flex-wrap:wrap">
        <div class="incident-icon" style="background:rgba(239,68,68,.2);color:#ef4444">
          <i class="fas fa-heart-pulse"></i>
        </div>
        <div class="incident-body">
          <div class="incident-title" style="font-weight:700;color:#f87171">${e.type}</div>
          <div class="incident-meta">📍 ${e.loc} · 👤 ${e.reporter}</div>
          ${e.summary ? `<div style="font-size:.76rem;color:var(--text2);margin-top:4px">${e.summary}</div>` : ''}
          ${e.dispatchedAmb ? `<div style="font-size:.76rem;color:#34d399;margin-top:4px">🚑 <strong>Dispatched:</strong> ${e.dispatchedAmb} (ETA: ${e.eta||'2 min'})</div>` : ''}
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          ${UI.pill('critical')}
          ${!e.dispatchedAmb ? `
            <button class="btn sm danger" onclick="Healthcare.showDispatchModal('${e.id}', '${e.type.replace(/'/g,"\\'")}', '${(e.loc||'').replace(/'/g,"\\'")}')">
              <i class="fas fa-ambulance"></i> Admin Dispatch Ambulance
            </button>
          ` : `
            <span class="pill low"><i class="fas fa-check"></i> Ambulance En Route</span>
          `}
        </div>
      </div>`).join('');
  },

  renderAmbulances() {
    const el = document.getElementById('ambulance-board');
    if (!el) return;

    const list = DATA.ambulances || [];
    const availCount = list.filter(a => a.status === 'Available').length;
    const availStatEl = document.getElementById('med-stat-amb-avail');
    if (availStatEl) availStatEl.textContent = `${availCount} Ready / ${list.length - availCount} Deployed`;

    el.innerHTML = list.map(a => `
      <div style="padding:12px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:42px;height:42px;border-radius:10px;background:${a.status==='Available'?'rgba(16,185,129,.15)':'rgba(239,68,68,.15)'};display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:${a.status==='Available'?'#34d399':'#f87171'}">
            🚑
          </div>
          <div>
            <div style="font-weight:700;font-size:.88rem">${a.name} <span style="font-size:.75rem;color:var(--text2)">(${a.vehicleNo})</span></div>
            <div style="font-size:.76rem;color:var(--text2)">📍 Base: ${a.station} · 👤 Driver: ${a.driver} (${a.phone})</div>
            <div style="font-size:.72rem;color:var(--accent2);margin-top:2px">💊 ${a.equipment}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="pill ${a.status==='Available'?'low':'critical'}" style="font-size:.7rem">${a.status}</span>
          ${a.status === 'Available' ? `
            <button class="btn sm" onclick="Healthcare.quickDispatch('${a.id}')"><i class="fas fa-paper-plane"></i> Dispatch</button>
          ` : `
            <button class="btn sm ghost" onclick="Healthcare.resetAmbulance('${a.id}')"><i class="fas fa-rotate-left"></i> Recall</button>
          `}
        </div>
      </div>`).join('');
  },

  showDispatchModal(evtId, type, loc) {
    const list = DATA.ambulances.filter(a => a.status === 'Available');
    const targetAmb = list[0] || DATA.ambulances[0];
    this.dispatchAmbulance(targetAmb.id, type, loc, evtId);
  },

  dispatchAmbulance(ambId, type, loc, evtId) {
    const amb = DATA.ambulances.find(a => a.id === ambId);
    if (!amb) return;

    amb.status = 'Dispatched';
    const etaMin = Math.floor(Math.random() * 2) + 2;

    if (evtId && typeof Store !== 'undefined') {
      const e = Store.find(evtId);
      if (e) {
        e.dispatchedAmb = `${amb.name} (${amb.vehicleNo})`;
        e.eta = `${etaMin} min`;
        e.status = 'Ambulance Dispatched';
        Store.addResponse(evtId, { from: 'Admin Medical Dispatch', msg: `Dispatched ${amb.name} with driver ${amb.driver} to ${loc}. ETA ~${etaMin} min.` });
      }
    }

    UI.showToast('🚨 AMBULANCE DISPATCHED!', `Admin connected ${amb.name} to ${loc}. ETA ${etaMin} mins.`, 'alert');
    this.renderAmbulances();
    this.renderQueue();
  },

  quickDispatch(ambId) {
    this.dispatchAmbulance(ambId, 'Medical SOS', 'Library Block / Campus Central');
  },

  resetAmbulance(ambId) {
    const amb = DATA.ambulances.find(a => a.id === ambId);
    if (amb) {
      amb.status = 'Available';
      UI.showToast('Ambulance Ready', `${amb.name} returned to station and marked Available.`);
      this.renderAmbulances();
      this.renderQueue();
    }
  }
};
