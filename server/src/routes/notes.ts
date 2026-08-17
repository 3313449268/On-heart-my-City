import { Router } from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { pool } from '../db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const router = Router();

// ----------------- 多图上传配置 -----------------
const uploadDir = join(__dirname, '..', '..', 'uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname) || '.jpg';
    cb(null, `note-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
  allowedTypes.includes(file.mimetype) ? cb(null, true)
    : cb(new Error('只支持 JPG / PNG / WebP / GIF 格式的图片'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ----------------- 行转 Note 对象 -----------------
function rowToNote(row: any) {
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
    likeCount: typeof row.like_count === 'number' ? row.like_count : 0,
    commentCount: typeof row.comment_count === 'number' ? row.comment_count : 0,
    viewCount: typeof row.view_count === 'number' ? row.view_count : 0,
    isLiked: typeof row.is_liked === 'number' ? row.is_liked > 0 : Boolean(row.is_liked),
    isApproved: !!row.is_approved,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function escapeLikeField(v: unknown): string {
  return String(v ?? '').replace(/[^0-9a-zA-Z_-]/g, '').slice(0, 32);
}

// ----------------- 路由 -----------------

// GET /api/notes - 笔记列表（支持按城市、排序、分页、当前用户点赞状态）
router.get('/', async (req, res) => {
  try {
    const { cityId, sort = 'latest', page = '1', pageSize = '12', userId } = req.query;

    const p = Math.max(1, parseInt(page as string) || 1);
    const ps = Math.min(50, Math.max(1, parseInt(pageSize as string) || 12));
    const offset = (p - 1) * ps;

    let orderBy = 'created_at DESC';
    if (sort === 'hot') orderBy = 'like_count DESC, view_count DESC, created_at DESC';
    if (sort === 'popular') orderBy = 'view_count DESC, created_at DESC';

    const whereClauses: string[] = ['n.is_approved = TRUE'];
    const params: any[] = [];

    if (cityId && cityId !== 'all') {
      whereClauses.push('n.city_id = ?');
      params.push(String(cityId));
    }

    const likeUserId = userId ? escapeLikeField(userId) : '';
    const likeJoin = likeUserId
      ? `LEFT JOIN note_likes nl ON n.id = nl.note_id AND nl.user_id = ?`
      : '';
    const likeSelect = likeUserId ? `, IFNULL(nl.id, 0) > 0 AS is_liked` : ', 0 AS is_liked';

    // 注意：likeUserId 必须放在 params 最前面，因为 LIKE JOIN 的 ? 在 WHERE 之前
    const listParams = likeUserId
      ? [likeUserId, ...params, ps, offset]
      : [...params, ps, offset];

    // COUNT 查询不需要 likeUserId
    const countParams = [...params];

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT n.* ${likeSelect}
       FROM notes n ${likeJoin}
       ${whereSql}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      listParams
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM notes n ${whereSql}`,
      countParams
    );
    const total = (countRows as any[])[0].total;

    res.json({
      list: (rows as any[]).map(rowToNote),
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

// GET /api/notes/:id - 笔记详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const likeUserId = userId ? escapeLikeField(userId) : '';
    const likeSelect = likeUserId ? `, IFNULL(nl.id, 0) > 0 AS is_liked` : ', 0 AS is_liked';
    const likeJoin = likeUserId
      ? `LEFT JOIN note_likes nl ON n.id = nl.note_id AND nl.user_id = ?`
      : '';
    const selectParams: any[] = [id];
    if (likeUserId) selectParams.push(likeUserId);

    const [rows] = await pool.query(
      `SELECT n.* ${likeSelect} FROM notes n ${likeJoin} WHERE n.id = ? LIMIT 1`,
      likeUserId ? [likeUserId, id] : [id]
    );

    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: '笔记不存在' });
    }

    // 先增加浏览量（保证返回给前端的是最新值）
    await pool.query('UPDATE notes SET view_count = view_count + 1 WHERE id = ?', [id]);

    // 再查一次拿到最新的浏览量
    const [refreshed] = await pool.query(
      `SELECT n.* ${likeSelect} FROM notes n ${likeJoin} WHERE n.id = ? LIMIT 1`,
      likeUserId ? [likeUserId, id] : [id]
    );

    res.json(rowToNote((refreshed as any[])[0]));
  } catch (err) {
    console.error('获取笔记详情失败:', err);
    res.status(500).json({ error: '获取笔记详情失败' });
  }
});

// POST /api/notes - 发布笔记
router.post('/', async (req, res) => {
  try {
    const { userId, username: bodyUsername, userAvatar: bodyAvatar, cityId, title, content, images = [] } = req.body;

    if (!userId || !cityId || !title || !content) {
      return res.status(400).json({ error: '请填写完整信息（用户、城市、标题、内容为必填）' });
    }

    const titleStr = String(title).trim();
    const contentStr = String(content).trim();
    if (titleStr.length === 0) return res.status(400).json({ error: '标题不能为空' });
    if (titleStr.length > 200) return res.status(400).json({ error: '标题不能超过 200 字' });
    if (contentStr.length === 0) return res.status(400).json({ error: '内容不能为空' });
    if (contentStr.length > 10000) return res.status(400).json({ error: '内容不能超过 10000 字' });

    if (!Array.isArray(images) || images.some((x: any) => typeof x !== 'string')) {
      return res.status(400).json({ error: 'images 必须是字符串数组' });
    }
    if (images.length > 9) {
      return res.status(400).json({ error: '最多上传 9 张图片' });
    }

    // 1. 校验 cityId 真实存在，cityName 从 DB 取（拒绝前端伪造）
    const [cityRows] = await pool.query(
      'SELECT id, name FROM cities WHERE id = ? LIMIT 1',
      [String(cityId)]
    );
    if ((cityRows as any[]).length === 0) {
      return res.status(400).json({ error: '所选城市不存在' });
    }
    const city = (cityRows as any[])[0];

    // 2. 校验 userId：如果 users 表里存在该用户，以 DB 里的 username/avatar 为准（防止前端伪造身份）
    let finalUsername = bodyUsername ? String(bodyUsername).trim() : '';
    let finalAvatar = bodyAvatar || null;

    const [userRows] = await pool.query(
      'SELECT id, username, avatar FROM users WHERE id = ? LIMIT 1',
      [String(userId)]
    );
    if ((userRows as any[]).length > 0) {
      const u = (userRows as any[])[0];
      finalUsername = u.username || finalUsername || '城市居民';
      finalAvatar = u.avatar || finalAvatar;
    } else if (!finalUsername) {
      finalUsername = '城市居民';
    }
    finalUsername = finalUsername.slice(0, 50);

    const id = generateId();
    const imagesJson = JSON.stringify(images);

    await pool.query(
      `INSERT INTO notes (id, user_id, username, user_avatar, city_id, city_name, title, content, images)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        String(userId),
        finalUsername,
        finalAvatar ? String(finalAvatar) : null,
        city.id,
        city.name,
        titleStr,
        contentStr,
        imagesJson,
      ]
    );

    const [rows] = await pool.query('SELECT *, 0 AS is_liked FROM notes WHERE id = ? LIMIT 1', [id]);
    res.status(201).json(rowToNote((rows as any[])[0]));
  } catch (err) {
    console.error('发布笔记失败:', err);
    res.status(500).json({ error: '发布笔记失败' });
  }
});

// POST /api/notes/upload-images - 批量上传笔记图片（一次最多 9 张）
router.post('/upload-images', upload.array('images', 9), (req, res) => {
  if (!req.files || (req.files as any[]).length === 0) {
    return res.status(400).json({ error: '请选择要上传的图片' });
  }
  const urls = (req.files as any[]).map((f: any) => `/uploads/${f.filename}`);
  res.json({ urls });
});

// POST /api/notes/:id/like - 点赞 / 取消点赞
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: '请先登录' });
    }

    const [noteRows] = await pool.query('SELECT id FROM notes WHERE id = ? LIMIT 1', [id]);
    if ((noteRows as any[]).length === 0) {
      return res.status(404).json({ error: '笔记不存在' });
    }

    const safeUserId = String(userId);

    const [existing] = await pool.query(
      'SELECT id FROM note_likes WHERE note_id = ? AND user_id = ? LIMIT 1',
      [id, safeUserId]
    );

    let liked: boolean;

    if ((existing as any[]).length > 0) {
      // 取消点赞
      const likeId = (existing as any[])[0].id;
      await pool.query('DELETE FROM note_likes WHERE id = ?', [likeId]);
      await pool.query('UPDATE notes SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?', [id]);
      liked = false;
    } else {
      // 点赞（利用唯一索引兜底，保证不会重复）
      try {
        await pool.query(
          `INSERT INTO note_likes (id, note_id, user_id) VALUES (?, ?, ?)`,
          [generateId(), id, safeUserId]
        );
      } catch (dupErr: any) {
        // 唯一索引命中，表示刚刚已有人点过（重复请求场景）
        if (dupErr?.code === 'ER_DUP_ENTRY') {
          const [rows] = await pool.query('SELECT like_count FROM notes WHERE id = ? LIMIT 1', [id]);
          return res.json({ liked: true, likeCount: (rows as any[])[0].like_count });
        }
        throw dupErr;
      }
      await pool.query('UPDATE notes SET like_count = like_count + 1 WHERE id = ?', [id]);
      liked = true;
    }

    const [rows] = await pool.query('SELECT like_count FROM notes WHERE id = ? LIMIT 1', [id]);
    res.json({ liked, likeCount: (rows as any[])[0].like_count });
  } catch (err) {
    console.error('点赞操作失败:', err);
    res.status(500).json({ error: '点赞操作失败' });
  }
});

// DELETE /api/notes/:id - 删除笔记（只能作者本人删除）
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: '请先登录' });
    }

    const [rows] = await pool.query(
      'SELECT id, user_id FROM notes WHERE id = ? LIMIT 1',
      [id]
    );
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: '笔记不存在' });
    }

    const note = (rows as any[])[0];
    if (String(note.user_id) !== String(userId)) {
      return res.status(403).json({ error: '无权限删除该笔记' });
    }

    // 用事务保证数据一致：删笔记 + 删点赞
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

    res.json({ message: '删除成功' });
  } catch (err) {
    console.error('删除笔记失败:', err);
    res.status(500).json({ error: '删除笔记失败' });
  }
});

// 上传错误处理
router.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '单张图片大小不能超过 5MB' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: '一次最多上传 9 张图片' });
    }
    return res.status(400).json({ error: err.message });
  }
  res.status(400).json({ error: err.message || '图片上传失败' });
});

export default router;
