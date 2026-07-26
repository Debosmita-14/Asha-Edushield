// js/pages/dispatch.js
var Pages = Pages || {};

Pages.dispatch = function (el) {
  el.innerHTML = `
  <div class="stat-grid">
    <div class="stat-card red animate-in"><div class="stat-label">Active Emergencies</div><div class="stat-value" style="color:#f87171">2</div><div class="stat-change down">Require response</div><i class="fas fa-bolt stat-icon" style="color:#ef4444"></i></div>
    <div class="stat-card green animate-in"><div class="stat-label">Guards On Duty</div><div class="stat-value" style="color:#34d399">8</div><div class="stat-change up">3 available now</div><i class="fas fa-shield-alt stat-icon" style="color:#10b981"></i></div>
    <div class="stat-card yellow animate-in"><div class="stat-label">Avg Response Time</div><div class="stat-value" style="color:#fbbf24">4.2m</div><div class="stat-change up">↓ Below 5m SLA</div><i class="fas fa-clock stat-icon" style="color:#f59e0b"></i></div>
    <div class="stat-card blue animate-in"><div class="stat-label">Resolved Today</div><div class="stat-value" style="color:#60a5fa">23</div><div class="stat-change up">All closed</div><i class="fas fa-check-circle stat-icon" style="color:#3b82f6"></i></div>
  </div>
  <div class="two-col">
    <div class="card">
      <div class="card-title">🚨 Live Dispatch Queue</div>
      <div id="dispatch-queue"></div>
    </div>
    <div class="card">
      <div class="card-title">Guard Status Board</div>
      <div id="guard-board"></div>
    </div>
  </div>
  <div class="card">
    <div class="card-title">Manual Dispatch</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px">
      <div class="form-row" style="margin:0"><label>Incident Type</label>
        <select class="filter-select" id="d-type" style="width:100%">
          <option>Medical SOS (Heart Pain / Cardiac)</option><option>SOS Emergency</option><option>Ragging</option><option>Harassment</option><option>Medical</option><option>Fire</option>
        </select>
      </div>
      <div class="form-row" style="margin:0"><label>Location</label>
        <input type="text" id="d-loc" placeholder="e.g. Block B, Room 204">
      </div>
      <div class="form-row" style="margin:0"><label>Priority</label>
        <select class="filter-select" id="d-priority" style="width:100%">
          <option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option>
        </select>
      </div>
    </div>
    <button class="btn danger" onclick="Dispatch.manual()"><i class="fas fa-bolt"></i> Dispatch Now</button>
    <div id="dispatch-result" style="margin-top:16px"></div>
  </div>`;

  Dispatch.renderQueue();
  Dispatch.renderBoard();
};

const Dispatch = {
  renderQueue() {
    const el = document.getElementById('dispatch-queue');
    if (!el) return;
    const active = DATA.incidents.filter(i => i.status === 'Active' || i.status === 'Investigating').slice(0, 3);
    el.innerHTML = active.map(i => `
      <div class="incident-item" style="border-left-color:${UI.sevColor(i.sev)}">
        <div class="incident-icon" style="background:${UI.sevColor(i.sev)}22;color:${UI.sevColor(i.sev)}">
          <i class="fas fa-bolt"></i>
        </div>
        <div class="incident-body">
          <div class="incident-title">${i.type} — ${i.loc}</div>
          <div class="incident-meta">${i.reporter} · ${i.time} · ${i.status}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          ${UI.pill(i.sev)}
          <button class="btn sm ghost" onclick="Dispatch.updateStatus('${i.id}')">
            <i class="fas fa-check"></i> En Route
          </button>
        </div>
      </div>`).join('');
  },

  renderBoard() {
    const el = document.getElementById('guard-board');
    if (!el) return;
    el.innerHTML = DATA.guards.map(g => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:9px;height:9px;border-radius:50%;background:${g.status==='Available'?'#10b981':g.status==='Dispatched'?'#ef4444':'#f59e0b'}"></div>
          <div>
            <div style="font-size:.85rem;font-weight:600">Guard #${g.id.slice(1)} — ${g.name}</div>
            <div style="font-size:.75rem;color:var(--text2)">${g.zone}</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <span class="pill ${g.status==='Available'?'low':g.status==='Dispatched'?'critical':'high'}">${g.status}</span>
          ${g.status==='Available'?`<button class="btn sm" onclick="Dispatch.assign('${g.id}')"><i class="fas fa-paper-plane"></i></button>`:''}
        </div>
      </div>`).join('');
  },

  updateStatus(id) {
    UI.showToast('Status Updated', `${id} — Guard marked as en route.`);
  },

  assign(guardId) {
    const g = DATA.guards.find(x => x.id === guardId);
    UI.showToast('Guard Assigned', `${g.name} dispatched to active incident.`, 'alert');
    g.status = 'Dispatched';
    this.renderBoard();
  },

  manual() {
    const type = document.getElementById('d-type').value;
    const loc = document.getElementById('d-loc').value || 'Campus';
    const priority = document.getElementById('d-priority').value;
    const isMed = type.toLowerCase().includes('medical') || type.toLowerCase().includes('heart');

    const available = DATA.guards.filter(g => g.status === 'Available');
    const guard = available.length ? available[0] : { name: 'Admin Quick Responder', id: 'G0' };
    if (available.length) guard.status = 'Dispatched';

    let ambText = '';
    if (isMed && typeof DATA.ambulances !== 'undefined') {
      const ambList = DATA.ambulances.filter(a => a.status === 'Available');
      const amb = ambList[0] || DATA.ambulances[0];
      if (amb) {
        amb.status = 'Dispatched';
        ambText = `<br>🚑 <strong>Campus Ambulance:</strong> ${amb.name} (${amb.vehicleNo}) dispatched with driver ${amb.driver} (${amb.phone}).`;
      }
    }

    document.getElementById('dispatch-result').innerHTML = `
    <div style="background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.3);border-radius:12px;padding:16px;font-size:.875rem">
      <div style="font-weight:700;color:#34d399;margin-bottom:8px">✅ Emergency Dispatch Confirmed</div>
      <strong>${guard.name}</strong> dispatched to <strong>${loc}</strong><br>
      Incident: ${type} · Priority: ${UI.pill(priority)}${ambText}<br>
      ETA: ~2.5 minutes · Ticket: INC-${4823 + Math.floor(Math.random()*10)}
    </div>`;
    UI.showToast('Dispatched!', `${guard.name} ${ambText ? '+ Ambulance' : ''} en route to ${loc}.`, 'alert');
    this.renderBoard();
  }
};
