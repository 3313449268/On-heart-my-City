import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { testConnection } from './db.js';
import cityRoutes from './routes/cities.js';
import userRoutes from './routes/users.js';
import reviewRoutes from './routes/reviews.js';
import announcementRoutes from './routes/announcements.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import chatRoutes from './routes/chat.js';
import noteRoutes from './routes/notes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 加载 .env 配置
function loadEnv() {
  try {
    const envContent = readFileSync(join(__dirname, '..', '.env'), 'utf-8');
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    });
  } catch (e) {
    console.log('未找到 .env 文件，使用默认配置');
  }
}

loadEnv();

const app = express();
const PORT = parseInt(process.env.PORT || '3000');

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 静态文件服务 - 提供上传图片的访问
app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: '如意城市后端服务运行中' });
});

// API 路由
app.use('/api/cities', cityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notes', noteRoutes);

// 错误处理中间件
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误', message: err.message });
});

// 启动服务器
async function start() {
  const connected = await testConnection();
  if (!connected) {
    console.error('无法连接到数据库，请检查 MySQL 是否启动以及配置是否正确');
    console.error('请运行 npm run init-db 初始化数据库');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 如意城市后端服务已启动`);
    console.log(`   地址: http://localhost:${PORT}`);
    console.log(`   健康检查: http://localhost:${PORT}/api/health\n`);
  });
}

start();
