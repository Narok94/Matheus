import 'dotenv/config';
import pg from 'pg';
import { schema } from './schema.js';

const { Pool } = pg;

// Use pg.Pool which is more standard and works everywhere
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.POSTGRES_URL ? { rejectUnauthorized: false } : false
});

export const query = async (text: string, params?: any[]) => {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL environment variable is missing. Please configure it in Settings -> Environment Variables.");
  }
  return await pool.query(text, params);
};

export const initDB = async () => {
  if (!process.env.POSTGRES_URL) {
    console.warn('POSTGRES_URL is missing. Skipping database initialization.');
    return;
  }
  try {
    await pool.query(schema);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export default pool;
