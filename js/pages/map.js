// js/pages/map.js
var Pages = Pages || {};

Pages.map = function (el) {
  el.innerHTML = `
  <div class="card" style="padding:0;overflow:hidden">
    <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
      <div>
        <div style="font-weight:700">Campus Safety Map — Live Digital Twin</div>
        <div style="font-size:.75rem;color:var(--text2);margin-top:2px">OpenStreetMap · Leaflet · Real-time incident overlay</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
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
      <span style="margin-left:auto;font-size:.72rem;color:var(--text2);display:flex;align-items:center;gap:5px"><span class="live-dot"></span> Live · Updated just now</span>
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
      <div class="card-title">🏙 Tech Stack — Live Integrations</div>
      ${[
        {name:'MongoDB Atlas',icon:'🍃',status:'Connected',color:'#10b981',detail:'4,821 incident docs · 12,340 embeddings'},
        {name:'DigitalOcean',icon:'🌊',status:'Running',color:'#0080ff',detail:'2 Droplets · App Platform · Spaces CDN'},
        {name:'Solana',icon:'◎',status:'Active',color:'#9945ff',detail:'Evidence NFTs · Immutable audit trail'},
        {name:'ElevenLabs',icon:'🔊',status:'Ready',color:'#f59e0b',detail:'Multilingual voice · 8 languages'},
        {name:'Gemini API',icon:'✨',status:'Active',color:'#4285f4',detail:'Vision + Pro + Flash · 7,241 calls today'},
      ].map(t => `
        <div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:1.2rem">${t.icon}</span>
          <div style="flex:1">
            <div style="font-size:.85rem;font-weight:600">${t.name}</div>
            <div style="font-size:.72rem;color:var(--text2)">${t.detail}</div>
          </div>
          <span style="font-size:.7rem;font-weight:700;color:${t.color};background:${t.color}18;padding:3px 8px;border-radius:20px">${t.status}</span>
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

  init() {
    const el = document.getElementById('map');
    if (!el || App.mapInstance) return;
    this._map = L.map('map', { zoomControl: true }).setView([28.6139, 77.2090], 17);
    App.mapInstance = this._map;
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd', maxZoom: 20
    }).addTo(this._map);
    this._addIncidentMarkers();
    this._addGuardMarkers();
    this._addZoneCircles();
    this._addSafeRoutes();
  },

  _mk(color, size = 14, pulse = false) {
    const anim = pulse ? 'animation:mapPulse 1.5s infinite' : '';
    return L.divIcon({
      html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:2px solid rgba(255,255,255,.8);box-shadow:0 0 10px ${color}cc;${anim}"></div>`,
      iconSize: [size, size], className: ''
    });
  },

  _addIncidentMarkers() {
    DATA.incidents.filter(i => i.status !== 'Resolved').forEach(i => {
      const color = UI.sevColor(i.sev);
      const size = i.sev === 'critical' ? 20 : i.sev === 'high' ? 16 : 13;
      L.marker([i.lat, i.lng], { icon: this._mk(color, size, i.sev === 'critical') })
        .addTo(this._map)
        .bindPopup(`<div style="font-family:system-ui;min-width:180px">
          <div style="font-weight:700;color:${color};font-size:.9rem;margin-bottom:4px">${i.type}</div>
          <div style="font-size:.8rem;margin-bottom:2px">📍 ${i.loc}</div>
          <div style="font-size:.75rem;color:#666">${i.reporter} · ${i.time}</div>
          <div style="margin-top:6px;padding:3px 8px;background:${color}22;border-radius:8px;font-size:.72rem;font-weight:700;color:${color};display:inline-block">${i.sev.toUpperCase()}</div>
        </div>`, { maxWidth: 220 });
      if (i.sev === 'critical') {
        L.circle([i.lat, i.lng], { color, fillColor: color, fillOpacity: .06, radius: 90, weight: 1.5, dashArray: '6 4' }).addTo(this._map);
      }
    });
  },

  _addGuardMarkers() {
    DATA.guards.forEach(g => {
      const color = g.status === 'Available' ? '#10b981' : g.status === 'Dispatched' ? '#ef4444' : '#f59e0b';
      L.marker([g.lat, g.lng], { icon: this._mk(color, 12) })
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
      L.circle([z.lat, z.lng], { color: z.color, fillColor: z.color, fillOpacity: .08, radius: z.r, weight: 1.5, dashArray: '5 4' })
        .addTo(this._map)
        .bindPopup(`<div style="font-family:system-ui"><b style="color:${z.color}">⚠️ ${z.label}</b><br><span style="font-size:.78rem">${z.sub}</span></div>`);
    });
  },

  _addSafeRoutes() {
    const route = [[28.6122,77.2072],[28.6128,77.2080],[28.6135,77.2090],[28.6140,77.2100],[28.6145,77.2108]];
    L.polyline(route, { color: '#06b6d4', weight: 3, opacity: .75, dashArray: '8 5' })
      .addTo(this._map)
      .bindPopup('<div style="font-family:system-ui"><b style="color:#06b6d4">✅ Safe Route</b><br><span style="font-size:.78rem">Well-lit · Patrolled · Recommended</span></div>');
  },

  toggleHeatmap() {
    this._heatmapOn = !this._heatmapOn;
    const btn = document.getElementById('heatmap-btn');
    if (this._heatmapOn) {
      [[28.6150,77.2078,90],[28.6132,77.2085,75],[28.6145,77.2095,95],[28.6128,77.2092,55],[28.6140,77.2100,40],[28.6155,77.2088,65]]
        .forEach(([lat,lng,intensity]) => {
          const c = intensity > 80 ? '#ef4444' : intensity > 60 ? '#f59e0b' : '#3b82f6';
          this._heatCircles.push(L.circle([lat,lng],{color:'transparent',fillColor:c,fillOpacity:.22,radius:intensity*1.4}).addTo(this._map));
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
    const route = [[28.6139,77.2090],[28.6133,77.2095],[28.6128,77.2102],[28.6122,77.2110]];
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
    UI.showToast('Map Refreshed','All guard positions and incident markers updated.');
    this.renderSidePanels();
  },

  sosAll() {
    UI.showToast('📢 Campus Alert Broadcast','All guards + wardens notified. CCTV activated campus-wide.','alert');
  },

  renderSidePanels() {
    const inc = document.getElementById('map-incidents');
    if (inc) {
      inc.innerHTML = DATA.incidents.filter(i => i.status !== 'Resolved').map(i => `
        <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);cursor:pointer"
          onclick="CampusMap._map&&CampusMap._map.setView([${i.lat},${i.lng}],18)">
          <div style="width:8px;height:8px;border-radius:50%;background:${UI.sevColor(i.sev)};flex-shrink:0;box-shadow:0 0 5px ${UI.sevColor(i.sev)}"></div>
          <div style="flex:1;min-width:0">
            <div style="font-size:.83rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${i.type}</div>
            <div style="font-size:.73rem;color:var(--text2)">${i.loc}</div>
          </div>
          ${UI.pill(i.sev)}
        </div>`).join('') || '<div style="color:var(--text2);font-size:.82rem;padding:10px 0">No active incidents</div>';
    }
    const grd = document.getElementById('map-guards');
    if (grd) {
      grd.innerHTML = DATA.guards.map(g => `
        <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);cursor:pointer"
          onclick="CampusMap._map&&CampusMap._map.setView([${g.lat},${g.lng}],18)">
          <div style="width:8px;height:8px;border-radius:50%;background:${g.status==='Available'?'#10b981':g.status==='Dispatched'?'#ef4444':'#f59e0b'};flex-shrink:0"></div>
          <div style="flex:1"><div style="font-size:.83rem;font-weight:600">${g.name}</div><div style="font-size:.73rem;color:var(--text2)">${g.zone}</div></div>
          <span class="pill ${g.status==='Available'?'low':g.status==='Dispatched'?'critical':'high'}" style="font-size:.65rem">${g.status}</span>
        </div>`).join('');
    }
    const risk = document.getElementById('map-risk');
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
