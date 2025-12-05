const express = require('express');
const healthController = require('../controllers/health');

const authRoutes = require('./auth');
const blogRoutes = require('./blogs');

const router = express.Router();

// Health endpoints
/**
 * @openapi
 * /:
 *   get:
 *     summary: Health endpoint
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));
/**
 * @openapi
 * /healthz:
 *   get:
 *     summary: Liveness probe
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/healthz', (req, res) => res.status(200).json({ status: 'ok' }));

// API routes
router.use('/api/auth', authRoutes);
router.use('/api/blogs', blogRoutes);

module.exports = router;
