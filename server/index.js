require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'cryptomine-secret-key-2026';
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not set in environment. Using insecure default. Set JWT_SECRET env var in production!');
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET must be set in production');
    process.exit(1);
  }
}

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));

// Rate limiting
// NOTE: The default MemoryStore is suitable for single-process deployments only.
// For horizontal scaling (multiple workers/instances), use a Redis-backed store
// such as rate-limit-redis to share counters across processes.
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
  if (!token) return res.status(401).json({ error: '\u10d0\u10e0\u10d0\u10d0\u10d5\u10e2\u10dd\u10e0\u10d8\u10d6\u10d4\u10d1\u10e3\u10da\u10d8' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: '\u10e2\u10dd\u10d9\u10d4\u10dc\u10d8 \u10d0\u10e0\u10d0\u10e1\u10ec\u10dd\u10e0\u10d8\u10d0' });
  }
}

// ============ DATABASE INITIALIZATION ============

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      invite_code TEXT UNIQUE NOT NULL,
      referred_by TEXT,
      balance DOUBLE PRECISION DEFAULT 7,
      total_deposits DOUBLE PRECISION DEFAULT 0,
      total_withdrawals DOUBLE PRECISION DEFAULT 0,
      withdrawal_account TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      days INTEGER NOT NULL,
      daily_income DOUBLE PRECISION NOT NULL,
      total_income DOUBLE PRECISION NOT NULL,
      price DOUBLE PRECISION NOT NULL,
      hash_rate TEXT NOT NULL,
      image TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchased_products (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      purchased_at TIMESTAMP DEFAULT NOW(),
      total_earned DOUBLE PRECISION DEFAULT 0,
      status TEXT DEFAULT 'active',
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'completed',
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS referrals (
      id TEXT PRIMARY KEY,
      referrer_id TEXT NOT NULL,
      referred_id TEXT NOT NULL,
      phone TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      total_earnings DOUBLE PRECISION DEFAULT 0,
      joined_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (referrer_id) REFERENCES users(id),
      FOREIGN KEY (referred_id) REFERENCES users(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id SERIAL PRIMARY KEY,
      user_id TEXT,
      username TEXT NOT NULL,
      comment TEXT NOT NULL,
      reward DOUBLE PRECISION NOT NULL,
      withdraw_amount DOUBLE PRECISION,
      method TEXT,
      image TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Seed products if empty
  const productCount = await pool.query('SELECT COUNT(*) as count FROM products');
  if (parseInt(productCount.rows[0].count) === 0) {
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
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const p of products) {
        await client.query(
          'INSERT INTO products (id, name, days, daily_income, total_income, price, hash_rate, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          p
        );
      }
      await client.query("SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))");
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  // Seed blog posts if empty
  const blogCount = await pool.query('SELECT COUNT(*) as count FROM blog_posts');
  if (parseInt(blogCount.rows[0].count) === 0) {
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
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const b of blogs) {
        await client.query(
          'INSERT INTO blog_posts (username, comment, reward, withdraw_amount, method, image, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          b
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

// ============ HEALTH CHECK ============

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// ============ AUTH ROUTES ============

app.post('/api/auth/register', async (req, res) => {
  const { phone, password, inviteCode } = req.body;
  if (!phone || phone.length < 9) return res.status(400).json({ error: 'ტელეფონის ნომერი არასწორია' });
  if (!/^\d{9,15}$/.test(phone)) return res.status(400).json({ error: 'ტელეფონის ნომერი მხოლოდ ციფრებს უნდა შეიცავდეს' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო' });

  try {
    const { rows: existingRows } = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existingRows[0]) return res.status(400).json({ error: 'ეს ნომერი უკვე რეგისტრირებულია' });

    let referredBy = null;
    if (inviteCode) {
      const { rows: referrerRows } = await pool.query('SELECT id FROM users WHERE invite_code = $1', [inviteCode]);
      if (!referrerRows[0]) return res.status(400).json({ error: 'მოწვევის კოდი არასწორია' });
      referredBy = referrerRows[0].id;
    }

    const id = genId();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const myInviteCode = genInviteCode();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('INSERT INTO users (id, phone, password, invite_code, referred_by) VALUES ($1, $2, $3, $4, $5)', [id, phone, hashedPassword, myInviteCode, referredBy]);

      // Add referral record
      if (referredBy) {
        await client.query('INSERT INTO referrals (id, referrer_id, referred_id, phone, level) VALUES ($1, $2, $3, $4, 1)', [genId(), referredBy, id, phone]);
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, user: { id, phone, inviteCode: myInviteCode, balance: 7 } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !/^\d{9,15}$/.test(phone)) return res.status(400).json({ error: 'ტელეფონის ნომერი არასწორია' });
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'არასწორი ნომერი ან პაროლი' });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, user: { id: user.id, phone: user.phone, inviteCode: user.invite_code, balance: user.balance } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ USER ROUTES ============

app.get('/api/user/profile', auth, async (req, res) => {
  try {
    const { rows: userRows } = await pool.query('SELECT id, phone, invite_code, balance, total_deposits, total_withdrawals, withdrawal_account, created_at FROM users WHERE id = $1', [req.userId]);
    const user = userRows[0];
    if (!user) return res.status(404).json({ error: 'მომხმარებელი ვერ მოიძებნა' });

    const { rows: productCountRows } = await pool.query('SELECT COUNT(*) as count FROM purchased_products WHERE user_id = $1', [req.userId]);
    const { rows: referralCountRows } = await pool.query('SELECT COUNT(*) as count FROM referrals WHERE referrer_id = $1', [req.userId]);

    res.json({ ...user, productCount: parseInt(productCountRows[0].count), referralCount: parseInt(referralCountRows[0].count) });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/user/set-account', auth, async (req, res) => {
  const { account } = req.body;
  if (!account || account.trim().length < 5) return res.status(400).json({ error: 'არასწორი ანგარიში' });
  try {
    await pool.query('UPDATE users SET withdrawal_account = $1 WHERE id = $2', [account.trim(), req.userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Set account error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ FINANCIAL ROUTES ============

app.post('/api/deposit', auth, async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount < 1) return res.status(400).json({ error: 'მინიმალური შევსება: ₾1' });

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('UPDATE users SET balance = balance + $1, total_deposits = total_deposits + $1 WHERE id = $2', [amount, req.userId]);
      await client.query('INSERT INTO transactions (id, user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5, $6)', [genId(), req.userId, 'deposit', amount, `ბალანსის შევსება ₾${amount}`, 'completed']);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    const { rows } = await pool.query('SELECT balance FROM users WHERE id = $1', [req.userId]);
    res.json({ success: true, balance: rows[0].balance });
  } catch (err) {
    console.error('Deposit error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/withdraw', auth, async (req, res) => {
  const { amount } = req.body;
  try {
    const { rows: userRows } = await pool.query('SELECT balance, withdrawal_account FROM users WHERE id = $1', [req.userId]);
    const user = userRows[0];

    if (!user.withdrawal_account) return res.status(400).json({ error: 'გთხოვთ ჯერ დააყენოთ გატანის ანგარიში' });
    if (!amount || amount < 5) return res.status(400).json({ error: 'მინიმალური გატანა: ₾5' });
    if (amount > user.balance) return res.status(400).json({ error: 'არასაკმარისი ბალანსი' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rowCount } = await client.query('UPDATE users SET balance = balance - $1, total_withdrawals = total_withdrawals + $1 WHERE id = $2 AND balance >= $1', [amount, req.userId]);
      if (rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'არასაკმარისი ბალანსი' });
      }
      await client.query('INSERT INTO transactions (id, user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5, $6)', [genId(), req.userId, 'withdrawal', -amount, `თანხის გატანა ₾${amount} → ${user.withdrawal_account}`, 'pending']);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    const { rows: updatedRows } = await pool.query('SELECT balance FROM users WHERE id = $1', [req.userId]);
    res.json({ success: true, balance: updatedRows[0].balance, estimatedTime: '5-30 წუთი' });
  } catch (err) {
    console.error('Withdraw error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/transactions', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [req.userId]);
    res.json(rows);
  } catch (err) {
    console.error('Transactions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ PRODUCT ROUTES ============

app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY price ASC');
    res.json(rows);
  } catch (err) {
    console.error('Products error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/purchase', auth, async (req, res) => {
  const { productId } = req.body;
  try {
    const { rows: productRows } = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
    const product = productRows[0];
    if (!product) return res.status(404).json({ error: 'პროდუქტი ვერ მოიძებნა' });

    const { rows: userRows } = await pool.query('SELECT balance FROM users WHERE id = $1', [req.userId]);
    const user = userRows[0];
    if (user.balance < product.price) return res.status(400).json({ error: 'არასაკმარისი ბალანსი. გთხოვთ შეავსოთ ბალანსი.' });

    const purchaseId = genId();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [product.price, req.userId]);
      await client.query('INSERT INTO purchased_products (id, user_id, product_id) VALUES ($1, $2, $3)', [purchaseId, req.userId, product.id]);
      await client.query('INSERT INTO transactions (id, user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5, $6)', [genId(), req.userId, 'purchase', -product.price, `${product.name} შეძენა`, 'completed']);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    const { rows: updatedRows } = await pool.query('SELECT balance FROM users WHERE id = $1', [req.userId]);
    res.json({ success: true, balance: updatedRows[0].balance, purchaseId });
  } catch (err) {
    console.error('Purchase error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/my-products', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT pp.*, p.name, p.days, p.daily_income, p.total_income, p.price, p.hash_rate, p.image
      FROM purchased_products pp
      JOIN products p ON pp.product_id = p.id
      WHERE pp.user_id = $1
      ORDER BY pp.purchased_at DESC
    `, [req.userId]);
    res.json(rows);
  } catch (err) {
    console.error('My products error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/collect-earnings', auth, async (req, res) => {
  try {
    const { rows: products } = await pool.query(`
      SELECT pp.*, p.daily_income, p.total_income
      FROM purchased_products pp
      JOIN products p ON pp.product_id = p.id
      WHERE pp.user_id = $1 AND pp.status = 'active'
    `, [req.userId]);

    let totalNewEarnings = 0;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

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
          await client.query('UPDATE purchased_products SET total_earned = $1, status = $2 WHERE id = $3', [totalPossible, isCompleted ? 'completed' : 'active', pp.id]);
        }
      }

      if (totalNewEarnings > 0.01) {
        await client.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [totalNewEarnings, req.userId]);
        await client.query('INSERT INTO transactions (id, user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5, $6)', [genId(), req.userId, 'earning', totalNewEarnings, `მაინერების შემოსავალი +₾${totalNewEarnings.toFixed(2)}`, 'completed']);

        // Referral bonus
        const { rows: referrals } = await client.query('SELECT * FROM referrals WHERE referrer_id = $1', [req.userId]);
        if (referrals.length > 0) {
          const l1 = referrals.filter(r => r.level === 1).length;
          const l2 = referrals.filter(r => r.level === 2).length;
          const l3 = referrals.filter(r => r.level === 3).length;
          const refBonus = (l1 * 0.25 + l2 * 0.02 + l3 * 0.01) * (totalNewEarnings * 0.3);
          if (refBonus > 0.01) {
            await client.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [refBonus, req.userId]);
            await client.query('INSERT INTO transactions (id, user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5, $6)', [genId(), req.userId, 'referral_bonus', refBonus, `რეფერალ ბონუსი +₾${refBonus.toFixed(2)}`, 'completed']);
            totalNewEarnings += refBonus;
          }
        }
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    const { rows: updatedRows } = await pool.query('SELECT balance FROM users WHERE id = $1', [req.userId]);
    res.json({ success: true, earned: totalNewEarnings, balance: updatedRows[0].balance });
  } catch (err) {
    console.error('Collect earnings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ REFERRAL ROUTES ============

app.get('/api/referrals', auth, async (req, res) => {
  try {
    const { rows: referrals } = await pool.query('SELECT * FROM referrals WHERE referrer_id = $1 ORDER BY joined_at DESC', [req.userId]);
    const { rows: userRows } = await pool.query('SELECT invite_code FROM users WHERE id = $1', [req.userId]);
    res.json({ referrals, inviteCode: userRows[0].invite_code });
  } catch (err) {
    console.error('Referrals error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ BLOG ROUTES ============

app.get('/api/blog', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM blog_posts ORDER BY created_at DESC LIMIT 30');
    res.json(rows);
  } catch (err) {
    console.error('Blog error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/blog', auth, async (req, res) => {
  let { comment } = req.body;
  if (!comment || comment.trim().length === 0) return res.status(400).json({ error: 'კომენტარი აუცილებელია' });

  comment = comment.trim().substring(0, 500);

  try {
    const { rows: userRows } = await pool.query('SELECT phone FROM users WHERE id = $1', [req.userId]);
    const user = userRows[0];
    const maskedPhone = `${user.phone.substring(0, 2)}*****${user.phone.substring(user.phone.length - 2)}`;
    const reward = parseFloat((Math.random() * 0.5 + 0.2).toFixed(2));

    const client = await pool.connect();
    let postId;
    try {
      await client.query('BEGIN');
      const { rows: insertRows } = await client.query(
        'INSERT INTO blog_posts (user_id, username, comment, reward, image, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [req.userId, maskedPhone, comment, reward, `https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&h=200&fit=crop&t=${Date.now()}`, new Date().toISOString().replace('T', ' ').substring(0, 19)]
      );
      postId = insertRows[0].id;

      // Add reward to balance
      await client.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [reward, req.userId]);
      await client.query('INSERT INTO transactions (id, user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5, $6)', [genId(), req.userId, 'earning', reward, `ბლოგის ჯილდო +₾${reward}`, 'completed']);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    const { rows: updatedRows } = await pool.query('SELECT balance FROM users WHERE id = $1', [req.userId]);
    res.json({ success: true, postId, reward, balance: updatedRows[0].balance });
  } catch (err) {
    console.error('Blog post error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ STATS ROUTE ============

app.get('/api/stats', async (req, res) => {
  try {
    const { rows: totalRows } = await pool.query("SELECT COALESCE(SUM(ABS(amount)), 0) as total FROM transactions WHERE type = 'withdrawal'");
    const { rows: todayRows } = await pool.query("SELECT COALESCE(SUM(ABS(amount)), 0) as total FROM transactions WHERE type = 'withdrawal' AND created_at::date = CURRENT_DATE");
    const { rows: userCountRows } = await pool.query('SELECT COUNT(*) as count FROM users');
    res.json({ totalWithdrawals: parseFloat(totalRows[0].total), todayWithdrawals: parseFloat(todayRows[0].total), userCount: parseInt(userCountRows[0].count) });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ ERROR HANDLER ============

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Start server
initDb().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`CryptoMine API server running on http://localhost:${PORT}`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      pool.end();
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
      pool.end();
      process.exit(0);
    });
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  pool.end();
  process.exit(1);
});
