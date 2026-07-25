// ── Pages namespace (initialized here, extended by other page files) ──
var Pages = Pages || {};

Pages.dashboard = function (el) {
  const role = App.currentRole;
  el.innerHTML = `
  <div class="stat-grid">
    <div class="stat-card red animate-in"><div class="stat-label">Active Incidents</div><div class="stat-value" style="color:#f87171">7</div><div class="stat-change down">↑ 2 from yesterday</div><i class="fas fa-exclamation-triangle stat-icon" style="color:#ef4444"></i></div>
    <div class="stat-card purple animate-in"><div class="stat-label">Safety Score</div><div class="stat-value" style="color:#a78bfa">94/100</div><div class="stat-change up">Improved from last week</div><i class="fas fa-shield-alt stat-icon" style="color:#8b5cf6"></i></div>
    <div class="stat-card blue animate-in"><div class="stat-label">Students Safe</div><div class="stat-value" style="color:#60a5fa">4,821</div><div class="stat-change up">98.6% safety rate</div><i class="fas fa-user-shield stat-icon" style="color:#3b82f6"></i></div>
    <div class="stat-card green animate-in"><div class="stat-label">Resolved Today</div><div class="stat-value" style="color:#34d399">23</div><div class="stat-change up">Avg 4.2 min response</div><i class="fas fa-check-circle stat-icon" style="color:#10b981"></i></div>
    <div class="stat-card yellow animate-in"><div class="stat-label">AI Agents Active</div><div class="stat-value" style="color:#fbbf24">13/15</div><div class="stat-change up">All systems nominal</div><i class="fas fa-robot stat-icon" style="color:#f59e0b"></i></div>
  </div>
  <div class="two-col">
    <div class="card">
      <div class="card-title">Live Incident Feed <span class="pill critical"><span class="live-dot red"></span> Live</span></div>
      <div id="live-feed"></div>
    </div>
    <div class="card">
      <div class="card-title">Incident Trend — Last 7 Days</div>
      <canvas id="trendChart" height="200"></canvas>
    </div>
  </div>
  <div class="two-col">
    <div class="card">
      <div class="card-title">Incident Breakdown</div>
      <canvas id="pieChart" height="220"></canvas>
    </div>
    <div class="card">
      <div class="card-title">AI Agent Activity <span style="font-size:.75rem;color:var(--text2);font-weight:400">Real-time</span></div>
      <div id="agent-activity"></div>
    </div>
  </div>`;

  // Live feed
  const feed = document.getElementById('live-feed');
  feed.innerHTML = DATA.incidents.slice(0, 5).map(i => `
    <div class="incident-item" style="border-left-color:${UI.sevColor(i.sev)}">
      <div class="incident-icon" style="background:${UI.sevColor(i.sev)}22;color:${UI.sevColor(i.sev)}">
        <i class="fas ${Pages._typeIcon(i.type)}"></i>
      </div>
      <div class="incident-body">
        <div class="incident-title">${i.type} — ${i.loc}</div>
        <div class="incident-meta">${i.reporter} · ${i.time}</div>
      </div>
      ${UI.pill(i.sev)}
    </div>`).join('');

  // Charts
  UI.makeChart('trendChart', 'line', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [
    { label: 'Reported', data: [8, 12, 6, 15, 9, 4, 7], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.1)', tension: .4, fill: true },
    { label: 'Resolved', data: [7, 11, 6, 13, 9, 4, 6], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.1)', tension: .4, fill: true }
  ]);

  UI.makeChart('pieChart', 'doughnut', ['SOS', 'Ragging', 'Harassment', 'Bullying', 'Mental Health', 'Other'], [
    { data: [18, 24, 19, 14, 16, 9], backgroundColor: ['#ef4444', '#8b5cf6', '#f59e0b', '#3b82f6', '#10b981', '#64748b'], borderWidth: 0 }
  ], { plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 }, padding: 12 } } }, cutout: '65%', scales: {} });

  // Agent activity
  const acts = DATA.agents.filter(a => a.status === 'active').slice(0, 6);
  document.getElementById('agent-activity').innerHTML = acts.map(a => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:1.1rem">${a.icon}</span>
        <span style="font-size:.85rem">${a.name}</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:.75rem;color:var(--text2)">${a.tasks} tasks</span>
        <span class="pill low"><span class="live-dot"></span> active</span>
      </div>
    </div>`).join('');
};

Pages._typeIcon = function (type) {
  return {
    'SOS': 'fa-exclamation-circle', 'Ragging': 'fa-user-slash',
    'Mental Health': 'fa-brain', 'Harassment': 'fa-shield-alt',
    'Bullying': 'fa-fist-raised'
  }[type] || 'fa-flag';
};
