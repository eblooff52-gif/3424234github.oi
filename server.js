require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const SITE = process.env.SITE_NAME || 'swiftcrime';
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';

const PRICES = { vip: 15, vipplus: 50, vippro: 150 };

const uploadsDir = path.join(__dirname, 'public', 'uploads');
['avatars', 'backgrounds', 'music'].forEach((d) => {
  const p = path.join(uploadsDir, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 },
  })
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const m = { avatar: 'avatars', background: 'backgrounds', music: 'music' };
    cb(null, path.join(uploadsDir, m[file.fieldname] || 'avatars'));
  },
  filename: (req, file, cb) => {
    cb(null, `${req.session.userId || 'g'}_${Date.now()}${path.extname(file.originalname) || '.jpg'}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 12 * 1024 * 1024 } });

function log(userId, username, action, ip) {
  db.log(userId, username, action, ip);
}

function genInvite() {
  const code = 'SC-' + uuidv4().slice(0, 8).toUpperCase();
  db.createInvite(code);
  return code;
}

function isAdmin(u) {
  return u && u.role === 'admin';
}

function isStaff(u) {
  return u && db.isStaff(u.role);
}

function canAdmin(u) {
  return u && (u.role === 'admin' || u.role === 'moderator');
}

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

function requireAdmin(req, res, next) {
  const u = db.getUserById(req.session.userId);
  if (!canAdmin(u)) return res.status(403).render('error', { message: 'Нет доступа', siteName: SITE });
  next();
}

function clamp(v, d = 50) {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? d : Math.max(0, Math.min(100, n));
}

function tierLabel(t) {
  return { none: 'Игрок', vip: 'VIP', vipplus: 'VIP+', vippro: 'VIP Pro' }[t] || t;
}

function ensureAdmin() {
  if (!db.getUserByUsername(ADMIN_USER)) {
    db.createUser({
      username: ADMIN_USER,
      email: 'admin@local.dev',
      password_hash: bcrypt.hashSync(ADMIN_PASS, 10),
      role: 'admin',
      tier: 'vippro',
      display_name: 'Admin',
    });
    genInvite();
    console.log(`Админ: ${ADMIN_USER} / ${ADMIN_PASS}`);
  }
}
ensureAdmin();

app.use((req, res, next) => {
  const user = req.session.userId ? db.getUserById(req.session.userId) : null;
  res.locals.user = user;
  res.locals.siteName = SITE;
  res.locals.isAdmin = isAdmin(user);
  res.locals.isStaff = isStaff(user);
  res.locals.settings = db.getSettings();
  res.locals.tierLabel = tierLabel;
  next();
});

app.get('/', (req, res) => res.render('index'));

app.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const u = db.getUserByLogin(req.body.username);
  if (!u || !bcrypt.compareSync(req.body.password, u.password_hash)) {
    return res.render('login', { error: 'Неверный логин или пароль' });
  }
  req.session.userId = u.id;
  db.updateLastLogin(u.id, req.ip);
  log(u.id, u.username, 'Вход', req.ip);
  res.redirect(u.role === 'admin' ? '/admin' : '/dashboard');
});

app.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('register', { error: null, invite: req.query.invite || '' });
});

app.post('/register', (req, res) => {
  const uname = (req.body.username || '').trim().toLowerCase();
  const invite = (req.body.invite || '').trim();
  if (!/^[a-z0-9_]{3,20}$/.test(uname)) {
    return res.render('register', { error: 'Ник: 3–20 символов, a-z, 0-9, _', invite });
  }
  const inv = db.getInvite(invite);
  if (!inv) return res.render('register', { error: 'Неверный инвайт-код', invite });
  if (db.userExists(uname, req.body.email)) {
    return res.render('register', { error: 'Ник или email заняты', invite });
  }
  const info = db.createUser({
    username: uname,
    email: req.body.email,
    password_hash: bcrypt.hashSync(req.body.password, 10),
    display_name: req.body.display_name || uname,
  });
  db.useInvite(inv.id, info.lastInsertRowid);
  log(info.lastInsertRowid, uname, 'Регистрация', req.ip);
  req.session.userId = info.lastInsertRowid;
  res.redirect('/dashboard?new=1');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/shop', (req, res) => {
  res.render('shop', { prices: PRICES, payment: null, error: null, success: null });
});

app.post('/shop/buy', requireAuth, (req, res) => {
  const tier = req.body.tier;
  if (!PRICES[tier]) return res.redirect('/shop?error=tier');
  const pid = 'pay_' + uuidv4().slice(0, 12);
  db.createPayment(pid, tier, PRICES[tier]);
  res.render('shop', { prices: PRICES, payment: pid, tier, amount: PRICES[tier], error: null, success: null });
});

app.post('/shop/confirm', requireAuth, (req, res) => {
  const pay = db.getPendingPayment(req.body.payment_id);
  if (!pay) return res.render('shop', { prices: PRICES, payment: null, error: 'Платёж не найден', success: null });
  db.completePayment(req.body.payment_id, req.session.userId);
  log(req.session.userId, req.session.userId, `Купил ${pay.tier}`, req.ip);
  res.render('shop', { prices: PRICES, payment: null, error: null, success: `Подписка ${tierLabel(pay.tier)} активирована!` });
});

app.get('/dashboard', requireAuth, (req, res) => {
  const user = db.getUserById(req.session.userId);
  if (user.role === 'admin' && !req.query.stay) return res.redirect('/admin');
  res.render('dashboard', {
    user,
    saved: req.query.saved === '1',
    isNew: req.query.new === '1',
  });
});

app.post(
  '/dashboard/save',
  requireAuth,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'background', maxCount: 1 },
    { name: 'music', maxCount: 1 },
  ]),
  (req, res) => {
    const user = db.getUserById(req.session.userId);
    const fields = {
      display_name: req.body.display_name || user.username,
      bio: req.body.bio || '',
      tagline: req.body.tagline || '',
      location: req.body.location || '',
      music_title: req.body.music_title || '',
      music_artist: req.body.music_artist || '',
      bg_x: clamp(req.body.bg_x),
      bg_y: clamp(req.body.bg_y),
      avatar_x: clamp(req.body.avatar_x),
      avatar_y: clamp(req.body.avatar_y),
      avatar: user.avatar,
      background: user.background,
      music_url: user.music_url,
    };
    if (req.files?.avatar) fields.avatar = '/uploads/avatars/' + req.files.avatar[0].filename;
    if (req.files?.background) fields.background = '/uploads/backgrounds/' + req.files.background[0].filename;
    if (req.files?.music) fields.music_url = '/uploads/music/' + req.files.music[0].filename;
    db.updateUser(user.id, fields);
    log(user.id, user.username, 'Профиль сохранён', req.ip);
    res.redirect('/dashboard?saved=1');
  }
);

app.get('/admin', requireAuth, requireAdmin, (req, res) => {
  res.render('admin', {
    users: db.listAllUsers().filter((u) => u.username !== ADMIN_USER),
    invites: db.listInvites(100),
    logs: db.listLogs(120),
    payments: db.listPayments(30),
    stats: db.stats(),
    roles: ['moderator', 'helper', 'vippro', 'vipplus', 'vip', 'player'],
    newInvites: req.query.invites || '',
    msg: req.query.msg || '',
  });
});

app.post('/admin/invites', requireAuth, requireAdmin, (req, res) => {
  const n = Math.min(parseInt(req.body.count, 10) || 1, 30);
  const codes = [];
  for (let i = 0; i < n; i++) codes.push(genInvite());
  res.redirect('/admin?invites=' + encodeURIComponent(codes.join(', ')) + '&msg=inv');
});

app.post('/admin/role/:id', requireAuth, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const role = req.body.role;
  if (db.ROLES.includes(role)) {
    const target = db.getUserById(id);
    if (target && target.username !== ADMIN_USER) {
      db.setRole(id, role);
      log(req.session.userId, ADMIN_USER, `Роль ${target.username} → ${role}`, req.ip);
    }
  }
  res.redirect('/admin?msg=role');
});

app.post('/admin/sub/remove/:id', requireAuth, requireAdmin, (req, res) => {
  const target = db.getUserById(parseInt(req.params.id, 10));
  if (target && target.username !== ADMIN_USER) {
    db.removeSubscription(target.id);
    log(req.session.userId, ADMIN_USER, `Снята подписка ${target.username}`, req.ip);
  }
  res.redirect('/admin?msg=sub');
});

app.post('/admin/settings', requireAuth, requireAdmin, (req, res) => {
  if (!isAdmin(db.getUserById(req.session.userId))) {
    return res.redirect('/admin?msg=nope');
  }
  db.updateSettings({
    snow: req.body.snow === 'on',
    leaves: req.body.leaves === 'on',
    theme: req.body.theme || 'dark',
  });
  res.redirect('/admin?msg=fx');
});

app.get('/:username', (req, res, next) => {
  const reserved = ['login', 'register', 'dashboard', 'admin', 'shop', 'logout', 'api', 'css', 'js', 'img', 'uploads'];
  if (reserved.includes(req.params.username.toLowerCase())) return next();
  const user = db.getUserByUsername(req.params.username);
  if (!user || user.role === 'admin') {
    return res.status(404).render('error', { message: 'Профиль не найден', siteName: SITE });
  }
  const isOwner = req.session.userId === user.id;
  if (!isOwner) {
    if (!req.session.vid) req.session.vid = uuidv4();
    db.recordView(user.id, req.session.vid + ':' + user.id);
  }
  const profile = db.getUserById(user.id);
  const joined = profile.created_at ? profile.created_at.slice(0, 10) : '';
  res.render('profile', { profile, isOwner, joined, settings: db.getSettings() });
});

app.use((req, res) => {
  res.status(404).render('error', { message: 'Страница не найдена', siteName: SITE });
});

app.listen(PORT, () => {
  console.log('');
  console.log('  swiftcrime → http://localhost:' + PORT);
  console.log('  Админ: ' + ADMIN_USER + ' / ' + ADMIN_PASS);
  console.log('');
});
