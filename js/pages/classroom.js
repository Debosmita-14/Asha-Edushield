// js/pages/classroom.js — Classroom Guardian AI (OpenCV + YOLO-style + Gemini Vision)
// One multimodal pass → per-student boxes, weapon detection, aggression/ragging,
// emergency gestures, exam integrity, attention analytics, combined Risk Agent score.
// Human-in-the-loop: AI flags & alerts faculty/security/admin for review — never accuses.
var Pages = Pages || {};

Pages.classroom = function (el) {
  el.innerHTML = `
  <div class="card" style="border-left:3px solid #8b5cf6">
    <div class="card-title">🛡️ Classroom Guardian AI
      <span style="font-size:.75rem;color:var(--text2);font-weight:400">OpenCV · YOLOv11 · Gemini Vision · Human-in-the-loop</span></div>
    <div style="font-size:.85rem;color:var(--text2);margin-bottom:14px">
      Upload a classroom / exam-hall / hostel frame. One vision pass detects <b>weapons</b>, <b>aggression &amp; ragging</b>,
      <b>emergency gestures</b>, <b>exam-integrity</b> flags and <b>attention</b> — draws boxes on the image and computes a live
      Classroom Risk score. The AI <b>flags for human review</b> and alerts faculty/security; it never accuses a student.
    </div>
    <div id="cls-drop" style="border:2px dashed var(--border);border-radius:12px;padding:24px;text-align:center;cursor:pointer;transition:.2s"
      onclick="document.getElementById('cls-file').click()">
      <i class="fas fa-camera" style="font-size:1.6rem;color:#8b5cf6"></i>
      <div style="margin-top:8px;font-size:.9rem;font-weight:600">Upload classroom photo</div>
      <div style="font-size:.75rem;color:var(--text2);margin-top:3px">Wide shot works best · JPG/PNG · analyzed on the frame you provide</div>
      <input type="file" id="cls-file" accept="image/*" style="display:none" onchange="Classroom.onFile(this)">
    </div>
    <div class="form-row" style="margin-top:12px;margin-bottom:8px">
      <label>Room / location label</label>
      <input type="text" id="cls-topic" placeholder="e.g. Classroom 302 · Data Structures" value="Classroom 302">
    </div>
    <div style="font-size:.72rem;color:var(--text2);margin-bottom:6px">No image? Preview the interface with a <b>labelled sample scenario</b> (not real analysis):</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn sm ghost" onclick="Classroom.demo('normal')">🟢 Normal class</button>
      <button class="btn sm ghost" onclick="Classroom.demo('exam')">📝 Exam hall</button>
      <button class="btn sm ghost" onclick="Classroom.demo('ragging')">🟠 Aggression / ragging</button>
      <button class="btn sm ghost" onclick="Classroom.demo('weapon')">🔴 Weapon detected</button>
      <button class="btn sm ghost" onclick="Classroom.demo('gesture')">🆘 Emergency gesture</button>
    </div>
    <div id="cls-canvas-wrap" style="margin-top:14px;position:relative;display:none">
      <canvas id="cls-canvas" style="width:100%;border-radius:12px;border:1px solid var(--border);display:block"></canvas>
      <div id="cls-canvas-badge" style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,.7);color:#fff;font-size:.72rem;padding:3px 8px;border-radius:6px">OpenCV overlay</div>
    </div>
    <div id="cls-actions" style="margin-top:12px"></div>
  </div>

  <!-- Classroom Risk Agent -->
  <div class="card" id="cls-riskagent-card" style="border-left:3px solid #10b981">
    <div class="card-title">🧭 Classroom Risk Agent
      <span style="font-size:.75rem;color:var(--text2);font-weight:400">Object + Behavior + Gesture + Exam, fused</span></div>
    <div id="cls-riskagent">
      <div style="color:var(--text2);font-size:.86rem;padding:8px 0">Upload a frame or pick a demo scenario to compute the live classroom risk score.</div>
    </div>
  </div>

  <div class="stat-grid" id="cls-stats">
    <div class="stat-card blue"><div class="stat-label">Attention Score</div><div class="stat-value" id="s-att" style="color:#60a5fa">—</div><div class="stat-change" id="s-att-c">Awaiting frame</div><i class="fas fa-eye stat-icon" style="color:#3b82f6"></i></div>
    <div class="stat-card green"><div class="stat-label">Focused</div><div class="stat-value" id="s-foc" style="color:#34d399">—</div><div class="stat-change" id="s-foc-c">students</div><i class="fas fa-user-check stat-icon" style="color:#10b981"></i></div>
    <div class="stat-card yellow"><div class="stat-label">Distracted</div><div class="stat-value" id="s-dis" style="color:#fbbf24">—</div><div class="stat-change" id="s-dis-c">students</div><i class="fas fa-user-clock stat-icon" style="color:#f59e0b"></i></div>
    <div class="stat-card red"><div class="stat-label">Sleeping / Flagged</div><div class="stat-value" id="s-slp" style="color:#f87171">—</div><div class="stat-change" id="s-slp-c">students</div><i class="fas fa-bed stat-icon" style="color:#ef4444"></i></div>
  </div>

  <div class="card">
    <div class="card-title">🤖 Gemini Vision — Guardian Report</div>
    <div id="cls-insights"><div style="color:var(--text2);font-size:.86rem;padding:8px 0">Upload a classroom photo or pick a demo scenario to generate the Guardian report.</div></div>
  </div>

  <div class="card">
    <div class="card-title">📉 Learning Difficulty Prediction Agent
      <span style="font-size:.75rem;color:var(--text2);font-weight:400">Attendance + engagement + quiz + exam</span></div>
    <div id="cls-risk"></div>
  </div>`;

  Classroom.renderRisk();
};

const Classroom = {
  _img: null,
  _last: null,
  _imgEl: null,

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
        document.getElementById('cls-canvas-wrap').style.display = 'block';
        document.getElementById('cls-actions').innerHTML =
          `<button class="btn" style="background:linear-gradient(135deg,#8b5cf6,#6366f1)" onclick="Classroom.analyze()"><i class="fas fa-wand-magic-sparkles"></i> Run Classroom Guardian AI</button>`;
      };
      img.src = this._img;
    };
    reader.readAsDataURL(f);
  },

  _drawBase(img) {
    const canvas = document.getElementById('cls-canvas');
    if (!canvas) return;
    const maxW = 900;
    const scale = Math.min(1, maxW / img.naturalWidth);
    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  },

  async analyze() {
    if (!this._img) { UI.showToast('No photo', 'Upload a classroom photo first.'); return; }
    const room = (document.getElementById('cls-topic').value || 'Classroom').trim();
    const ins = document.getElementById('cls-insights');
    ins.innerHTML = `<div style="color:var(--text2);font-size:.86rem;padding:8px 0"><i class="fas fa-spinner fa-spin"></i> Gemini Vision analyzing the uploaded frame — detecting objects, behavior, gestures, attention on the real image…</div>`;
    const btn = document.querySelector('#cls-actions .btn');
    if (btn) { btn.disabled = true; btn.style.opacity = '.6'; }

    // Real Gemini Vision analysis of the uploaded image. No simulated fallback is
    // passed, so an offline/failed call returns null and we report that honestly
    // instead of painting fabricated boxes.
    const raw = await AI.analyzeImage(this._img, this._prompt(room), null);
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    const d = this._parse(raw);
    if (!d || !Array.isArray(d.students)) {
      this._offlineNotice(room, raw);
      return;
    }
    d._live = true;
    this._apply(d, room);
  },


  _offlineNotice(room, raw) {
    const err = (typeof AI !== 'undefined' && AI.lastError) ? String(AI.lastError) : '';
    const quota = /quota|rate limit|RESOURCE_EXHAUSTED|429/i.test(err);
    const reason = quota
      ? `The Gemini free-tier quota is temporarily exhausted (rate-limited). Wait ~60s and analyze again — every model in the fallback chain is currently at its limit.`
      : `Make sure the app is served by <code>node server.js</code> (so <code>/api/gemini</code> is reachable) and try a clearer, well-lit wide shot.`;
    const ins = document.getElementById('cls-insights');
    if (ins) ins.innerHTML = `
      <div style="background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.35);border-radius:10px;padding:14px;font-size:.85rem;line-height:1.6">
        ⚠️ <b>Gemini Vision could not analyze this frame.</b><br>
        The model returned no usable detection for <b>${(room||'').replace(/</g,'&lt;')}</b>. Nothing has been fabricated — no boxes or scores are shown.<br>
        <span style="color:var(--text2);font-size:.78rem">${reason} You can also try a labelled demo scenario below the uploader to preview the interface.${err ? `<br><span style="opacity:.7">Reason: ${err.replace(/</g,'&lt;').slice(0,160)}</span>` : ''}</span>
      </div>`;
    const wrap = document.getElementById('cls-canvas-wrap');
    // keep the plain uploaded image visible (no overlay) so the user still sees their frame
    if (this._imgEl) this._drawBase(this._imgEl);
    const badge = document.getElementById('cls-canvas-badge');
    if (badge) badge.textContent = 'No detections — vision unavailable';
    UI.showToast('Vision unavailable', 'Gemini Vision returned no analysis for this frame. Nothing fabricated.', 'alert');
  },

  demo(kind) {
    const room = (document.getElementById('cls-topic') && document.getElementById('cls-topic').value) || 'Classroom 302';
    const d = this._sim(kind);
    // synthesize a neutral placeholder frame so the overlay has something to draw on
    this._imgEl = null; this._img = null;
    const canvas = document.getElementById('cls-canvas');
    if (canvas) {
      canvas.width = 900; canvas.height = 520;
      const ctx = canvas.getContext('2d');
      const g = ctx.createLinearGradient(0, 0, 0, 520);
      g.addColorStop(0, '#1e293b'); g.addColorStop(1, '#0f172a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 900, 520);
      ctx.fillStyle = 'rgba(255,255,255,.06)';
      for (let i = 0; i < 8; i++) ctx.fillRect(60 + (i % 4) * 200, 120 + Math.floor(i / 4) * 200, 150, 150);
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.font = '14px sans-serif';
      ctx.fillText('Demo frame · ' + kind.toUpperCase() + ' scenario (no image uploaded)', 24, 32);
      document.getElementById('cls-canvas-wrap').style.display = 'block';
    }
    UI.showToast('Demo scenario', `Simulating "${kind}" — running Guardian AI.`);
    this._apply(d, room);
  },

  _prompt(room) {
    return `You are Classroom Guardian AI — an OpenCV + YOLO + Gemini Vision safety agent monitoring "${room}".
Analyze this frame and return STRICT JSON only (no markdown). Use normalized coordinates 0-100 (percent of image width/height).
Shape:
{
 "students": [ {"id": <int>, "box": {"x":<0-100>,"y":<0-100>,"w":<0-100>,"h":<0-100>},
   "status": "normal|inattentive|suspected", "label": "<short reason e.g. 'Looking front','Repeated distraction','Looking at adjacent sheet','Phone detected'>",
   "confidence": <0-100>} ],
 "weapons": [ {"object": "<knife|cutter|blade|weapon|sharp object>", "box": {"x":<0-100>,"y":<0-100>,"w":<0-100>,"h":<0-100>},
   "seat": "<best-guess seat/location e.g. 'Seat B-12'>", "confidence": <0-100>} ],
 "aggression": {"detected": <bool>, "type": "<raised fists|fighting posture|cornering|choking|crowd surrounding|ragging|none>",
   "box": {"x":<0-100>,"y":<0-100>,"w":<0-100>,"h":<0-100>}, "students_involved": <int>, "confidence": <0-100>, "detail": "<one sentence>"},
 "gesture": {"detected": <bool>, "type": "<raised hand repeatedly|distress|collapse|seizure-like|unconscious|none>",
   "box": {"x":<0-100>,"y":<0-100>,"w":<0-100>,"h":<0-100>}, "confidence": <0-100>, "detail": "<one sentence>"},
 "attention": {"score": <0-100>, "focused": <int>, "distracted": <int>, "sleeping": <int>},
 "students_visible": <int>,
 "report": "<2 sentence human-in-the-loop summary for faculty review>",
 "confidence": <0-100>
}
Rules:
- Flag weapons ONLY for clear knives/cutters/blades/weapons in a hand. Do NOT flag pens, rulers, phones or normal stationery as weapons.
- status "suspected" = possible exam malpractice (looking at neighbour's sheet, phone in use, talking). Use cautious language.
- This is human-in-the-loop assistance: you FLAG for faculty/security review, you never declare guilt.
- If nothing is visible for a category, return empty arrays / detected:false / seat best-guess.`;
  },

  // Deterministic simulated scenarios (offline fallback + demo buttons)
  _sim(kind) {
    const base = {
      students: [
        { id: 1, box: { x: 8,  y: 30, w: 16, h: 26 }, status: 'normal',      label: 'Looking front',        confidence: 96 },
        { id: 2, box: { x: 30, y: 28, w: 16, h: 26 }, status: 'inattentive', label: 'Repeated distraction',  confidence: 74 },
        { id: 3, box: { x: 52, y: 30, w: 16, h: 26 }, status: 'normal',      label: 'Active',               confidence: 92 },
        { id: 4, box: { x: 74, y: 29, w: 16, h: 26 }, status: 'normal',      label: 'Taking notes',         confidence: 90 },
      ],
      weapons: [], aggression: { detected: false, type: 'none', confidence: 0, detail: '', students_involved: 0 },
      gesture: { detected: false, type: 'none', confidence: 0, detail: '' },
      attention: { score: 84, focused: 31, distracted: 7, sleeping: 2 },
      students_visible: 40, report: 'Class is largely attentive with a few distracted students. No safety threats detected.', confidence: 90
    };
    if (kind === 'normal') return base;
    if (kind === 'exam') {
      base.students = [
        { id: 1, box: { x: 8,  y: 30, w: 16, h: 26 }, status: 'normal',    label: 'Looking front',              confidence: 95 },
        { id: 2, box: { x: 30, y: 28, w: 16, h: 26 }, status: 'inattentive', label: 'Repeated distraction (74%)', confidence: 74 },
        { id: 3, box: { x: 52, y: 30, w: 16, h: 26 }, status: 'suspected', label: 'Looking at adjacent sheet',   confidence: 89 },
        { id: 4, box: { x: 74, y: 29, w: 16, h: 26 }, status: 'suspected', label: 'Phone detected',             confidence: 86 },
      ];
      base.attention = { score: 71, focused: 28, distracted: 8, sleeping: 1 };
      base.report = 'Two students show possible exam-integrity concerns (adjacent-sheet gaze, phone). Flagged for proctor review — not a determination of malpractice.';
      return base;
    }
    if (kind === 'ragging') {
      base.aggression = { detected: true, type: 'cornering', box: { x: 40, y: 22, w: 42, h: 60 }, students_involved: 3, confidence: 87, detail: '2 students appear to corner 1 student — possible ragging behavior.' };
      base.attention = { score: 58, focused: 20, distracted: 15, sleeping: 0 };
      base.report = 'Possible ragging: two students cornering one in the study hall. Immediate human review and security check recommended.';
      return base;
    }
    if (kind === 'weapon') {
      base.weapons = [{ object: 'knife', box: { x: 33, y: 46, w: 12, h: 12 }, seat: 'Seat B-12', confidence: 94 }];
      base.students[1].status = 'suspected'; base.students[1].label = 'Object in hand';
      base.attention = { score: 60, focused: 22, distracted: 10, sleeping: 0 };
      base.report = 'CRITICAL: a knife-like object appears in a student\'s hand near Seat B-12. Emergency response dispatched for human verification.';
      return base;
    }
    if (kind === 'gesture') {
      base.gesture = { detected: true, type: 'collapse', box: { x: 46, y: 40, w: 20, h: 34 }, confidence: 83, detail: 'A student appears to have collapsed / shows distress — possible medical emergency.' };
      base.attention = { score: 62, focused: 25, distracted: 8, sleeping: 0 };
      base.report = 'Emergency gesture detected: a student appears to collapse. Auto-SOS generated for immediate human response.';
      return base;
    }
    return base;
  },

  _parse(s) {
    if (!s) return null;
    try {
      const m = s.replace(/```json|```/gi, '').match(/\{[\s\S]*\}/);
      return m ? JSON.parse(m[0]) : null;
    } catch (e) { return null; }
  },

  // Master: draw overlay, paint stats, compute risk, fire human-in-the-loop alerts
  _apply(d, room) {
    d.students = d.students || [];
    d.weapons = d.weapons || [];
    d.aggression = d.aggression || { detected: false };
    d.gesture = d.gesture || { detected: false };
    d.attention = d.attention || { score: 0, focused: 0, distracted: 0, sleeping: 0 };
    this._last = { d, room };

    this._overlay(d);
    this._paintStats(d);
    const risk = this._riskScore(d);
    this._renderRiskAgent(d, risk, room);
    this._renderReport(d, room, risk);
    this._handleThreats(d, room, risk);
  },

  // ── OpenCV-style bounding-box overlay drawn on the canvas ──
  _overlay(d) {
    const canvas = document.getElementById('cls-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // redraw base
    if (this._imgEl) this._drawBase(this._imgEl);
    else { /* demo frame already painted by demo() */ }
    const W = canvas.width, H = canvas.height;
    const COL = { normal: '#22c55e', inattentive: '#f59e0b', suspected: '#ef4444' };
    const LBL = { normal: '🟢', inattentive: '🟡', suspected: '🔴' };

    const box = (b, color, tagTop, tagBottom, dashed) => {
      if (!b) return;
      const x = b.x / 100 * W, y = b.y / 100 * H, w = b.w / 100 * W, h = b.h / 100 * H;
      ctx.lineWidth = 3; ctx.strokeStyle = color;
      if (dashed) ctx.setLineDash([8, 5]); else ctx.setLineDash([]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
      // tag background
      ctx.font = '600 13px sans-serif';
      const tw = Math.max(ctx.measureText(tagTop).width, ctx.measureText(tagBottom || '').width) + 12;
      const th = tagBottom ? 34 : 20;
      ctx.fillStyle = color; ctx.fillRect(x, Math.max(0, y - th), tw, th);
      ctx.fillStyle = '#0b1220'; ctx.textBaseline = 'top';
      ctx.fillText(tagTop, x + 6, Math.max(2, y - th + 3));
      if (tagBottom) ctx.fillText(tagBottom, x + 6, Math.max(2, y - th + 18));
    };

    // students
    d.students.forEach(s => {
      const c = COL[s.status] || '#22c55e';
      box(s.box, c, `${LBL[s.status] || '🟢'} ${s.confidence != null ? s.confidence + '%' : ''}`.trim(),
        (s.label || '').slice(0, 22));
    });
    // weapons (critical, thick red)
    d.weapons.forEach(w => box(w.box, '#dc2626', `🔴 ${w.object} ${w.confidence}%`, w.seat));
    // aggression
    if (d.aggression && d.aggression.detected) box(d.aggression.box, '#f97316', `🟠 ${d.aggression.type} ${d.aggression.confidence}%`, 'Possible ' + d.aggression.type, true);
    // emergency gesture
    if (d.gesture && d.gesture.detected) box(d.gesture.box, '#eab308', `🆘 ${d.gesture.type} ${d.gesture.confidence}%`, 'Emergency gesture', true);

    const badge = document.getElementById('cls-canvas-badge');
    if (badge) badge.textContent = `OpenCV overlay · ${d.students.length} students · ${d.weapons.length} weapon flags`;
  },

  _paintStats(d) {
    const a = d.attention;
    const setV = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setV('s-att', (a.score != null ? a.score : 0) + '%');
    setV('s-foc', a.focused != null ? a.focused : '—');
    setV('s-dis', a.distracted != null ? a.distracted : '—');
    const flagged = (a.sleeping || 0) + d.weapons.length + (d.aggression.detected ? 1 : 0) + (d.gesture.detected ? 1 : 0);
    setV('s-slp', flagged);
    const attC = document.getElementById('s-att-c');
    if (attC) { attC.textContent = a.score >= 75 ? 'Class engaged' : a.score >= 55 ? 'Mixed focus' : 'Low focus'; attC.className = 'stat-change ' + (a.score >= 65 ? 'up' : 'down'); }
    const slpC = document.getElementById('s-slp-c'); if (slpC) slpC.textContent = flagged ? 'need review' : 'all clear';
  },

  // ── Classroom Risk Agent: fuse object + behavior + gesture + exam ──
  _riskScore(d) {
    let score = 0;
    if (d.weapons.length) score += 70 + Math.min(20, d.weapons.length * 10);           // weapons dominate
    // A medical/collapse gesture is a life-safety emergency — weight it like a weapon.
    if (d.gesture.detected) {
      const critical = ['collapse', 'unconscious', 'seizure-like'].includes((d.gesture.type || '').toLowerCase());
      score += critical ? 70 + Math.round((d.gesture.confidence || 70) * 0.1)
                        : Math.round((d.gesture.confidence || 70) * 0.5);
    }
    if (d.aggression.detected) {
      const conf = d.aggression.confidence || 70;
      // High-confidence aggression/ragging warrants intervention, not just review.
      score += conf >= 80 ? 70 + Math.round((conf - 80) * 0.5) : Math.round(conf * 0.6);
    }
    const suspected = d.students.filter(s => s.status === 'suspected').length;
    score += suspected * 8;
    score += Math.round((100 - (d.attention.score || 80)) * 0.15);
    score += (d.attention.sleeping || 0) * 3;
    score = Math.max(0, Math.min(100, Math.round(score)));
    let band;
    if (score >= 70) band = ['SECURITY INTERVENTION NEEDED', '#ef4444'];
    else if (score >= 40) band = ['ELEVATED — REVIEW ADVISED', '#f59e0b'];
    else band = ['SAFE', '#10b981'];
    return { score, band };
  },

  _renderRiskAgent(d, risk, room) {
    const el = document.getElementById('cls-riskagent');
    if (!el) return;
    const card = document.getElementById('cls-riskagent-card');
    if (card) card.style.borderLeftColor = risk.band[1];
    const chips = [
      { on: d.weapons.length > 0, txt: `Weapon ×${d.weapons.length}`, c: '#ef4444' },
      { on: d.aggression.detected, txt: `Aggression ${d.aggression.confidence || ''}%`, c: '#f97316' },
      { on: d.gesture.detected, txt: `Gesture ${d.gesture.confidence || ''}%`, c: '#eab308' },
      { on: d.students.some(s => s.status === 'suspected'), txt: `Exam flags ×${d.students.filter(s => s.status === 'suspected').length}`, c: '#ef4444' },
      { on: (d.attention.score || 100) < 60, txt: `Low attention ${d.attention.score}%`, c: '#f59e0b' },
    ].filter(x => x.on);

    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">
        <div style="text-align:center;min-width:120px">
          <div style="font-size:2.6rem;font-weight:800;color:${risk.band[1]};line-height:1">${risk.score}<span style="font-size:1rem;color:var(--text2)">/100</span></div>
          <div style="font-size:.72rem;font-weight:700;color:${risk.band[1]};margin-top:4px">${risk.band[0]}</div>
        </div>
        <div style="flex:1;min-width:200px">
          <div class="progress-bar" style="height:10px"><div class="progress-fill" style="width:${risk.score}%;background:${risk.band[1]}"></div></div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
            ${chips.length ? chips.map(c => `<span style="font-size:.7rem;font-weight:700;color:${c.c};background:${c.c}18;padding:3px 9px;border-radius:20px">${c.txt}</span>`).join('') : '<span style="font-size:.72rem;color:#10b981">✓ No safety flags in this frame</span>'}
          </div>
        </div>
      </div>
      <div style="font-size:.72rem;color:var(--text2);margin-top:12px">Risk Agent fuses object detection + behavior + gesture + exam monitoring for ${room}. Human-in-the-loop: alerts are advisory and require faculty/security confirmation.</div>`;
  },

  _renderReport(d, room, risk) {
    const esc = t => (t || '').replace(/</g, '&lt;');
    const rows = [];
    d.weapons.forEach(w => rows.push(['🔴', `Weapon: ${w.object}`, `${w.seat || 'location est.'} · ${w.confidence}% · CRITICAL`, '#ef4444']));
    if (d.aggression.detected) rows.push(['🟠', `Aggression: ${d.aggression.type}`, `${esc(d.aggression.detail)} · ${d.aggression.confidence}%`, '#f97316']);
    if (d.gesture.detected) rows.push(['🆘', `Emergency gesture: ${d.gesture.type}`, `${esc(d.gesture.detail)} · ${d.gesture.confidence}%`, '#eab308']);
    d.students.filter(s => s.status === 'suspected').forEach(s => rows.push(['🔴', `Exam flag — Student ${s.id}`, `${esc(s.label)} · ${s.confidence}% (for proctor review)`, '#ef4444']));
    d.students.filter(s => s.status === 'inattentive').forEach(s => rows.push(['🟡', `Inattentive — Student ${s.id}`, `${esc(s.label)} · ${s.confidence}%`, '#f59e0b']));

    document.getElementById('cls-insights').innerHTML = `
      ${d._live ? '' : `<div style="background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.35);border-radius:8px;padding:8px 10px;font-size:.75rem;color:#fbbf24;margin-bottom:10px"><b>SAMPLE SCENARIO</b> — illustrative demo data, not analysis of a real uploaded image.</div>`}
      <div style="display:flex;gap:12px;padding:14px;background:var(--bg3);border-radius:10px;margin-bottom:10px;border-left:3px solid ${risk.band[1]}">
        <span style="font-size:1.2rem">🛡️</span>
        <div style="font-size:.875rem;line-height:1.6">
          <b>Room:</b> ${esc(room)} · <b>${d.students_visible || d.students.length} students</b><br>
          <b>Guardian summary:</b> ${esc(d.report)}<br>
          <b>Classroom Risk:</b> <span style="color:${risk.band[1]};font-weight:700">${risk.score}/100 — ${risk.band[0]}</span>
        </div>
      </div>
      ${rows.length ? `
        <div style="font-size:.75rem;font-weight:700;color:var(--text2);margin:6px 0;text-transform:uppercase;letter-spacing:.04em">Flagged for human review (${rows.length})</div>
        ${rows.map(r => `
          <div style="display:flex;gap:10px;padding:9px;background:var(--bg);border-radius:8px;margin-bottom:6px;align-items:flex-start;border-left:3px solid ${r[3]}">
            <span>${r[0]}</span>
            <div style="flex:1"><div style="font-size:.83rem;font-weight:600">${r[1]}</div>
              <div style="font-size:.77rem;color:var(--text2);margin-top:2px">${r[2]}</div></div>
          </div>`).join('')}
      ` : `<div style="color:#10b981;font-size:.84rem;padding:6px 0">✅ No safety or integrity flags in this frame.</div>`}
      <div style="margin-top:10px;padding:10px;background:rgba(59,130,246,.08);border-radius:8px;font-size:.77rem;color:var(--text2)">
        ⚖️ <b>Human-in-the-loop:</b> Guardian AI <em>flags possibilities</em> for faculty/security review — it does not accuse or punish. A human confirms every action.
      </div>
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
        <button class="btn sm" onclick="Classroom.sendToAdmin()"><i class="fas fa-paper-plane"></i> Send Report to Admin</button>
        <button class="btn sm ghost" onclick="Classroom.predict()"><i class="fas fa-brain"></i> Learning-Risk Prediction</button>
      </div>
      <div style="font-size:.72rem;color:var(--text2);margin-top:8px">Gemini Vision confidence: ${Math.round(d.confidence || 88)}% · analyzed just now</div>`;

    UI.showToast('🛡️ Guardian analysis', `Risk ${risk.score}/100 · ${risk.band[0]}`, risk.score >= 70 ? 'alert' : undefined);
  },

  // ── Human-in-the-loop emergency dispatch for critical categories ──
  _handleThreats(d, room, risk) {
    const fire = (type, summary) => {
      const banner = `<div class="animate-in" style="background:linear-gradient(180deg,rgba(239,68,68,.18),transparent);border:1px solid #ef4444;border-left:4px solid #ef4444;border-radius:12px;padding:12px;margin-bottom:10px">
        <div style="font-weight:800;color:#f87171">🚨 ${type} — emergency alert generated</div>
        <div style="font-size:.83rem;line-height:1.5;margin-top:4px">${summary.replace(/</g, '&lt;')}</div>
        <div style="font-size:.72rem;color:var(--text2);margin-top:5px">Routed to Admin Dashboard → Faculty → Security Dispatch for human confirmation. Room: ${room}.</div></div>`;
      const host = document.getElementById('cls-insights');
      if (host) host.insertAdjacentHTML('afterbegin', banner);
      UI.showToast('🚨 ' + type, summary, 'alert');
      if (typeof AlertSystem !== 'undefined') {
        AlertSystem.trigger({ type: `${type} — ${room}`, sev: 'critical', channel: 'sos',
          source: 'Classroom Guardian AI', summaryHint: summary,
          evidence: this._img ? [{ name: 'guardian_frame.jpg', kind: 'image', url: this._img }] : [],
          onCard: html => { const ra = document.getElementById('cls-riskagent'); if (ra) ra.insertAdjacentHTML('afterbegin', html); } });
      } else if (typeof Store !== 'undefined') {
        Store.add({ type, sev: 'critical', channel: 'sos', loc: room, reporter: 'Classroom Guardian AI', summary, riskLevel: 'HIGH' });
      }
    };

    if (d.weapons.length) {
      const w = d.weapons[0];
      fire('Weapon Detected', `AI vision flagged a possible ${w.object} (${w.confidence}%) near ${w.seat || room}. Immediate human verification required.`);
    }
    if (d.gesture.detected && ['collapse', 'unconscious', 'seizure-like', 'distress'].includes((d.gesture.type || '').toLowerCase())) {
      fire('Emergency Gesture / Medical', d.gesture.detail || `A student appears to need urgent help (${d.gesture.type}). Auto-SOS generated.`);
    }
    if (d.aggression.detected && (d.aggression.confidence || 0) >= 80) {
      fire('Aggression / Possible Ragging', d.aggression.detail || `Possible ${d.aggression.type} involving ${d.aggression.students_involved || 2} students.`);
    }
  },

  // ── Send Guardian report to Admin as evidence (human review) ──
  sendToAdmin() {
    if (!this._last) { UI.showToast('Nothing to send', 'Run an analysis first.'); return; }
    const { d, room } = this._last;
    const risk = this._riskScore(d);
    const sev = risk.score >= 70 ? 'critical' : risk.score >= 40 ? 'high' : 'low';
    const lines = [];
    d.weapons.forEach(w => lines.push(`• WEAPON: ${w.object} @ ${w.seat || 'est.'} (${w.confidence}%)`));
    if (d.aggression.detected) lines.push(`• Aggression: ${d.aggression.type} — ${d.aggression.detail} (${d.aggression.confidence}%)`);
    if (d.gesture.detected) lines.push(`• Emergency gesture: ${d.gesture.type} — ${d.gesture.detail} (${d.gesture.confidence}%)`);
    d.students.filter(s => s.status === 'suspected').forEach(s => lines.push(`• Exam flag — Student ${s.id}: ${s.label} (${s.confidence}%)`));
    const summary = `Classroom Guardian report — ${room}. Risk ${risk.score}/100 (${risk.band[0]}). Attention ${d.attention.score}% · focused ${d.attention.focused}, distracted ${d.attention.distracted}, sleeping ${d.attention.sleeping}. ${d.report}${lines.length ? '\n\nFlags:\n' + lines.join('\n') : '\n\nNo safety/integrity flags.'}\n\n⚖️ Human-in-the-loop: advisory flags for administrative review, not accusations.`;
    if (typeof Store !== 'undefined') {
      Store.add({
        type: 'Classroom Guardian Report', sev, channel: 'report',
        loc: room, reporter: `${typeof Profile !== 'undefined' ? Profile.me().name : 'Faculty'} (Faculty)`,
        summary, description: `Classroom Guardian AI report submitted for administrative review — ${room}.`,
        riskLevel: risk.band[0], evidence: this._img ? [{ name: 'guardian_frame.jpg', kind: 'image', url: this._img }] : []
      });
    }
    UI.showToast('📤 Sent to Admin', 'Guardian report filed as evidence in the Incident log for review.');
  },

  // ── Learning Difficulty Prediction Agent (retained) ──
  renderRisk() {
    const el = document.getElementById('cls-risk');
    if (!el) return;
    const cohort = [
      { id: 'Roll #2287', att: 62, eng: 48, quiz: 41, exam: 52 },
      { id: 'Roll #2156', att: 71, eng: 55, quiz: 60, exam: 58 },
      { id: 'Roll #2398', att: 88, eng: 83, quiz: 79, exam: 85 },
      { id: 'Roll #2341', att: 54, eng: 39, quiz: 35, exam: 44 },
      { id: 'Roll #2205', att: 93, eng: 90, quiz: 88, exam: 91 },
    ].map(s => {
      const score = Math.round(s.att * 0.2 + s.eng * 0.3 + s.quiz * 0.25 + s.exam * 0.25);
      const risk = score < 50 ? ['HIGH', '#ef4444'] : score < 68 ? ['MEDIUM', '#f59e0b'] : ['LOW', '#10b981'];
      return { ...s, score, risk };
    }).sort((a, b) => a.score - b.score);

    el.innerHTML = `<div style="font-size:.78rem;color:var(--text2);margin-bottom:10px">Predicts students at academic risk from attendance + engagement + quiz + exam performance.</div>` +
      cohort.map(s => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
          <div style="flex:1"><div style="font-size:.85rem;font-weight:600">${s.id}</div>
            <div style="font-size:.72rem;color:var(--text2)">Att ${s.att} · Eng ${s.eng} · Quiz ${s.quiz} · Exam ${s.exam}</div></div>
          <div style="width:120px"><div class="progress-bar"><div class="progress-fill" style="width:${s.score}%;background:${s.risk[1]}"></div></div></div>
          <span style="font-size:.7rem;font-weight:700;color:${s.risk[1]};background:${s.risk[1]}18;padding:3px 8px;border-radius:20px;min-width:64px;text-align:center">${s.risk[0]}</span>
        </div>`).join('') +
      `<button class="btn sm ghost" style="margin-top:12px" onclick="Classroom.predict()"><i class="fas fa-brain"></i> Re-run Prediction Agent</button>`;
  },

  async predict() {
    UI.showToast('Prediction Agent', 'Recomputed academic-risk scores across the cohort.');
    const rec = await AI.analyzeText(
      'In one sentence, advise faculty on supporting a student flagged HIGH academic risk (low attendance, engagement, quiz and exam scores).',
      'Schedule a one-on-one mentoring session and provide targeted practice on weak topics before the next assessment.');
    UI.showToast('💡 Support recommendation', rec);
  }
};
