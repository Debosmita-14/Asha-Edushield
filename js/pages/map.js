// js/pages/map.js
Pages = Pages || {};

Pages.map = function (el) {
  el.innerHTML = `
  <div class="card" style="padding:0;overflow:hidden">
    <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
      <div>
        <div style="font-weight:700">Campus Safety Map — Live Digital Twin</div>
        <div style="font-size:.75rem;color:var(--text2);margin-top:2px" id="map-addr">OpenStreetMap · Leaflet · Locating your live position…</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn sm" id="locate-btn" onclick="CampusMap.locateMe()"><i class="fas fa-location-crosshairs"></i> Locate Me</button>
        <button class="btn sm ghost" id="heatmap-btn" onclick="CampusMap.toggleHeatmap()"><i class="fas fa-fire"></i> Risk Heatmap</button>
        <button class="btn sm ghost" onclick="CampusMap.toggleClusters()"><i class="fas fa-layer-group"></i> Clusters</button>
        <button class="btn sm ghost" onclick="CampusMap.refresh()"><i class="fas fa-sync-alt"></i> Refresh</button>
        <button class="btn sm danger" onclick="CampusMap.sosAll()"><i class="fas fa-broadcast-tower"></i> Broadcast Alert</button>
      </div>
    </div>
    <div style="display:flex;gap:12px;padding:10px 20px;background:var(--bg3);border-bottom:1px solid var(--border);flex-wrap:wrap;align-items:center">
      <span style="font-size:.75rem;color:var(--text2);display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;background:#ef4444;border-radius:50%;display:inline-block;box-shadow:0 0 6px #ef4444"></span>SOS/Emergency</span>
      <span style="font-size:.75rem;color:var(--text2);display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;background:#f59e0b;border-radius:50%;display:inline-block;box-shadow:0 0 6px #f59e0b"></span>Incident</span>
      <span style="font-size:.75rem;color:var(--text2);display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;background:#10b981;border-radius:50%;display:inline-block;box-shadow:0 0 6px #10b981"></span>Guard</span>
      <span style="font-size:.75rem;color:var(--text2);display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;background:#8b5cf6;border-radius:50%;display:inline-block;box-shadow:0 0 6px #8b5cf6"></span>Unsafe Zone</span>
      <span style="font-size:.75rem;color:var(--text2);display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;background:#06b6d4;border-radius:50%;display:inline-block;box-shadow:0 0 6px #06b6d4"></span>Safe Route</span>
      <span style="margin-left:auto;font-size:.72rem;color:var(--text2);display:flex;align-items:center;gap:5px" id="map-live-readout"><span class="live-dot"></span> Live · Locating…</span>
    </div>
    <div id="map" style="height:460px;border-radius:0;z-index:1"></div>
  </div>
  <div class="three-col" style="margin-top:20px">
    <div class="card">
      <div class="card-title">🚨 Active Incidents</div>
      <div id="map-incidents"></div>
    </div>
    <div class="card">
      <div class="card-title">🛡 Guard Positions</div>
      <div id="map-guards"></div>
    </div>
    <div class="card">
      <div class="card-title">📊 Risk Prediction Agent</div>
      <div id="map-risk"></div>
    </div>
  </div>
  <div class="two-col">
    <div class="card">
      <div class="card-title">🗺 Safe Route Planner</div>
      <div class="form-row" style="margin-bottom:10px"><label>From</label><input type="text" value="Campus Main Gate" readonly style="background:var(--bg)"></div>
      <div class="form-row" style="margin-bottom:10px"><label>To</label><input type="text" id="map-dest" placeholder="Enter destination..."></div>
      <button class="btn sm" onclick="CampusMap.planRoute()"><i class="fas fa-route"></i> Plan Safe Route</button>
      <div id="map-route-result" style="margin-top:12px"></div>
    </div>
    <div class="card">
      <div class="card-title">📞 Campus Emergency Hotlines & Support Desk</div>
      ${[
        {name:'Campus Health Center & Ambulance SOS',icon:'🚑',phone:'+91 1800-HEAL-SOS',color:'#ef4444',detail:'24/7 Paramedic & Cardiac Ambulance'},
        {name:'Security Control Room Desk',icon:'🛡️',phone:'+91 98765 43210 (Ext. 4001)',color:'#10b981',detail:'Main Gate & CCTV Command Center'},
        {name:'Women Safety & Night Escort Service',icon:'👩',phone:'+91 98765 12345 (Ext. 4002)',color:'#ec4899',detail:'Safe Travel & Guard Accompaniment'},
        {name:'Anti-Ragging Squad Helpline',icon:'🚫',phone:'+91 1800-ANTI-RAG (Ext. 4003)',color:'#8b5cf6',detail:'Anonymous Reporting & Emergency Action'},
        {name:'Mental Health & Crisis Counselor',icon:'🧠',phone:'+91 91529 87821 (iCall)',color:'#3b82f6',detail:'Confidential Wellness Support'},
      ].map(t => `
        <div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:1.3rem">${t.icon}</span>
          <div style="flex:1">
            <div style="font-size:.85rem;font-weight:600">${t.name}</div>
            <div style="font-size:.72rem;color:${t.color};font-weight:700">${t.phone}</div>
            <div style="font-size:.7rem;color:var(--text2)">${t.detail}</div>
          </div>
          <a href="tel:${t.phone.split(' ')[0]}" class="btn sm ghost" style="font-size:.7rem;padding:3px 8px"><i class="fas fa-phone"></i> Call</a>
        </div>`).join('')}
    </div>
  </div>`;

  setTimeout(() => CampusMap.init(), 120);
  CampusMap.renderSidePanels();
};

const CampusMap = {
  _map: null,
  _heatmapOn: false,
  _heatCircles: [],
  _routeLine: null,
  // Live-location state
  _anchor: [28.6139, 77.2090],   // becomes the user's real GPS fix once available
  _meMarker: null,
  _meAccuracy: null,
  _watchId: null,
  _overlayBuilt: false,
  _liveMarkers: {},               // Store event id -> Leaflet marker
  _unsub: null,
  _briefDone: false,

  init() {
    const el = document.getElementById('map');
    if (!el || App.mapInstance) return;
    // Reset singleton state — the page HTML is rebuilt on every navigation,
    // so stale markers/watchers from a previous visit must be dropped.
    if (this._watchId != null && navigator.geolocation) navigator.geolocation.clearWatch(this._watchId);
    this._watchId = null;
    this._meMarker = null; this._meAccuracy = null;
    this._overlayBuilt = false; this._briefDone = false;
    this._liveMarkers = {}; this._heatCircles = []; this._heatmapOn = false; this._routeLine = null;
    this._anchor = this._DEF.slice();
    this._map = L.map('map', { zoomControl: true }).setView(this._anchor, 17);
    App.mapInstance = this._map;
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd', maxZoom: 20
    }).addTo(this._map);

    // Subscribe to the live event bus so new reports/SOS drop pins in real time.
    if (typeof Store !== 'undefined') {
      this._unsub = Store.subscribe(() => this._syncLiveEvents());
    }

    // Try to anchor on the user's real position; fall back to default after timeout.
    this.locateMe(true);
  },

  // ── Live geolocation ──────────────────────────────────────────────
  locateMe(silent) {
    if (!navigator.geolocation) {
      if (!silent) UI.showToast('Location unavailable', 'This browser has no Geolocation API. Using default campus map.', 'alert');
      this._buildOverlay();
      return;
    }
    const btn = document.getElementById('locate-btn');
    if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating…';

    // Fallback: if no fix within 6s, build the overlay on the default anchor anyway.
    let settled = false;
    const fallback = setTimeout(() => {
      if (settled) return;
      settled = true;
      if (btn) btn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Locate Me';
      if (!this._overlayBuilt) this._buildOverlay();
    }, 6000);

    if (this._watchId != null) navigator.geolocation.clearWatch(this._watchId);
    this._watchId = navigator.geolocation.watchPosition(
      pos => {
        settled = true; clearTimeout(fallback);
        if (btn) btn.innerHTML = '<i class="fas fa-location-crosshairs" style="color:#06b6d4"></i> Live';
        this._onFix(pos);
      },
      err => {
        settled = true; clearTimeout(fallback);
        if (btn) btn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Locate Me';
        if (!silent) UI.showToast('Location denied', err.message + ' — using default campus map.', 'alert');
        if (!this._overlayBuilt) this._buildOverlay();
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  },

  _onFix(pos) {
    const { latitude: lat, longitude: lng, accuracy } = pos.coords;
    const firstFix = !this._meMarker;
    this._anchor = [lat, lng];

    // Live "you are here" marker + accuracy ring.
    if (!this._meMarker) {
      this._meMarker = L.marker([lat, lng], { icon: this._mk('#06b6d4', 18, true), zIndexOffset: 1000 })
        .addTo(this._map).bindPopup('<b style="color:#06b6d4">📍 You are here</b><br><span style="font-size:.75rem">Live GPS position</span>');
      this._meAccuracy = L.circle([lat, lng], { color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: .08, weight: 1, radius: accuracy || 30 }).addTo(this._map);
    } else {
      this._meMarker.setLatLng([lat, lng]);
      this._meAccuracy.setLatLng([lat, lng]).setRadius(accuracy || 30);
    }

    const readout = document.getElementById('map-live-readout');
    if (readout) readout.innerHTML = `<span class="live-dot"></span> Live · ${lat.toFixed(5)}, ${lng.toFixed(5)} · ±${Math.round(accuracy||0)}m`;

    if (firstFix) {
      this._map.setView([lat, lng], 17);
      this._buildOverlay();          // (re)build context markers relative to real position
      this._reverseGeocode(lat, lng);
      this._geminiSafetyBrief(lat, lng);
    }
  },

  // Offset helper: place a context marker relative to the live anchor (deltas in degrees).
  _rel(dLat, dLng) { return [this._anchor[0] + dLat, this._anchor[1] + dLng]; },

  _mk(color, size = 14, pulse = false) {
    const anim = pulse ? 'animation:mapPulse 1.5s infinite' : '';
    return L.divIcon({
      html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:2px solid rgba(255,255,255,.8);box-shadow:0 0 10px ${color}cc;${anim}"></div>`,
      iconSize: [size, size], className: ''
    });
  },

  // Build all context overlays relative to the current anchor. Idempotent-ish:
  // called once on first GPS fix (or on fallback). Guarded by _overlayBuilt.
  _buildOverlay() {
    if (this._overlayBuilt) return;
    this._overlayBuilt = true;
    this._addIncidentMarkers();
    this._addGuardMarkers();
    this._addZoneCircles();
    this._addSafeRoutes();
    this._syncLiveEvents();
  },

  // Default demo anchor — deltas are computed from this so the spatial layout
  // is preserved when re-anchored onto the user's real position anywhere on Earth.
  _DEF: [28.6139, 77.2090],
  _off(lat, lng) { return this._rel(lat - this._DEF[0], lng - this._DEF[1]); },

  _addIncidentMarkers() {
    DATA.incidents.filter(i => i.status !== 'Resolved').forEach(i => {
      const color = UI.sevColor(i.sev);
      const size = i.sev === 'critical' ? 20 : i.sev === 'high' ? 16 : 13;
      const [ilat, ilng] = this._off(i.lat, i.lng);
      L.marker([ilat, ilng], { icon: this._mk(color, size, i.sev === 'critical') })
        .addTo(this._map)
        .bindPopup(`<div style="font-family:system-ui;min-width:180px">
          <div style="font-weight:700;color:${color};font-size:.9rem;margin-bottom:4px">${i.type}</div>
          <div style="font-size:.8rem;margin-bottom:2px">📍 ${i.loc}</div>
          <div style="font-size:.75rem;color:#666">${i.reporter} · ${i.time}</div>
          <div style="margin-top:6px;padding:3px 8px;background:${color}22;border-radius:8px;font-size:.72rem;font-weight:700;color:${color};display:inline-block">${i.sev.toUpperCase()}</div>
        </div>`, { maxWidth: 220 });
      if (i.sev === 'critical') {
        L.circle([ilat, ilng], { color, fillColor: color, fillOpacity: .06, radius: 90, weight: 1.5, dashArray: '6 4' }).addTo(this._map);
      }
    });
  },

  _addGuardMarkers() {
    DATA.guards.forEach(g => {
      const color = g.status === 'Available' ? '#10b981' : g.status === 'Dispatched' ? '#ef4444' : '#f59e0b';
      const [glat, glng] = this._off(g.lat, g.lng);
      L.marker([glat, glng], { icon: this._mk(color, 12) })
        .addTo(this._map)
        .bindPopup(`<div style="font-family:system-ui;min-width:160px">
          <div style="font-weight:700;color:${color};font-size:.88rem">🛡 ${g.name}</div>
          <div style="font-size:.78rem;margin-top:3px">Zone: ${g.zone}</div>
          <div style="font-size:.72rem;color:#666;margin-top:2px">${g.status}</div>
        </div>`);
    });
  },

  _addZoneCircles() {
    [
      { lat: 28.6150, lng: 77.2078, label: 'Parking Lot A', sub: 'HIGH risk · Harassment reported', color: '#ef4444', r: 75 },
      { lat: 28.6132, lng: 77.2085, label: 'Hostel 3 Corridor', sub: 'Ragging incident 14min ago', color: '#f59e0b', r: 65 },
      { lat: 28.6128, lng: 77.2092, label: 'Back Gate Road', sub: 'Poor lighting · Isolated', color: '#f59e0b', r: 55 },
    ].forEach(z => {
      const [zlat, zlng] = this._off(z.lat, z.lng);
      L.circle([zlat, zlng], { color: z.color, fillColor: z.color, fillOpacity: .08, radius: z.r, weight: 1.5, dashArray: '5 4' })
        .addTo(this._map)
        .bindPopup(`<div style="font-family:system-ui"><b style="color:${z.color}">⚠️ ${z.label}</b><br><span style="font-size:.78rem">${z.sub}</span></div>`);
    });
  },

  _addSafeRoutes() {
    const route = [[28.6122,77.2072],[28.6128,77.2080],[28.6135,77.2090],[28.6140,77.2100],[28.6145,77.2108]]
      .map(([la,ln]) => this._off(la, ln));
    L.polyline(route, { color: '#06b6d4', weight: 3, opacity: .75, dashArray: '8 5' })
      .addTo(this._map)
      .bindPopup('<div style="font-family:system-ui"><b style="color:#06b6d4">✅ Safe Route</b><br><span style="font-size:.78rem">Well-lit · Patrolled · Recommended</span></div>');
  },

  // ── OSM Nominatim reverse geocoding (real address for live coords) ──
  async _reverseGeocode(lat, lng) {
    const addrEl = document.getElementById('map-addr');
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=17&addressdetails=1`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!r.ok) throw new Error('geocode failed');
      const j = await r.json();
      this._placeName = j.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      if (addrEl) addrEl.innerHTML = `📍 <b>${this._placeName}</b>`;
      if (this._meMarker) this._meMarker.setPopupContent(`<b style="color:#06b6d4">📍 You are here</b><br><span style="font-size:.75rem">${this._placeName}</span>`);
    } catch (e) {
      this._placeName = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      if (addrEl) addrEl.innerHTML = `📍 Live position · ${this._placeName}`;
    }
  },

  // ── Gemini live safety brief for the real surrounding area ──
  async _geminiSafetyBrief(lat, lng) {
    if (this._briefDone || typeof AI === 'undefined') return;
    this._briefDone = true;
    const riskEl = document.getElementById('map-risk');
    if (riskEl) riskEl.innerHTML = `<div style="font-size:.8rem;color:var(--text2)"><i class="fas fa-spinner fa-spin"></i> Gemini analyzing your surroundings…</div>`;
    const place = this._placeName || `coordinates ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const prompt = `You are a campus safety analyst. A student is currently at: ${place} (lat ${lat}, lng ${lng}).
Give a concise real-time personal-safety brief for THIS location. Respond in plain text, max 5 short lines:
1) Area type (residential / commercial / isolated / busy).
2) Time-of-day risk right now (it is ${new Date().toLocaleTimeString()}).
3) One practical safety tip for someone walking here alone.
4) Overall risk word: LOW, MEDIUM, or HIGH.
Do not use markdown headers.`;
    const sim = `Area appears moderately populated. Stay on lit main paths after dark.\nKeep your live location shared with a trusted contact.\nOverall risk: MEDIUM`;
    const text = await AI.analyzeText(prompt, sim);
    if (!riskEl) return;
    const m = (text.match(/\b(LOW|MEDIUM|HIGH)\b/i) || [])[1];
    const level = (m || 'MEDIUM').toUpperCase();
    const color = level === 'HIGH' ? '#ef4444' : level === 'MEDIUM' ? '#f59e0b' : '#10b981';
    riskEl.innerHTML = `
      <div style="font-size:.75rem;color:var(--text2);margin-bottom:8px">✨ Gemini live area brief · your location</div>
      <div style="display:inline-block;font-size:.72rem;font-weight:700;color:${color};background:${color}18;padding:3px 10px;border-radius:20px;margin-bottom:8px">Risk: ${level}</div>
      <div style="font-size:.82rem;line-height:1.5;white-space:pre-wrap;color:var(--text)">${text.replace(/</g,'&lt;')}</div>`;
  },

  // ── Live Store events → map pins (reports / SOS in real time) ──
  _syncLiveEvents() {
    if (!this._map || typeof Store === 'undefined') return;
    Store.active().forEach(e => {
      if (this._liveMarkers[e.id]) return;
      // If the event has its own coords use them, else drop near the user's anchor.
      const jitter = () => (Math.random() - 0.5) * 0.0016;
      const lat = e.lat || (this._anchor[0] + jitter());
      const lng = e.lng || (this._anchor[1] + jitter());
      const color = UI.sevColor(e.sev || 'high');
      const size = (e.sev === 'critical') ? 20 : 16;
      const icons = { sos:'🚨', report:'⚠️', voice:'🎙', wellness:'💙' };
      const m = L.marker([lat, lng], { icon: this._mk(color, size, true), zIndexOffset: 800 })
        .addTo(this._map)
        .bindPopup(`<div style="font-family:system-ui;min-width:180px">
          <div style="font-weight:700;color:${color}">${icons[e.channel]||'🔔'} ${e.type || 'Live Report'}</div>
          <div style="font-size:.78rem;margin-top:3px">📍 ${e.loc || 'Near your location'}</div>
          <div style="font-size:.72rem;color:#666;margin-top:2px">${e.reporter} · LIVE</div>
        </div>`);
      this._liveMarkers[e.id] = m;
      m.openPopup();
    });
    this.renderSidePanels();
  },

  toggleHeatmap() {
    this._heatmapOn = !this._heatmapOn;
    const btn = document.getElementById('heatmap-btn');
    if (this._heatmapOn) {
      [[28.6150,77.2078,90],[28.6132,77.2085,75],[28.6145,77.2095,95],[28.6128,77.2092,55],[28.6140,77.2100,40],[28.6155,77.2088,65]]
        .forEach(([lat,lng,intensity]) => {
          const c = intensity > 80 ? '#ef4444' : intensity > 60 ? '#f59e0b' : '#3b82f6';
          const [hlat,hlng] = this._off(lat,lng);
          this._heatCircles.push(L.circle([hlat,hlng],{color:'transparent',fillColor:c,fillOpacity:.22,radius:intensity*1.4}).addTo(this._map));
        });
      if (btn) { btn.innerHTML='<i class="fas fa-fire" style="color:#ef4444"></i> Hide Heatmap'; btn.style.borderColor='#ef4444'; }
      UI.showToast('Risk Heatmap ON','AI-predicted danger zones from Risk Prediction Agent.');
    } else {
      this._heatCircles.forEach(c => this._map.removeLayer(c));
      this._heatCircles = [];
      if (btn) { btn.innerHTML='<i class="fas fa-fire"></i> Risk Heatmap'; btn.style.borderColor=''; }
      UI.showToast('Risk Heatmap OFF','Heatmap hidden.');
    }
  },

  toggleClusters() {
    UI.showToast('Cluster View','3 incident clusters: Hostel Zone (4), Parking (2), Gate Area (1).');
  },

  planRoute() {
    const dest = document.getElementById('map-dest').value || 'Library';
    if (this._routeLine) this._map.removeLayer(this._routeLine);
    // Start from the user's live position and walk outward toward a nearby destination.
    const [a, b] = this._anchor;
    const route = [[a,b],[a-0.0006,b+0.0005],[a-0.0011,b+0.0012],[a-0.0017,b+0.0020]];
    this._routeLine = L.polyline(route,{color:'#10b981',weight:4,opacity:.85}).addTo(this._map);
    this._map.fitBounds(this._routeLine.getBounds(),{padding:[40,40]});
    document.getElementById('map-route-result').innerHTML = `
    <div style="background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.25);border-radius:10px;padding:12px;font-size:.82rem">
      <div style="color:#34d399;font-weight:700;margin-bottom:5px">✅ Safe Route to ${dest}</div>
      Distance: 1.1 km · ETA: ~13 min · Safety Score: 94/100<br>
      <span style="color:#f87171">Avoid:</span> Parking Lot A (incident 1hr ago)
    </div>`;
    UI.showToast('Safe Route',`Route to ${dest} plotted on map.`);
  },

  refresh() {
    if (this._meMarker) this._map.setView(this._anchor, 17);
    this._syncLiveEvents();
    UI.showToast('Map Refreshed','Re-centered on your live position · guard + incident markers updated.');
    this.renderSidePanels();
  },

  sosAll() {
    UI.showToast('📢 Campus Alert Broadcast','All guards + wardens notified. CCTV activated campus-wide.','alert');
  },

  renderSidePanels() {
    const inc = document.getElementById('map-incidents');
    if (inc) {
      // Live Store events first (real reports/SOS), then seed demo incidents.
      const live = (typeof Store !== 'undefined' ? Store.active() : []).map(e => ({
        type: e.type || 'Live Report', loc: e.loc || 'Near your location', sev: e.sev || 'high',
        lat: this._liveMarkers[e.id] ? this._liveMarkers[e.id].getLatLng().lat : this._anchor[0],
        lng: this._liveMarkers[e.id] ? this._liveMarkers[e.id].getLatLng().lng : this._anchor[1],
        _live: true
      }));
      const seed = DATA.incidents.filter(i => i.status !== 'Resolved').map(i => {
        const [la, ln] = this._off(i.lat, i.lng); return { type:i.type, loc:i.loc, sev:i.sev, lat:la, lng:ln };
      });
      const rows = live.concat(seed);
      inc.innerHTML = rows.map(i => `
        <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);cursor:pointer"
          onclick="CampusMap._map&&CampusMap._map.setView([${i.lat},${i.lng}],18)">
          <div style="width:8px;height:8px;border-radius:50%;background:${UI.sevColor(i.sev)};flex-shrink:0;box-shadow:0 0 5px ${UI.sevColor(i.sev)}"></div>
          <div style="flex:1;min-width:0">
            <div style="font-size:.83rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${i._live?'🔴 ':''}${i.type}</div>
            <div style="font-size:.73rem;color:var(--text2)">${i.loc}</div>
          </div>
          ${UI.pill(i.sev)}
        </div>`).join('') || '<div style="color:var(--text2);font-size:.82rem;padding:10px 0">No active incidents</div>';
    }
    const grd = document.getElementById('map-guards');
    if (grd) {
      grd.innerHTML = DATA.guards.map(g => {
        const color = g.status === 'Available' ? '#10b981' : g.status === 'Dispatched' ? '#ef4444' : '#f59e0b';
        const [glat, glng] = this._off(g.lat, g.lng);
        return `
        <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);cursor:pointer"
          onclick="CampusMap._map&&CampusMap._map.setView([${glat},${glng}],18)">
          <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></div>
          <div style="flex:1"><div style="font-size:.83rem;font-weight:600">${g.name}</div><div style="font-size:.73rem;color:var(--text2)">${g.zone}</div></div>
          <span class="pill ${g.status==='Available'?'low':g.status==='Dispatched'?'critical':'high'}" style="font-size:.65rem">${g.status}</span>
        </div>`;
      }).join('');
    }
    // Skip the static risk list once Gemini's live area brief owns this panel.
    const risk = this._briefDone ? null : document.getElementById('map-risk');
    if (risk) {
      risk.innerHTML = `<div style="font-size:.78rem;color:var(--text2);margin-bottom:10px">Risk Prediction Agent · Updated just now</div>` +
        [{zone:'Parking Lot A',score:90,color:'#ef4444'},{zone:'Hostel 3 Corridor',score:75,color:'#f59e0b'},
         {zone:'Back Gate Road',score:60,color:'#f59e0b'},{zone:'Library Zone',score:35,color:'#3b82f6'},
         {zone:'Admin Block',score:15,color:'#10b981'}].map(r => `
          <div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:4px">
              <span>${r.zone}</span><span style="color:${r.color};font-weight:700">${r.score}/100</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${r.score}%;background:${r.color}"></div></div>
          </div>`).join('');
    }
  }
};
