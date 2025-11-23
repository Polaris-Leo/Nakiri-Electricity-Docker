import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export async function initDatabase() {
  db = await open({
    filename: process.env.DB_PATH || './data/main.db', // 支持通过环境变量配置数据库路径，适合 Docker 挂载
    driver: sqlite3.Database
  });

  // 仅保留电量数据表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS electricity (
      timestamp TEXT,
      room_id TEXT,
      kWh REAL,
      UNIQUE(timestamp, room_id)
    );
  `);
  
  console.log('Database initialized.');
}

export async function getDb() {
  if (!db) await initDatabase();
  return db;
}