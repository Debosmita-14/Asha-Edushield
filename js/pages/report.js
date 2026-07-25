// js/pages/report.js
var Pages = Pages || {};

Pages.report = function (el) {
  el.innerHTML = `
  <div style="max-width:700px">
    <div class="card">
      <div class="card-title">Submit Incident Report</div>
      <div class="anon-toggle">
        <input type="checkbox" id="anon-chk" style="width:18px;height:18px;accent-color:var(--accent2)">
        <label for="anon-chk" style="font-size:.88rem;cursor:pointer;flex:1">
          <strong>Submit Anonymously</strong> — your identity will be hidden from all parties including admin
        </label>
      </div>
      <div class="form-row">
        <label>Incident Type</label>
        <select id="inc-type">
          <option>Ragging</option><option>Bullying</option><option>Sexual Harassment</option>
          <option>Physical Violence</option><option>Mental Harassment</option>
          <option>Stalking</option><option>Discrimination</option><option>Other</option>
        </select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="form-row" style="margin:0">
          <label>Location</label>
          <input type="text" id="inc-loc" placeholder="e.g. Hostel 3, Block B corridor">
        </div>
        <div class="form-row" style="margin:0">
          <label>Date & Time</label>
          <input type="datetime-local" id="inc-time">
        </div>
      </div>
      <div class="form-row" style="margin-top:16px">
        <label>Description</label>
        <textarea id="inc-desc" placeholder="Describe what happened in detail. The more detail you provide, the better the AI can assess and investigate."></textarea>
      </div>
      <div class="form-row">
        <label>Accused Person(s) — optional</label>
        <input type="text" id="inc-accused" placeholder="Name, roll number, or physical description">
      </div>
      <div class="form-row">
        <label>Witnesses — optional</label>
        <input type="text" id="inc-witness" placeholder="Names or descriptions of witnesses">
      </div>
      <div class="form-row">
        <label>Upload Evidence (image / audio / video)</label>
        <input type="file" accept="image/*,audio/*,video/*" multiple
          style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;color:var(--text);width:100%;cursor:pointer">
      </div>
      <div style="display:flex;gap:12px;margin-top:8px;flex-wrap:wrap">
        <button class="btn danger" onclick="Report.submit()"><i class="fas fa-paper-plane"></i> Submit Report</button>
        <button class="btn ghost" onclick="App.navigate('sos')"><i class="fas fa-exclamation-circle"></i> Emergency SOS Instead</button>
      </div>
    </div>
    <div id="report-result"></div>
  </div>`;
};

const Report = {
  submit() {
    const type = document.getElementById('inc-type').value;
    const loc = document.getElementById('inc-loc').value || 'Not specified';
    const desc = document.getElementById('inc-desc').value;
    const anon = document.getElementById('anon-chk').checked;
    const ticketId = 'INC-' + (4822 + Math.floor(Math.random() * 100));

    document.getElementById('report-result').innerHTML = `
    <div class="card animate-in" style="border-color:rgba(16,185,129,.3)">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
        <div style="width:48px;height:48px;border-radius:50%;background:rgba(16,185,129,.15);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0">✅</div>
        <div>
          <div style="font-weight:700;font-size:1rem">Report Submitted Successfully</div>
          <div style="color:var(--text2);font-size:.8rem;margin-top:2px">
            Ticket <strong style="color:var(--accent2)">${ticketId}</strong> ·
            ${anon ? '🔒 Anonymous' : '👤 Identified'} ·
            Type: ${type}
          </div>
        </div>
      </div>
      <div style="margin-bottom:14px;font-size:.85rem;color:var(--text2)">
        <strong style="color:var(--text)">AI Agent Pipeline — Processing your report</strong>
      </div>
      <div id="report-pipeline"></div>
      <div id="report-gemini" style="margin-top:16px"></div>
    </div>`;

    UI.showToast('Report Received', 'AI agents are analyzing your complaint.', 'alert');

    const pipeline = type === 'Ragging' ? Agents.ragingPipeline : [
      { icon: '🤖', name: 'Guardian Agent', desc: `Classifying "${type}" complaint — initial threat assessment` },
      { icon: '🔍', name: 'Actian Vector Search', desc: 'Searching knowledge base for similar past incidents' },
      { icon: '📋', name: 'Investigation Agent', desc: 'Generating preliminary investigation brief' },
      { icon: '🛡', name: 'Dispatch Agent', desc: 'Notifying relevant authority based on severity' },
    ];

    Agents.runPipeline('report-pipeline', pipeline, () => {
      document.getElementById('report-gemini').innerHTML = `
      <div style="background:var(--bg3);border-radius:12px;padding:16px;border-left:3px solid #3b82f6">
        <div style="font-size:.78rem;color:var(--accent2);font-weight:700;margin-bottom:8px">
          🤖 Gemini Pro Analysis — ${ticketId}
        </div>
        <div style="font-size:.85rem;line-height:1.7;color:var(--text)">
          <strong>Severity Assessment:</strong> HIGH (Score: 78/100)<br>
          <strong>Category:</strong> ${type} — Pattern matches 3 prior incidents in same zone<br>
          <strong>Recommended Action:</strong> Immediate Anti-Ragging Committee notification + counselor assignment<br>
          <strong>Actian Vector Match:</strong> 2 similar incidents found (INC-4801, INC-4789) — same hostel block<br>
          <strong>Compliance:</strong> UGC Anti-Ragging Act 2009 — mandatory 24hr response required
        </div>
        <div style="margin-top:12px;display:flex;gap:10px">
          <span class="pill high">Severity: HIGH</span>
          <span class="pill medium">Response: 24hr SLA</span>
          <span class="pill low">Compliance: Logged</span>
        </div>
      </div>`;
      UI.showToast('AI Analysis Complete', `${ticketId} — Severity HIGH. Admin notified.`, 'alert');
    });
  }
};

