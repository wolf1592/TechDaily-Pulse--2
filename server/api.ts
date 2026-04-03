import { Router, Request, Response } from 'express';
import pool from './db.js';
import { authenticateToken, isAdmin } from './auth.js';

const router = Router();

// --- Articles ---
router.get('/articles', async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute(`
      SELECT a.*, c.name as categoryName, u.displayName as authorName 
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.author_id = u.id
      ORDER BY a.createdAt DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Makaleler yüklenirken hata oluştu' });
  }
});

router.get('/articles/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows]: any = await pool.execute(`
      SELECT a.*, c.name as categoryName, u.displayName as authorName 
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.id = ?
    `, [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Makale bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Makale yüklenirken hata oluştu' });
  }
});

router.post('/articles', authenticateToken, async (req: any, res: Response) => {
  const { title, slug, image, category_id, date, content, status, isFeatured, isLarge, seo_focusKeyword, seo_altText, seo_title, seo_description } = req.body;
  const author_id = req.user.id;

  try {
    const [result]: any = await pool.execute(
      `INSERT INTO articles (title, slug, image, category_id, date, author_id, content, status, isFeatured, isLarge, seo_focusKeyword, seo_altText, seo_title, seo_description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, image, category_id, date, author_id, content, status || 'draft', isFeatured || false, isLarge || false, seo_focusKeyword, seo_altText, seo_title, seo_description]
    );
    res.status(201).json({ id: result.insertId, message: 'Makale başarıyla eklendi' });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ message: 'Makale eklenirken hata oluştu' });
  }
});

router.put('/articles/:id', authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, slug, image, category_id, date, content, status, isFeatured, isLarge, seo_focusKeyword, seo_altText, seo_title, seo_description } = req.body;

  try {
    await pool.execute(
      `UPDATE articles SET title=?, slug=?, image=?, category_id=?, date=?, content=?, status=?, isFeatured=?, isLarge=?, seo_focusKeyword=?, seo_altText=?, seo_title=?, seo_description=? 
       WHERE id=?`,
      [title, slug, image, category_id, date, content, status, isFeatured, isLarge, seo_focusKeyword, seo_altText, seo_title, seo_description, id]
    );
    res.json({ message: 'Makale başarıyla güncellendi' });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ message: 'Makale güncellenirken hata oluştu' });
  }
});

router.delete('/articles/:id', authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM articles WHERE id = ?', [id]);
    res.json({ message: 'Makale başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ message: 'Makale silinirken hata oluştu' });
  }
});

// --- Categories ---
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute('SELECT * FROM categories ORDER BY `order` ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Kategoriler yüklenirken hata oluştu' });
  }
});

router.post('/categories', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  const { name, description, slug, metaTitle, metaDescription, color, icon, parentId, order } = req.body;
  try {
    const [result]: any = await pool.execute(
      'INSERT INTO categories (name, description, slug, metaTitle, metaDescription, color, icon, parentId, `order`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, slug, metaTitle, metaDescription, color, icon, parentId || null, order || 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Kategori başarıyla eklendi' });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Kategori eklenirken hata oluştu' });
  }
});

router.put('/categories/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, slug, metaTitle, metaDescription, color, icon, parentId, order } = req.body;
  try {
    await pool.execute(
      'UPDATE categories SET name=?, description=?, slug=?, metaTitle=?, metaDescription=?, color=?, icon=?, parentId=?, `order`=? WHERE id=?',
      [name, description, slug, metaTitle, metaDescription, color, icon, parentId || null, order || 0, id]
    );
    res.json({ message: 'Kategori başarıyla güncellendi' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Kategori güncellenirken hata oluştu' });
  }
});

router.delete('/categories/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: 'Kategori başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Kategori silinirken hata oluştu' });
  }
});

// --- Videos ---
router.get('/videos', async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute('SELECT * FROM videos ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Videolar yüklenirken hata oluştu' });
  }
});

router.post('/videos', authenticateToken, async (req: Request, res: Response) => {
  const { title, image, duration, url } = req.body;
  try {
    const [result]: any = await pool.execute(
      'INSERT INTO videos (title, image, duration, url) VALUES (?, ?, ?, ?)',
      [title, image, duration, url]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Video eklenirken hata oluştu' });
  }
});

// --- Users ---
router.get('/users', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute('SELECT id, email, displayName, role, createdAt FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Kullanıcılar yüklenirken hata oluştu' });
  }
});

router.put('/users/:id/role', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ message: 'Rol başarıyla güncellendi' });
  } catch (error) {
    res.status(500).json({ message: 'Rol güncellenirken hata oluştu' });
  }
});

// --- Settings ---
router.get('/settings', async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute('SELECT * FROM settings');
    const settings: any = {};
    rows.forEach((row: any) => {
      try {
        settings[row.id] = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
      } catch (e) {
        settings[row.id] = row.value;
      }
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Ayarlar yüklenirken hata oluştu' });
  }
});

router.post('/settings/poll/vote', async (req: Request, res: Response) => {
  const { optionIndex } = req.body;
  try {
    const [rows]: any = await pool.execute('SELECT value FROM settings WHERE id = "poll"');
    if (rows.length > 0) {
      const poll = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
      poll.options[optionIndex].votes += 1;
      poll.totalVotes += 1;
      await pool.execute('UPDATE settings SET value = ? WHERE id = "poll"', [JSON.stringify(poll)]);
      res.json({ success: true });
    } else {
      res.status(404).json({ message: 'Anket bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Oy kullanılırken hata oluştu' });
  }
});

router.post('/settings/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  
  try {
    await pool.execute(
      'INSERT INTO settings (id, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
      [id, JSON.stringify(data), JSON.stringify(data)]
    );
    res.json({ message: 'Ayarlar başarıyla güncellendi' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Ayarlar güncellenirken hata oluştu' });
  }
});

// --- Comments ---
router.get('/articles/:id/comments', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows]: any = await pool.execute(
      'SELECT * FROM comments WHERE articleId = ? ORDER BY createdAt DESC',
      [id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Yorumlar yüklenirken hata oluştu' });
  }
});

router.post('/articles/:id/comments', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { text, authorName } = req.body;
  try {
    await pool.execute(
      'INSERT INTO comments (articleId, text, authorName) VALUES (?, ?, ?)',
      [id, text, authorName]
    );
    res.status(201).json({ message: 'Yorum başarıyla eklendi' });
  } catch (error) {
    res.status(500).json({ message: 'Yorum eklenirken hata oluştu' });
  }
});

export default router;
