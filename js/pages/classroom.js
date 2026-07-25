// js/pages/classroom.js
var Pages = Pages || {};

Pages.classroom = function (el) {
  el.innerHTML = `
  <div class="stat-grid">
    <div class="stat-card blue animate-in"><div class="stat-label">Engagement Score</div><div class="stat-value" style="color:#60a5fa">82%</div><div class="stat-change up">↑ Above average</div><i class="fas fa-chart-line stat-icon" style="color:#3b82f6"></i></div>
    <div class="stat-card green animate-in"><div class="stat-label">Attention Level</div><div class="stat-value" style="color:#34d399">76%</div><div class="stat-change up">Good focus</div><i class="fas fa-eye stat-icon" style="color:#10b981"></i></div>
    <div class="stat-card yellow animate-in"><div class="stat-label">Confusion Index</div><div class="stat-value" style="color:#fbbf24">34%</div><div class="stat-change down">↑ Topic 4 difficult</div><i class="fas fa-question-circle stat-icon" style="color:#f59e0b"></i></div>
    <div class="stat-card red animate-in"><div class="stat-label">Drowsy Students</div><div class="stat-value" style="color:#f87171">8</div><div class="stat-change down">Detected now</div><i class="fas fa-moon stat-icon" style="color:#ef4444"></i></div>
  </div>
  <div class="two-col">
    <div class="card">
      <div class="card-title">Engagement Over Time <span style="font-size:.75rem;color:var(--text2);font-weight:400">Gemini Vision · 30s intervals</span></div>
      <canvas id="engChart" height="200"></canvas>
    </div>
    <div class="card">
      <div class="card-title">Student Attention Heatmap <span style="font-size:.75rem;color:var(--text2);font-weight:400">Click a cell for details</span></div>
      <div class="heatmap-grid" id="heatmap"></div>
      <div style="display:flex;gap:16px;margin-top:10px;font-size:.75rem;color:var(--text2)">
        <span><span style="display:inline-block;width:12px;height:12px;background:#10b981;border-radius:3px;margin-right:4px"></span>Attentive</span>
        <span><span style="display:inline-block;width:12px;height:12px;background:#f59e0b;border-radius:3px;margin-right:4px"></span>Distracted</span>
        <span><span style="display:inline-block;width:12px;height:12px;background:#ef4444;border-radius:3px;margin-right:4px"></span>Sleeping</span>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-title">🤖 Gemini AI Recommendations for Faculty</div>
    <div id="faculty-recs"></div>
  </div>`;

  UI.makeChart('engChart', 'line',
    ['0m','5m','10m','15m','20m','25m','30m','35m','40m','45m'],
    [
      {label:'Engagement %', data:[88,85,82,79,72,68,74,78,82,76], borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,.1)', tension:.4, fill:true},
      {label:'Attention %',  data:[90,87,80,75,65,60,70,75,80,72], borderColor:'#10b981', backgroundColor:'rgba(16,185,129,.1)', tension:.4, fill:true}
    ],
    { scales: { x:{ticks:{color:'#94a3b8'},grid:{color:'#1e293b'}}, y:{ticks:{color:'#94a3b8'},grid:{color:'#1e293b'},min:0,max:100} } }
  );

  const states = ['#10b981','#10b981','#f59e0b','#10b981','#ef4444','#10b981','#10b981','#f59e0b',
                  '#10b981','#f59e0b','#10b981','#10b981','#ef4444','#10b981','#f59e0b','#10b981',
                  '#10b981','#10b981','#f59e0b','#10b981','#10b981','#ef4444','#10b981','#10b981',
                  '#f59e0b','#10b981','#10b981','#10b981','#10b981','#f59e0b','#10b981','#10b981'];
  const statusLabel = c => c==='#10b981'?'Attentive':c==='#f59e0b'?'Distracted':'Sleeping';
  document.getElementById('heatmap').innerHTML = states.map((c,i) =>
    `<div class="heatmap-cell" style="background:${c}" title="Student ${i+1}: ${statusLabel(c)}"
      onclick="UI.showToast('Student ${i+1}','Status: ${statusLabel(c)} · Row ${Math.floor(i/8)+1}, Seat ${(i%8)+1}')"></div>`
  ).join('');

  document.getElementById('faculty-recs').innerHTML = [
    {icon:'⚠️', text:'Engagement dropped significantly after 25 minutes. Consider a 5-minute interactive break or Q&A session.'},
    {icon:'🔴', text:'8 students showing drowsiness signals. Suggest a quick activity, cold water break, or change of teaching pace.'},
    {icon:'💡', text:'Topic 4 (Data Structures) showing 34% confusion index. Recommend visual diagram or worked example recap.'},
    {icon:'✅', text:'First 20 minutes had excellent engagement (88%). Your opening strategy is highly effective — replicate it.'},
    {icon:'📊', text:'Gemini Vision confidence: 91%. Analysis based on 90 sampled frames over 45-minute session.'},
  ].map(r => `
    <div style="display:flex;gap:14px;padding:14px;background:var(--bg3);border-radius:10px;margin-bottom:10px;align-items:flex-start">
      <span style="font-size:1.2rem;flex-shrink:0">${r.icon}</span>
      <span style="font-size:.875rem;line-height:1.6">${r.text}</span>
    </div>`).join('');
};
