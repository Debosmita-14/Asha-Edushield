// js/pages/wellness.js
var Pages = Pages || {};

Pages.wellness = function (el) {
  el.innerHTML = `
  <div style="max-width:700px">
    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:14px">
        <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0">🧠</div>
        <div style="flex:1">
          <div style="font-weight:700">ASHA Wellness AI</div>
          <div style="color:var(--text2);font-size:.78rem">Powered by Gemini Pro · Fully anonymous · Confidential</div>
        </div>
        <span class="pill low"><span class="live-dot"></span> Online</span>
      </div>
    </div>
    <div class="card">
      <div class="chat-box" id="chat-box"></div>
      <div style="margin-bottom:10px;display:flex;gap:8px;flex-wrap:wrap">
        ${["I'm feeling anxious","Stressed about exams","I feel lonely","I need to talk","I'm not doing well"].map(t =>
          `<span class="tag" style="cursor:pointer;padding:6px 12px;transition:all .2s" onclick="Wellness.quickChat('${t}')">${t}</span>`
        ).join('')}
      </div>
      <div class="chat-input">
        <input type="text" id="chat-in" placeholder="How are you feeling today? Type anything..." onkeydown="if(event.key==='Enter')Wellness.send()">
        <button onclick="Wellness.send()"><i class="fas fa-paper-plane"></i></button>
      </div>
    </div>
    <div class="two-col" style="margin-top:0">
      <div class="card">
        <div class="card-title">Wellness Resources</div>
        ${[
          {icon:'📞', label:'iCall Helpline', val:'9152987821', color:'#10b981'},
          {icon:'💬', label:'Campus Counselor', val:'Dr. Meera Sharma', color:'#3b82f6'},
          {icon:'🏥', label:'Medical Center', val:'Ext. 1234', color:'#f59e0b'},
          {icon:'🚨', label:'Emergency', val:'112 / Campus SOS', color:'#ef4444'},
        ].map(r => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:1.2rem">${r.icon}</span>
            <div><div style="font-size:.85rem;font-weight:600">${r.label}</div>
            <div style="font-size:.78rem;color:${r.color}">${r.val}</div></div>
          </div>`).join('')}
      </div>
    </div>
  </div>`;

  Wellness._addBot("Hi 👋 I'm ASHA, your wellness companion. Everything you share here is completely confidential — I'm here to listen without judgment. How are you feeling today?");
};

const Wellness = {
  _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },

  _reply(msg) {
    const m = msg.toLowerCase();
    const r = DATA.botResponses;
    if (m.includes('die') || m.includes('suicide') || m.includes('end my life') || m.includes('kill myself') || m.includes('self harm')) {
      setTimeout(() => {
        UI.showToast('⚠️ Crisis Alert', 'Suicide Prevention Agent activated. Counselor notified.', 'alert');
        Agents.runPipeline('wellness-pipeline', Agents.wellnessPipeline, () => {});
      }, 600);
      return r.crisis[0];
    }
    if (m.includes('anxi') || m.includes('panic') || m.includes('worry') || m.includes('nervous')) return this._pick(r.anxious);
    if (m.includes('stress') || m.includes('exam') || m.includes('study') || m.includes('pressure')) return this._pick(r.stress);
    if (m.includes('lone') || m.includes('alone') || m.includes('isolat') || m.includes('friend')) return this._pick(r.lonely);
    if (m.includes('sad') || m.includes('depress') || m.includes('cry') || m.includes('hurt') || m.includes('hopeless')) return this._pick(r.sad);
    return this._pick(r.default);
  },

  _addBot(text) {
    const box = document.getElementById('chat-box');
    if (!box) return;
    const d = document.createElement('div');
    d.className = 'msg bot';
    d.textContent = text;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  },

  _addUser(text) {
    const box = document.getElementById('chat-box');
    if (!box) return;
    const d = document.createElement('div');
    d.className = 'msg user';
    d.textContent = text;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  },

  send() {
    const inp = document.getElementById('chat-in');
    if (!inp || !inp.value.trim()) return;
    const msg = inp.value.trim();
    inp.value = '';
    this._addUser(msg);
    setTimeout(() => this._addBot(this._reply(msg)), 900);
  },

  quickChat(text) {
    const inp = document.getElementById('chat-in');
    if (inp) inp.value = text;
    this.send();
  }
};
