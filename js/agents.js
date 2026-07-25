// ── ASHA EduShield 2.0 — Agent Pipeline Engine ──
const Agents = {
  // Run a visual step-by-step pipeline in a container element
  runPipeline(containerId, steps, onComplete) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `<div class="agent-flow">${steps.map((s, i) =>
      `<div class="agent-step" id="ap-${containerId}-${i}">
        <div class="agent-badge">${s.icon}</div>
        <div class="agent-info">
          <div class="agent-name">${s.name}</div>
          <div class="agent-desc">${s.desc}</div>
        </div>
        <div class="agent-status" id="aps-${containerId}-${i}">
          <i class="fas fa-circle" style="color:#1e293b;font-size:.7rem"></i>
        </div>
      </div>`).join('')}
    </div>`;

    steps.forEach((_, i) => {
      setTimeout(() => {
        if (i > 0) {
          const prev = document.getElementById(`ap-${containerId}-${i-1}`);
          const prevS = document.getElementById(`aps-${containerId}-${i-1}`);
          if (prev) { prev.classList.remove('active'); prev.classList.add('done'); }
          if (prevS) prevS.innerHTML = '<i class="fas fa-check-circle" style="color:#10b981"></i>';
        }
        const cur = document.getElementById(`ap-${containerId}-${i}`);
        const curS = document.getElementById(`aps-${containerId}-${i}`);
        if (cur) cur.classList.add('active');
        if (curS) curS.innerHTML = '<i class="fas fa-spinner fa-spin" style="color:#f59e0b"></i>';

        if (i === steps.length - 1) {
          setTimeout(() => {
            if (cur) { cur.classList.remove('active'); cur.classList.add('done'); }
            if (curS) curS.innerHTML = '<i class="fas fa-check-circle" style="color:#10b981"></i>';
            if (onComplete) onComplete();
          }, 1200);
        }
      }, i * 1100);
    });
  },

  sosPipeline: [
    {icon:'📍', name:'SOS Agent', desc:'Capturing GPS coordinates & creating incident ticket #INC-4822'},
    {icon:'🛡', name:'Guardian Agent', desc:'Evaluating threat level → Score: 94/100 → CRITICAL'},
    {icon:'📡', name:'Dispatch Agent', desc:'Notifying Guard #3 (Rajan K.) + Guard #7 (Suresh M.) + Warden'},
    {icon:'🔍', name:'Investigation Agent', desc:'Starting evidence collection — audio & GPS stream active'},
    {icon:'🔊', name:'ElevenLabs Voice', desc:'Sending multilingual voice alert to all responders'},
    {icon:'📊', name:'Risk Prediction Agent', desc:'Updating campus threat heatmap — Block B flagged HIGH'},
  ],

  ragingPipeline: [
    {icon:'🤖', name:'Anti-Ragging Agent', desc:'Running Gemini Pro NLP analysis on complaint text'},
    {icon:'🔍', name:'Actian Vector Search', desc:'Searching 847 past incidents for similar patterns'},
    {icon:'👤', name:'Offender Detection', desc:'Cross-referencing accused against repeat offender registry'},
    {icon:'📋', name:'Investigation Agent', desc:'Generating preliminary investigation brief & evidence summary'},
    {icon:'🛡', name:'Guardian Agent', desc:'Severity: HIGH — Escalating to Admin + Anti-Ragging Committee'},
    {icon:'📜', name:'Compliance Agent', desc:'Logging for UGC Anti-Ragging compliance report'},
  ],

  wellnessPipeline: [
    {icon:'🧠', name:'Mental Wellness Agent', desc:'Analyzing sentiment & distress signals in conversation'},
    {icon:'📊', name:'Risk Scoring', desc:'Computing wellness score: 42/100 — MEDIUM risk'},
    {icon:'💙', name:'Suicide Prevention Agent', desc:'Monitoring for crisis keywords — threshold not crossed'},
    {icon:'👩‍⚕️', name:'Counselor Assignment', desc:'Flagging for follow-up with Dr. Meera Sharma (Counselor)'},
  ],

  examPipeline: [
    {icon:'👁', name:'Exam Integrity Agent', desc:'Gemini Vision analyzing frame — seat B-12'},
    {icon:'📱', name:'Phone Detection', desc:'Object detection: smartphone — confidence 94%'},
    {icon:'📋', name:'Evidence Generation', desc:'Timestamped screenshot + 30s clip saved to evidence store'},
    {icon:'🚨', name:'Faculty Alert', desc:'Real-time alert sent to invigilator dashboard'},
  ],

  missingPipeline: [
    {icon:'📍', name:'Last Location Agent', desc:'Retrieving last GPS ping — Library Zone, 2:34 PM'},
    {icon:'👁', name:'CCTV Face Match', desc:'Gemini Vision scanning 12 camera feeds for face match'},
    {icon:'🔍', name:'Missing Student Agent', desc:'Generating search radius map — 500m from last location'},
    {icon:'📡', name:'Dispatch Agent', desc:'Deploying 3 guards to search zones A, B, C'},
    {icon:'🚔', name:'Compliance Agent', desc:'Preparing police notification — 2hr threshold approaching'},
  ],

  voiceEvidencePipeline: [
    {icon:'🎙', name:'Voice Evidence Agent', desc:'Capturing audio stream — encrypting with AES-256'},
    {icon:'✨', name:'Gemini Audio Analysis', desc:'Speech-to-text + emotion detection (Fear 78%, Distress 71%)'},
    {icon:'🔊', name:'ElevenLabs Voice Verify', desc:'Matching voice signature — owner identity confirmed (94%)'},
    {icon:'🔍', name:'Threat Classification', desc:'Gemini Pro: Harassment / Physical threat — Risk Score 82/100'},
    {icon:'◎', name:'Solana Evidence Chain', desc:'Minting evidence hash as immutable NFT on Solana devnet'},
    {icon:'🍃', name:'MongoDB Atlas', desc:'Storing audio + transcript + analysis in Atlas cluster'},
    {icon:'📡', name:'Dispatch Agent', desc:'Alerting nearest guard + warden with evidence package'},
  ]
};
