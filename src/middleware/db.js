import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();
let sql;

const init = async () => {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. The application requires a Postgres database.');
  }

  sql = postgres(DATABASE_URL, {
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  // Define schema: keep these statements simple and idempotent.
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      first_name TEXT,
      last_name TEXT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      destination TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      description TEXT,
      user_id TEXT REFERENCES users(username) ON DELETE CASCADE,
      cost NUMERIC NOT NULL,
      funds_raised NUMERIC DEFAULT 0,
      funding_goal NUMERIC DEFAULT 0,
      allow_donations BOOLEAN DEFAULT false,
      status TEXT DEFAULT 'draft'
    );
  `;

  // Ensure legacy installations gain new columns
  await sql`ALTER TABLE trips ADD COLUMN IF NOT EXISTS funding_goal NUMERIC DEFAULT 0`; 
  await sql`ALTER TABLE trips ADD COLUMN IF NOT EXISTS allow_donations BOOLEAN DEFAULT false`;
  await sql`ALTER TABLE trips ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'`;

  await sql`
    CREATE TABLE IF NOT EXISTS itinerary_items (
      id TEXT PRIMARY KEY,
      trip_id TEXT REFERENCES trips(id) ON DELETE CASCADE,
      day_number INTEGER,
      title TEXT,
      location TEXT,
      notes TEXT,
      estimated_cost NUMERIC,
      activity_time TIME
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS budget_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE,
      description TEXT
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS trip_budget_items (
      id TEXT PRIMARY KEY,
      trip_id TEXT REFERENCES trips(id) ON DELETE CASCADE,
      category_id TEXT REFERENCES budget_categories(id) ON DELETE SET NULL,
      planned_amount NUMERIC NOT NULL DEFAULT 0
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      trip_id TEXT REFERENCES trips(id) ON DELETE CASCADE,
      category_id TEXT REFERENCES budget_categories(id) ON DELETE SET NULL,
      created_by_user_id TEXT REFERENCES users(username) ON DELETE SET NULL,
      amount NUMERIC NOT NULL,
      description TEXT,
      expense_date DATE,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS contributions (
      id TEXT PRIMARY KEY,
      trip_id TEXT REFERENCES trips(id) ON DELETE CASCADE,
      contributor_user_id TEXT REFERENCES users(username) ON DELETE SET NULL,
      amount NUMERIC NOT NULL,
      type TEXT NOT NULL,
      message TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS trip_status_history (
      id TEXT PRIMARY KEY,
      trip_id TEXT REFERENCES trips(id) ON DELETE CASCADE,
      old_status TEXT,
      new_status TEXT,
      changed_by_user_id TEXT REFERENCES users(username) ON DELETE SET NULL,
      changed_at TIMESTAMPTZ DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS recaps (
      id TEXT PRIMARY KEY,
      trip_id TEXT UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      total_cost NUMERIC,
      lessons_learned TEXT,
      recommendation TEXT,
      featured BOOLEAN DEFAULT false,
      posted_at TIMESTAMPTZ DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS recap_photos (
      id TEXT PRIMARY KEY,
      recap_id TEXT REFERENCES recaps(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      caption TEXT,
      sort_order INTEGER DEFAULT 0
    );
  `;
  
  await sql`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      trip_id TEXT REFERENCES trips(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(username) ON DELETE SET NULL,
      body TEXT NOT NULL,
      parent_id TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      reported_by TEXT REFERENCES users(username) ON DELETE SET NULL,
      reason TEXT,
      details TEXT,
      status TEXT DEFAULT 'open',
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `;
};
export { init, sql };
