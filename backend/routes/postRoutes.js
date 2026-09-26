const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { uploadImage } = require('../middleware/uploadMiddleware');
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
} = require('../controllers/postController');

// Public endpoints
router.get('/', getAllPosts);
router.get('/:id', getPostById);

// Protected endpoints
router.post('/', authMiddleware, uploadImage, createPost);
router.put('/:id', authMiddleware, uploadImage, updatePost);
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;
