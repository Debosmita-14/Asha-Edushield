// ── ASHA EduShield 2.0 — Live Event Store ──
// Central live bus: student reports / SOS / voice-evidence create events here.
// Admin, Security, Faculty dashboards subscribe and update in real time.
// Persisted to localStorage so events survive reloads and role switches.
const Store = {
  _events: [],
  _listeners: [],
  KEY: 'asha_live_events',

  load() {
    try { this._events = JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
    catch (e) { this._events = []; }
  },
  save() {
    try { localStorage.setItem(this.KEY, JSON.stringify(this._events)); } catch (e) {}
  },

  all() { return this._events.slice(); },
  active() { return this._events.filter(e => e.status !== 'Resolved'); },
  find(id) { return this._events.find(e => e.id === id); },

  // Create a new live event and kick off its real-time response pipeline
  add(evt) {
    const id = evt.id || ('INC-' + (5000 + Math.floor(Math.random() * 4000)));
    const e = Object.assign({
      id, ts: Date.now(), status: 'Active',
      reporter: 'Anonymous', channel: 'report',
      responses: [], live: true
    }, evt);
    this._events.unshift(e);
    this.save();
    this._notify();
    this._broadcast(e);
    this._runResponse(e);
    return e;
  },

  addResponse(id, resp) {
    const e = this.find(id);
    if (!e) return;
    e.responses.push(Object.assign({ ts: Date.now() }, resp));
    this.save();
    this._notify();
  },

  setStatus(id, status) {
    const e = this.find(id);
    if (!e) return;
    e.status = status;
    this.save();
    this._notify();
  },

  subscribe(fn) {
    this._listeners.push(fn);
    return () => { this._listeners = this._listeners.filter(f => f !== fn); };
  },
  _notify() { this._listeners.forEach(fn => { try { fn(this._events); } catch (e) {} }); },

  // Broadcast a live alert toast to admin/security/faculty when a new event arrives
  _broadcast(e) {
    const role = typeof App !== 'undefined' ? App.currentRole : '';
    if (role === 'admin' || role === 'security' || role === 'faculty') {
      const icons = { sos:'🚨', report:'⚠️', voice:'🎙', wellness:'💙' };
      UI.showToast(
        `${icons[e.channel]||'🔔'} Live Alert — ${e.type}`,
        `${e.loc||'Unknown location'} · ${e.reporter}`,
        'alert'
      );
      const badge = document.getElementById('notif-badge');
      if (badge) badge.textContent = (parseInt(badge.textContent)||0) + 1;
    }
  },

  // Simulate AI response pipeline: timed status + response messages
  _runResponse(e) {
    const score = e.sev === 'critical' ? 94 : e.sev === 'high' ? 78 : 55;
    [
      { delay: 900,  status: 'AI Analyzing',  from: 'Guardian Agent',      msg: `Threat score: ${score}/100 — routing to specialist agents.` },
      { delay: 2200, status: 'Dispatching',   from: 'Dispatch Agent',      msg: 'Nearest available guard notified. ETA calculated.' },
      { delay: 3800, status: 'Investigating', from: 'Investigation Agent', msg: 'Evidence collection started. Actian vector search running.' },
      { delay: 5500, status: 'Investigating', from: 'Compliance Agent',    msg: 'Incident logged for UGC compliance. Ticket sealed on Solana.' },
    ].forEach(s => setTimeout(() => {
      this.addResponse(e.id, { from: s.from, msg: s.msg });
      this.setStatus(e.id, s.status);
    }, s.delay));
  },

  // Format a Store event as a DATA.incidents-compatible row for existing UI
  toIncident(e) {
    return {
      id: e.id, type: e.type || 'Report', loc: e.loc || 'Unknown',
      reporter: e.reporter, time: new Date(e.ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) + ' (live)',
      sev: e.sev || 'medium', status: e.status,
      lat: e.lat || 28.6140, lng: e.lng || 77.2100, _live: true
    };
  }
};
Store.load();
