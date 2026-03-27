import mysql from 'mysql2/promise';
import env from './env.js';

const pool = mysql.createPool({
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

export const testConnection = async () => {
  const connection = await pool.getConnection();
  connection.release();
};

export default pool;
