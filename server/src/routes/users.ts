import { Router } from 'express';
import { pool } from '../db.js';
import { mapUserRow } from '../utils.js';

const router = Router();

// 获取所有用户
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    const users = (rows as any[]).map(mapUserRow);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个用户
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json(mapUserRow((rows as any[])[0]));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 切换用户禁用状态
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    const currentStatus = (rows as any[])[0].is_disabled;
    await pool.query('UPDATE users SET is_disabled = ? WHERE id = ?', [!currentStatus, req.params.id]);
    const [updated] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    res.json(mapUserRow((updated as any[])[0]));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 更新用户信息
router.put('/:id', async (req, res) => {
  try {
    const b = req.body;
    const favorites = JSON.stringify(b.favorites || []);
    await pool.query(
      'UPDATE users SET username=?, phone=?, avatar=?, favorites=? WHERE id=?',
      [b.username, b.phone, b.avatar, favorites, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json(mapUserRow((rows as any[])[0]));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 注册新用户
router.post('/register', async (req, res) => {
  try {
    const { username, phone, password } = req.body;
    // 检查手机号是否已存在
    const [existing] = await pool.query('SELECT id FROM users WHERE phone = ?', [phone]);
    if ((existing as any[]).length > 0) {
      return res.status(400).json({ error: '该手机号已注册' });
    }
    const id = String(Date.now());
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`;
    const favorites = JSON.stringify([]);
    await pool.query(
      'INSERT INTO users (id, username, phone, password, avatar, favorites, is_disabled) VALUES (?,?,?,?,?,?,?)',
      [id, username, phone, password || '', avatar, favorites, false]
    );
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    res.status(201).json(mapUserRow((rows as any[])[0]));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { phone } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE phone = ?', [phone]);
    if ((rows as any[]).length === 0) {
      // 自动注册
      const id = String(Date.now());
      const username = '用户' + phone.slice(-4);
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`;
      const favorites = JSON.stringify([]);
      await pool.query(
        'INSERT INTO users (id, username, phone, avatar, favorites, is_disabled) VALUES (?,?,?,?,?,?)',
        [id, username, phone, avatar, favorites, false]
      );
      const [newRows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
      return res.json(mapUserRow((newRows as any[])[0]));
    }
    const user = (rows as any[])[0];
    if (user.is_disabled) {
      return res.status(403).json({ error: '账号已被禁用' });
    }
    res.json(mapUserRow(user));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
