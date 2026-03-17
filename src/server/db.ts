import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Initialize database schema
try {
  db.exec("ALTER TABLE bookings ADD COLUMN reschedule_reason TEXT;");
} catch (e) {
  // Column might already exist
}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    content TEXT,
    published BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    qualifications TEXT,
    experience_years INTEGER,
    bio TEXT,
    image_url TEXT,
    published BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    image_url TEXT,
    published BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    service_id INTEGER,
    doctor_id INTEGER,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    reschedule_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    content TEXT NOT NULL,
    published BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial admin user if none exists
const adminCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (adminCount.count === 0) {
  const defaultPassword = 'admin';
  const hash = bcrypt.hashSync(defaultPassword, 10);
  db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)').run('admin@urbandontics.com', hash, 'admin');
}

// Seed initial settings
const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
if (settingsCount.count === 0) {
  const defaultSettings = {
    siteName: 'Urban Dontics',
    contactEmail: 'hello@urbandontics.com',
    contactPhone: '(555) 123-4567',
    address: '123 Smile Avenue, Suite 400, New York, NY 10001',
    heroHeadline: 'Modern Dentistry for a Better Smile',
    heroSubheadline: 'Experience pain-free, professional dental care in a relaxing environment.',
    aboutText: 'Urban Dontics is a premier dental clinic dedicated to providing top-tier oral healthcare. Our team of experienced professionals uses state-of-the-art technology to ensure your comfort and satisfaction.',
  };
  
  const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
  for (const [key, value] of Object.entries(defaultSettings)) {
    insertSetting.run(key, value);
  }
}

// Seed initial services
const servicesCount = db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number };
if (servicesCount.count === 0) {
  const insertService = db.prepare('INSERT INTO services (slug, title, description, icon, content) VALUES (?, ?, ?, ?, ?)');
  insertService.run('general-dentistry', 'General Dentistry', 'Comprehensive oral exams, cleanings, and preventative care.', 'Stethoscope', 'Regular checkups are the foundation of good oral health. Our general dentistry services include professional cleanings, comprehensive exams, oral cancer screenings, and personalized advice to keep your smile bright and healthy.');
  insertService.run('cosmetic-dentistry', 'Cosmetic Dentistry', 'Enhance your smile with veneers, bonding, and contouring.', 'Sparkles', 'Transform your smile with our cosmetic dentistry services. We offer porcelain veneers, dental bonding, and gum contouring to correct imperfections and give you the confidence you deserve.');
  insertService.run('teeth-whitening', 'Teeth Whitening', 'Professional whitening treatments for a brighter smile.', 'Sun', 'Achieve a dazzling smile with our professional teeth whitening treatments. We offer both in-office procedures for immediate results and take-home kits for your convenience.');
  insertService.run('dental-implants', 'Dental Implants', 'Permanent solutions for missing teeth that look and feel natural.', 'Activity', 'Replace missing teeth with durable, natural-looking dental implants. Our implant specialists use advanced techniques to restore your smile\'s function and aesthetics permanently.');
}

// Seed initial doctors
const doctorsCount = db.prepare('SELECT COUNT(*) as count FROM doctors').get() as { count: number };
if (doctorsCount.count === 0) {
  const insertDoctor = db.prepare('INSERT INTO doctors (slug, name, specialty, qualifications, experience_years, bio, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertDoctor.run('dr-sarah-jenkins', 'Dr. Sarah Jenkins', 'Cosmetic Dentist', 'DDS, NYU College of Dentistry', 12, 'Dr. Jenkins specializes in creating beautiful, natural-looking smiles. With over a decade of experience in cosmetic procedures, she is passionate about helping patients achieve their dream smiles.', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300');
  insertDoctor.run('dr-michael-chen', 'Dr. Michael Chen', 'Orthodontist', 'DMD, Harvard School of Dental Medicine', 8, 'Dr. Chen is an expert in modern orthodontic treatments, including clear aligners and traditional braces. He focuses on aligning teeth for both optimal function and aesthetics.', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300');
}

export default db;
