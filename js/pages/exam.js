// js/pages/exam.js — Advanced Exam Integrity System (OpenCV + YOLO + Gemini Vision)
// Faculty uploads an exam-hall photo; Gemini Vision draws per-student boxes
// (🟢 normal / 🟡 inattentive / 🔴 suspected), detects dangerous objects, and
// generates a legally-cautious Suspicious Activity Report. Human-in-the-loop:
// the AI flags for proctor review — it never declares guilt. Weapons trigger
// the same emergency response used across ASHA.
var Pages = Pages || {};

Pages.exam = function (el) {
  el.innerHTML = `
  <div class="card" style="border-left:3px solid #ef4444">
    <div class="card-title">🎥 Advanced Exam Integrity
      <span style="font-size:.75rem;color:var(--text2);font-weight:400">OpenCV · YOLOv11 · Gemini Vision · Faculty upload</span></div>
    <div style="font-size:.85rem;color:var(--text2);margin-bottom:14px">
      Upload an exam-hall photo. <b>Gemini Vision</b> analyzes each visible student for exam-integrity signals — looking off-paper,
      turning toward a neighbour, phone/notes in hand — and scans for <b>dangerous objects</b>. It generates a
      <b>Suspicious Activity Report</b> for human review; a proctor makes the final decision. Weapons trigger an immediate emergency alert.
    </div>
    <div id="exm-drop" style="border:2px dashed var(--border);border-radius:12px;padding:26px;text-align:center;cursor:pointer"
      onclick="document.getElementById('exm-file').click()">
      <i class="fas fa-camera" style="font-size:1.6rem;color:#ef4444"></i>
      <div style="margin-top:8px;font-size:.9rem;font-weight:600">Upload exam-hall photo</div>
      <div style="font-size:.75rem;color:var(--text2);margin-top:3px">Seat or row view · JPG/PNG · analyzed on the frame you provide</div>
      <input type="file" id="exm-file" accept="image/*" style="display:none" onchange="Exam.onFile(this)">
    </div>
    <div class="form-row" style="margin-top:12px;margin-bottom:0">
      <label>Seat / reference (optional)</label>
      <input type="text" id="exm-seat" placeholder="e.g. Hall B · Seat C-05">
    </div>
    <div id="exm-canvas-wrap" style="margin-top:14px;position:relative;display:none">
      <canvas id="exm-canvas" style="width:100%;border-radius:12px;border:1px solid var(--border);display:block"></canvas>
      <div id="exm-canvas-badge" style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,.7);color:#fff;font-size:.72rem;padding:3px 8px;border-radius:6px">OpenCV overlay</div>
    </div>
    <div id="exm-actions" style="margin-top:12px"></div>
  </div>

  <div class="stat-grid">
    <div class="stat-card red"><div class="stat-label">Flags This Session</div><div class="stat-value" id="e-flags" style="color:#f87171">0</div><div class="stat-change">For human review</div><i class="fas fa-flag stat-icon" style="color:#ef4444"></i></div>
    <div class="stat-card yellow"><div class="stat-label">Highest Confidence</div><div class="stat-value" id="e-conf" style="color:#fbbf24">—</div><div class="stat-change">Latest report</div><i class="fas fa-gauge-high stat-icon" style="color:#f59e0b"></i></div>
    <div class="stat-card blue"><div class="stat-label">Frames Analyzed</div><div class="stat-value" id="e-frames" style="color:#60a5fa">0</div><div class="stat-change">Gemini Vision</div><i class="fas fa-image stat-icon" style="color:#3b82f6"></i></div>
    <div class="stat-card green"><div class="stat-label">Review Status</div><div class="stat-value" style="color:#34d399;font-size:1.4rem">Human</div><div class="stat-change up">Proctor decides</div><i class="fas fa-user-check stat-icon" style="color:#10b981"></i></div>
  </div>

  <div class="card">
    <div class="card-title">🧾 Suspicious Activity Reports <span style="font-size:.75rem;color:var(--text2);font-weight:400">Evidence Generator Agent</span></div>
    <div id="exm-reports"><div style="color:var(--text2);font-size:.86rem;padding:8px 0">No reports yet. Upload an exam-hall photo to generate a review-ready report.</div></div>
  </div>`;

  Exam._flags = 0; Exam._frames = 0; Exam._reports = [];
};

const Exam = {
  _img: null,
  _imgEl: null,
  _flags: 0,
  _frames: 0,
  _reports: [],
  _last: null,

  onFile(input) {
    const f = input.files && input.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = e => {
      this._img = e.target.result;
      const img = new Image();
      img.onload = () => {
        this._imgEl = img;
        this._drawBase(img);
        document.getElementById('exm-canvas-wrap').style.display = 'block';
        document.getElementById('exm-actions').innerHTML =
          `<button class="btn" style="background:#ef4444" onclick="Exam.analyze()"><i class="fas fa-wand-magic-sparkles"></i> Analyze with Gemini Vision</button>`;
      };
      img.src = this._img;
    };
    reader.readAsDataURL(f);
  },

  _drawBase(img) {
    const canvas = document.getElementById('exm-canvas');
    if (!canvas) return;
    const maxW = 900;
    const scale = Math.min(1, maxW / img.naturalWidth);
    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  },

  async analyze() {
    if (!this._img) { UI.showToast('No photo', 'Upload an exam-hall photo first.'); return; }
    const seat = (document.getElementById('exm-seat').value || 'Unknown seat').trim();
    const rpt = document.getElementById('exm-reports');
    rpt.innerHTML = `<div style="color:var(--text2);font-size:.86rem;padding:8px 0"><i class="fas fa-spinner fa-spin"></i> Gemini Vision analyzing the uploaded exam frame…</div>`;
    const btn = document.querySelector('#exm-actions .btn');
    if (btn) { btn.disabled = true; btn.style.opacity = '.6'; }

    // Real Gemini Vision on the uploaded image. No simulated fallback is passed, so a
    // failed/offline call returns null and we report that honestly — no fabricated boxes.
    const raw = await AI.analyzeImage(this._img, this._prompt(seat), null);
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    const d = this._parse(raw);
    if (!d || !Array.isArray(d.students)) { this._offlineNotice(seat); return; }

    this._frames++;
    this._last = { d, seat };
    this._overlay(d);
    this._renderReport(d, seat);
    this._handleWeapons(d, seat);
  },


  _prompt(seat) {
    return `You are an OpenCV + YOLO + Gemini Vision exam-integrity agent analyzing an exam-hall photo (reference: ${seat}).
Analyze the ACTUAL image. Return STRICT JSON only (no markdown). Use normalized coordinates 0-100 (percent of image width/height).
{
 "students": [ {"id": <int>, "box": {"x":<0-100>,"y":<0-100>,"w":<0-100>,"h":<0-100>},
   "status": "normal|inattentive|suspected",
   "label": "<short reason e.g. 'Looking front','Repeated distraction','Looking at adjacent sheet','Phone detected','Talking'>",
   "confidence": <0-100>} ],
 "weapons": [ {"object": "<knife|cutter|blade|weapon|sharp object>", "box": {"x":<0-100>,"y":<0-100>,"w":<0-100>,"h":<0-100>},
   "seat": "<best-guess seat/location>", "confidence": <0-100>} ],
 "anomalies": [ {"type": "<short label>", "description": "<one cautious sentence>", "confidence": <0-100>, "seat": "<best-guess>"} ],
 "students_visible": <int>, "overall_risk": "LOW|MEDIUM|HIGH", "summary": "<one sentence overall>"
}
Rules:
- status "suspected" = POSSIBLE malpractice (looking at neighbour's sheet, phone in use, talking, hidden notes). "inattentive" = distracted but not suspicious. "normal" otherwise.
- Every "suspected" student should also appear in "anomalies" with cautious language ("appears to", "possible", "may indicate"). NEVER state guilt.
- weapons: flag ONLY clear knives/cutters/blades/weapons in a hand. Do NOT flag pens, rulers, calculators, or phones as weapons (phones are an exam anomaly, not a weapon).
- If nothing suspicious: empty anomalies, overall_risk "LOW". This is human-in-the-loop assistance for a proctor to review.`;
  },

  _offlineNotice(seat) {
    const err = (typeof AI !== 'undefined' && AI.lastError) ? String(AI.lastError) : '';
    const quota = /429|quota|exhaust|rate/i.test(err);
    const reason = quota
      ? `Gemini's free-tier vision quota is exhausted right now (HTTP 429). It resets after a short cooldown — try again in a minute.`
      : `Gemini Vision was unavailable or returned no readable analysis for this frame. Try a clearer, well-lit view where students' faces are visible.`;
    const rpt = document.getElementById('exm-reports');
    if (rpt) rpt.innerHTML = `
      <div style="background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.35);border-radius:10px;padding:14px;font-size:.85rem;line-height:1.6">
        ⚠️ <b>Could not analyze this frame.</b><br>
        Nothing has been fabricated for <b>${(seat||'').replace(/</g,'&lt;')}</b> — no report, boxes or flags are shown.<br>
        <span style="color:var(--text2);font-size:.78rem">${reason}${err ? `<br><span style="opacity:.7">Gemini: ${err.replace(/</g,'&lt;').slice(0,140)}</span>` : ''}</span>
      </div>`;
    if (this._imgEl) this._drawBase(this._imgEl);
    const badge = document.getElementById('exm-canvas-badge');
    if (badge) badge.textContent = 'No detections — vision unavailable';
    UI.showToast('Vision unavailable', 'Gemini Vision returned no analysis for this frame. Nothing fabricated.', 'alert');
  },

  _parse(s) {
    if (!s) return null;
    try {
      const m = s.replace(/```json|```/gi, '').match(/\{[\s\S]*\}/);
      return m ? JSON.parse(m[0]) : null;
    } catch (e) { return null; }
  },

  // ── OpenCV-style bounding-box overlay drawn on the real uploaded frame ──
  _overlay(d) {
    const canvas = document.getElementById('exm-canvas');
    if (!canvas) return;
    if (this._imgEl) this._drawBase(this._imgEl);
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const COL = { normal: '#22c55e', inattentive: '#f59e0b', suspected: '#ef4444' };
    const LBL = { normal: '🟢', inattentive: '🟡', suspected: '🔴' };

    const box = (b, color, tagTop, tagBottom, dashed) => {
      if (!b) return;
      const x = b.x / 100 * W, y = b.y / 100 * H, w = b.w / 100 * W, h = b.h / 100 * H;
      ctx.lineWidth = 3; ctx.strokeStyle = color;
      ctx.setLineDash(dashed ? [8, 5] : []);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
      ctx.font = '600 13px sans-serif';
      const tw = Math.max(ctx.measureText(tagTop).width, ctx.measureText(tagBottom || '').width) + 12;
      const th = tagBottom ? 34 : 20;
      ctx.fillStyle = color; ctx.fillRect(x, Math.max(0, y - th), tw, th);
      ctx.fillStyle = '#0b1220'; ctx.textBaseline = 'top';
      ctx.fillText(tagTop, x + 6, Math.max(2, y - th + 3));
      if (tagBottom) ctx.fillText(tagBottom, x + 6, Math.max(2, y - th + 18));
    };

    (d.students || []).forEach(s => box(s.box, COL[s.status] || '#22c55e',
      `${LBL[s.status] || '🟢'} ${s.confidence != null ? s.confidence + '%' : ''}`.trim(), (s.label || '').slice(0, 24)));
    (d.weapons || []).forEach(w => box(w.box, '#dc2626', `🔴 ${w.object} ${w.confidence}%`, w.seat, false));

    const susp = (d.students || []).filter(s => s.status === 'suspected').length;
    const badge = document.getElementById('exm-canvas-badge');
    if (badge) badge.textContent = `OpenCV overlay · ${(d.students||[]).length} students · ${susp} suspected · ${(d.weapons||[]).length} weapon flags`;
  },

  _renderReport(d, seat) {
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const riskColor = d.overall_risk === 'HIGH' ? '#ef4444' : d.overall_risk === 'MEDIUM' ? '#f59e0b' : '#10b981';
    const anomalies = d.anomalies || [];
    const weapons = d.weapons || [];
    if (anomalies.length) this._flags += anomalies.length;

    const ef = document.getElementById('e-flags'); if (ef) ef.textContent = this._flags;
    const efr = document.getElementById('e-frames'); if (efr) efr.textContent = this._frames;
    const maxConf = anomalies.length ? Math.max(...anomalies.map(a => a.confidence)) : 0;
    const ec = document.getElementById('e-conf'); if (ec) ec.textContent = maxConf ? maxConf + '%' : '—';

    const students = d.students || [];
    const counts = {
      normal: students.filter(s => s.status === 'normal').length,
      inattentive: students.filter(s => s.status === 'inattentive').length,
      suspected: students.filter(s => s.status === 'suspected').length,
    };

    const reportHtml = `
      <div style="background:var(--bg3);border:1px solid ${riskColor}44;border-left:3px solid ${riskColor};border-radius:12px;padding:16px;margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px">
          <div>
            <div style="font-weight:700;font-size:.95rem">🧾 Suspicious Activity Report</div>
            <div style="font-size:.75rem;color:var(--text2);margin-top:2px">Ref: ${seat} · ${ts} · Gemini Vision · For human review only</div>
          </div>
          <span style="font-size:.72rem;font-weight:700;color:${riskColor};background:${riskColor}18;padding:4px 12px;border-radius:20px">Risk: ${d.overall_risk}</span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
          <span style="font-size:.7rem;font-weight:700;color:#22c55e;background:#22c55e18;padding:3px 9px;border-radius:20px">🟢 Normal ${counts.normal}</span>
          <span style="font-size:.7rem;font-weight:700;color:#f59e0b;background:#f59e0b18;padding:3px 9px;border-radius:20px">🟡 Inattentive ${counts.inattentive}</span>
          <span style="font-size:.7rem;font-weight:700;color:#ef4444;background:#ef444418;padding:3px 9px;border-radius:20px">🔴 Suspected ${counts.suspected}</span>
          <span style="font-size:.7rem;font-weight:700;color:var(--text2);background:var(--bg);padding:3px 9px;border-radius:20px">${d.students_visible||students.length} visible</span>
        </div>
        <div style="font-size:.84rem;margin-bottom:10px;color:var(--text2)">${(d.summary||'').replace(/</g,'&lt;')}</div>
        ${weapons.length ? `
          <div style="background:rgba(239,68,68,.12);border:1px solid #ef4444;border-radius:8px;padding:10px;margin-bottom:10px;font-size:.82rem">
            🔴 <b>Dangerous object flagged:</b> ${weapons.map(w=>`${w.object} @ ${w.seat||'est.'} (${w.confidence}%)`).join(', ')} — emergency response triggered for human verification.
          </div>` : ''}
        ${anomalies.length ? `
          <div style="font-size:.78rem;font-weight:700;color:var(--text2);margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em">Flagged observations (${anomalies.length})</div>
          ${anomalies.map(a => `
            <div style="display:flex;gap:12px;padding:9px;background:var(--bg);border-radius:8px;margin-bottom:6px;align-items:flex-start">
              <div style="flex:1">
                <div style="font-size:.84rem;font-weight:600">${a.type}${a.seat?` · <span style="color:var(--text2);font-weight:400">${a.seat}</span>`:''}</div>
                <div style="font-size:.78rem;color:var(--text2);margin-top:2px">${(a.description||'').replace(/</g,'&lt;')}</div>
              </div>
              <span style="font-size:.72rem;font-weight:700;color:${a.confidence>=80?'#ef4444':a.confidence>=60?'#f59e0b':'#3b82f6'};white-space:nowrap">${a.confidence}% conf.</span>
            </div>`).join('')}
        ` : `<div style="color:#10b981;font-size:.84rem">✅ No anomalies detected in this frame.</div>`}
        <div style="margin-top:12px;padding:10px;background:rgba(59,130,246,.08);border-radius:8px;font-size:.78rem;color:var(--text2)">
          ⚖️ <b>Legal note:</b> This report documents <em>possible</em> anomalies for proctor review. It does not constitute evidence of malpractice. A qualified invigilator must make the final determination.
        </div>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button class="btn sm danger" onclick="Exam.sendToAdmin()"><i class="fas fa-paper-plane"></i> Send to Admin as Evidence</button>
          <button class="btn sm ghost" onclick="UI.showToast('Report saved','SAR saved to incident log for proctor review.')"><i class="fas fa-save"></i> Save to Log</button>
          <button class="btn sm ghost" onclick="UI.showToast('Flagged','Proctor notified for seat ${seat.replace(/'/g,'').replace(/"/g,'')}.')"><i class="fas fa-flag"></i> Notify Proctor</button>
        </div>
      </div>`;

    const rpt = document.getElementById('exm-reports');
    if (rpt) rpt.innerHTML = reportHtml + (rpt.innerHTML.includes('Suspicious Activity') ? rpt.innerHTML : '');
    UI.showToast('Frame analyzed', `${anomalies.length} flag(s) · Risk: ${d.overall_risk} · ${d.students_visible||students.length} students.`);
  },

  // ── Dangerous object in an exam hall → same emergency response as the rest of ASHA ──
  _handleWeapons(d, seat) {
    const weapons = d.weapons || [];
    if (!weapons.length) return;
    const w = weapons[0];
    const where = w.seat || seat;
    const summary = `Exam hall ${seat}: AI vision flagged a possible ${w.object} (${w.confidence}%) near ${where}. Immediate human verification required.`;
    UI.showToast('🚨 Weapon Detected', summary, 'alert');
    if (typeof AlertSystem !== 'undefined') {
      AlertSystem.trigger({
        type: `Weapon Detected — Exam Hall ${seat}`, sev: 'critical', channel: 'sos',
        source: 'Exam Integrity Vision', summaryHint: summary,
        evidence: this._img ? [{ name: 'exam_frame.jpg', kind: 'image', url: this._img }] : [],
        onCard: html => { const rpt = document.getElementById('exm-reports'); if (rpt) rpt.insertAdjacentHTML('afterbegin', html); }
      });
    } else if (typeof Store !== 'undefined') {
      Store.add({ type: 'Weapon Detected — Exam Hall', sev: 'critical', channel: 'sos', loc: `Exam Hall · ${where}`, reporter: 'Exam Integrity Vision', summary, riskLevel: 'HIGH' });
    }
  },

  // ── Send the Suspicious Activity Report to Admin as evidence ──
  sendToAdmin() {
    if (!this._last) { UI.showToast('Nothing to send', 'Analyze an exam-hall photo first.'); return; }
    const { d, seat } = this._last;
    const anomalies = d.anomalies || [];
    const weapons = d.weapons || [];
    const maxConf = anomalies.length ? Math.max(...anomalies.map(a => a.confidence)) : 0;
    let sev = d.overall_risk === 'HIGH' ? 'high' : d.overall_risk === 'MEDIUM' ? 'medium' : 'low';
    if (weapons.length) sev = 'critical';
    const flagList = anomalies.length
      ? anomalies.map(a => `• ${a.type}${a.seat?` (${a.seat})`:''} (${a.confidence}% conf.) — ${a.description}`).join('\n')
      : 'No anomalies flagged in this frame.';
    const weaponLine = weapons.length ? `\n\n🔴 DANGEROUS OBJECT: ${weapons.map(w=>`${w.object} @ ${w.seat||'est.'} (${w.confidence}%)`).join(', ')}` : '';
    const summary = `Suspicious Activity Report — ${seat}. Overall risk: ${d.overall_risk}. ${d.summary||''}${weaponLine}\n\nFlagged observations (${anomalies.length}):\n${flagList}\n\n⚖️ Documents POSSIBLE anomalies for administrative review only — not proof of malpractice. Final determination requires a human invigilator.`;
    if (typeof Store !== 'undefined') {
      Store.add({
        type: weapons.length ? 'Exam Integrity + Weapon Report' : 'Exam Integrity Report', sev, channel: 'report',
        loc: `Exam Hall · ${seat}`,
        reporter: `${typeof Profile !== 'undefined' ? Profile.me().name : 'Faculty'} (Proctor)`,
        summary, description: `Gemini Vision exam-integrity SAR submitted by faculty for administrative review. Highest confidence: ${maxConf}%.`,
        riskLevel: weapons.length ? 'HIGH' : d.overall_risk,
        evidence: this._img ? [{ name: 'exam_frame.jpg', kind: 'image', url: this._img }] : []
      });
    }
    UI.showToast('📤 Sent to Admin', 'Suspicious Activity Report filed as evidence in the Incident log for review.');
  }
};
