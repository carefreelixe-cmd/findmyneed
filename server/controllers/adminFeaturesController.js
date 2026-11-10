import { query } from '../config/database.js';

// ====================================================================
// BANNERS
// ====================================================================

export const getAllBanners = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM banners WHERE deleted_at IS NULL ORDER BY position ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createBanner = async (req, res) => {
  try {
    const { title, description, imageUrl, link, position } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const result = await query(
      `INSERT INTO banners (title, description, image_url, link, position)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, imageUrl, link, position || 0]
    );

    res.status(201).json({ message: 'Banner created', banner: result.rows[0] });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, imageUrl, link, position, isActive } = req.body;

    const result = await query(
      `UPDATE banners SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        image_url = COALESCE($3, image_url),
        link = COALESCE($4, link),
        position = COALESCE($5, position),
        is_active = COALESCE($6, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND deleted_at IS NULL
       RETURNING *`,
      [title, description, imageUrl, link, position, isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.json({ message: 'Banner updated', banner: result.rows[0] });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE banners SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.json({ message: 'Banner deleted' });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ====================================================================
// FAQs
// ====================================================================

export const getAllFAQs = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM faqs WHERE deleted_at IS NULL ORDER BY display_order ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createFAQ = async (req, res) => {
  try {
    const { question, answer, category, displayOrder } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    const result = await query(
      `INSERT INTO faqs (question, answer, category, display_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [question, answer, category, displayOrder || 0]
    );

    res.status(201).json({ message: 'FAQ created', faq: result.rows[0] });
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, displayOrder, isActive } = req.body;

    const result = await query(
      `UPDATE faqs SET
        question = COALESCE($1, question),
        answer = COALESCE($2, answer),
        category = COALESCE($3, category),
        display_order = COALESCE($4, display_order),
        is_active = COALESCE($5, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND deleted_at IS NULL
       RETURNING *`,
      [question, answer, category, displayOrder, isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json({ message: 'FAQ updated', faq: result.rows[0] });
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE faqs SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json({ message: 'FAQ deleted' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ====================================================================
// PAGES
// ====================================================================

export const getAllPages = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, title, slug, is_published, created_at, updated_at FROM pages WHERE deleted_at IS NULL'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createPage = async (req, res) => {
  try {
    const { title, slug, content, isPublished } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ message: 'Title and slug are required' });
    }

    const result = await query(
      `INSERT INTO pages (title, slug, content, is_published)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, slug, content || '', isPublished || false]
    );

    res.status(201).json({ message: 'Page created', page: result.rows[0] });
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, isPublished } = req.body;

    const result = await query(
      `UPDATE pages SET
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        content = COALESCE($3, content),
        is_published = COALESCE($4, is_published),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND deleted_at IS NULL
       RETURNING *`,
      [title, slug, content, isPublished, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Page not found' });
    }

    res.json({ message: 'Page updated', page: result.rows[0] });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deletePage = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE pages SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Page not found' });
    }

    res.json({ message: 'Page deleted' });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ====================================================================
// COMMISSIONS
// ====================================================================

export const getAllCommissions = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM commissions WHERE deleted_at IS NULL ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get commissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCommission = async (req, res) => {
  try {
    const { name, commissionType, amount, description } = req.body;

    if (!name || !commissionType || amount === undefined) {
      return res.status(400).json({ message: 'Name, type, and amount are required' });
    }

    if (!['percentage', 'fixed'].includes(commissionType)) {
      return res.status(400).json({ message: 'Invalid commission type' });
    }

    const result = await query(
      `INSERT INTO commissions (name, commission_type, amount, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, commissionType, amount, description || '']
    );

    res.status(201).json({ message: 'Commission created', commission: result.rows[0] });
  } catch (error) {
    console.error('Create commission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCommission = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, commissionType, amount, description, isActive } = req.body;

    const result = await query(
      `UPDATE commissions SET
        name = COALESCE($1, name),
        commission_type = COALESCE($2, commission_type),
        amount = COALESCE($3, amount),
        description = COALESCE($4, description),
        is_active = COALESCE($5, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND deleted_at IS NULL
       RETURNING *`,
      [name, commissionType, amount, description, isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Commission not found' });
    }

    res.json({ message: 'Commission updated', commission: result.rows[0] });
  } catch (error) {
    console.error('Update commission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCommission = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE commissions SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Commission not found' });
    }

    res.json({ message: 'Commission deleted' });
  } catch (error) {
    console.error('Delete commission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ====================================================================
// SYSTEM NOTIFICATIONS
// ====================================================================

export const getAllNotifications = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM system_notifications ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendNotification = async (req, res) => {
  try {
    const { title, message, notificationType, recipientType } = req.body;

    if (!title || !message || !notificationType || !recipientType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['email', 'sms', 'in_app'].includes(notificationType)) {
      return res.status(400).json({ message: 'Invalid notification type' });
    }

    if (!['all', 'providers', 'customers'].includes(recipientType)) {
      return res.status(400).json({ message: 'Invalid recipient type' });
    }

    const result = await query(
      `INSERT INTO system_notifications (title, message, notification_type, recipient_type, is_sent, sent_at)
       VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP)
       RETURNING *`,
      [title, message, notificationType, recipientType]
    );

    res.status(201).json({ message: 'Notification sent', notification: result.rows[0] });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM system_notifications WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ====================================================================
// BLOG POSTS FUNCTIONS
// ====================================================================

export const getAllBlogPosts = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM blog_posts WHERE deleted_at IS NULL ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createBlogPost = async (req, res) => {
  const { title, slug, content, excerpt, isPublished } = req.body;

  if (!title || !slug || !content) {
    return res.status(400).json({ message: 'Title, slug, and content are required' });
  }

  try {
    const result = await query(
      `INSERT INTO blog_posts (title, slug, content, excerpt, is_published, author_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [title, slug, content, excerpt || null, isPublished || false, 1]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create blog post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBlogPost = async (req, res) => {
  const { id } = req.params;
  const { title, slug, content, excerpt, isPublished } = req.body;

  try {
    const result = await query(
      `UPDATE blog_posts 
       SET title = COALESCE($1, title),
           slug = COALESCE($2, slug),
           content = COALESCE($3, content),
           excerpt = COALESCE($4, excerpt),
           is_published = COALESCE($5, is_published),
           updated_at = NOW()
       WHERE id = $6 AND deleted_at IS NULL
       RETURNING *`,
      [title, slug, content, excerpt, isPublished, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update blog post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteBlogPost = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `UPDATE blog_posts SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json({ message: 'Blog post deleted' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
