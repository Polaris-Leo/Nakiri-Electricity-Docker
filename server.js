import express from 'express';
import cron from 'node-cron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase, getDb } from './database.js';
import { scrapeTargetRoom } from './scraper.js';

// --- 初始化 ---
const app = express();
const port = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 检查核心环境变量
if (!process.env.ROOM_ID) {
    console.warn("⚠️ WARNING: ROOM_ID is not set! System may not work.");
}
if (!process.env.ROOM_URL) {
    console.warn("ℹ️ INFO: ROOM_URL is not set. Using default fallback URL logic.");
}

app.use(express.json());

// 初始化数据库
await initDatabase();

// --- 辅助函数：生成显示名称 ---
function getRoomDisplayName() {
    const roomId = process.env.ROOM_ID || 'Unset';
    const buildId = process.env.BUILD_ID;
    const partId = process.env.PART_ID; // 0: 奉贤, 1: 徐汇

    // 如果没有配置详细信息，直接返回 Room ID
    if (!buildId || !partId) {
        return `Room ${roomId}`;
    }

    const campus = partId === '0' ? '奉贤' : '徐汇';
    // 格式：徐汇-18号楼-507
    return `${campus}-${buildId}号楼-${roomId}`;
}

// --- API 接口 ---

// 1. 获取当前配置信息
app.get('/api/config', (req, res) => {
    res.json({
        roomId: process.env.ROOM_ID || null,
        displayName: getRoomDisplayName(), // 发送格式化后的名称
        version: 'Docker-v1.1'
    });
});

// 2. 获取数据
app.get('/api/data', async (req, res) => {
  try {
    const db = await getDb();
    const targetRoom = process.env.ROOM_ID;
    
    let query = "SELECT * FROM electricity WHERE timestamp > datetime('now', '-30 days')";
    const params = [];
    
    if (targetRoom) {
        query += " AND room_id = ?";
        params.push(targetRoom);
    }
    
    query += " ORDER BY timestamp ASC";

    const results = await db.all(query, params);
    res.json(results);
  } catch (e) {
    console.error("Database error:", e);
    res.status(500).json({ error: e.message });
  }
});

// --- 静态文件服务 ---
app.use(express.static(path.join(__dirname, 'dist')));

// --- 兜底路由 ---
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const indexFile = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(indexFile)) {
      res.sendFile(indexFile);
    } else {
      res.type('text/html');
      res.send('<h1>Nakiri Electricity</h1><p>Frontend building...</p>');
    }
  }
});

// --- 定时任务 (Cron) ---
cron.schedule('0 * * * *', async () => {
  console.log(`[${new Date().toISOString()}] Cron job running...`);
  await scrapeTargetRoom();
});

// --- 启动服务器 ---
app.listen(port, '0.0.0.0', async () => {
  console.log(`
  🚀 Nakiri Electricity is running!
  ---------------------------------------
  Port:    ${port}
  Room:    ${getRoomDisplayName()}
  URL:     ${process.env.ROOM_URL ? 'Custom URL Configured' : 'Default URL'}
  ---------------------------------------
  `);
  
  if (process.env.ROOM_ID) {
      console.log('Initializing data scrape on startup...');
      await scrapeTargetRoom();
  }
});