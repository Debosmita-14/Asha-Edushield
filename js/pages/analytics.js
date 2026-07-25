// js/pages/analytics.js
var Pages = Pages || {};

Pages.analytics = function (el) {
  el.innerHTML = `
  <div class="stat-grid">
    <div class="stat-card blue animate-in"><div class="stat-label">Total Incidents (30d)</div><div class="stat-value" style="color:#60a5fa">184</div><div class="stat-change down">↓ 12% vs last month</div><i class="fas fa-chart-bar stat-icon" style="color:#3b82f6"></i></div>
    <div class="stat-card green animate-in"><div class="stat-label">Resolution Rate</div><div class="stat-value" style="color:#34d399">94%</div><div class="stat-change up">↑ 3% improvement</div><i class="fas fa-check-circle stat-icon" style="color:#10b981"></i></div>
    <div class="stat-card yellow animate-in"><div class="stat-label">Avg Response Time</div><div class="stat-value" style="color:#fbbf24">4.2m</div><div class="stat-change up">↓ 1.8m faster</div><i class="fas fa-clock stat-icon" style="color:#f59e0b"></i></div>
    <div class="stat-card red animate-in"><div class="stat-label">High-Risk Students</div><div class="stat-value" style="color:#f87171">12</div><div class="stat-change down">Under monitoring</div><i class="fas fa-user-shield stat-icon" style="color:#ef4444"></i></div>
  </div>
  <div class="two-col">
    <div class="card"><div class="card-title">Monthly Incident Trend</div><canvas id="monthChart" height="200"></canvas></div>
    <div class="card"><div class="card-title">Incident Type Distribution</div><canvas id="typeChart" height="200"></canvas></div>
  </div>
  <div class="card">
    <div class="card-title">Campus Safety Scores — AI Assessment</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
      ${[
        {label:'Women Safety',   score:87, color:'#ec4899'},
        {label:'Anti-Ragging',   score:91, color:'#8b5cf6'},
        {label:'Mental Health',  score:78, color:'#10b981'},
        {label:'Exam Integrity', score:95, color:'#3b82f6'},
      ].map(s => `
        <div style="text-align:center;padding:18px;background:var(--bg3);border-radius:14px">
          <div style="font-size:2.2rem;font-weight:900;color:${s.color}">${s.score}</div>
          <div style="font-size:.78rem;color:var(--text2);margin-top:4px">${s.label}</div>
          <div class="progress-bar" style="margin-top:10px">
            <div class="progress-fill" style="width:${s.score}%;background:${s.color}"></div>
          </div>
        </div>`).join('')}
    </div>
  </div>
  <div class="two-col">
    <div class="card">
      <div class="card-title">Actian Vector DB — Knowledge Base Stats</div>
      ${[
        {label:'Incident Embeddings',  val:'4,821', icon:'🗄'},
        {label:'Evidence Embeddings',  val:'12,340', icon:'📎'},
        {label:'Offender Profiles',    val:'89', icon:'👤'},
        {label:'Wellness Sessions',    val:'2,156', icon:'🧠'},
        {label:'Avg Query Latency',    val:'12ms', icon:'⚡'},
        {label:'Hybrid Search Queries',val:'847 today', icon:'🔍'},
      ].map(r => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:.85rem">${r.icon} ${r.label}</span>
          <span style="font-weight:700;color:var(--accent2);font-size:.88rem">${r.val}</span>
        </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-title">Gemini API Usage Today</div>
      ${[
        {label:'Gemini Pro — Incident Analysis',  val:'234 calls', color:'#3b82f6'},
        {label:'Gemini Flash — NLP Scoring',      val:'1,847 calls', color:'#10b981'},
        {label:'Gemini Vision — Exam Proctor',    val:'4,320 frames', color:'#8b5cf6'},
        {label:'Gemini Vision — Classroom',       val:'2,160 frames', color:'#f59e0b'},
        {label:'Gemini Vision — CCTV Analysis',   val:'890 frames', color:'#ef4444'},
        {label:'Multimodal — Evidence Analysis',  val:'67 calls', color:'#ec4899'},
      ].map(r => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:.85rem">${r.label}</span>
          <span style="font-weight:700;font-size:.85rem;color:${r.color}">${r.val}</span>
        </div>`).join('')}
    </div>
  </div>`;

  UI.makeChart('monthChart', 'bar',
    ['Jan','Feb','Mar','Apr','May','Jun','Jul'],
    [
      {label:'Incidents', data:[32,28,41,35,22,19,7], backgroundColor:'rgba(239,68,68,.7)', borderRadius:6},
      {label:'Resolved',  data:[30,27,39,34,22,18,6], backgroundColor:'rgba(16,185,129,.7)', borderRadius:6}
    ]
  );

  UI.makeChart('typeChart', 'doughnut',
    ['Ragging','SOS','Harassment','Bullying','Mental Health','Other'],
    [{data:[28,18,22,16,12,8], backgroundColor:['#8b5cf6','#ef4444','#f59e0b','#3b82f6','#10b981','#64748b'], borderWidth:0}],
    { plugins:{legend:{position:'right',labels:{color:'#94a3b8',font:{size:11},padding:12}}}, cutout:'65%', scales:{} }
  );
};
