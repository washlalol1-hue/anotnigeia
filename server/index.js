require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'cryptomine-secret-key-2026';
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not set in environment. Using insecure default. Set JWT_SECRET env var in production!');
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many authentication attempts, please try again later.' }
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// NOTE: SQLite requires persistent filesystem storage in production.
// Do NOT deploy to ephemeral containers (e.g., Heroku free tier dynos) without
// attaching persistent storage or migrating to PostgreSQL/MySQL.

// Database
const db = new Database(path.join(__dirname, 'cryptomine.db'));
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    invite_code TEXT UNIQUE NOT NULL,
    referred_by TEXT,
    balance REAL DEFAULT 7,
    total_deposits REAL DEFAULT 0,
    total_withdrawals REAL DEFAULT 0,
    withdrawal_account TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    days INTEGER NOT NULL,
    daily_income REAL NOT NULL,
    total_income REAL NOT NULL,
    price REAL NOT NULL,
    hash_rate TEXT NOT NULL,
    image TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS purchased_products (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    purchased_at TEXT DEFAULT (datetime('now')),
    total_earned REAL DEFAULT 0,
    status TEXT DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'completed',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    referrer_id TEXT NOT NULL,
    referred_id TEXT NOT NULL,
    phone TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    total_earnings REAL DEFAULT 0,
    joined_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (referrer_id) REFERENCES users(id),
    FOREIGN KEY (referred_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    username TEXT NOT NULL,
    comment TEXT NOT NULL,
    reward REAL NOT NULL,
    withdraw_amount REAL,
    method TEXT,
    image TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed products if empty
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (productCount.count === 0) {
  const insertProduct = db.prepare('INSERT INTO products (id, name, days, daily_income, total_income, price, hash_rate, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const products = [
    [1, 'Miner S1', 80, 2.5, 200, 20, '15 TH/s', 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&h=200&fit=crop'],
    [2, 'Miner S2', 80, 6.7, 534, 50, '38 TH/s', 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=200&fit=crop'],
    [3, 'Miner Pro', 80, 17.2, 1372, 120, '95 TH/s', 'https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?w=400&h=200&fit=crop'],
    [4, 'Miner X1', 80, 36.8, 2940, 250, '200 TH/s', 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=200&fit=crop'],
    [5, 'Miner X2', 80, 78.8, 6300, 520, '420 TH/s', 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=200&fit=crop'],
    [6, 'Miner Ultra', 80, 172.0, 13760, 1100, '850 TH/s', 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=400&h=200&fit=crop'],
    [7, 'Miner Max', 80, 403.0, 32240, 2500, '1.8 PH/s', 'https://images.unsplash.com/photo-1624996379697-f01d168b1a52?w=400&h=200&fit=crop'],
    [8, 'Miner Titan', 80, 866.0, 69280, 5200, '3.5 PH/s', 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400&h=200&fit=crop'],
  ];
  const insertMany = db.transaction((items) => {
    for (const p of items) insertProduct.run(...p);
  });
  insertMany(products);
}

// Seed blog posts if empty
const blogCount = db.prepare('SELECT COUNT(*) as count FROM blog_posts').get();
if (blogCount.count === 0) {
  const insertBlog = db.prepare('INSERT INTO blog_posts (username, comment, reward, withdraw_amount, method, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const blogs = [
    ['55*****78', '₾450 გავიტანე, 3 წუთში დამიჯდა BOG-ზე! Miner Ultra-მ გაამართლა', 0.46, 450, 'BOG', 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&h=200&fit=crop', '2026-05-18 13:38:20'],
    ['59*****12', 'მეორე გატანა ₾120, TBC Pay-ზე წამებში ჩამოვარდა. მაინერები 24/7 მუშაობს', 0.38, 120, 'TBC Pay', 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=200&fit=crop', '2026-05-17 10:22:05'],
    ['57*****34', 'პირველი თვის შემოსავალი ₾2,100 Miner Max-ით. ინვესტიცია უკვე დაბრუნდა!', 0.52, 2100, 'BOG', 'https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?w=400&h=200&fit=crop', '2026-05-16 18:45:33'],
    ['51*****90', '₾85 გავიტანე, ჩემი მეგობრის რეფერალიდანაც მაქვს ბონუსი. საუკეთესოა!', 0.41, 85, 'TBC Pay', 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=200&fit=crop', '2026-05-15 09:12:47'],
    ['58*****56', 'პირველი გატანა ₾35 Miner S2-ით დავიწყე, ახლა Pro-ზე გადავალ. რეალურია!', 0.33, 35, 'BOG', 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=200&fit=crop', '2026-05-14 21:05:10'],
    ['56*****41', '3 მაინერი მაქვს, დღეში ₾56 შემოსავალი. ყოველ დღე ვაგროვებ', 0.44, 280, 'BOG', 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=400&h=200&fit=crop', '2026-05-13 15:30:00'],
    ['53*****67', 'რეფერალიდან ₾125 ბონუსი მივიღე! გუნდში 12 ადამიანი მყავს', 0.55, 125, 'TBC Pay', 'https://images.unsplash.com/photo-1624996379697-f01d168b1a52?w=400&h=200&fit=crop', '2026-05-12 08:15:42'],
    ['52*****89', 'Miner Titan შევიძინე, პირველ კვირაში ₾6,000+ შემოსავალი', 0.61, 6062, 'BOG', 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400&h=200&fit=crop', '2026-05-11 19:45:11'],
  ];
  const insertBlogs = db.transaction((items) => {
    for (const b of items) insertBlog.run(...b);
  });
  insertBlogs(blogs);
}

// Helper: generate ID
function genId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Helper: generate invite code
function genInviteCode() {
  return 'PRN' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'არაავტორიზებული' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'ტოკენი არასწორია' });
  }
}

// ============ HEALTH CHECK ============

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// ============ AUTH ROUTES ============

app.post('/api/auth/register', (req, res) => {
  const { phone, password, inviteCode } = req.body;
  if (!phone || phone.length < 9) return res.status(400).json({ error: 'ტელეფონის ნომერი არასწორია' });
  if (!/^\d{9,15}$/.test(phone)) return res.status(400).json({ error: 'ტელეფონის ნომერი მხოლოდ ციფრებს უნდა შეიცავდეს' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო' });

  const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  if (existing) return res.status(400).json({ error: 'ეს ნომერი უკვე რეგისტრირებულია' });

  let referredBy = null;
  if (inviteCode) {
    const referrer = db.prepare('SELECT id FROM users WHERE invite_code = ?').get(inviteCode);
    if (!referrer) return res.status(400).json({ error: 'მოწვევის კოდი არასწორია' });
    referredBy = referrer.id;
  }

  const id = genId();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const myInviteCode = genInviteCode();

  db.prepare('INSERT INTO users (id, phone, password, invite_code, referred_by) VALUES (?, ?, ?, ?, ?)').run(id, phone, hashedPassword, myInviteCode, referredBy);

  // Add referral record
  if (referredBy) {
    db.prepare('INSERT INTO referrals (id, referrer_id, referred_id, phone, level) VALUES (?, ?, ?, ?, 1)').run(genId(), referredBy, id, phone);
  }

  const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ success: true, token, user: { id, phone, inviteCode: myInviteCode, balance: 7 } });
});

app.post('/api/auth/login', (req, res) => {
  const { phone, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'არასწორი ნომერი ან პაროლი' });
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ success: true, token, user: { id: user.id, phone: user.phone, inviteCode: user.invite_code, balance: user.balance } });
});

// ============ USER ROUTES ============

app.get('/api/user/profile', auth, (req, res) => {
  const user = db.prepare('SELECT id, phone, invite_code, balance, total_deposits, total_withdrawals, withdrawal_account, created_at FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'მომხმარებელი ვერ მოიძებნა' });

  const productCount = db.prepare('SELECT COUNT(*) as count FROM purchased_products WHERE user_id = ?').get(req.userId);
  const referralCount = db.prepare('SELECT COUNT(*) as count FROM referrals WHERE referrer_id = ?').get(req.userId);

  res.json({ ...user, productCount: productCount.count, referralCount: referralCount.count });
});

app.post('/api/user/set-account', auth, (req, res) => {
  const { account } = req.body;
  if (!account || account.trim().length < 5) return res.status(400).json({ error: 'არასწორი ანგარიში' });
  db.prepare('UPDATE users SET withdrawal_account = ? WHERE id = ?').run(account.trim(), req.userId);
  res.json({ success: true });
});

// ============ FINANCIAL ROUTES ============

app.post('/api/deposit', auth, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount < 1) return res.status(400).json({ error: 'მინიმალური შევსება: ₾1' });

  db.prepare('UPDATE users SET balance = balance + ?, total_deposits = total_deposits + ? WHERE id = ?').run(amount, amount, req.userId);
  db.prepare('INSERT INTO transactions (id, user_id, type, amount, description, status) VALUES (?, ?, ?, ?, ?, ?)').run(genId(), req.userId, 'deposit', amount, `ბალანსის შევსება ₾${amount}`, 'completed');

  const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.userId);
  res.json({ success: true, balance: user.balance });
});

app.post('/api/withdraw', auth, (req, res) => {
  const { amount } = req.body;
  const user = db.prepare('SELECT balance, withdrawal_account FROM users WHERE id = ?').get(req.userId);

  if (!user.withdrawal_account) return res.status(400).json({ error: 'გთხოვთ ჯერ დააყენოთ გატანის ანგარიში' });
  if (!amount || amount < 5) return res.status(400).json({ error: 'მინიმალური გატანა: ₾5' });
  if (amount > user.balance) return res.status(400).json({ error: 'არასაკმარისი ბალანსი' });

  db.prepare('UPDATE users SET balance = balance - ?, total_withdrawals = total_withdrawals + ? WHERE id = ?').run(amount, amount, req.userId);
  db.prepare('INSERT INTO transactions (id, user_id, type, amount, description, status) VALUES (?, ?, ?, ?, ?, ?)').run(genId(), req.userId, 'withdrawal', -amount, `თანხის გატანა ₾${amount} → ${user.withdrawal_account}`, 'pending');

  // Simulate completion after 3 seconds (in real app this would be async)
  const updatedUser = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.userId);
  res.json({ success: true, balance: updatedUser.balance, estimatedTime: '5-30 წუთი' });
});

app.get('/api/transactions', auth, (req, res) => {
  const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.userId);
  res.json(transactions);
});

// ============ PRODUCT ROUTES ============

app.get('/api/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY price ASC').all();
  res.json(products);
});

app.post('/api/purchase', auth, (req, res) => {
  const { productId } = req.body;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) return res.status(404).json({ error: 'პროდუქტი ვერ მოიძებნა' });

  const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.userId);
  if (user.balance < product.price) return res.status(400).json({ error: 'არასაკმარისი ბალანსი. გთხოვთ შეავსოთ ბალანსი.' });

  const purchaseId = genId();
  db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(product.price, req.userId);
  db.prepare('INSERT INTO purchased_products (id, user_id, product_id) VALUES (?, ?, ?)').run(purchaseId, req.userId, product.id);
  db.prepare('INSERT INTO transactions (id, user_id, type, amount, description, status) VALUES (?, ?, ?, ?, ?, ?)').run(genId(), req.userId, 'purchase', -product.price, `${product.name} შეძენა`, 'completed');

  const updatedUser = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.userId);
  res.json({ success: true, balance: updatedUser.balance, purchaseId });
});

app.get('/api/my-products', auth, (req, res) => {
  const products = db.prepare(`
    SELECT pp.*, p.name, p.days, p.daily_income, p.total_income, p.price, p.hash_rate, p.image
    FROM purchased_products pp
    JOIN products p ON pp.product_id = p.id
    WHERE pp.user_id = ?
    ORDER BY pp.purchased_at DESC
  `).all(req.userId);
  res.json(products);
});

app.post('/api/collect-earnings', auth, (req, res) => {
  const products = db.prepare(`
    SELECT pp.*, p.daily_income, p.total_income
    FROM purchased_products pp
    JOIN products p ON pp.product_id = p.id
    WHERE pp.user_id = ? AND pp.status = 'active'
  `).all(req.userId);

  let totalNewEarnings = 0;

  const updateProduct = db.prepare('UPDATE purchased_products SET total_earned = ?, status = ? WHERE id = ?');
  const collect = db.transaction(() => {
    for (const pp of products) {
      const startDate = new Date(pp.purchased_at);
      const now = new Date();
      const hoursElapsed = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60);
      const hourlyRate = pp.daily_income / 24;
      const totalPossible = Math.min(hourlyRate * hoursElapsed, pp.total_income);
      const newEarnings = totalPossible - pp.total_earned;

      if (newEarnings > 0.01) {
        totalNewEarnings += newEarnings;
        const isCompleted = totalPossible >= pp.total_income;
        updateProduct.run(totalPossible, isCompleted ? 'completed' : 'active', pp.id);
      }
    }

    if (totalNewEarnings > 0.01) {
      db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(totalNewEarnings, req.userId);
      db.prepare('INSERT INTO transactions (id, user_id, type, amount, description, status) VALUES (?, ?, ?, ?, ?, ?)').run(genId(), req.userId, 'earning', totalNewEarnings, `მაინერების შემოსავალი +₾${totalNewEarnings.toFixed(2)}`, 'completed');

      // Referral bonus
      const referrals = db.prepare('SELECT * FROM referrals WHERE referrer_id = ?').all(req.userId);
      if (referrals.length > 0) {
        const l1 = referrals.filter(r => r.level === 1).length;
        const l2 = referrals.filter(r => r.level === 2).length;
        const l3 = referrals.filter(r => r.level === 3).length;
        const refBonus = (l1 * 0.25 + l2 * 0.02 + l3 * 0.01) * (totalNewEarnings * 0.3);
        if (refBonus > 0.01) {
          db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(refBonus, req.userId);
          db.prepare('INSERT INTO transactions (id, user_id, type, amount, description, status) VALUES (?, ?, ?, ?, ?, ?)').run(genId(), req.userId, 'referral_bonus', refBonus, `რეფერალ ბონუსი +₾${refBonus.toFixed(2)}`, 'completed');
          totalNewEarnings += refBonus;
        }
      }
    }
  });

  collect();
  const updatedUser = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.userId);
  res.json({ success: true, earned: totalNewEarnings, balance: updatedUser.balance });
});

// ============ REFERRAL ROUTES ============

app.get('/api/referrals', auth, (req, res) => {
  const referrals = db.prepare('SELECT * FROM referrals WHERE referrer_id = ? ORDER BY joined_at DESC').all(req.userId);
  const user = db.prepare('SELECT invite_code FROM users WHERE id = ?').get(req.userId);
  res.json({ referrals, inviteCode: user.invite_code });
});

// ============ BLOG ROUTES ============

app.get('/api/blog', (req, res) => {
  const posts = db.prepare('SELECT * FROM blog_posts ORDER BY created_at DESC LIMIT 30').all();
  res.json(posts);
});

app.post('/api/blog', auth, (req, res) => {
  let { comment } = req.body;
  if (!comment || comment.trim().length === 0) return res.status(400).json({ error: 'კომენტარი აუცილებელია' });

  comment = comment.trim().substring(0, 500);

  const user = db.prepare('SELECT phone FROM users WHERE id = ?').get(req.userId);
  const maskedPhone = `${user.phone.substring(0, 2)}*****${user.phone.substring(user.phone.length - 2)}`;
  const reward = parseFloat((Math.random() * 0.5 + 0.2).toFixed(2));

  const result = db.prepare('INSERT INTO blog_posts (user_id, username, comment, reward, image, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    req.userId, maskedPhone, comment, reward,
    `https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&h=200&fit=crop&t=${Date.now()}`,
    new Date().toISOString().replace('T', ' ').substring(0, 19)
  );

  // Add reward to balance
  db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(reward, req.userId);
  db.prepare('INSERT INTO transactions (id, user_id, type, amount, description, status) VALUES (?, ?, ?, ?, ?, ?)').run(genId(), req.userId, 'earning', reward, `ბლოგის ჯილდო +₾${reward}`, 'completed');

  const updatedUser = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.userId);
  res.json({ success: true, postId: result.lastInsertRowid, reward, balance: updatedUser.balance });
});

// ============ STATS ROUTE ============

app.get('/api/stats', (req, res) => {
  const totalWithdrawals = db.prepare("SELECT COALESCE(SUM(ABS(amount)), 0) as total FROM transactions WHERE type = 'withdrawal'").get();
  const todayWithdrawals = db.prepare("SELECT COALESCE(SUM(ABS(amount)), 0) as total FROM transactions WHERE type = 'withdrawal' AND date(created_at) = date('now')").get();
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  res.json({ totalWithdrawals: totalWithdrawals.total, todayWithdrawals: todayWithdrawals.total, userCount: userCount.count });
});

// ============ ERROR HANDLER ============

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`CryptoMine API server running on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  db.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  db.close();
  process.exit(0);
});
