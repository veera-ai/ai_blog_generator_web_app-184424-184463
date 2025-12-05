'use strict';

const express = require('express');
const { body, query, param } = require('express-validator');
const blogsController = require('../controllers/blogs');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /api/blogs/generate:
 *   post:
 *     summary: Generate a new blog post based on a topic
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Blogs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [topic]
 *             properties:
 *               topic:
 *                 type: string
 *                 description: Topic for the blog post
 *     responses:
 *       201:
 *         description: Blog generated
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation failed
 */
router.post(
  '/generate',
  auth,
  [body('topic').isString().isLength({ min: 2 }).withMessage('topic required')],
  blogsController.generate.bind(blogsController)
);

/**
 * @openapi
 * /api/blogs/history:
 *   get:
 *     summary: Get paginated history of generated blogs
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Blogs
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: History list
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/history',
  auth,
  [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 })],
  blogsController.history.bind(blogsController)
);

/**
 * @openapi
 * /api/blogs/{id}:
 *   get:
 *     summary: Get a blog post by id (only if owned by user)
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Blogs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog post
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.get(
  '/:id',
  auth,
  [param('id').isString().isLength({ min: 8 })],
  blogsController.getById.bind(blogsController)
);

module.exports = router;
