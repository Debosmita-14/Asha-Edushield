// js/pages/agentspage.js
var Pages = Pages || {};

Pages.agents = function (el) {
  el.innerHTML = `
  <div class="card" style="margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
      <div style="flex:1;min-width:200px">
        <div style="font-weight:700;font-size:1rem;margin-bottom:4px">15-Agent Autonomous Network</div>
        <div style="font-size:.83rem;color:var(--text2)">Multi-agent orchestration powered by Gemini + Actian Vector DB + SuperPlane workflows</div>
      </div>
      <div style="display:flex;gap:20px">
        <div style="text-align:center"><div style="font-size:1.6rem;font-weight:900;color:#10b981">13</div><div style="font-size:.72rem;color:var(--text2)">Active</div></div>
        <div style="text-align:center"><div style="font-size:1.6rem;font-weight:900;color:#f59e0b">243</div><div style="font-size:.72rem;color:var(--text2)">Tasks Today</div></div>
        <div style="text-align:center"><div style="font-size:1.6rem;font-weight:900;color:#3b82f6">99.2%</div><div style="font-size:.72rem;color:var(--text2)">Uptime</div></div>
      </div>
    </div>
  </div>
  <div class="three-col" id="agents-grid"></div>
  <div class="card">
    <div class="card-title">🔗 Agent Collaboration Flow (SuperPlane Orchestration)</div>
    <div style="overflow-x:auto;padding:20px 0">
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;min-width:700px;flex-wrap:wrap">
        ${['Student Input','Guardian Agent','Investigation Agent','Risk Prediction','Dispatch Agent','Admin Dashboard'].map((s,i,arr) => `
          <div style="display:flex;align-items:center;gap:8px">
            <div style="background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:14px 18px;text-align:center;font-size:.82rem;font-weight:600;white-space:nowrap;border-left:3px solid ${['#3b82f6','#ef4444','#a855f7','#eab308','#22c55e','#8b5cf6'][i]}">${s}</div>
            ${i < arr.length-1 ? '<i class="fas fa-arrow-right" style="color:var(--text2)"></i>' : ''}
          </div>`).join('')}
      </div>
    </div>
  </div>`;

  document.getElementById('agents-grid').innerHTML = DATA.agents.map(a => `
    <div class="agent-card" style="border-left:3px solid ${a.color}" onclick="AgentsPage.detail('${a.name}')">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <span style="font-size:1.6rem">${a.icon}</span>
        <span class="pill ${a.status==='active'?'low':'resolved'}">${a.status==='active'?'<span class="live-dot"></span> active':'idle'}</span>
      </div>
      <div style="font-weight:700;font-size:.9rem;margin-bottom:6px">${a.name}</div>
      <div style="font-size:.76rem;color:var(--text2);line-height:1.5;margin-bottom:12px">${a.desc}</div>
      <div style="font-size:.75rem;color:var(--text2);padding-top:10px;border-top:1px solid var(--border)">
        <i class="fas fa-tasks" style="margin-right:5px"></i> ${a.tasks} tasks processed today
      </div>
    </div>`).join('');
};

const AgentsPage = {
  detail(name) {
    const a = DATA.agents.find(x => x.name === name);
    if (!a) return;
    UI.showToast(`${a.icon} ${a.name}`, `In: ${a.inputs} → Out: ${a.outputs}`);
  }
};
