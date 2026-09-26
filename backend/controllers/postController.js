const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// Helper to validate integer ID
const isValidId = (id) => {
  return /^\d+$/.test(String(id));
};

// Safe helper to delete local uploaded image file
const deleteLocalImage = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return;
  if (!imageUrl.startsWith('/uploads/')) return;

  const fileName = path.basename(imageUrl);
  if (!fileName || fileName === '.gitkeep') return;

  const uploadsDir = path.resolve(__dirname, '..', 'uploads');
  const targetPath = path.resolve(uploadsDir, fileName);

  // Path traversal check: ensure resolved path is strictly within uploads directory
  if (targetPath.startsWith(uploadsDir + path.sep)) {
    if (fs.existsSync(targetPath)) {
      try {
        fs.unlinkSync(targetPath);
      } catch (err) {
        console.error('Error deleting local file:', targetPath, err.message);
      }
    }
  }
};

// GET /api/posts - Public: Get all posts
const getAllPosts = async (req, res) => {
  try {
    const [posts] = await db.query(
      `SELECT 
        p.id, 
        p.title, 
        p.content, 
        p.image_url, 
        p.user_id, 
        p.created_at, 
        p.updated_at,
        u.name AS author_name
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC, p.id DESC`
    );

    res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/posts/:id - Public: Get single post by ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const [posts] = await db.query(
      `SELECT 
        p.id, 
        p.title, 
        p.content, 
        p.image_url, 
        p.user_id, 
        p.created_at, 
        p.updated_at,
        u.name AS author_name
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?`,
      [id]
    );

    if (posts.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(posts[0]);
  } catch (err) {
    console.error('Error fetching post by ID:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/posts - Protected: Create a new post (supports optional image upload)
const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    // Validate title
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
      return res.status(400).json({ message: 'Title is required and cannot be empty' });
    }

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
      return res.status(400).json({ message: 'Content is required and cannot be empty' });
    }

    // Authenticated user ID strictly from req.user.id
    const userId = req.user.id;

    // Determine image URL if file was uploaded
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Insert post into database
    const [result] = await db.query(
      'INSERT INTO posts (title, content, image_url, user_id) VALUES (?, ?, ?, ?)',
      [title.trim(), content.trim(), imageUrl, userId]
    );

    const newPostId = result.insertId;

    // Fetch the newly created post with author details safely
    const [posts] = await db.query(
      `SELECT 
        p.id, 
        p.title, 
        p.content, 
        p.image_url, 
        p.user_id, 
        p.created_at, 
        p.updated_at,
        u.name AS author_name
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?`,
      [newPostId]
    );

    res.status(201).json({
      message: 'Post created successfully',
      post: posts[0]
    });
  } catch (err) {
    if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
    console.error('Error creating post:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/posts/:id - Protected: Update a post (supports optional replacement image)
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // Validate ID
    if (!isValidId(id)) {
      if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Validate input fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
      return res.status(400).json({ message: 'Title is required and cannot be empty' });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
      return res.status(400).json({ message: 'Content is required and cannot be empty' });
    }

    // Find the post first
    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);

    if (posts.length === 0) {
      if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = posts[0];

    // Check ownership using authenticated user ID
    if (Number(post.user_id) !== Number(req.user.id)) {
      if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
      return res.status(403).json({ message: 'Forbidden. You do not have permission to update this post' });
    }

    let updatedImageUrl = post.image_url;

    // Handle replacement image upload
    if (req.file) {
      updatedImageUrl = `/uploads/${req.file.filename}`;

      // Safely delete previous local image file if one existed
      if (post.image_url) {
        deleteLocalImage(post.image_url);
      }
    }

    // Update post in database (user_id cannot be changed)
    await db.query(
      'UPDATE posts SET title = ?, content = ?, image_url = ? WHERE id = ?',
      [title.trim(), content.trim(), updatedImageUrl, id]
    );

    // Fetch updated post
    const [updatedPosts] = await db.query(
      `SELECT 
        p.id, 
        p.title, 
        p.content, 
        p.image_url, 
        p.user_id, 
        p.created_at, 
        p.updated_at,
        u.name AS author_name
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?`,
      [id]
    );

    res.status(200).json({
      message: 'Post updated successfully',
      post: updatedPosts[0]
    });
  } catch (err) {
    if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
    console.error('Error updating post:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/posts/:id - Protected: Delete a post and associated image file
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Find the post first
    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);

    if (posts.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = posts[0];

    // Check ownership
    if (Number(post.user_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Forbidden. You do not have permission to delete this post' });
    }

    // Delete associated local image file if present
    if (post.image_url) {
      deleteLocalImage(post.image_url);
    }

    // Delete post from database
    await db.query('DELETE FROM posts WHERE id = ?', [id]);

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
};
