'use strict';

const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

/**
 * Generate a JWT token for the given user id.
 * @param {string} userId
 * @returns {string}
 */
function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not set');
  }
  // 7d expiry
  return jwt.sign({ sub: userId }, secret, { expiresIn: '7d' });
}

class AuthController {
  /**
   * Register a user with email, password, and optional name.
   */
  async register(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;
    try {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(409).json({ message: 'Email already registered' });
      }
      const user = new User({ email, name });
      await user.setPassword(password);
      await user.save();

      const token = signToken(user._id.toString());
      return res.status(201).json({
        token,
        user: { id: user._id, email: user.email, name: user.name },
      });
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ message: 'Registration failed' });
    }
  }

  /**
   * Login with email and password.
   */
  async login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email }).select('+passwordHash');
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const ok = await user.comparePassword(password);
      if (!ok) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = signToken(user._id.toString());
      return res.status(200).json({
        token,
        user: { id: user._id, email: user.email, name: user.name },
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Login failed' });
    }
  }

  /**
   * Return current user profile based on JWT.
   */
  async me(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.status(200).json({ id: user._id, email: user.email, name: user.name });
    } catch (err) {
      console.error('Me error:', err);
      return res.status(500).json({ message: 'Failed to fetch profile' });
    }
  }
}

module.exports = new AuthController();
