const SITE = 'Jade Bio';

const SOCIAL_ICONS = {
  discord: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5L15.8 12l-6.1 3.5z"/></svg>',
  steam: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a9.9 9.9 0 0 0-7.4 3.3l3.9 1.8a3.5 3.5 0 0 1 1.9-.6 3.5 3.5 0 1 1-1.4 6.6l-3.7 1.7A10 10 0 1 0 12 2zm-1 9.2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>',
  custom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
};

function getLevel(p) {
  return Math.min(99, Math.floor((p.views || 0) / 10) + 1);
}
const DB_KEY = 'swiftcrime_db';
const SESSION_KEY = 'swiftcrime_session';

const ROLES = ['admin', 'moderator', 'helper', 'vippro', 'vipplus', 'vip', 'player'];
const PRICES = { vip: 15, vipplus: 50, vippro: 150 };

function loadDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) return migrateDB(JSON.parse(raw));
  const adminPass = hash('admin123');
  const db = {
    users: [{
      id: 1, username: 'admin', email: 'admin@local.dev', password: adminPass,
      role: 'admin', tier: 'vippro', display_name: 'Admin',
      avatar: '', background: '', bio: '', tagline: '', location: '',
      music_title: '', music_artist: '', music_url: '',
      views: 0, bg_x: 50, bg_y: 50, avatar_x: 50, avatar_y: 50,
      created_at: today(), last_login: null, last_ip: '',
      viewedBy: [],
    }],
    invites: [{ id: 1, code: 'VL-START2025', used_by: null, created_at: today() }],
    logs: [],
    settings: { snow: false, leaves: false, theme: 'dark' },
    nextId: { user: 2, invite: 2 },
  };
  saveDB(db);
  return db;
}

function saveDB(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }
function getDB() { return loadDB(); }

function hash(s) { return btoa(unescape(encodeURIComponent(s))); }

function today() { return new Date().toISOString().slice(0, 10); }

function genCode() {
  return 'VL-' + Math.random().toString(36).slice(2, 10).toUpperCase();
}

function migrateUser(u) {
  u.link_discord = u.link_discord || '';
  u.link_discord_server = u.link_discord_server || '';
  u.link_telegram = u.link_telegram || '';
  u.link_steam = u.link_steam || '';
  u.link_youtube = u.link_youtube || '';
  u.link_custom = u.link_custom || '';
  u.link_custom_label = u.link_custom_label || '';
  u.discord_id = u.discord_id || extractDiscordId(u.link_discord) || '';
  return u;
}

function extractDiscordId(urlOrId) {
  if (!urlOrId) return '';
  const s = String(urlOrId).trim();
  if (/^\d{17,20}$/.test(s)) return s;
  const m = s.match(/discord(?:app)?\.com\/users\/(\d{17,20})/i);
  return m ? m[1] : '';
}

function migrateDB(db) {
  db.users = (db.users || []).map(migrateUser);
  return db;
}

function session() {
  const id = localStorage.getItem(SESSION_KEY);
  return id ? getDB().users.find((u) => u.id === parseInt(id, 10)) : null;
}

function setSession(id) {
  if (id) localStorage.setItem(SESSION_KEY, String(id));
  else localStorage.removeItem(SESSION_KEY);
}

function log(action, username, ip = 'local') {
  const db = getDB();
  db.logs.unshift({ time: new Date().toLocaleString('ru'), username, action, ip });
  if (db.logs.length > 200) db.logs.length = 200;
  saveDB(db);
}

function isStaff(u) { return u && ['admin', 'moderator', 'helper'].includes(u.role); }
function canAdmin(u) { return u && (u.role === 'admin' || u.role === 'moderator'); }

function showPage(name) {
  document.querySelectorAll('[data-page]').forEach((el) => {
    el.classList.add('hidden');
    el.classList.remove('page-enter');
  });
  const page = document.querySelector(`[data-page="${name}"]`);
  if (page) {
    page.classList.remove('hidden');
    requestAnimationFrame(() => {
      page.classList.add('page-enter');
    });
  }
  window.scrollTo(0, 0);
  if (name === 'home') renderHome();
  if (name === 'dashboard') renderDashboard();
  if (name === 'shop') renderShop();
  if (name === 'admin') renderAdmin();
  if (name === 'profile') renderProfile();
}

function renderHome() {
  const u = session();
  const nav = document.getElementById('nav-home');
  if (!nav) return;
  if (u) {
    nav.innerHTML = `
      <button class="link-btn" onclick="openProfile('${u.username}')">Мой био</button>
      <button class="link-btn" onclick="showPage('dashboard')">Кабинет</button>
      <button class="link-btn" onclick="showPage('shop')">Магазин</button>
      ${isStaff(u) ? '<button class="link-btn" onclick="showPage(\'admin\')">Админ</button>' : ''}
      <button class="pill-btn" onclick="logout()">Выход</button>`;
    document.getElementById('hero-cta').innerHTML = `
      <button class="pill-btn lg" onclick="showPage('dashboard')">Настроить био</button>
      <button class="pill-btn lg dark" onclick="openProfile('${u.username}')">Смотреть страницу</button>`;
  } else {
    nav.innerHTML = `
      <button class="link-btn" onclick="showPage('login')">Войти</button>
      <button class="pill-btn" onclick="showPage('register')">Регистрация</button>`;
    document.getElementById('hero-cta').innerHTML = `
      <button class="pill-btn lg" onclick="showPage('register')">Создать био</button>
      <button class="pill-btn lg outline" onclick="showPage('login')">Войти</button>`;
  }
}

function switchDashTab(tab) {
  document.querySelectorAll('.dash-tabs [data-dash-tab]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.dashTab === tab);
  });
  document.querySelectorAll('[data-dash-panel]').forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.dashPanel === tab);
  });
}

function previewDashFile(input, kind) {
  const file = input.files?.[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    if (kind === 'bg') {
      const img = document.getElementById('dash-bg-img');
      const ph = document.querySelector('.dash-preview-placeholder');
      if (img) {
        img.src = r.result;
        img.style.display = 'block';
      }
      if (ph) ph.style.display = 'none';
    } else {
      const img = document.getElementById('dash-ava-preview');
      if (img) img.src = r.result;
    }
  };
  r.readAsDataURL(file);
}

function renderDashboard() {
  const u = session();
  if (!u) return showPage('login');
  if (u.role === 'admin') return showPage('admin');
  const f = document.getElementById('dash-form');
  if (!f) return;
  switchDashTab('profile');
  f.display_name.value = u.display_name || u.username;
  f.tagline.value = u.tagline || '';
  f.location.value = u.location || '';
  f.bio.value = u.bio || '';
  f.music_title.value = u.music_title || '';
  f.music_artist.value = u.music_artist || '';
  if (f.discord_id) f.discord_id.value = u.discord_id || '';
  if (f.link_discord) f.link_discord.value = u.link_discord || '';
  if (f.link_discord_server) f.link_discord_server.value = u.link_discord_server || '';
  if (f.link_telegram) f.link_telegram.value = u.link_telegram || '';
  if (f.link_steam) f.link_steam.value = u.link_steam || '';
  if (f.link_youtube) f.link_youtube.value = u.link_youtube || '';
  if (f.link_custom) f.link_custom.value = u.link_custom || '';
  if (f.link_custom_label) f.link_custom_label.value = u.link_custom_label || '';
  const link = document.getElementById('dash-link');
  link.textContent = '/' + u.username;
  link.onclick = (e) => { e.preventDefault(); openProfile(u.username); };
  document.getElementById('dash-views').textContent = u.views || 0;
  const uidEl = document.getElementById('dash-uid');
  if (uidEl) uidEl.textContent = u.id;

  const avPrev = document.getElementById('dash-ava-preview');
  if (avPrev) avPrev.src = u.avatar || 'img/default-avatar.svg';
  const bgPrev = document.getElementById('dash-bg-img');
  const bgPh = document.querySelector('.dash-preview-placeholder');
  if (u.background && bgPrev) {
    bgPrev.src = u.background;
    bgPrev.style.display = 'block';
    if (bgPh) bgPh.style.display = 'none';
  } else if (bgPrev) {
    bgPrev.style.display = 'none';
    if (bgPh) bgPh.style.display = '';
  }
}

function fileToDataUrl(file, cb) {
  const r = new FileReader();
  r.onload = () => cb(r.result);
  r.readAsDataURL(file);
}

function saveDashboard(e) {
  e.preventDefault();
  const u = session();
  if (!u) return;
  const db = getDB();
  const user = db.users.find((x) => x.id === u.id);
  const f = e.target;

  user.display_name = f.display_name.value;
  user.tagline = f.tagline.value;
  user.location = f.location.value;
  user.bio = f.bio.value;
  user.music_title = f.music_title.value;
  user.music_artist = f.music_artist.value;
  user.discord_id = (f.discord_id?.value || '').trim().replace(/\D/g, '') || extractDiscordId(f.link_discord?.value);
  user.link_discord = f.link_discord?.value || '';
  user.link_discord_server = f.link_discord_server?.value || '';
  user.link_telegram = f.link_telegram?.value || '';
  user.link_steam = f.link_steam?.value || '';
  user.link_youtube = f.link_youtube?.value || '';
  user.link_custom = f.link_custom?.value || '';
  user.link_custom_label = f.link_custom_label?.value || '';

  const done = () => {
    saveDB(db);
    setSession(user.id);
    log('Профиль сохранён', user.username);
    document.getElementById('dash-msg').innerHTML = '<div class="alert alert-success">Сохранено!</div>';
  };

  let pending = 0;
  const check = () => { if (--pending <= 0) done(); };

  if (f.avatar.files[0]) { pending++; fileToDataUrl(f.avatar.files[0], (d) => { user.avatar = d; check(); }); }
  if (f.background.files[0]) { pending++; fileToDataUrl(f.background.files[0], (d) => { user.background = d; check(); }); }
  if (f.music.files[0]) { pending++; fileToDataUrl(f.music.files[0], (d) => { user.music_url = d; check(); }); }
  if (pending === 0) done();
}

function renderShop() {
  const u = session();
  document.getElementById('shop-grid').querySelectorAll('[data-tier]').forEach((btn) => {
    btn.onclick = () => buyTier(btn.dataset.tier);
    btn.disabled = !u;
    btn.textContent = u ? 'Купить' : 'Войти';
    if (!u) btn.onclick = () => showPage('login');
  });
}

function buyTier(tier) {
  const u = session();
  if (!u) return showPage('login');
  if (confirm(`Демо-оплата ${PRICES[tier]}₽ за ${tier.toUpperCase()}?`)) {
    const db = getDB();
    const user = db.users.find((x) => x.id === u.id);
    user.tier = tier;
    if (!isStaff(user)) user.role = tier;
    saveDB(db);
    setSession(user.id);
    log(`Купил ${tier}`, user.username);
    document.getElementById('shop-msg').innerHTML = `<div class="alert alert-success">Подписка ${tier.toUpperCase()} активирована!</div>`;
  }
}

function renderAdmin() {
  const u = session();
  if (!canAdmin(u)) return showPage('home');
  const db = getDB();
  const players = db.users.filter((x) => x.username !== 'admin');

  document.getElementById('stat-users').textContent = players.length;
  document.getElementById('stat-invites').textContent = db.invites.filter((i) => !i.used_by).length;

  document.getElementById('admin-players').innerHTML = players.map((p) => `
    <tr>
      <td><span class="key-code">${p.id}</span></td>
      <td><a href="#" onclick="openProfile('${p.username}');return false" style="color:#67e8f9">${p.username}</a></td>
      <td>${p.email}</td>
      <td>
        <select onchange="setRole(${p.id},this.value)" class="btn-sm">
          ${ROLES.filter(r => r !== 'admin').map((r) => `<option value="${r}" ${p.role===r?'selected':''}>${r}</option>`).join('')}
        </select>
      </td>
      <td>${p.tier || '—'}</td>
      <td>${p.views || 0}</td>
      <td style="font-size:0.7rem">${p.last_ip || '—'}</td>
      <td><button class="btn-sm danger" onclick="removeVip(${p.id})">Снять VIP</button></td>
    </tr>`).join('');

  document.getElementById('admin-invites').innerHTML = db.invites.slice(0, 30).map((i) => {
    const used = db.users.find((u) => u.id === i.used_by);
    return `<tr><td><span class="key-code">${i.code}</span></td><td>${i.used_by ? 'Да' : 'Нет'}</td><td>${used ? used.username : '—'}</td><td>${i.created_at}</td></tr>`;
  }).join('');

  document.getElementById('admin-logs').innerHTML = db.logs.slice(0, 50).map((l) =>
    `<tr><td>${l.time}</td><td>${l.username}</td><td>${l.action}</td><td>${l.ip}</td></tr>`
  ).join('');

  if (u.role === 'admin') {
    document.getElementById('fx-panel').classList.remove('hidden');
    document.getElementById('fx-snow').checked = db.settings.snow;
    document.getElementById('fx-leaves').checked = db.settings.leaves;
    document.getElementById('fx-theme').value = db.settings.theme;
  } else {
    document.getElementById('fx-panel').classList.add('hidden');
  }
}

function createInvites() {
  const n = parseInt(document.getElementById('invite-count').value, 10) || 1;
  const db = getDB();
  const codes = [];
  for (let i = 0; i < Math.min(n, 20); i++) {
    const code = genCode();
    db.invites.push({ id: db.nextId.invite++, code, used_by: null, created_at: today() });
    codes.push(code);
  }
  saveDB(db);
  document.getElementById('admin-msg').innerHTML = `<div class="alert alert-success">Созданы:</div><div class="invite-box">${codes.join('<br>')}</div>`;
  renderAdmin();
}

function setRole(id, role) {
  const db = getDB();
  const u = db.users.find((x) => x.id === id);
  if (u && u.username !== 'admin') {
    u.role = role;
    if (['vip','vipplus','vippro'].includes(role)) u.tier = role;
    saveDB(db);
    log(`Роль ${u.username} → ${role}`, session()?.username || 'admin');
    renderAdmin();
  }
}

function removeVip(id) {
  const db = getDB();
  const u = db.users.find((x) => x.id === id);
  if (u && !isStaff(u)) { u.tier = 'none'; u.role = 'player'; saveDB(db); renderAdmin(); }
}

function saveFx() {
  const db = getDB();
  db.settings.snow = document.getElementById('fx-snow').checked;
  db.settings.leaves = document.getElementById('fx-leaves').checked;
  db.settings.theme = document.getElementById('fx-theme').value;
  saveDB(db);
  document.getElementById('admin-msg').innerHTML = '<div class="alert alert-success">Эффекты сохранены</div>';
}

let profileUser = null;

function openProfile(username) {
  const db = getDB();
  profileUser = db.users.find((u) => u.username === username.toLowerCase());
  if (!profileUser || profileUser.role === 'admin') {
    alert('Профиль не найден');
    return;
  }
  const me = session();
  if (!me || me.id !== profileUser.id) {
    const vid = localStorage.getItem('visitor_id') || (() => {
      const v = 'v_' + Math.random().toString(36).slice(2);
      localStorage.setItem('visitor_id', v);
      return v;
    })();
    if (!profileUser.viewedBy) profileUser.viewedBy = [];
    if (!profileUser.viewedBy.includes(vid)) {
      profileUser.viewedBy.push(vid);
      profileUser.views = (profileUser.views || 0) + 1;
      saveDB(db);
    }
  }
  showPage('profile');
}

function renderProfile() {
  const p = profileUser;
  if (!p) return;
  const db = getDB();
  const settings = db.settings;
  const me = session();
  const level = getLevel(p);
  const avatarSrc = p.avatar || 'img/default-avatar.svg';
  const tagline = p.tagline || p.bio?.split('\n')[0] || '';
  const hasMusic = !!(p.music_url || p.music_title);
  const discordId = p.discord_id || extractDiscordId(p.link_discord);

  const root = document.getElementById('profile-root');
  root.innerHTML = `
    ${settings.snow ? '<canvas id="snow-canvas"></canvas>' : ''}
    ${settings.leaves ? '<canvas id="leaves-canvas"></canvas>' : ''}
    <div class="bio-page bio-glass-page">
      <img class="bio-bg-img" id="bio-bg-img" alt="" style="display:none">
      <img class="bio-bg-blur-img" id="bio-bg-blur-img" alt="" style="display:none">
      <div class="bio-bg-fallback"></div>
      <div class="bio-bg-layer"></div>
      <button type="button" class="bio-volume" id="vol-btn" title="Звук">🔊</button>
      ${me && me.id === p.id ? '<button class="pill-btn dark bio-edit-btn" onclick="showPage(\'dashboard\')">✎ Редактировать</button>' : ''}
      <div class="bio-glass-wrap">
        <div class="bio-glass-card">
          <div class="bio-badges">${buildBadges(p)}</div>
          <div class="bio-avatar-wrap">
            <img class="bio-avatar" id="bio-avatar-img" src="${avatarSrc}" alt="">
          </div>
          <h1 class="bio-name">${esc(p.display_name || p.username)}</h1>
          ${tagline ? `<p class="bio-tagline">${esc(tagline)}<span class="bio-cursor">|</span></p>` : ''}
          <div class="bio-uid-line">
            <span class="uid-mini">${p.id}</span>
            <span>UID <strong>${p.id}</strong> · Ур. <strong>${level}</strong> · ${p.views || 0} просм.</span>
          </div>
          ${p.bio ? `<p class="bio-desc-lg">${esc(p.bio)}</p>` : ''}
          ${p.location ? `<p class="bio-location">${esc(p.location)}</p>` : ''}
          ${buildSocialRow(p)}
          <div id="discord-widget" class="bio-discord-widget hidden"></div>
          <div id="lanyard-activity" class="bio-activity-panel hidden"></div>
          ${hasMusic ? `
          <div class="bio-track-panel">
            <img class="bio-track-art" id="track-art" src="${avatarSrc}" alt="">
            <div class="bio-track-info">
              <div class="bio-track-title">${esc(p.music_title || 'Трек')}</div>
              <div class="bio-track-artist">by ${esc(p.music_artist || p.username)}</div>
              <div class="bio-progress-row">
                <span id="cur">0:00</span>
                <div class="bio-progress" id="prog"><div class="bio-progress-fill" id="fill"></div></div>
                <span id="dur">0:00</span>
              </div>
            </div>
          </div>
          <div class="bio-player-bar">
            <button type="button" class="bio-bar-vol" id="vol-bar" title="Громкость">🔊</button>
            <div class="bio-bar-now">
              <span class="bio-bar-label">Now playing:</span>
              <span id="now-label">${esc(p.music_title || '—')}</span>
            </div>
            <input type="range" class="bio-vol-slider" id="vol-slider" min="0" max="100" value="60">
            <div class="bio-bar-controls">
              <button type="button" class="bio-ctrl-btn" id="prev">⏮</button>
              <button type="button" class="bio-ctrl-btn play" id="play">▶</button>
              <button type="button" class="bio-ctrl-btn" id="next">⏭</button>
            </div>
          </div>
          ${p.music_url ? '<audio id="audio" preload="auto"></audio>' : ''}` : ''}
        </div>
      </div>
    </div>`;

  if (p.background) {
    const bgImg = document.getElementById('bio-bg-img');
    const bgBlur = document.getElementById('bio-bg-blur-img');
    bgImg.src = p.background;
    bgBlur.src = p.background;
    bgImg.style.display = 'block';
    bgBlur.style.display = 'block';
    document.querySelector('.bio-bg-fallback').style.display = 'none';
  }

  const av = document.getElementById('bio-avatar-img');
  if (p.avatar) av.src = p.avatar;

  if (settings.snow || settings.leaves) {
    window.FX_SNOW = settings.snow;
    window.FX_LEAVES = settings.leaves;
    if (!document.querySelector('script[src="js/effects.js"]')) {
      const s = document.createElement('script');
      s.src = 'js/effects.js';
      document.body.appendChild(s);
    }
  }
  if (discordId) {
    loadLanyard(discordId, p);
  } else if (p.link_discord) {
    const w = document.getElementById('discord-widget');
    if (w) {
      w.classList.remove('hidden');
      w.innerHTML = discordWidgetFallback(p, '');
    }
  }
  if (hasMusic) initPlayer(true);
}

function buildBadges(p) {
  const icons = [];
  if (p.role === 'admin') icons.push('👑');
  if (['moderator', 'helper'].includes(p.role)) icons.push('🛡');
  const t = p.tier !== 'none' ? p.tier : '';
  if (t === 'vippro') icons.push('💎');
  else if (t === 'vipplus') icons.push('⭐');
  else if (t === 'vip') icons.push('✦');
  if (getLevel(p) >= 10) icons.push('🔥');
  if (!icons.length) icons.push('◇');
  return icons.map((i) => `<span class="bio-badge-ico" title="">${i}</span>`).join('');
}

function buildSocialRow(p) {
  const items = [];
  if (p.link_discord) items.push(socialIcon(p.link_discord, 'discord', 'Discord'));
  if (p.link_telegram) items.push(socialIcon(p.link_telegram, 'telegram', 'Telegram'));
  if (p.link_youtube) items.push(socialIcon(p.link_youtube, 'youtube', 'YouTube'));
  if (p.link_steam) items.push(socialIcon(p.link_steam, 'steam', 'Steam'));
  if (p.link_custom) items.push(socialIcon(p.link_custom, 'custom', p.link_custom_label || 'Ссылка'));
  if (p.link_discord_server) items.push(socialIcon(p.link_discord_server, 'discord', 'Сервер'));
  if (!items.length) return '';
  return `<div class="bio-social-row">${items.join('')}</div>`;
}

function socialIcon(href, type, label) {
  const icon = SOCIAL_ICONS[type] || SOCIAL_ICONS.custom;
  return `<a href="${escUrl(href)}" class="bio-social-btn ${type}" target="_blank" rel="noopener" title="${esc(label)}">${icon}</a>`;
}

const STATUS_COLORS = { online: '#23a55a', idle: '#f0b232', dnd: '#f23f43', offline: '#80848e' };

async function loadLanyard(discordId, profile) {
  const widget = document.getElementById('discord-widget');
  const activityEl = document.getElementById('lanyard-activity');
  if (!widget) return;
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
    const json = await res.json();
    if (!json.success || !json.data) {
      widget.classList.remove('hidden');
      widget.innerHTML = discordWidgetFallback(profile, discordId);
      return;
    }
    const d = json.data;
    const user = d.discord_user;
    const status = d.discord_status || 'offline';
    const addUrl = profile.link_discord || `https://discord.com/users/${discordId}`;

    widget.classList.remove('hidden');
    widget.innerHTML = `
      <div class="dcw-top">
        <div class="dcw-user">
          <div class="dcw-ava-wrap">
            <img src="${esc(user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64` : 'img/default-avatar.svg')}" alt="">
            <span class="dcw-dot" style="background:${STATUS_COLORS[status] || STATUS_COLORS.offline}"></span>
          </div>
          <div class="dcw-text">
            <div class="dcw-handle">@${esc(user.username)}</div>
            <div class="dcw-status">${esc(lanyardStatusText(d))}</div>
          </div>
        </div>
        <a href="${escUrl(addUrl)}" class="dcw-add" target="_blank" rel="noopener">Add on Discord →</a>
      </div>`;

    const act = pickLanyardActivity(d);
    if (act && activityEl) {
      activityEl.classList.remove('hidden');
      activityEl.innerHTML = renderLanyardActivity(act);
    }
  } catch {
    widget.classList.remove('hidden');
    widget.innerHTML = discordWidgetFallback(profile, discordId);
  }
}

function discordWidgetFallback(profile, discordId) {
  const addUrl = profile.link_discord || `https://discord.com/users/${discordId}`;
  return `
    <div class="dcw-top">
      <div class="dcw-user">
        <div class="dcw-ava-wrap">
          <img src="${profile.avatar || 'img/default-avatar.svg'}" alt="">
          <span class="dcw-dot" style="background:#80848e"></span>
        </div>
        <div class="dcw-text">
          <div class="dcw-handle">@${esc(profile.username)}</div>
          <div class="dcw-status">Подключи Lanyard для статуса</div>
        </div>
      </div>
      <a href="${escUrl(addUrl)}" class="dcw-add" target="_blank" rel="noopener">Add on Discord →</a>
    </div>`;
}

function lanyardStatusText(d) {
  if (d.activities?.length) {
    const a = d.activities.find((x) => x.type !== 4) || d.activities[0];
    if (a?.type === 0) return `Playing ${a.name}`;
    if (a?.type === 2) return `Listening to ${a.name}`;
    if (a?.type === 3) return `Watching ${a.name}`;
    if (a?.name) return a.name;
  }
  if (d.listening_to_spotify && d.spotify) return `Listening to ${d.spotify.song}`;
  const map = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', offline: 'Offline' };
  return map[d.discord_status] || 'Offline';
}

function pickLanyardActivity(d) {
  if (d.listening_to_spotify && d.spotify) return { kind: 'spotify', data: d.spotify };
  const act = (d.activities || []).find((x) => x.type === 0);
  if (act) return { kind: 'game', data: act };
  return null;
}

function activityAssetUrl(a) {
  const id = a.assets?.large_image;
  if (!id) return '';
  if (id.startsWith('mp:external/')) return `https://media.discordapp.net/external/${id.slice(12)}`;
  if (id.startsWith('spotify:')) return `https://i.scdn.co/image/${id.slice(8)}`;
  if (a.application_id) return `https://cdn.discordapp.com/app-assets/${a.application_id}/${id}.png`;
  return '';
}

function renderLanyardActivity(act) {
  if (act.kind === 'spotify') {
    const s = act.data;
    const art = s.album_art_url || '';
    return `
      <div class="act-row">
        ${art ? `<img class="act-big-icon" src="${esc(art)}" alt="">` : '<div class="act-big-icon act-placeholder">♪</div>'}
        <div class="act-details">
          <div class="act-name">${esc(s.song)}</div>
          <div class="act-sub">${esc(s.artist)}</div>
          <div class="act-sub dim">on ${esc(s.album)}</div>
        </div>
      </div>`;
  }
  const a = act.data;
  const img = activityAssetUrl(a);
  const sub = [a.details, a.state].filter(Boolean).join(' · ');
  return `
    <div class="act-row">
      ${img ? `<img class="act-big-icon" src="${esc(img)}" alt="" onerror="this.style.display='none'">` : '<div class="act-big-icon act-placeholder">🎮</div>'}
      <div class="act-details">
        <div class="act-name">${esc(a.name)}</div>
        ${sub ? `<div class="act-sub">${esc(sub)}</div>` : ''}
      </div>
    </div>`;
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function tierBadge(p) {
  const t = p.tier !== 'none' ? p.tier : (['vip','vipplus','vippro'].includes(p.role) ? p.role : '');
  return t ? `<span class="role-pill ${t}">${t.toUpperCase()}</span>` : '';
}

function escUrl(url) {
  if (!url) return '#';
  if (!/^https?:\/\//i.test(url)) return 'https://' + url;
  return url.replace(/"/g, '&quot;');
}

function initPlayer(autoplay) {
  const audio = document.getElementById('audio');
  if (!audio) return;
  const p = profileUser;
  if (p && p.music_url) audio.src = p.music_url;

  const play = document.getElementById('play');
  const fill = document.getElementById('fill');
  const cur = document.getElementById('cur');
  const dur = document.getElementById('dur');
  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  };
  const setPlaying = (on) => { if (play) play.textContent = on ? '⏸' : '▶'; };

  audio.onloadedmetadata = () => { if (dur) dur.textContent = fmt(audio.duration); };
  audio.ontimeupdate = () => {
    if (fill) fill.style.width = ((audio.currentTime / audio.duration) * 100 || 0) + '%';
    if (cur) cur.textContent = fmt(audio.currentTime);
  };
  document.getElementById('prog')?.addEventListener('click', (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  });
  play.onclick = () => {
    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setPlaying(false);
    }
  };
  document.getElementById('prev')?.addEventListener('click', () => { audio.currentTime = 0; });
  document.getElementById('next')?.addEventListener('click', () => {
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
  });
  const setVol = (v) => { audio.volume = v; audio.muted = v <= 0; };
  document.getElementById('vol-btn')?.addEventListener('click', () => {
    audio.muted = !audio.muted;
  });
  document.getElementById('vol-bar')?.addEventListener('click', () => {
    audio.muted = !audio.muted;
  });
  const slider = document.getElementById('vol-slider');
  if (slider) {
    slider.addEventListener('input', () => setVol(slider.value / 100));
    setVol(slider.value / 100);
  }

  if (autoplay && p.music_url) {
    audio.volume = 0.6;
    const tryPlay = () => {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    };
    if (audio.readyState >= 2) tryPlay();
    else audio.addEventListener('canplay', tryPlay, { once: true });
    document.body.addEventListener('click', tryPlay, { once: true });
  }
}

function doLogin(e) {
  e.preventDefault();
  const login = e.target.login.value.trim();
  const pass = e.target.password.value;
  const db = getDB();
  const u = db.users.find((x) => x.username === login.toLowerCase() || x.email === login);
  if (!u || u.password !== hash(pass)) {
    document.getElementById('login-msg').innerHTML = '<div class="alert alert-error">Неверный логин или пароль</div>';
    return;
  }
  u.last_login = new Date().toLocaleString('ru');
  u.last_ip = '127.0.0.1';
  saveDB(db);
  setSession(u.id);
  log('Вход', u.username);
  showPage(u.role === 'admin' ? 'admin' : 'dashboard');
}

function doRegister(e) {
  e.preventDefault();
  const f = e.target;
  const uname = f.username.value.trim().toLowerCase();
  const invite = f.invite.value.trim().toUpperCase();
  const db = getDB();

  if (!/^[a-z0-9_]{3,20}$/.test(uname)) {
    document.getElementById('reg-msg').innerHTML = '<div class="alert alert-error">Ник: 3-20 символов, a-z, 0-9, _</div>';
    return;
  }
  const inv = db.invites.find((i) => i.code.toUpperCase() === invite && !i.used_by);
  if (!inv) {
    document.getElementById('reg-msg').innerHTML = '<div class="alert alert-error">Неверный инвайт</div>';
    return;
  }
  if (db.users.some((u) => u.username === uname || u.email === f.email.value)) {
    document.getElementById('reg-msg').innerHTML = '<div class="alert alert-error">Ник или email заняты</div>';
    return;
  }

  const id = db.nextId.user++;
  const user = {
    id, username: uname, email: f.email.value, password: hash(f.password.value),
    role: 'player', tier: 'none', display_name: f.display_name.value || uname,
    avatar: '', background: '', bio: '', tagline: '', location: '',
    music_title: '', music_artist: '', music_url: '',
    views: 0, bg_x: 50, bg_y: 50, avatar_x: 50, avatar_y: 50,
    discord_id: '', link_discord: '', link_discord_server: '', link_telegram: '', link_steam: '',
    link_youtube: '', link_custom: '', link_custom_label: '',
    created_at: today(), last_login: null, last_ip: '', viewedBy: [],
  };
  migrateUser(user);
  db.users.push(user);
  inv.used_by = id;
  saveDB(db);
  setSession(id);
  log('Регистрация', uname);
  document.getElementById('reg-msg').innerHTML = '<div class="alert alert-success">Готово! Настрой профиль.</div>';
  setTimeout(() => showPage('dashboard'), 800);
}

function logout() {
  setSession(null);
  showPage('home');
}

document.addEventListener('DOMContentLoaded', () => {
  loadDB();
  showPage('home');
  const params = new URLSearchParams(location.search);
  if (params.get('u')) openProfile(params.get('u'));
});
