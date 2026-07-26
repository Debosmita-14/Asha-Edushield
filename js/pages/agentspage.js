// js/pages/agentspage.js
var Pages = Pages || {};

Pages.agents = function (el) {
  el.innerHTML = `
  <div class="stat-grid">
    <div class="stat-card green animate-in"><div class="stat-label">Active Agents</div><div class="stat-value" style="color:#34d399">13</div><div class="stat-change up">99.2% uptime</div><i class="fas fa-robot stat-icon" style="color:#10b981"></i></div>
    <div class="stat-card yellow animate-in"><div class="stat-label">Tasks Today</div><div class="stat-value" style="color:#fbbf24">243</div><div class="stat-change up">↑ 18% vs yesterday</div><i class="fas fa-tasks stat-icon" style="color:#f59e0b"></i></div>
    <div class="stat-card blue animate-in"><div class="stat-label">Gemini API Calls</div><div class="stat-value" style="color:#60a5fa">7,241</div><div class="stat-change up">Vision + Pro + Flash</div><i class="fas fa-bolt stat-icon" style="color:#3b82f6"></i></div>
    <div class="stat-card purple animate-in"><div class="stat-label">Avg Decision Time</div><div class="stat-value" style="color:#c084fc">1.2s</div><div class="stat-change up">↓ 0.3s faster</div><i class="fas fa-clock stat-icon" style="color:#8b5cf6"></i></div>
  </div>

  <!-- Live Workflow Simulator -->
  <div class="card" style="margin-bottom:20px">
    <div class="card-title">⚡ Live Agent Workflow Simulator
      <div style="display:flex;gap:8px">
        <select id="wf-scenario" class="filter-select" style="font-size:.78rem;padding:6px 10px">
          <option value="sos">SOS Emergency</option>
          <option value="ragging">Ragging Report</option>
          <option value="wellness">Wellness Crisis</option>
          <option value="exam">Exam Malpractice</option>
          <option value="missing">Missing Student</option>
          <option value="voice">Voice Evidence</option>
        </select>
        <button class="btn sm" onclick="AgentsPage.runScenario()"><i class="fas fa-play"></i> Run Workflow</button>
        <button class="btn sm ghost" onclick="AgentsPage.resetWorkflow()"><i class="fas fa-redo"></i> Reset</button>
      </div>
    </div>
    <div id="wf-visual" style="overflow-x:auto;padding:10px 0">
      <div style="font-size:.82rem;color:var(--text2);text-align:center;padding:20px">Select a scenario and click Run Workflow to see the agent pipeline execute in real-time.</div>
    </div>
    <div id="wf-log" style="margin-top:14px;max-height:180px;overflow-y:auto;background:var(--bg);border-radius:10px;padding:12px;font-family:monospace;font-size:.75rem;color:#94a3b8;display:none"></div>
  </div>

  <!-- Agent Cards -->
  <div class="three-col" id="agents-grid"></div>`;

  // Render agent cards
  document.getElementById('agents-grid').innerHTML = DATA.agents.map(a => `
    <div class="agent-card" style="border-left:3px solid ${a.color}" onclick="AgentsPage.detail('${a.name.replace(/'/g,"\\'")}')">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <span style="font-size:1.5rem">${a.icon}</span>
        <span class="pill ${a.status==='active'?'low':'resolved'}">${a.status==='active'?'<span class="live-dot"></span> active':'idle'}</span>
      </div>
      <div style="font-weight:700;font-size:.88rem;margin-bottom:4px">${a.name}</div>
      <div style="font-size:.74rem;color:var(--text2);line-height:1.5;margin-bottom:10px">${a.desc}</div>
      <div style="font-size:.72rem;color:var(--text2);padding-top:8px;border-top:1px solid var(--border);display:flex;justify-content:space-between">
        <span><i class="fas fa-tasks" style="margin-right:4px"></i>${a.tasks} tasks</span>
        <span style="color:${a.color}">${a.inputs.split(',')[0].trim()}</span>
      </div>
    </div>`).join('');
};

const AgentsPage = {
  _scenarios: {
    sos:      { label:'SOS Emergency', pipeline: 'sosPipeline' },
    ragging:  { label:'Ragging Report', pipeline: 'ragingPipeline' },
    wellness: { label:'Wellness Crisis', pipeline: 'wellnessPipeline' },
    exam:     { label:'Exam Malpractice', pipeline: 'examPipeline' },
    missing:  { label:'Missing Student', pipeline: 'missingPipeline' },
    voice:    { label:'Voice Evidence', pipeline: 'voiceEvidencePipeline' },
  },

  runScenario() {
    const key = document.getElementById('wf-scenario').value;
    const sc = this._scenarios[key];
    const log = document.getElementById('wf-log');
    log.style.display = 'block';
    log.innerHTML = '';
    const steps = Agents[sc.pipeline];
    const wfEl = document.getElementById('wf-visual');
    wfEl.innerHTML = `<div style="font-size:.8rem;color:#f59e0b;font-weight:700;margin-bottom:12px;padding:0 4px">▶ Running: ${sc.label}</div>
      <div id="wf-steps" style="display:flex;align-items:flex-start;gap:0;overflow-x:auto;padding-bottom:8px"></div>`;
    const stepsEl = document.getElementById('wf-steps');
    stepsEl.innerHTML = steps.map((s,i) => `
      <div style="display:flex;align-items:center;gap:0;flex-shrink:0">
        <div id="wf-step-${i}" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 8px;min-width:110px;opacity:.3;transition:all .4s">
          <div id="wf-badge-${i}" style="width:44px;height:44px;border-radius:50%;background:var(--bg3);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:1.2rem;transition:all .4s">${s.icon}</div>
          <div style="font-size:.7rem;font-weight:700;text-align:center;line-height:1.3">${s.name}</div>
          <div id="wf-status-${i}" style="font-size:.65rem;color:var(--text2)">waiting</div>
        </div>
        ${i < steps.length-1 ? '<div style="width:24px;height:2px;background:var(--border);flex-shrink:0;margin-top:-18px"></div>' : ''}
      </div>`).join('');

    steps.forEach((s, i) => {
      setTimeout(() => {
        if (i > 0) {
          const prev = document.getElementById(`wf-step-${i-1}`);
          const prevB = document.getElementById(`wf-badge-${i-1}`);
          const prevS = document.getElementById(`wf-status-${i-1}`);
          if (prev) prev.style.opacity = '1';
          if (prevB) { prevB.style.background='rgba(16,185,129,.15)'; prevB.style.borderColor='#10b981'; }
          if (prevS) prevS.innerHTML = '<span style="color:#10b981">✓ done</span>';
        }
        const cur = document.getElementById(`wf-step-${i}`);
        const curB = document.getElementById(`wf-badge-${i}`);
        const curS = document.getElementById(`wf-status-${i}`);
        if (cur) cur.style.opacity = '1';
        if (curB) { curB.style.background='rgba(245,158,11,.15)'; curB.style.borderColor='#f59e0b'; }
        if (curS) curS.innerHTML = '<span style="color:#f59e0b"><i class="fas fa-spinner fa-spin"></i> running</span>';
        log.innerHTML += `<div style="color:#94a3b8">[${new Date().toLocaleTimeString()}] <span style="color:#f59e0b">${s.name}</span> — ${s.desc}</div>`;
        log.scrollTop = log.scrollHeight;

        if (i === steps.length - 1) {
          setTimeout(() => {
            if (cur) cur.style.opacity = '1';
            if (curB) { curB.style.background='rgba(16,185,129,.15)'; curB.style.borderColor='#10b981'; }
            if (curS) curS.innerHTML = '<span style="color:#10b981">✓ done</span>';
            log.innerHTML += `<div style="color:#34d399;margin-top:4px">[${new Date().toLocaleTimeString()}] ✅ Workflow complete — ${sc.label}</div>`;
            log.scrollTop = log.scrollHeight;
            UI.showToast(`✅ ${sc.label}`, `${steps.length}-step agent workflow completed.`, 'alert');
          }, 1200);
        }
      }, i * 1100);
    });
  },

  resetWorkflow() {
    document.getElementById('wf-visual').innerHTML = '<div style="font-size:.82rem;color:var(--text2);text-align:center;padding:20px">Select a scenario and click Run Workflow to see the agent pipeline execute in real-time.</div>';
    document.getElementById('wf-log').style.display = 'none';
    document.getElementById('wf-log').innerHTML = '';
  },

  detail(name) {
    const a = DATA.agents.find(x => x.name === name);
    if (!a) return;
    UI.showToast(`${a.icon} ${a.name}`, `Inputs: ${a.inputs.split(',')[0]} → Outputs: ${a.outputs.split(',')[0]}`);
  }
};
