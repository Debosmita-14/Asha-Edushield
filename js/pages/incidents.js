// js/pages/incidents.js
var Pages = Pages || {};

Pages.incidents = function (el) {
  el.innerHTML = `
  <div class="filter-bar">
    <select class="filter-select" id="filter-type" onchange="IncidentPage.filter()">
      <option value="all">All Types</option>
      <option>SOS</option><option>Ragging</option><option>Harassment</option>
      <option>Bullying</option><option>Mental Health</option>
    </select>
    <select class="filter-select" id="filter-sev" onchange="IncidentPage.filter()">
      <option value="all">All Severity</option>
      <option value="critical">Critical</option><option value="high">High</option>
      <option value="medium">Medium</option><option value="low">Low</option>
    </select>
    <select class="filter-select" id="filter-status" onchange="IncidentPage.filter()">
      <option value="all">All Status</option>
      <option>Active</option><option>Investigating</option>
      <option>Under Review</option><option>Resolved</option>
    </select>
    <button class="btn ghost sm" onclick="IncidentPage.exportCSV()"><i class="fas fa-download"></i> Export CSV</button>
    <button class="btn sm" onclick="IncidentPage.runMissing()"><i class="fas fa-search"></i> Missing Person</button>
  </div>
  <div class="card">
    <div class="card-title">
      All Incidents
      <span id="incident-count" style="font-size:.8rem;color:var(--text2);font-weight:400">Showing ${DATA.incidents.length} records</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>Ticket ID</th><th>Type</th><th>Location</th><th>Reporter</th>
          <th>Time</th><th>Severity</th><th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody id="incidents-tbody"></tbody>
    </table>
  </div>
  <div id="inv-panel"></div>`;

  IncidentPage.render(IncidentPage._allRows());
  // Live: refresh table when new student reports/SOS/voice evidence arrive
  Pages._liveUnsub = Store.subscribe(() => {
    const tbody = document.getElementById('incidents-tbody');
    if (tbody) IncidentPage.render(IncidentPage._allRows());
  });
};

const IncidentPage = {
  // Live store events (newest) merged ahead of seeded historical records
  _allRows() {
    const live = (typeof Store !== 'undefined') ? Store.all().map(e => Store.toIncident(e)) : [];
    return live.concat(DATA.incidents);
  },

  _lookup(id) {
    if (typeof Store !== 'undefined') {
      const e = Store.find(id);
      if (e) return Store.toIncident(e);
    }
    return DATA.incidents.find(i => i.id === id);
  },

  render(rows) {
    const tbody = document.getElementById('incidents-tbody');
    const count = document.getElementById('incident-count');
    if (!tbody) return;
    if (count) count.textContent = `Showing ${rows.length} records`;
    tbody.innerHTML = rows.map(i => `
      <tr>
        <td style="font-family:monospace;color:var(--text2);font-size:.8rem">${i.id}</td>
        <td><span class="tag">${i.type}</span></td>
        <td style="font-size:.82rem">${i.loc}</td>
        <td style="font-size:.82rem;color:var(--text2)">${i.reporter}</td>
        <td style="font-size:.78rem;color:var(--text2)">${i.time}</td>
        <td>${UI.pill(i.sev)}</td>
        <td style="font-size:.8rem">${i.status}</td>
        <td style="display:flex;gap:6px">
          <button class="btn ghost sm" onclick="IncidentPage.view('${i.id}')"><i class="fas fa-eye"></i></button>
          <button class="btn sm" style="background:linear-gradient(135deg,#8b5cf6,#6366f1)"
            onclick="IncidentPage.investigate('${i.id}')"><i class="fas fa-robot"></i> Investigate</button>
        </td>
      </tr>`).join('');
  },

  // Student-submitted evidence block (transcript + audio + AI summary) for faculty/security/admin to analyze
  _studentEvidence(e) {
    return `
    <div style="background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.25);border-radius:12px;padding:14px;margin-bottom:16px">
      <div style="font-size:.75rem;color:#60a5fa;font-weight:700;margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px">
        📥 Student-Submitted Evidence — analyze below
      </div>
      ${e.transcript ? `<div style="font-size:.74rem;color:var(--text2);margin-bottom:3px">Voice Transcript</div>
      <div style="background:var(--bg);border-radius:8px;padding:10px;font-size:.82rem;margin-bottom:10px;line-height:1.5">"${e.transcript}"</div>` : ''}
      ${e.description ? `<div style="font-size:.74rem;color:var(--text2);margin-bottom:3px">Description</div>
      <div style="background:var(--bg);border-radius:8px;padding:10px;font-size:.82rem;margin-bottom:10px;line-height:1.5">${e.description}</div>` : ''}
      ${e.summary ? `<div style="font-size:.74rem;color:var(--text2);margin-bottom:3px">AI Summary (Gemini)</div>
      <div style="background:rgba(139,92,246,.1);border-radius:8px;padding:10px;font-size:.8rem;margin-bottom:10px;line-height:1.6">${e.summary}</div>` : ''}
      ${e.audioFile ? `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span class="pill medium">📁 ${e.audioFile}</span>
        ${e.audioUrl ? `<audio controls src="${e.audioUrl}" style="height:34px;border-radius:8px;flex:1;min-width:180px"></audio>` : '<span style="font-size:.72rem;color:var(--text2)">(audio stored on server)</span>'}
      </div>` : ''}
    </div>`;
  },

  _evidenceColumn(id) {
    const role = typeof App !== 'undefined' ? App.currentRole : '';
    if (role === 'faculty') {
      // Faculty: only exam/classroom image upload for analysis
      return `
      <div style="background:var(--bg3);border-radius:12px;padding:14px">
        <div style="font-size:.75rem;color:var(--text2);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">Faculty Analysis</div>
        <div style="font-size:.78rem;color:var(--text2);margin-bottom:10px;line-height:1.5">Upload exam-cheating or classroom-behavior images for Gemini Vision analysis.</div>
        <label style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg);border-radius:8px;cursor:pointer;border:1px dashed var(--border)">
          <i class="fas fa-camera" style="color:#3b82f6"></i>
          <span style="font-size:.82rem">Upload Exam / Classroom Image</span>
          <input type="file" accept="image/*" style="display:none" onchange="IncidentPage.analyzeImage(event,'${id}')">
        </label>
        <div id="evidence-preview-${id}" style="margin-top:10px"></div>
        <div style="margin-top:10px;font-size:.72rem;color:var(--text2)">
          Student-submitted audio/video evidence is shown in the AI investigation results below.
        </div>
      </div>`;
    }
    // Student / admin / security: full evidence upload
    return `
    <div style="background:var(--bg3);border-radius:12px;padding:14px">
      <div style="font-size:.75rem;color:var(--text2);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">Evidence Upload</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <label style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg);border-radius:8px;cursor:pointer;border:1px dashed var(--border)">
          <i class="fas fa-image" style="color:#3b82f6"></i>
          <span style="font-size:.82rem">Upload Image Evidence</span>
          <input type="file" accept="image/*" style="display:none" onchange="IncidentPage.analyzeImage(event,'${id}')">
        </label>
        <label style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg);border-radius:8px;cursor:pointer;border:1px dashed var(--border)">
          <i class="fas fa-microphone" style="color:#ef4444"></i>
          <span style="font-size:.82rem">Upload Audio Evidence</span>
          <input type="file" accept="audio/*" style="display:none" onchange="IncidentPage.analyzeAudio(event,'${id}')">
        </label>
        <label style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg);border-radius:8px;cursor:pointer;border:1px dashed var(--border)">
          <i class="fas fa-video" style="color:#8b5cf6"></i>
          <span style="font-size:.82rem">Upload Video Evidence</span>
          <input type="file" accept="video/*" style="display:none" onchange="IncidentPage.analyzeVideo(event,'${id}')">
        </label>
      </div>
      <div id="evidence-preview-${id}" style="margin-top:10px"></div>
    </div>`;
  },

  filter() {
    const type = document.getElementById('filter-type').value;
    const sev  = document.getElementById('filter-sev').value;
    const stat = document.getElementById('filter-status').value;
    let rows = this._allRows();
    if (type !== 'all') rows = rows.filter(r => r.type === type);
    if (sev  !== 'all') rows = rows.filter(r => r.sev  === sev);
    if (stat !== 'all') rows = rows.filter(r => r.status === stat);
    this.render(rows);
  },

  view(id) {
    const inc = this._lookup(id);
    if (!inc) return;
    const panel = document.getElementById('inv-panel');
    panel.innerHTML = `
    <div class="card animate-in" style="border-color:rgba(59,130,246,.3)">
      <div class="card-title">📋 Incident Detail — ${id}
        <button class="btn ghost sm" onclick="document.getElementById('inv-panel').innerHTML=''"><i class="fas fa-times"></i></button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px">
        ${[
          {label:'Type',     val:inc.type},
          {label:'Location', val:inc.loc},
          {label:'Reporter', val:inc.reporter},
          {label:'Time',     val:inc.time},
          {label:'Severity', val:inc.sev.toUpperCase()},
          {label:'Status',   val:inc.status},
        ].map(f=>`<div style="background:var(--bg3);border-radius:10px;padding:12px">
          <div style="font-size:.7rem;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">${f.label}</div>
          <div style="font-size:.88rem;font-weight:600">${f.val}</div>
        </div>`).join('')}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn sm" style="background:linear-gradient(135deg,#8b5cf6,#6366f1)" onclick="IncidentPage.investigate('${id}')">
          <i class="fas fa-robot"></i> Full AI Investigation
        </button>
        <button class="btn sm ghost" onclick="UI.showToast('Evidence Package','Downloading ${id}_evidence.zip...','alert')">
          <i class="fas fa-download"></i> Download Evidence
        </button>
        <button class="btn sm ghost" onclick="UI.showToast('Solana','Evidence hash minted as NFT on Solana devnet. Immutable audit trail created.','alert')">
          <i class="fas fa-link"></i> Mint Evidence NFT
        </button>
      </div>
    </div>`;
    panel.scrollIntoView({ behavior: 'smooth' });
  },

  investigate(id) {
    const inc = this._lookup(id);
    if (!inc) return;
    const liveEvt = (typeof Store !== 'undefined') ? Store.find(id) : null;
    const panel = document.getElementById('inv-panel');
    panel.innerHTML = `
    <div class="card animate-in" style="border-color:rgba(139,92,246,.35)">
      <div class="card-title">🔍 Multimodal AI Investigation — ${id}
        <button class="btn ghost sm" onclick="document.getElementById('inv-panel').innerHTML=''"><i class="fas fa-times"></i></button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        ${this._evidenceColumn(id)}
        <div style="background:var(--bg3);border-radius:12px;padding:14px">
          <div style="font-size:.75rem;color:var(--text2);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">Case Summary</div>
          <div style="font-size:.83rem;line-height:1.7">
            <strong>Incident:</strong> ${inc.type}<br>
            <strong>Location:</strong> ${inc.loc}<br>
            <strong>Reporter:</strong> ${inc.reporter}<br>
            <strong>Time:</strong> ${inc.time}<br>
            <strong>Severity:</strong> <span style="color:${UI.sevColor(inc.sev)}">${inc.sev.toUpperCase()}</span><br>
            <strong>Status:</strong> ${inc.status}
          </div>
          <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
            ${UI.pill(inc.sev)}
            <span class="pill medium">MongoDB: Stored</span>
            <span class="pill low">Actian: Indexed</span>
          </div>
        </div>
      </div>
      ${liveEvt ? this._studentEvidence(liveEvt) : ''}
      <div id="inv-pipeline-${id}"></div>
      <div id="inv-result-${id}" style="margin-top:16px"></div>
    </div>`;

    panel.scrollIntoView({ behavior: 'smooth' });
    UI.showToast('🤖 Investigation Started', `Multimodal AI agents analyzing ${id}...`, 'alert');

    const steps = [
      {icon:'📋', name:'Investigation Agent', desc:`Collecting all evidence for ${inc.type} at ${inc.loc}`},
      {icon:'🔍', name:'Actian Hybrid Search', desc:'Vector + keyword search across 4,821 incident embeddings'},
      {icon:'🤖', name:'Gemini Pro Analysis', desc:'Synthesizing evidence, witness data, and behavioral patterns'},
      {icon:'👁', name:'Gemini Vision', desc:'Analyzing uploaded images/video for forensic evidence'},
      {icon:'📊', name:'Risk Prediction Agent', desc:'Assessing repeat-offender probability and hotspot risk'},
      {icon:'◎', name:'Solana Evidence Chain', desc:'Minting evidence hash as immutable NFT on Solana devnet'},
      {icon:'🍃', name:'MongoDB Atlas', desc:'Storing investigation report + embeddings in Atlas cluster'},
      {icon:'📜', name:'Compliance Agent', desc:'Generating UGC-compliant investigation report'},
    ];

    Agents.runPipeline(`inv-pipeline-${id}`, steps, () => {
      const simResult = `
      <div style="background:var(--bg3);border-radius:12px;padding:18px;border-left:3px solid #8b5cf6;font-size:.85rem;line-height:1.8">
        <div style="font-size:.78rem;color:#a78bfa;font-weight:700;margin-bottom:10px">
          ✨ Gemini Pro Multimodal Investigation Report · ${id} · ${new Date().toLocaleTimeString()}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
          <div style="background:var(--bg);border-radius:8px;padding:12px">
            <div style="font-size:.72rem;color:var(--text2);margin-bottom:4px">INCIDENT CLASSIFICATION</div>
            <div style="font-weight:700;color:${UI.sevColor(inc.sev)}">${inc.type} — ${inc.sev.toUpperCase()}</div>
          </div>
          <div style="background:var(--bg);border-radius:8px;padding:12px">
            <div style="font-size:.72rem;color:var(--text2);margin-bottom:4px">AI CONFIDENCE SCORE</div>
            <div style="font-weight:700;color:#a78bfa">87 / 100</div>
          </div>
          <div style="background:var(--bg);border-radius:8px;padding:12px">
            <div style="font-size:.72rem;color:var(--text2);margin-bottom:4px">ACTIAN VECTOR MATCH</div>
            <div style="font-weight:700;color:#3b82f6">INC-4801, INC-4789 (0.87 cosine)</div>
          </div>
          <div style="background:var(--bg);border-radius:8px;padding:12px">
            <div style="font-size:.72rem;color:var(--text2);margin-bottom:4px">SOLANA EVIDENCE NFT</div>
            <div style="font-weight:700;color:#9945ff">0x4f2a...c891 (devnet)</div>
          </div>
        </div>
        <strong>Gemini Analysis:</strong> Pattern matches 3 prior incidents in same zone. Behavioral indicators suggest repeat offender. Recommend immediate Anti-Ragging Committee notification.<br>
        <strong>Actian Hybrid Search:</strong> 2 similar incidents found — same hostel block, same time window. Offender profile cross-referenced.<br>
        <strong>Recommended Actions:</strong>
        <ol style="margin:8px 0 0 18px;line-height:2">
          <li>Immediate counselor assignment for victim</li>
          <li>Anti-Ragging Committee notification (24hr SLA)</li>
          <li>CCTV footage retrieval from ${inc.loc}</li>
          <li>Witness statement collection</li>
        </ol>
        <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
          ${UI.pill(inc.sev)}
          <span class="pill medium">Evidence: Collected</span>
          <span class="pill low">Compliance: Logged</span>
          <span class="pill low">NFT: Minted</span>
          <span class="pill medium">MongoDB: Stored</span>
        </div>
        <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn sm danger" onclick="UI.showToast('Report Sent','Investigation report sent to Admin + Anti-Ragging Committee.','alert')">
            <i class="fas fa-paper-plane"></i> Send to Committee
          </button>
          <button class="btn sm ghost" onclick="UI.showToast('PDF Generated','${id}_investigation_report.pdf downloaded.','alert')">
            <i class="fas fa-file-pdf"></i> Export PDF
          </button>
          <button class="btn sm ghost" onclick="UI.showToast('DigitalOcean','Report backed up to DigitalOcean Spaces CDN.','alert')">
            <i class="fas fa-cloud-upload-alt"></i> Backup to DO
          </button>
        </div>
      </div>`;
      document.getElementById(`inv-result-${id}`).innerHTML = simResult;
      UI.showToast('✅ Investigation Complete', `${id} — Severity ${inc.sev.toUpperCase()}. Report ready.`, 'alert');
    });
  },

  async analyzeImage(e, id) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      const prev = document.getElementById(`evidence-preview-${id}`);
      if (prev) prev.innerHTML = `
        <img src="${base64}" style="width:100%;border-radius:8px;margin-bottom:8px;max-height:160px;object-fit:cover">
        <div style="font-size:.75rem;color:#a78bfa;font-weight:700">✨ Gemini Vision analyzing...</div>`;
      const prompt = `You are a campus safety forensic AI. Analyze this image for: violence indicators, harassment evidence, suspicious behavior, injuries, or safety threats. Give a structured forensic assessment with risk score 0-100.`;
      const sim = `Gemini Vision Analysis:\n• No immediate violence detected\n• Scene: Indoor corridor, low lighting\n• Persons detected: 2\n• Behavioral indicators: Confrontational posture (confidence 74%)\n• Risk Score: 68/100 — MEDIUM\n• Recommendation: Preserve as evidence, interview persons present`;
      const result = await AI.analyzeImage(base64, prompt, sim);
      if (prev) prev.innerHTML = `
        <img src="${base64}" style="width:100%;border-radius:8px;margin-bottom:8px;max-height:160px;object-fit:cover">
        <div style="background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.3);border-radius:8px;padding:10px;font-size:.78rem;line-height:1.6;white-space:pre-wrap">${result}</div>`;
      UI.showToast('✨ Gemini Vision', 'Image forensic analysis complete.', 'alert');
    };
    reader.readAsDataURL(file);
  },

  analyzeAudio(e, id) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const prev = document.getElementById(`evidence-preview-${id}`);
    if (prev) prev.innerHTML = `
      <audio controls src="${url}" style="width:100%;margin-bottom:8px;border-radius:8px"></audio>
      <div style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:10px;font-size:.78rem;line-height:1.6">
        🎙 Audio Evidence Logged<br>
        <strong>Gemini Audio Analysis (simulated):</strong><br>
        • Voices detected: 2 (1 distressed, 1 aggressive)<br>
        • Emotion: Fear (78%), Anger (65%)<br>
        • Keywords flagged: threatening language<br>
        • Risk Score: 82/100 — HIGH<br>
        • Transcript: Generating...
      </div>`;
    UI.showToast('🎙 Audio Analyzed', 'Gemini audio forensics complete. Distress detected.', 'alert');
  },

  analyzeVideo(e, id) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const prev = document.getElementById(`evidence-preview-${id}`);
    if (prev) prev.innerHTML = `
      <video controls src="${url}" style="width:100%;border-radius:8px;margin-bottom:8px;max-height:160px"></video>
      <div style="background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.3);border-radius:8px;padding:10px;font-size:.78rem;line-height:1.6">
        🎥 Video Evidence Logged<br>
        <strong>Gemini Vision Analysis (simulated):</strong><br>
        • Frames analyzed: 240<br>
        • Persons detected: 3<br>
        • Physical contact detected: Yes (confidence 81%)<br>
        • Risk Score: 88/100 — HIGH<br>
        • Key timestamp: 0:14 — confrontation begins
      </div>`;
    UI.showToast('🎥 Video Analyzed', 'Gemini Vision forensics complete. Physical contact detected.', 'alert');
  },

  exportCSV() {
    const rows = ['ID,Type,Location,Reporter,Time,Severity,Status',
      ...DATA.incidents.map(i => `${i.id},${i.type},${i.loc},${i.reporter},${i.time},${i.sev},${i.status}`)
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `incidents_${Date.now()}.csv`;
    a.click();
    UI.showToast('Export Ready', 'incidents_report.csv downloaded.');
  },

  runMissing() {
    const panel = document.getElementById('inv-panel');
    panel.innerHTML = `
    <div class="card animate-in" style="border-color:rgba(6,182,212,.3)">
      <div class="card-title">🔎 Missing Student Recovery Pipeline
        <button class="btn ghost sm" onclick="document.getElementById('inv-panel').innerHTML=''"><i class="fas fa-times"></i></button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <div class="form-row" style="margin:0"><label>Student Name / Roll Number</label>
          <input type="text" id="missing-name" placeholder="e.g. Priya Sharma / 2024-CS-041"></div>
        <div class="form-row" style="margin:0"><label>Last Known Location</label>
          <input type="text" id="missing-loc" placeholder="e.g. Library, 2:30 PM"></div>
      </div>
      <div style="margin-bottom:14px">
        <label style="font-size:.78rem;color:var(--text2);display:block;margin-bottom:6px">Upload Photo (for Gemini Vision face match)</label>
        <input type="file" accept="image/*" id="missing-photo" style="padding:8px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);width:100%;cursor:pointer">
      </div>
      <button class="btn" onclick="IncidentPage.startMissing()"><i class="fas fa-search"></i> Start Search</button>
      <div id="missing-pipeline" style="margin-top:16px"></div>
    </div>`;
    panel.scrollIntoView({ behavior: 'smooth' });
  },

  startMissing() {
    const name = document.getElementById('missing-name').value || 'Unknown Student';
    UI.showToast('🔎 Search Initiated', `Missing person protocol activated for ${name}`, 'alert');
    Agents.runPipeline('missing-pipeline', Agents.missingPipeline, () => {
      UI.showToast('📍 Possible Match Found', 'Gemini Vision: 78% face match — Camera Feed 7, Library Exit.', 'alert');
    });
  }
};
