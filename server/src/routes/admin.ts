import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// 管理员登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query(
      'SELECT * FROM admins WHERE username = ? AND password = ?',
      [username, password]
    );
    if ((rows as any[]).length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    res.json({ success: true, username: (rows as any[])[0].username });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 仪表盘统计数据
router.get('/dashboard', async (_req, res) => {
  try {
    const [cityCount] = await pool.query('SELECT COUNT(*) as count FROM cities');
    const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [reviewCount] = await pool.query('SELECT COUNT(*) as count FROM reviews');
    const [pendingReviewCount] = await pool.query('SELECT COUNT(*) as count FROM reviews WHERE is_approved = 0');
    const [annCount] = await pool.query('SELECT COUNT(*) as count FROM announcements WHERE is_active = 1');
    const [noteCount] = await pool.query('SELECT COUNT(*) as count FROM notes');
    const [pendingNoteCount] = await pool.query('SELECT COUNT(*) as count FROM notes WHERE is_approved = 0');

    res.json({
      cityCount: (cityCount as any[])[0].count,
      userCount: (userCount as any[])[0].count,
      reviewCount: (reviewCount as any[])[0].count,
      pendingReviewCount: (pendingReviewCount as any[])[0].count,
      announcementCount: (annCount as any[])[0].count,
      noteCount: (noteCount as any[])[0].count,
      pendingNoteCount: (pendingNoteCount as any[])[0].count,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================ 笔记管理 ================

// GET /api/admin/notes - 笔记列表（支持搜索、筛选、分页）
router.get('/notes', async (req, res) => {
  try {
    const { keyword = '', status = 'all', cityId = '', page = '1', pageSize = '10' } = req.query;
    const p = Math.max(1, parseInt(page as string) || 1);
    const ps = Math.min(50, Math.max(1, parseInt(pageSize as string) || 10));
    const offset = (p - 1) * ps;

    const whereClauses: string[] = ['1 = 1'];
    const params: any[] = [];

    if (keyword) {
      whereClauses.push('(n.title LIKE ? OR n.content LIKE ? OR n.username LIKE ?)');
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }
    if (status === 'approved') {
      whereClauses.push('n.is_approved = 1');
    } else if (status === 'pending') {
      whereClauses.push('n.is_approved = 0');
    }
    if (cityId) {
      whereClauses.push('n.city_id = ?');
      params.push(String(cityId));
    }

    const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

    const [rows] = await pool.query(
      `SELECT * FROM notes n ${whereSql} ORDER BY n.created_at DESC LIMIT ? OFFSET ?`,
      [...params, ps, offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM notes n ${whereSql}`,
      params
    );
    const total = (countRows as any[])[0].total;

    const list = (rows as any[]).map((row) => {
      let images: string[] = [];
      try {
        images = typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []);
      } catch {
        images = [];
      }
      return {
        id: row.id,
        userId: row.user_id,
        username: row.username,
        userAvatar: row.user_avatar,
        cityId: row.city_id,
        cityName: row.city_name,
        title: row.title,
        content: row.content,
        images,
        likeCount: row.like_count,
        commentCount: row.comment_count,
        viewCount: row.view_count,
        isApproved: !!row.is_approved,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    res.json({
      list,
      total,
      page: p,
      pageSize: ps,
      hasMore: offset + ps < total,
    });
  } catch (err) {
    console.error('获取笔记列表失败:', err);
    res.status(500).json({ error: '获取笔记列表失败' });
  }
});

// POST /api/admin/notes/:id/approve - 审核通过
router.post('/notes/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT id FROM notes WHERE id = ? LIMIT 1', [id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: '笔记不存在' });
    }
    await pool.query('UPDATE notes SET is_approved = 1 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('审核笔记失败:', err);
    res.status(500).json({ error: '审核失败' });
  }
});

// DELETE /api/admin/notes/:id - 删除笔记
router.delete('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT id FROM notes WHERE id = ? LIMIT 1', [id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: '笔记不存在' });
    }
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query('DELETE FROM note_likes WHERE note_id = ?', [id]);
      await conn.query('DELETE FROM notes WHERE id = ?', [id]);
      await conn.commit();
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }
    res.json({ success: true });
  } catch (err) {
    console.error('删除笔记失败:', err);
    res.status(500).json({ error: '删除失败' });
  }
});

// POST /api/admin/notes/batch-delete - 批量删除笔记
router.post('/notes/batch-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: '请提供笔记 ID 列表' });
    }
    if (ids.length > 100) {
      return res.status(400).json({ error: '单次最多删除 100 条' });
    }
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const placeholders = ids.map(() => '?').join(',');
      await conn.query(`DELETE FROM note_likes WHERE note_id IN (${placeholders})`, ids);
      const [result] = await conn.query(`DELETE FROM notes WHERE id IN (${placeholders})`, ids);
      await conn.commit();
      res.json({ success: true, affected: (result as any).affectedRows });
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('批量删除笔记失败:', err);
    res.status(500).json({ error: '批量删除失败' });
  }
});

// POST /api/admin/notes/batch-approve - 批量审核通过
router.post('/notes/batch-approve', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: '请提供笔记 ID 列表' });
    }
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await pool.query(
      `UPDATE notes SET is_approved = 1 WHERE id IN (${placeholders})`,
      ids
    );
    res.json({ success: true, affected: (result as any).affectedRows });
  } catch (err) {
    console.error('批量审核失败:', err);
    res.status(500).json({ error: '批量审核失败' });
  }
});

export default router;
