import { Router } from 'express';
import { pool } from '../db.js';
import { mapAnnouncementRow } from '../utils.js';

const router = Router();

// 获取所有公告
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
    const announcements = (rows as any[]).map(mapAnnouncementRow);
    res.json(announcements);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取已启用的公告（前台用）
router.get('/active', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC');
    const announcements = (rows as any[]).map(mapAnnouncementRow);
    res.json(announcements);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 新增公告
router.post('/', async (req, res) => {
  try {
    const b = req.body;
    const id = String(Date.now());
    await pool.query(
      'INSERT INTO announcements (id, title, content, is_active) VALUES (?,?,?,?)',
      [id, b.title, b.content, b.isActive ?? true]
    );
    const [rows] = await pool.query('SELECT * FROM announcements WHERE id = ?', [id]);
    res.status(201).json(mapAnnouncementRow((rows as any[])[0]));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 更新公告
router.put('/:id', async (req, res) => {
  try {
    const b = req.body;
    await pool.query(
      'UPDATE announcements SET title=?, content=?, is_active=? WHERE id=?',
      [b.title, b.content, b.isActive, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM announcements WHERE id = ?', [req.params.id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: '公告不存在' });
    }
    res.json(mapAnnouncementRow((rows as any[])[0]));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 切换公告启用状态
router.patch('/:id/toggle-active', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM announcements WHERE id = ?', [req.params.id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: '公告不存在' });
    }
    const currentStatus = (rows as any[])[0].is_active;
    await pool.query('UPDATE announcements SET is_active = ? WHERE id = ?', [!currentStatus, req.params.id]);
    const [updated] = await pool.query('SELECT * FROM announcements WHERE id = ?', [req.params.id]);
    res.json(mapAnnouncementRow((updated as any[])[0]));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 删除公告
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: '公告不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
