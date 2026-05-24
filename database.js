const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'store.json');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const ROLES = ['admin', 'moderator', 'helper', 'vippro', 'vipplus', 'vip', 'player'];
const TIERS = ['none', 'vip', 'vipplus', 'vippro'];

const empty = {
  users: [],
  invites: [],
  activity_log: [],
  payments: [],
  profile_views: [],
  settings: {
    snow: false,
    leaves: false,
    theme: 'dark',
  },
  _counters: { users: 0, invites: 0, activity_log: 0, payments: 0, profile_views: 0 },
};

function read() {
  if (!fs.existsSync(dbPath)) {
    const d = JSON.parse(JSON.stringify(empty));
    write(d);
    return d;
  }
  const d = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  d.settings = { ...empty.settings, ...(d.settings || {}) };
  d.profile_views = d.profile_views || [];
  d.users = (d.users || []).map(migrateUser);
  return d;
}

function write(d) {
  fs.writeFileSync(dbPath, JSON.stringify(d, null, 2));
}

function now() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function nid(d, t) {
  d._counters[t] = (d._counters[t] || 0) + 1;
  return d._counters[t];
}

function migrateUser(u) {
  if (!u.role) u.role = 'player';
  if (!u.tier) u.tier = tierFromRole(u.role);
  if (u.views == null) u.views = 0;
  if (u.bg_x == null) u.bg_x = 50;
  if (u.bg_y == null) u.bg_y = 50;
  if (u.avatar_x == null) u.avatar_x = 50;
  if (u.avatar_y == null) u.avatar_y = 50;
  if (!u.display_name) u.display_name = u.username;
  if (!u.tagline) u.tagline = '';
  if (!u.location) u.location = '';
  if (!u.bio) u.bio = '';
  if (!u.last_ip) u.last_ip = '';
  return u;
}

function tierFromRole(role) {
  if (['vip', 'vipplus', 'vippro'].includes(role)) return role;
  if (role === 'vippro') return 'vippro';
  return 'none';
}

function isStaff(role) {
  return ['admin', 'moderator', 'helper'].includes(role);
}

const db = {
  ROLES,
  TIERS,
  isStaff,
  getSettings() {
    return read().settings;
  },
  updateSettings(patch) {
    const d = read();
    d.settings = { ...d.settings, ...patch };
    write(d);
    return d.settings;
  },
  getUserById(id) {
    return read().users.find((u) => u.id === id) || null;
  },
  getUserByUsername(username) {
    const q = (username || '').toLowerCase();
    return read().users.find((u) => u.username === q) || null;
  },
  getUserByLogin(login) {
    const d = read();
    const q = (login || '').trim();
    const ql = q.toLowerCase();
    return d.users.find((u) => u.username === ql || u.email === q) || null;
  },
  userExists(username, email) {
    const d = read();
    return d.users.some((u) => u.username === username || u.email === email);
  },
  listUsers(limit) {
    let rows = read().users.filter((u) => u.role !== 'admin');
    rows = rows.sort((a, b) => b.id - a.id);
    return limit ? rows.slice(0, limit) : rows;
  },
  listAllUsers() {
    return read().users.sort((a, b) => a.id - b.id);
  },
  createUser(data) {
    const d = read();
    const id = nid(d, 'users');
    const user = migrateUser({
      id,
      username: data.username,
      email: data.email,
      password_hash: data.password_hash,
      role: data.role || 'player',
      tier: data.tier || 'none',
      display_name: data.display_name || data.username,
      avatar: '',
      background: '',
      bio: '',
      tagline: '',
      location: '',
      music_title: '',
      music_artist: '',
      music_url: '',
      views: 0,
      bg_x: 50,
      bg_y: 50,
      avatar_x: 50,
      avatar_y: 50,
      last_ip: '',
      created_at: now(),
      last_login: null,
    });
    d.users.push(user);
    write(d);
    return { lastInsertRowid: id };
  },
  updateUser(id, fields) {
    const d = read();
    const u = d.users.find((x) => x.id === id);
    if (u) Object.assign(u, migrateUser(u), fields);
    write(d);
  },
  updateLastLogin(id, ip) {
    const d = read();
    const u = d.users.find((x) => x.id === id);
    if (u) {
      u.last_login = now();
      if (ip) u.last_ip = ip;
    }
    write(d);
  },
  setRole(id, role) {
    const d = read();
    const u = d.users.find((x) => x.id === id);
    if (u && ROLES.includes(role)) {
      u.role = role;
      if (['vip', 'vipplus', 'vippro'].includes(role)) u.tier = role;
      else if (!isStaff(role)) u.tier = u.tier || 'none';
    }
    write(d);
  },
  setTier(id, tier) {
    const d = read();
    const u = d.users.find((x) => x.id === id);
    if (u && TIERS.includes(tier)) {
      u.tier = tier;
      if (tier !== 'none' && !isStaff(u.role)) u.role = tier;
      if (tier === 'none' && !isStaff(u.role)) u.role = 'player';
    }
    write(d);
  },
  removeSubscription(id) {
    this.setTier(id, 'none');
    const u = this.getUserById(id);
    if (u && !isStaff(u.role)) this.setRole(id, 'player');
  },
  recordView(profileId, visitorKey) {
    const d = read();
    const u = d.users.find((x) => x.id === profileId);
    if (!u) return null;
    const exists = d.profile_views.some(
      (v) => v.user_id === profileId && v.visitor_key === visitorKey
    );
    if (!exists) {
      d.profile_views.push({ id: nid(d, 'profile_views'), user_id: profileId, visitor_key: visitorKey, created_at: now() });
      u.views = (u.views || 0) + 1;
      write(d);
    }
    return u;
  },
  getInvite(code) {
    const c = (code || '').trim().toUpperCase();
    return read().invites.find((i) => i.code.toUpperCase() === c && !i.used_by) || null;
  },
  useInvite(id, userId) {
    const d = read();
    const inv = d.invites.find((x) => x.id === id);
    if (inv) {
      inv.used_by = userId;
      inv.used_at = now();
    }
    write(d);
  },
  createInvite(code, type = 'register') {
    const d = read();
    const id = nid(d, 'invites');
    d.invites.push({ id, code, type, used_by: null, used_at: null, created_at: now() });
    write(d);
    return code;
  },
  listInvites(limit = 80) {
    const d = read();
    return d.invites
      .map((i) => {
        const u = d.users.find((x) => x.id === i.used_by);
        return { ...i, used_username: u ? u.username : null };
      })
      .sort((a, b) => b.id - a.id)
      .slice(0, limit);
  },
  countInvitesFree() {
    return read().invites.filter((i) => !i.used_by).length;
  },
  log(userId, username, action, ip) {
    const d = read();
    d.activity_log.push({ id: nid(d, 'activity_log'), user_id: userId, username, action, ip: ip || '', created_at: now() });
    write(d);
  },
  listLogs(limit = 150) {
    return read().activity_log.sort((a, b) => b.id - a.id).slice(0, limit);
  },
  createPayment(pid, tier, amount) {
    const d = read();
    const id = nid(d, 'payments');
    d.payments.push({ id, payment_id: pid, tier, amount, status: 'pending', user_id: null, created_at: now(), paid_at: null });
    write(d);
    return id;
  },
  getPendingPayment(pid) {
    return read().payments.find((p) => p.payment_id === pid && p.status === 'pending') || null;
  },
  completePayment(pid, userId) {
    const d = read();
    const p = d.payments.find((x) => x.payment_id === pid);
    if (p) {
      p.status = 'paid';
      p.paid_at = now();
      p.user_id = userId;
      const u = d.users.find((x) => x.id === userId);
      if (u) {
        u.tier = p.tier;
        if (!isStaff(u.role)) u.role = p.tier;
      }
    }
    write(d);
    return p;
  },
  listPayments(limit = 40) {
    return read().payments.sort((a, b) => b.id - a.id).slice(0, limit);
  },
  stats() {
    const d = read();
    return {
      users: d.users.filter((u) => u.role !== 'admin').length,
      invitesFree: d.invites.filter((i) => !i.used_by).length,
      onlineToday: d.activity_log.filter((l) => l.created_at && l.created_at.startsWith(now().slice(0, 10))).length,
    };
  },
};

module.exports = db;
