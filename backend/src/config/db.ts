import mysql, { Connection } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Ensure required env vars exist
const {
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  DB_PORT
} = process.env;

if (!DB_HOST || !DB_USERNAME || !DB_PASSWORD || !DB_DATABASE) {
  throw new Error('Missing required database environment variables.');
}

const port: number = DB_PORT ? parseInt(DB_PORT, 10) : 3306;

const dbPromise = mysql.createConnection({
  host: DB_HOST,
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port
});

export default dbPromise;
