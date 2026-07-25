// js/pages/exam.js
var Pages = Pages || {};

Pages.exam = function (el) {
  el.innerHTML = `
  <div class="stat-grid">
    <div class="stat-card red animate-in"><div class="stat-label">Alerts Raised</div><div class="stat-value" style="color:#f87171">4</div><div class="stat-change down">This session</div><i class="fas fa-exclamation-triangle stat-icon" style="color:#ef4444"></i></div>
    <div class="stat-card yellow animate-in"><div class="stat-label">Under Watch</div><div class="stat-value" style="color:#fbbf24">3</div><div class="stat-change down">Suspicious behavior</div><i class="fas fa-eye stat-icon" style="color:#f59e0b"></i></div>
    <div class="stat-card green animate-in"><div class="stat-label">Students Clear</div><div class="stat-value" style="color:#34d399">54</div><div class="stat-change up">No issues detected</div><i class="fas fa-check-circle stat-icon" style="color:#10b981"></i></div>
    <div class="stat-card blue animate-in"><div class="stat-label">AI Confidence</div><div class="stat-value" style="color:#60a5fa">91%</div><div class="stat-change up">Detection accuracy</div><i class="fas fa-robot stat-icon" style="color:#3b82f6"></i></div>
  </div>
  <div class="card">
    <div class="card-title">
      Malpractice Alerts — Gemini Vision Analysis
      <button class="btn sm ghost" onclick="Exam.refresh()"><i class="fas fa-sync-alt"></i> Refresh</button>
    </div>
    <table>
      <thead><tr><th>Student</th><th>Seat</th><th>Alert Type</th><th>Confidence</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
      <tbody id="exam-tbody"></tbody>
    </table>
  </div>
  <div class="two-col">
    <div class="card">
      <div class="card-title">🤖 Gemini Vision — Latest Analysis</div>
      <div style="background:var(--bg3);border-radius:12px;padding:16px;font-size:.85rem;line-height:1.8;border-left:3px solid #3b82f6">
        <div style="font-size:.78rem;color:var(--accent2);font-weight:700;margin-bottom:8px">Gemini Pro Vision · 10:51 AM · Hall B</div>
        <strong>Seat B-12:</strong> Object consistent with smartphone detected at 10:23 AM — confidence 94%. Recommend immediate invigilator intervention.<br><br>
        <strong>Seat C-05:</strong> Leftward gaze deviation 7 times in 12 minutes, exceeding 3-deviation threshold. Pattern consistent with copying — confidence 87%.<br><br>
        <strong>Seat A-08:</strong> Unusual paper arrangement detected under answer sheet — confidence 79%.<br><br>
        <span style="color:#34d399">✅ 54 students showing normal examination behavior. No anomalies in last 5 minutes.</span>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Alert Timeline</div>
      <div id="exam-timeline"></div>
    </div>
  </div>
  <div class="card">
    <div class="card-title">Run AI Proctor Pipeline</div>
    <div style="margin-bottom:14px;font-size:.85rem;color:var(--text2)">Simulate Gemini Vision analysis on a new frame from Hall B cameras</div>
    <button class="btn" onclick="Exam.runProctor()"><i class="fas fa-play"></i> Analyze New Frame</button>
    <div id="exam-pipeline" style="margin-top:16px"></div>
  </div>`;

  Exam.renderTable();
  Exam.renderTimeline();
};

const Exam = {
  alerts: [
    {roll:'#2341', seat:'B-12', type:'📱 Phone detected',       conf:94, time:'10:23 AM', sev:'critical'},
    {roll:'#2287', seat:'C-05', type:'👀 Repeated gaze left',   conf:87, time:'10:31 AM', sev:'high'},
    {roll:'#2156', seat:'A-08', type:'📄 Hidden material',      conf:79, time:'10:44 AM', sev:'high'},
    {roll:'#2398', seat:'D-01', type:'🗣 Lip movement detected', conf:72, time:'10:51 AM', sev:'medium'},
  ],

  renderTable() {
    const tbody = document.getElementById('exam-tbody');
    if (!tbody) return;
    tbody.innerHTML = this.alerts.map(a => `
      <tr>
        <td style="font-family:monospace">Roll ${a.roll}</td>
        <td>${a.seat}</td>
        <td>${a.type}</td>
        <td><span style="color:${UI.sevColor(a.sev)};font-weight:700">${a.conf}%</span></td>
        <td style="color:var(--text2);font-size:.8rem">${a.time}</td>
        <td>${UI.pill(a.sev)}</td>
        <td>
          <button class="btn sm ghost" onclick="UI.showToast('Evidence Saved','Screenshot + 30s clip saved for Roll ${a.roll}.')">
            <i class="fas fa-save"></i> Save
          </button>
        </td>
      </tr>`).join('');
  },

  renderTimeline() {
    const el = document.getElementById('exam-timeline');
    if (!el) return;
    const events = [
      {time:'10:00 AM', text:'Exam session started — 61 students', color:'#10b981'},
      {time:'10:23 AM', text:'Phone detected — Seat B-12 (94%)', color:'#ef4444'},
      {time:'10:31 AM', text:'Gaze deviation — Seat C-05 (87%)', color:'#f59e0b'},
      {time:'10:44 AM', text:'Hidden material — Seat A-08 (79%)', color:'#f59e0b'},
      {time:'10:51 AM', text:'Lip movement — Seat D-01 (72%)', color:'#3b82f6'},
    ];
    el.innerHTML = events.map(e => `
      <div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="width:8px;height:8px;border-radius:50%;background:${e.color};flex-shrink:0;margin-top:5px"></div>
        <div>
          <div style="font-size:.78rem;color:var(--text2)">${e.time}</div>
          <div style="font-size:.85rem;margin-top:2px">${e.text}</div>
        </div>
      </div>`).join('');
  },

  refresh() {
    UI.showToast('Refreshed', 'Gemini Vision re-analyzed all active camera feeds.');
    this.renderTable();
  },

  runProctor() {
    Agents.runPipeline('exam-pipeline', Agents.examPipeline, () => {
      UI.showToast('🚨 New Alert', 'Seat E-03: Suspicious head movement detected — confidence 81%.', 'alert');
    });
  }
};
