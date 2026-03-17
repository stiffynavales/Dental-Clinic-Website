import { Router } from 'express';
import db from './db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Auth Routes ---
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

// --- Public Routes ---
router.get('/settings', (req, res) => {
  const settings = db.prepare('SELECT * FROM settings').all() as any[];
  const settingsObj = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
  res.json(settingsObj);
});

router.get('/services', (req, res) => {
  const services = db.prepare('SELECT * FROM services WHERE published = 1').all();
  res.json(services);
});

router.get('/services/:slug', (req, res) => {
  const service = db.prepare('SELECT * FROM services WHERE slug = ? AND published = 1').get(req.params.slug);
  if (!service) return res.status(404).json({ error: 'Not found' });
  res.json(service);
});

router.get('/doctors', (req, res) => {
  const doctors = db.prepare('SELECT * FROM doctors WHERE published = 1').all();
  res.json(doctors);
});

router.get('/doctors/:slug', (req, res) => {
  const doctor = db.prepare('SELECT * FROM doctors WHERE slug = ? AND published = 1').get(req.params.slug);
  if (!doctor) return res.status(404).json({ error: 'Not found' });
  res.json(doctor);
});

router.get('/blog', (req, res) => {
  const posts = db.prepare('SELECT * FROM blog_posts WHERE published = 1 ORDER BY created_at DESC').all();
  res.json(posts);
});

router.get('/blog/:slug', (req, res) => {
  const post = db.prepare('SELECT * FROM blog_posts WHERE slug = ? AND published = 1').get(req.params.slug);
  if (!post) return res.status(404).json({ error: 'Not found' });
  res.json(post);
});

router.get('/testimonials', (req, res) => {
  const testimonials = db.prepare('SELECT * FROM testimonials WHERE published = 1 ORDER BY created_at DESC').all();
  res.json(testimonials);
});

router.post('/bookings', (req, res) => {
  const { patient_name, email, phone, date, time, service_id, doctor_id, notes } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO bookings (patient_name, email, phone, date, time, service_id, doctor_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(patient_name, email, phone, date, time, service_id, doctor_id, notes);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Booking created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// --- Admin Routes (Protected) ---
router.use('/admin', authenticateToken);

router.get('/admin/dashboard', (req, res) => {
  const stats = {
    totalBookings: (db.prepare('SELECT COUNT(*) as count FROM bookings').get() as any).count,
    pendingBookings: (db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'").get() as any).count,
    totalServices: (db.prepare('SELECT COUNT(*) as count FROM services').get() as any).count,
    totalDoctors: (db.prepare('SELECT COUNT(*) as count FROM doctors').get() as any).count,
  };
  res.json(stats);
});

// Bookings Admin
router.get('/admin/bookings', (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, s.title as service_title, d.name as doctor_name 
    FROM bookings b 
    LEFT JOIN services s ON b.service_id = s.id 
    LEFT JOIN doctors d ON b.doctor_id = d.id
    ORDER BY b.date DESC, b.time DESC
  `).all();
  res.json(bookings);
});

router.put('/admin/bookings/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ message: 'Status updated' });
});

router.put('/admin/bookings/:id/reschedule', (req, res) => {
  const { date, time, reason } = req.body;
  db.prepare('UPDATE bookings SET date = ?, time = ?, reschedule_reason = ? WHERE id = ?').run(date, time, reason, req.params.id);
  res.json({ message: 'Booking rescheduled' });
});

// Services Admin
router.get('/admin/services', (req, res) => res.json(db.prepare('SELECT * FROM services').all()));
router.post('/admin/services', (req, res) => {
  const { slug, title, description, icon, content, published } = req.body;
  const result = db.prepare('INSERT INTO services (slug, title, description, icon, content, published) VALUES (?, ?, ?, ?, ?, ?)').run(slug, title, description, icon, content, published ? 1 : 0);
  res.json({ id: result.lastInsertRowid });
});
router.put('/admin/services/:id', (req, res) => {
  const { slug, title, description, icon, content, published } = req.body;
  db.prepare('UPDATE services SET slug=?, title=?, description=?, icon=?, content=?, published=? WHERE id=?').run(slug, title, description, icon, content, published ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});
router.delete('/admin/services/:id', (req, res) => {
  db.prepare('DELETE FROM services WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// Doctors Admin
router.get('/admin/doctors', (req, res) => res.json(db.prepare('SELECT * FROM doctors').all()));
router.post('/admin/doctors', (req, res) => {
  const { slug, name, specialty, qualifications, experience_years, bio, image_url, published } = req.body;
  const result = db.prepare('INSERT INTO doctors (slug, name, specialty, qualifications, experience_years, bio, image_url, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(slug, name, specialty, qualifications, experience_years, bio, image_url, published ? 1 : 0);
  res.json({ id: result.lastInsertRowid });
});
router.put('/admin/doctors/:id', (req, res) => {
  const { slug, name, specialty, qualifications, experience_years, bio, image_url, published } = req.body;
  db.prepare('UPDATE doctors SET slug=?, name=?, specialty=?, qualifications=?, experience_years=?, bio=?, image_url=?, published=? WHERE id=?').run(slug, name, specialty, qualifications, experience_years, bio, image_url, published ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});
router.delete('/admin/doctors/:id', (req, res) => {
  db.prepare('DELETE FROM doctors WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// Settings Admin
router.put('/admin/settings', (req, res) => {
  const settings = req.body;
  const stmt = db.prepare('UPDATE settings SET value = ? WHERE key = ?');
  const insertStmt = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  
  db.transaction(() => {
    for (const [key, value] of Object.entries(settings)) {
      insertStmt.run(key, String(value));
      stmt.run(String(value), key);
    }
  })();
  res.json({ message: 'Settings updated' });
});

export default router;
