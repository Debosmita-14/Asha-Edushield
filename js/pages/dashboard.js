// ── Pages namespace (initialized here, extended by other page files) ──
var Pages = Pages || {};

Pages.dashboard = function (el) {
  const role = App.currentRole;
  if (role === 'security') { Pages._securityDash(el); return; }
  if (role === 'admin')    { Pages._adminDash(el);    return; }

  // Student / Faculty shared dashboard
  el.innerHTML = `
  <div class="stat-grid">
    <div class="stat-card red animate-in"><div class="stat-label">Active Incidents</div><div class="stat-value" style="color:#f87171">7</div><div class="stat-change down">↑ 2 from yesterday</div><i class="fas fa-exclamation-triangle stat-icon" style="color:#ef4444"></i></div>
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

  document.getElementById('live-feed').innerHTML = DATA.incidents.slice(0,5).map(i=>`
    <div class="incident-item" style="border-left-color:${UI.sevColor(i.sev)}">
      <div class="incident-icon" style="background:${UI.sevColor(i.sev)}22;color:${UI.sevColor(i.sev)}"><i class="fas ${Pages._typeIcon(i.type)}"></i></div>
      <div class="incident-body"><div class="incident-title">${i.type} — ${i.loc}</div><div class="incident-meta">${i.reporter} · ${i.time}</div></div>
      ${UI.pill(i.sev)}
    </div>`).join('');

  UI.makeChart('trendChart','line',['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],[
    {label:'Reported',data:[8,12,6,15,9,4,7],borderColor:'#ef4444',backgroundColor:'rgba(239,68,68,.1)',tension:.4,fill:true},
    {label:'Resolved',data:[7,11,6,13,9,4,6],borderColor:'#10b981',backgroundColor:'rgba(16,185,129,.1)',tension:.4,fill:true}
  ]);
  UI.makeChart('pieChart','doughnut',['SOS','Ragging','Harassment','Bullying','Mental Health','Other'],[
    {data:[18,24,19,14,16,9],backgroundColor:['#ef4444','#8b5cf6','#f59e0b','#3b82f6','#10b981','#64748b'],borderWidth:0}
  ],{plugins:{legend:{position:'right',labels:{color:'#94a3b8',font:{size:11},padding:12}}},cutout:'65%',scales:{}});

  document.getElementById('agent-activity').innerHTML = DATA.agents.filter(a=>a.status==='active').slice(0,6).map(a=>`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:10px"><span style="font-size:1.1rem">${a.icon}</span><span style="font-size:.85rem">${a.name}</span></div>
      <div style="display:flex;align-items:center;gap:10px"><span style="font-size:.75rem;color:var(--text2)">${a.tasks} tasks</span><span class="pill low"><span class="live-dot"></span> active</span></div>
    </div>`).join('');
};

// ── SECURITY DASHBOARD ──────────────────────────────────────────────────────
Pages._securityDash = function (el) {
  el.innerHTML = `
  <div class="stat-grid">
    <div class="stat-card red animate-in"><div class="stat-label">Active Emergencies</div><div class="stat-value" style="color:#f87171">2</div><div class="stat-change down">Require immediate response</div><i class="fas fa-bolt stat-icon" style="color:#ef4444"></i></div>
    <div class="stat-card green animate-in"><div class="stat-label">Guards On Duty</div><div class="stat-value" style="color:#34d399">8</div><div class="stat-change up">3 available now</div><i class="fas fa-shield-alt stat-icon" style="color:#10b981"></i></div>
    <div class="stat-card yellow animate-in"><div class="stat-label">Avg Response Time</div><div class="stat-value" style="color:#fbbf24">4.2m</div><div class="stat-change up">↓ Below 5m SLA</div><i class="fas fa-clock stat-icon" style="color:#f59e0b"></i></div>
    <div class="stat-card blue animate-in"><div class="stat-label">Patrols Completed</div><div class="stat-value" style="color:#60a5fa">14</div><div class="stat-change up">Today</div><i class="fas fa-route stat-icon" style="color:#3b82f6"></i></div>
  </div>
  <div class="card" style="border-color:rgba(239,68,68,.3)">
    <div class="card-title">🔴 Live Incoming Alerts <span class="pill critical"><span class="live-dot red"></span> Real-time</span></div>
    <div id="sec-live-events"><div style="font-size:.82rem;color:var(--text2);padding:8px 0">No live alerts. Incoming student SOS / reports / voice evidence appear here instantly.</div></div>
  </div>
  <div class="two-col">
    <div class="card">
      <div class="card-title">🚨 Live SOS & Emergency Queue</div>
      <div id="sec-sos-queue"></div>
      <button class="btn sm danger" style="margin-top:12px;width:100%" onclick="App.navigate('dispatch')"><i class="fas fa-bolt"></i> Open Full Dispatch Console</button>
    </div>
    <div class="card">
      <div class="card-title">🛡 Guard Status Board</div>
      <div id="sec-guard-board"></div>
    </div>
  </div>
  <div class="two-col">
    <div class="card">
      <div class="card-title">📍 Patrol Schedule — Today</div>
      <div id="sec-patrol"></div>
    </div>
    <div class="card">
      <div class="card-title">⚡ Response Time Trend</div>
      <canvas id="sec-resp-chart" height="200"></canvas>
    </div>
  </div>`;

  // SOS queue
  document.getElementById('sec-sos-queue').innerHTML = DATA.incidents.filter(i=>i.status==='Active'||i.status==='Investigating').map(i=>`
    <div class="incident-item" style="border-left-color:${UI.sevColor(i.sev)}">
      <div class="incident-icon" style="background:${UI.sevColor(i.sev)}22;color:${UI.sevColor(i.sev)}"><i class="fas fa-bolt"></i></div>
      <div class="incident-body"><div class="incident-title">${i.type} — ${i.loc}</div><div class="incident-meta">${i.reporter} · ${i.time}</div></div>
      <div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end">
        ${UI.pill(i.sev)}
        <button class="btn sm ghost" onclick="UI.showToast('Responding','Guard dispatched to ${i.id}','alert')" style="font-size:.7rem;padding:4px 10px">Respond</button>
      </div>
    </div>`).join('');

  // Guard board
  document.getElementById('sec-guard-board').innerHTML = DATA.guards.map(g=>`
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="width:9px;height:9px;border-radius:50%;background:${g.status==='Available'?'#10b981':g.status==='Dispatched'?'#ef4444':'#f59e0b'};flex-shrink:0"></div>
      <div style="flex:1"><div style="font-size:.85rem;font-weight:600">${g.name}</div><div style="font-size:.73rem;color:var(--text2)">${g.zone}</div></div>
      <span class="pill ${g.status==='Available'?'low':g.status==='Dispatched'?'critical':'high'}" style="font-size:.65rem">${g.status}</span>
      ${g.status==='Available'?`<button class="btn sm" style="padding:4px 10px;font-size:.7rem" onclick="UI.showToast('Dispatched','${g.name} sent to active incident.','alert')"><i class="fas fa-paper-plane"></i></button>`:''}
    </div>`).join('');

  // Patrol schedule
  const patrols = [
    {guard:'Amit S.',zone:'Block A-C',time:'08:00–10:00',status:'done'},
    {guard:'Pradeep R.',zone:'Hostel Zone',time:'10:00–12:00',status:'active'},
    {guard:'Mohan L.',zone:'Gate 1-2',time:'12:00–14:00',status:'upcoming'},
    {guard:'Sunil T.',zone:'Parking',time:'14:00–16:00',status:'upcoming'},
    {guard:'Ramesh P.',zone:'Admin Block',time:'16:00–18:00',status:'upcoming'},
  ];
  document.getElementById('sec-patrol').innerHTML = patrols.map(p=>`
    <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="width:8px;height:8px;border-radius:50%;background:${p.status==='done'?'#64748b':p.status==='active'?'#10b981':'#1e293b'};flex-shrink:0"></div>
      <div style="flex:1"><div style="font-size:.84rem;font-weight:600">${p.guard}</div><div style="font-size:.73rem;color:var(--text2)">${p.zone}</div></div>
      <div style="font-size:.75rem;color:var(--text2)">${p.time}</div>
      <span class="pill ${p.status==='done'?'resolved':p.status==='active'?'low':'medium'}" style="font-size:.65rem">${p.status}</span>
    </div>`).join('');

  UI.makeChart('sec-resp-chart','line',['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],[
    {label:'Response Time (min)',data:[6.2,5.8,4.9,5.1,4.2,3.8,4.2],borderColor:'#f59e0b',backgroundColor:'rgba(245,158,11,.1)',tension:.4,fill:true}
  ],{scales:{x:{ticks:{color:'#94a3b8'},grid:{color:'#1e293b'}},y:{ticks:{color:'#94a3b8'},grid:{color:'#1e293b'},min:0,max:10}}});

  // Live events — subscribe to the store for real-time incoming alerts
  Pages._renderLiveEvents('sec-live-events');
  Pages._liveUnsub = Store.subscribe(() => Pages._renderLiveEvents('sec-live-events'));
};

// Shared live-events renderer (security + admin)
Pages._renderLiveEvents = function (containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const events = Store.all();
  if (!events.length) {
    el.innerHTML = `<div style="font-size:.82rem;color:var(--text2);padding:8px 0">No live alerts yet. Incoming student SOS / reports / voice evidence appear here instantly.</div>`;
    return;
  }
  el.innerHTML = events.slice(0, 6).map(e => {
    const last = e.responses[e.responses.length - 1];
    const chanIcon = { sos:'🚨', report:'⚠️', voice:'🎙', wellness:'💙' }[e.channel] || '🔔';
    return `
    <div class="incident-item animate-in" style="border-left-color:${UI.sevColor(e.sev)};flex-wrap:wrap">
      <div class="incident-icon" style="background:${UI.sevColor(e.sev)}22;color:${UI.sevColor(e.sev)}">${chanIcon}</div>
      <div class="incident-body">
        <div class="incident-title">${e.type} — ${e.loc}</div>
        <div class="incident-meta">${e.reporter} · ${new Date(e.ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} · ${e.id}</div>
        ${e.summary ? `<div style="font-size:.76rem;color:var(--text2);margin-top:5px;line-height:1.5"><i class="fas fa-robot" style="color:#a78bfa;margin-right:4px"></i>${e.summary}</div>` : ''}
        ${last ? `<div style="font-size:.74rem;color:#34d399;margin-top:5px"><i class="fas fa-arrow-right" style="margin-right:4px"></i><strong>${last.from}:</strong> ${last.msg}</div>` : `<div style="font-size:.74rem;color:#fbbf24;margin-top:5px"><i class="fas fa-spinner fa-spin"></i> AI agents processing...</div>`}
      </div>
      <div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end">
        ${UI.pill(e.sev)}
        <span class="pill ${e.status==='Resolved'?'resolved':'medium'}" style="font-size:.62rem">${e.status}</span>
        ${e.audioUrl ? `<button class="btn sm ghost" style="font-size:.65rem;padding:3px 8px" onclick="Pages._playEvidence('${e.id}')"><i class="fas fa-play"></i> Audio</button>` : ''}
        ${e.status!=='Resolved' ? `<button class="btn sm" style="font-size:.65rem;padding:3px 8px" onclick="Store.setStatus('${e.id}','Resolved');UI.showToast('Resolved','${e.id} marked resolved.','alert')">Resolve</button>` : ''}
      </div>
    </div>`;
  }).join('');
};

Pages._playEvidence = function (id) {
  const e = Store.find(id);
  if (e && e.audioUrl) new Audio(e.audioUrl).play();
  else UI.showToast('Audio', 'Evidence audio not available in this session.', 'warning');
};

// ── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
Pages._adminDash = function (el) {
  el.innerHTML = `
  <div class="stat-grid">
    <div class="stat-card purple animate-in"><div class="stat-label">Campus Safety Score</div><div class="stat-value" style="color:#c084fc">87</div><div class="stat-change up">↑ 3 this week</div><i class="fas fa-chart-line stat-icon" style="color:#8b5cf6"></i></div>
    <div class="stat-card blue animate-in"><div class="stat-label">AI Agents Running</div><div class="stat-value" style="color:#60a5fa">13/15</div><div class="stat-change up">99.2% uptime</div><i class="fas fa-robot stat-icon" style="color:#3b82f6"></i></div>
    <div class="stat-card green animate-in"><div class="stat-label">Compliance Score</div><div class="stat-value" style="color:#34d399">96%</div><div class="stat-change up">UGC/NAAC ready</div><i class="fas fa-certificate stat-icon" style="color:#10b981"></i></div>
    <div class="stat-card yellow animate-in"><div class="stat-label">Pending Actions</div><div class="stat-value" style="color:#fbbf24">5</div><div class="stat-change down">Require admin review</div><i class="fas fa-tasks stat-icon" style="color:#f59e0b"></i></div>
  </div>
  <div class="card" style="border-color:rgba(239,68,68,.3)">
    <div class="card-title">🔴 Live Incoming Alerts <span class="pill critical"><span class="live-dot red"></span> Real-time</span></div>
    <div id="adm-live-events"></div>
  </div>
  <div class="three-col">
    <div class="card">
      <div class="card-title">📊 Safety Scores by Domain</div>
      <div id="adm-scores"></div>
    </div>
    <div class="card">
      <div class="card-title">🤖 AI System Health</div>
      <div id="adm-agents"></div>
    </div>
    <div class="card">
      <div class="card-title">📋 Pending Admin Actions</div>
      <div id="adm-actions"></div>
    </div>
  </div>
  <div class="two-col">
    <div class="card">
      <div class="card-title">📈 30-Day Incident Trend</div>
      <canvas id="adm-trend" height="200"></canvas>
    </div>
    <div class="card">
      <div class="card-title">🏙 Tech Stack Health</div>
      <div id="adm-stack"></div>
    </div>
  </div>`;

  // Safety scores
  document.getElementById('adm-scores').innerHTML = [
    {label:'Women Safety',score:87,color:'#ec4899'},
    {label:'Anti-Ragging',score:91,color:'#8b5cf6'},
    {label:'Mental Health',score:78,color:'#10b981'},
    {label:'Exam Integrity',score:95,color:'#3b82f6'},
    {label:'Physical Safety',score:83,color:'#f59e0b'},
  ].map(s=>`
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:4px">
        <span>${s.label}</span><span style="color:${s.color};font-weight:700">${s.score}/100</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${s.score}%;background:${s.color}"></div></div>
    </div>`).join('');

  // AI system health
  document.getElementById('adm-agents').innerHTML = DATA.agents.map(a=>`
    <div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)">
      <span style="font-size:.95rem">${a.icon}</span>
      <div style="flex:1;min-width:0"><div style="font-size:.8rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.name}</div></div>
      <span style="font-size:.68rem;color:var(--text2)">${a.tasks}t</span>
      <span class="pill ${a.status==='active'?'low':'resolved'}" style="font-size:.62rem">${a.status}</span>
    </div>`).join('');

  // Pending actions
  const actions = [
    {text:'INC-4820 Ragging — Committee review required',sev:'high'},
    {text:'3 students flagged for wellness follow-up',sev:'medium'},
    {text:'Exam malpractice report — Roll #2341',sev:'high'},
    {text:'UGC compliance report due in 3 days',sev:'medium'},
    {text:'Guard patrol schedule update needed',sev:'low'},
  ];
  document.getElementById('adm-actions').innerHTML = actions.map(a=>`
    <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="width:7px;height:7px;border-radius:50%;background:${UI.sevColor(a.sev)};flex-shrink:0;margin-top:5px"></div>
      <div style="flex:1;font-size:.8rem;line-height:1.5">${a.text}</div>
      <button class="btn sm ghost" style="font-size:.65rem;padding:3px 8px" onclick="UI.showToast('Action Taken','Marked as reviewed.')">Done</button>
    </div>`).join('');

  UI.makeChart('adm-trend','bar',['W1','W2','W3','W4','W5'],[
    {label:'Incidents',data:[42,38,31,27,19],backgroundColor:'rgba(239,68,68,.7)',borderRadius:6},
    {label:'Resolved',data:[40,37,30,27,18],backgroundColor:'rgba(16,185,129,.7)',borderRadius:6}
  ]);

  // Stack health
  document.getElementById('adm-stack').innerHTML = [
    {name:'MongoDB Atlas',icon:'🍃',status:'Connected',color:'#10b981',detail:'4,821 docs · 12ms latency'},
    {name:'DigitalOcean',icon:'🌊',status:'Running',color:'#0080ff',detail:'2 Droplets · 99.9% uptime'},
    {name:'Solana',icon:'◎',status:'Active',color:'#9945ff',detail:'847 evidence NFTs minted'},
    {name:'ElevenLabs',icon:'🔊',status:'Ready',color:'#f59e0b',detail:'8 languages · 234 calls today'},
    {name:'Gemini API',icon:'✨',status:'Active',color:'#4285f4',detail:'7,241 calls · Vision + Pro'},
    {name:'Actian Vector DB',icon:'🗄',status:'Synced',color:'#06b6d4',detail:'16,000+ embeddings indexed'},
  ].map(t=>`
    <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)">
      <span style="font-size:1.1rem">${t.icon}</span>
      <div style="flex:1"><div style="font-size:.83rem;font-weight:600">${t.name}</div><div style="font-size:.72rem;color:var(--text2)">${t.detail}</div></div>
      <span style="font-size:.68rem;font-weight:700;color:${t.color};background:${t.color}18;padding:2px 8px;border-radius:20px">${t.status}</span>
    </div>`).join('');

  // Live events — real-time incoming alerts for admin
  Pages._renderLiveEvents('adm-live-events');
  Pages._liveUnsub = Store.subscribe(() => Pages._renderLiveEvents('adm-live-events'));
};

Pages._typeIcon = function (type) {
  return {'SOS':'fa-exclamation-circle','Ragging':'fa-user-slash','Mental Health':'fa-brain','Harassment':'fa-shield-alt','Bullying':'fa-fist-raised'}[type]||'fa-flag';
};
