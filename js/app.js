// ── ASHA EduShield 2.0 — UI Utilities ──
const UI = {
  _toastTimer: null,

  showToast(title, body = '', type = '') {
    const t = document.getElementById('toast');
    const icons = { alert: '🚨', warning: '⚠️', '': '🔔' };
    t.className = 'toast' + (type ? ' ' + type : '');
    document.getElementById('toast-icon').textContent = icons[type] || '🔔';
    document.getElementById('toast-title').textContent = title;
    document.getElementById('toast-body').textContent = body;
    t.classList.remove('hidden');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.add('hidden'), 5000);
  },

  pill(level) {
    return `<span class="pill ${level}">${level}</span>`;
  },

  sevColor(sev) {
    return { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#10b981', resolved: '#64748b' }[sev] || '#64748b';
  },

  chartDefaults() {
    return {
      plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 }, padding: 14 } } },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } }
      }
    };
  },

  makeChart(id, type, labels, datasets, extraOpts = {}) {
    const ctx = document.getElementById(id);
    if (!ctx) return null;
    return new Chart(ctx, {
      type,
      data: { labels, datasets },
      options: Object.assign({}, this.chartDefaults(), extraOpts)
    });
  },

  statCard(label, value, change, changeDir, icon, colorClass) {
    return `<div class="stat-card ${colorClass} animate-in">
      <div class="stat-label">${label}</div>
      <div class="stat-value" style="color:var(--${colorClass === 'red' ? 'red' : colorClass === 'blue' ? 'blue' : colorClass === 'green' ? 'green' : 'yellow'})">${value}</div>
      <div class="stat-change ${changeDir}">${change}</div>
      <i class="fas ${icon} stat-icon"></i>
    </div>`;
  }
};

// ── App Core ──
const App = {
  currentRole: 'student',
  mapInstance: null,
  _liveInterval: null,

  init() {
    this._buildRoleGrid();
    this._startLiveAlerts();
  },

  _buildRoleGrid() {
    const roles = [
      { id: 'student', icon: 'fa-user-graduate', label: 'Student' },
      { id: 'faculty', icon: 'fa-chalkboard-teacher', label: 'Faculty' },
      { id: 'security', icon: 'fa-shield-alt', label: 'Security' },
      { id: 'admin', icon: 'fa-user-tie', label: 'Admin' },
    ];
    const roleHint = document.createElement('div');
    roleHint.className = 'logo-sub';
    roleHint.textContent = 'Choose a role to enter the platform';
    const container = document.getElementById('role-grid');
    container.insertAdjacentElement('beforebegin', roleHint);
    document.getElementById('role-grid').innerHTML = roles.map((r, i) =>
      `<div class="role-btn${i === 0 ? ' selected' : ''}" onclick="App.selectRole(this,'${r.id}')">
        <i class="fas ${r.icon}"></i><span>${r.label}</span>
      </div>`
    ).join('');
  },

  selectRole(el, role) {
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    this.currentRole = role;
  },

  login() {
    document.getElementById('login-page').classList.remove('active');
    document.getElementById('app-page').classList.add('active');
    const r = DATA.roles[this.currentRole];
    document.getElementById('user-avatar').textContent = r.avatar;
    document.getElementById('user-avatar').style.background = `linear-gradient(135deg,${r.color},${r.color}99)`;
    this._buildNav();
    this.navigate('dashboard');
    setTimeout(() => UI.showToast('Welcome to ASHA EduShield 2.0', 'All 15 AI agents are active and monitoring.'), 900);
  },

  logout() {
    document.getElementById('app-page').classList.remove('active');
    document.getElementById('login-page').classList.add('active');
    const area = document.getElementById('content-area');
    if (area) area.innerHTML = '';
    const badge = document.getElementById('notif-badge');
    if (badge) badge.textContent = '0';
    this.mapInstance = null;
  },

  clearNotifications() {
    const badge = document.getElementById('notif-badge');
    if (badge) badge.textContent = '0';
    UI.showToast('Alerts cleared', 'The live alert feed has been reset.', 'warning');
  },

  _buildNav() {
    const nav = DATA.roles[this.currentRole].nav;
    let html = '';
    nav.forEach(n => {
      if (n.section) {
        html += `<div class="nav-section">${n.section}</div>`;
      } else {
        html += `<div class="nav-item" id="nav-${n.id}" onclick="App.navigate('${n.id}')">
          <i class="fas ${n.icon}"></i><span>${n.label}</span>
        </div>`;
      }
    });
    document.getElementById('nav-container').innerHTML = html;
  },

  navigate(id) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const el = document.getElementById('nav-' + id);
    if (el) el.classList.add('active');

    const titles = {
      dashboard: 'Dashboard', sos: 'SOS Emergency', report: 'Report Incident',
      wellness: 'Wellness Chat', 'women-safety': 'Women Safety Agent',
      classroom: 'Classroom Intelligence', exam: 'Exam Integrity',
      incidents: 'Incident Management', dispatch: 'Live Dispatch',
      agents: 'AI Agent Pipeline', analytics: 'Campus Analytics',
      'safe-travel': 'Safe Travel Mode', map: 'Campus Map'
    };
    const icons = {
      dashboard: 'fa-home', sos: 'fa-exclamation-circle', report: 'fa-flag',
      wellness: 'fa-heart', 'women-safety': 'fa-venus',
      classroom: 'fa-chalkboard', exam: 'fa-user-shield',
      incidents: 'fa-list-alt', dispatch: 'fa-bolt', agents: 'fa-robot',
      analytics: 'fa-chart-bar', 'safe-travel': 'fa-route', map: 'fa-map-marker-alt'
    };
    document.getElementById('page-title').innerHTML =
      `<i class="fas ${icons[id] || 'fa-circle'}"></i> ${titles[id] || id}`;

    const area = document.getElementById('content-area');
    area.innerHTML = '';
    this.mapInstance = null;

    const pages = {
      dashboard: Pages.dashboard,
      sos: Pages.sos,
      report: Pages.report,
      wellness: Pages.wellness,
      'women-safety': Pages.womenSafety,
      classroom: Pages.classroom,
      exam: Pages.exam,
      incidents: Pages.incidents,
      dispatch: Pages.dispatch,
      agents: Pages.agents,
      analytics: Pages.analytics,
      'safe-travel': Pages.safeTravel,
      map: Pages.map
    };
    if (pages[id]) pages[id](area);
  },

  _startLiveAlerts() {
    const alerts = [
      ['🚨 SOS Alert', 'Student near Gate 2 triggered emergency SOS.', 'alert'],
      ['⚠️ Ragging Report', 'Anonymous complaint received — Hostel 4 corridor.', 'alert'],
      ['🧠 Wellness Flag', '3 students flagged for counselor follow-up.', 'warning'],
      ['📋 Exam Alert', 'Suspicious behavior detected — Hall B, Seat C-05.', 'alert'],
      ['🛡 Guardian Agent', 'Threat level updated: Block B → HIGH risk zone.', 'warning'],
      ['📍 Safe Travel', 'Route deviation detected — Anjali K. near Market Road.', 'alert'],
      ['✅ Dispatch', 'Responder team dispatched to the latest high-risk incident.', 'alert'],
    ];
    let i = 0;
    setInterval(() => {
      const a = alerts[i % alerts.length];
      UI.showToast(a[0], a[1], a[2]);
      i++;
    }, 22000);
  }
};

window.addEventListener('load', () => App.init());
