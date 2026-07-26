// js/pages/profile.js — Student Profile + Trusted Contacts (Google-Safety style)
// Persisted to localStorage. Used by the SOS Emergency Alert dispatcher to know
// WHO to notify (student identity + trusted contacts + institutional recipients).
var Pages = Pages || {};

const Profile = {
  KEY_ME: 'asha_profile_me',
  KEY_CONTACTS: 'asha_trusted_contacts',
  KEY_INST: 'asha_institutional',

  _me: null,
  _contacts: null,
  _inst: null,

  _defMe() {
    return { name: 'Debosmita Banerjee', roll: 'CSE2026XXX', mobile: '+91 90000 00000', hostel: 'Girls Hostel, Block C' };
  },
  _defContacts() {
    return [
      { relation: 'Mother',   name: 'Anita Banerjee',  phone: '+91 90000 11111', email: '', channels: ['sms','whatsapp'] },
      { relation: 'Father',   name: 'Rajesh Banerjee', phone: '+91 90000 22222', email: '', channels: ['sms','whatsapp'] },
      { relation: 'Guardian', name: 'Local Guardian',  phone: '+91 90000 33333', email: '', channels: ['whatsapp'] },
    ];
  },
  _defInst() {
    return {
      adminEmail: 'admin@college.edu',
      securityEmail: 'security-control@college.edu',
      wardenEmail: 'warden@college.edu',
      wardenEnabled: true,
      securityPhone: '+91 90000 44444',
    };
  },

  load() {
    try { this._me = JSON.parse(localStorage.getItem(this.KEY_ME)) || this._defMe(); } catch (e) { this._me = this._defMe(); }
    try { this._contacts = JSON.parse(localStorage.getItem(this.KEY_CONTACTS)) || this._defContacts(); } catch (e) { this._contacts = this._defContacts(); }
    try { this._inst = JSON.parse(localStorage.getItem(this.KEY_INST)) || this._defInst(); } catch (e) { this._inst = this._defInst(); }
  },
  saveMe()       { try { localStorage.setItem(this.KEY_ME, JSON.stringify(this._me)); } catch (e) {} },
  saveContacts() { try { localStorage.setItem(this.KEY_CONTACTS, JSON.stringify(this._contacts)); } catch (e) {} },
  saveInst()     { try { localStorage.setItem(this.KEY_INST, JSON.stringify(this._inst)); } catch (e) {} },

  me()       { if (!this._me) this.load(); return this._me; },
  contacts() { if (!this._contacts) this.load(); return this._contacts; },
  inst()     { if (!this._inst) this.load(); return this._inst; },

  // Full recipient list for an emergency alert — institutional + trusted contacts.
  alertRecipients() {
    const inst = this.inst();
    const out = [
      { name: 'College Admin',        role: 'Admin',           email: inst.adminEmail,    phone: '',                 channels: ['email'] },
      { name: 'Security Control Room', role: 'Security',       email: inst.securityEmail, phone: inst.securityPhone, channels: ['email','sms'] },
    ];
    if (inst.wardenEnabled && inst.wardenEmail)
      out.push({ name: 'Hostel Warden', role: 'Warden', email: inst.wardenEmail, phone: '', channels: ['email'] });
    this.contacts().forEach(c => out.push({
      name: c.name, role: c.relation, email: c.email || '', phone: c.phone || '',
      channels: c.channels && c.channels.length ? c.channels : ['sms']
    }));
    return out;
  }
};
Profile.load();

// PLACEHOLDER_PROFILE_PAGE

Pages.profile = function (el) {
  const me = Profile.me(), inst = Profile.inst();
  const relIcon = { Mother:'👩', Father:'👨', Sibling:'🧑', Friend:'🧑‍🤝‍🧑', Guardian:'🛡️' };
  el.innerHTML = `
  <div class="card" style="border-left:3px solid #3b82f6">
    <div class="card-title">🪪 My Profile <span style="font-size:.75rem;color:var(--text2);font-weight:400">Used to identify you in emergency alerts</span></div>
    <div class="two-col" style="gap:12px">
      <div class="form-row"><label>Full Name</label><input id="pf-name" value="${me.name}"></div>
      <div class="form-row"><label>Roll / Student ID</label><input id="pf-roll" value="${me.roll}"></div>
      <div class="form-row"><label>Mobile Number</label><input id="pf-mobile" value="${me.mobile}"></div>
      <div class="form-row"><label>Hostel / Residence</label><input id="pf-hostel" value="${me.hostel}"></div>
    </div>
    <button class="btn sm" style="margin-top:10px" onclick="Profile.updateMe()"><i class="fas fa-save"></i> Save Profile</button>
  </div>

  <div class="card" style="border-left:3px solid #ec4899">
    <div class="card-title">💗 Trusted Contacts <span style="font-size:.75rem;color:var(--text2);font-weight:400">Alerted instantly when you trigger SOS — like Google Safety</span></div>
    <div id="pf-contacts"></div>
    <div style="margin-top:14px;padding:14px;background:var(--bg3);border-radius:10px">
      <div style="font-weight:600;font-size:.85rem;margin-bottom:10px">➕ Add a trusted contact</div>
      <div class="two-col" style="gap:10px">
        <div class="form-row"><label>Relation</label>
          <select id="nc-rel"><option>Mother</option><option>Father</option><option>Sibling</option><option>Friend</option><option>Guardian</option></select></div>
        <div class="form-row"><label>Name</label><input id="nc-name" placeholder="Contact name"></div>
        <div class="form-row"><label>Phone</label><input id="nc-phone" placeholder="+91 ..."></div>
        <div class="form-row"><label>Email (optional)</label><input id="nc-email" placeholder="name@example.com"></div>
      </div>
      <div style="display:flex;gap:14px;margin:8px 0;font-size:.8rem;flex-wrap:wrap">
        <label style="display:flex;align-items:center;gap:5px"><input type="checkbox" id="nc-sms" checked> SMS</label>
        <label style="display:flex;align-items:center;gap:5px"><input type="checkbox" id="nc-wa" checked> WhatsApp</label>
        <label style="display:flex;align-items:center;gap:5px"><input type="checkbox" id="nc-email-ch"> Email</label>
      </div>
      <button class="btn sm" onclick="Profile.addContact()"><i class="fas fa-user-plus"></i> Add Contact</button>
    </div>
  </div>

  <div class="card" style="border-left:3px solid #8b5cf6">
    <div class="card-title">🏛️ Institutional Recipients <span style="font-size:.75rem;color:var(--text2);font-weight:400">Official emergency inboxes</span></div>
    <div class="two-col" style="gap:12px">
      <div class="form-row"><label>College Admin Email</label><input id="in-admin" value="${inst.adminEmail}"></div>
      <div class="form-row"><label>Security Control Room Email</label><input id="in-sec" value="${inst.securityEmail}"></div>
      <div class="form-row"><label>Security Desk Phone</label><input id="in-secph" value="${inst.securityPhone}"></div>
      <div class="form-row"><label>Warden Email</label><input id="in-warden" value="${inst.wardenEmail}"></div>
    </div>
    <label style="display:flex;align-items:center;gap:6px;font-size:.82rem;margin:8px 0"><input type="checkbox" id="in-warden-en" ${inst.wardenEnabled?'checked':''}> Notify Warden (optional)</label>
    <button class="btn sm" onclick="Profile.updateInst()"><i class="fas fa-save"></i> Save Recipients</button>
  </div>

  <div class="card">
    <div class="card-title">🧪 Test Emergency Dispatch</div>
    <div style="font-size:.84rem;color:var(--text2);margin-bottom:12px">Send a <b>test</b> alert to all recipients through every enabled channel. Real messages send only if backend keys are configured; otherwise the dispatch is simulated on-screen.</div>
    <button class="btn" onclick="AlertSystem.test()"><i class="fas fa-paper-plane"></i> Send Test Alert</button>
  </div>`;

  Profile.renderContacts(relIcon);
};

Profile.renderContacts = function (relIcon) {
  relIcon = relIcon || { Mother:'👩', Father:'👨', Sibling:'🧑', Friend:'🧑‍🤝‍🧑', Guardian:'🛡️' };
  const wrap = document.getElementById('pf-contacts');
  if (!wrap) return;
  const list = this.contacts();
  wrap.innerHTML = list.length ? list.map((c, i) => `
    <div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--border)">
      <div style="width:40px;height:40px;border-radius:50%;background:rgba(236,72,153,.14);display:flex;align-items:center;justify-content:center;font-size:1.15rem;flex-shrink:0">${relIcon[c.relation]||'👤'}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:.88rem;font-weight:600">${c.name} <span style="color:var(--text2);font-weight:400">· ${c.relation}</span></div>
        <div style="font-size:.75rem;color:var(--text2)">${c.phone||'no phone'}${c.email?' · '+c.email:''} · ${(c.channels||[]).join(', ')||'—'}</div>
      </div>
      <button class="btn sm ghost" onclick="Profile.removeContact(${i})"><i class="fas fa-trash"></i></button>
    </div>`).join('') : '<div style="color:var(--text2);font-size:.84rem;padding:8px 0">No trusted contacts yet. Add one below.</div>';
};

Profile.updateMe = function () {
  this._me = {
    name: document.getElementById('pf-name').value.trim() || 'Student',
    roll: document.getElementById('pf-roll').value.trim() || '—',
    mobile: document.getElementById('pf-mobile').value.trim() || '—',
    hostel: document.getElementById('pf-hostel').value.trim() || '—',
  };
  this.saveMe();
  UI.showToast('Profile saved', 'Your details will be used in emergency alerts.');
};

Profile.updateInst = function () {
  this._inst = {
    adminEmail: document.getElementById('in-admin').value.trim(),
    securityEmail: document.getElementById('in-sec').value.trim(),
    securityPhone: document.getElementById('in-secph').value.trim(),
    wardenEmail: document.getElementById('in-warden').value.trim(),
    wardenEnabled: document.getElementById('in-warden-en').checked,
  };
  this.saveInst();
  UI.showToast('Recipients saved', 'Official emergency inboxes updated.');
};

Profile.addContact = function () {
  const name = document.getElementById('nc-name').value.trim();
  const phone = document.getElementById('nc-phone').value.trim();
  if (!name || !phone) { UI.showToast('Missing info', 'Name and phone are required.'); return; }
  const channels = [];
  if (document.getElementById('nc-sms').checked) channels.push('sms');
  if (document.getElementById('nc-wa').checked) channels.push('whatsapp');
  if (document.getElementById('nc-email-ch').checked) channels.push('email');
  this.contacts().push({
    relation: document.getElementById('nc-rel').value,
    name, phone, email: document.getElementById('nc-email').value.trim(),
    channels: channels.length ? channels : ['sms']
  });
  this.saveContacts();
  this.renderContacts();
  document.getElementById('nc-name').value = '';
  document.getElementById('nc-phone').value = '';
  document.getElementById('nc-email').value = '';
  UI.showToast('Contact added', `${name} will be alerted on SOS.`);
};

Profile.removeContact = function (i) {
  this.contacts().splice(i, 1);
  this.saveContacts();
  this.renderContacts();
  UI.showToast('Contact removed', '');
};

