import 'dotenv/config';
import pg from 'pg';
import { schema } from './schema';

const { Pool } = pg;

// Use pg.Pool which is more standard and works everywhere
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.POSTGRES_URL ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000, // 5 seconds timeout
  idleTimeoutMillis: 30000,
  max: 10 // Limit pool size for serverless-like environments
});

export const query = async (text: string, params?: any[]) => {
  if (!process.env.POSTGRES_URL) {
    const errorMsg = "POSTGRES_URL environment variable is missing. Please configure it in Settings -> Environment Variables with your Vercel PostgreSQL connection string.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  return await pool.query(text, params);
};

export const initDB = async () => {
  if (!process.env.POSTGRES_URL) {
    console.warn('POSTGRES_URL is missing. Database initialization skipped. Please set POSTGRES_URL in environment variables.');
    return;
  }
  try {
    await pool.query(schema);
    console.log('Database initialized successfully');
  } catch (error: any) {
    console.error('Error initializing database:', error.message);
    throw new Error(`Database Initialization Failed: ${error.message}`);
  }
};

export default pool;
