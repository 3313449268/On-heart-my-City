import { Router } from 'express';
import { pool } from '../db.js';
import { mapReviewRow } from '../utils.js';

const router = Router();

// 获取所有评价
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
    const reviews = (rows as any[]).map(mapReviewRow);
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取某城市的已审核评价
router.get('/city/:cityId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM reviews WHERE city_id = ? AND is_approved = 1 ORDER BY created_at DESC',
      [req.params.cityId]
    );
    const reviews = (rows as any[]).map(mapReviewRow);
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取某用户的评价
router.get('/user/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC',
      [req.params.userId]
    );
    const reviews = (rows as any[]).map(mapReviewRow);
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 新增评价
router.post('/', async (req, res) => {
  try {
    const b = req.body;
    const id = String(Date.now());
    await pool.query(
      'INSERT INTO reviews (id, user_id, username, user_avatar, city_id, rating, content, is_approved) VALUES (?,?,?,?,?,?,?,?)',
      [id, b.userId, b.username, b.userAvatar, b.cityId, b.rating, b.content, false]
    );
    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]);
    res.status(201).json(mapReviewRow((rows as any[])[0]));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 审核通过评价
router.patch('/:id/approve', async (req, res) => {
  try {
    await pool.query('UPDATE reviews SET is_approved = 1 WHERE id = ?', [req.params.id]);
    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: '评价不存在' });
    }
    res.json(mapReviewRow((rows as any[])[0]));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 更新评价
router.put('/:id', async (req, res) => {
  try {
    const b = req.body;
    await pool.query(
      'UPDATE reviews SET rating=?, content=? WHERE id=?',
      [b.rating, b.content, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: '评价不存在' });
    }
    res.json(mapReviewRow((rows as any[])[0]));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 删除评价
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: '评价不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
