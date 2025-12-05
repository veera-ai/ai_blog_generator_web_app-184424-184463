'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * User schema: stores email, name, and password hash.
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

/**
 * Set password by hashing with bcrypt.
 * @param {string} password
 * @returns {Promise<void>}
 */
userSchema.methods.setPassword = async function setPassword(password) {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  this.passwordHash = hash;
};

/**
 * Compare a candidate password to the stored passwordHash.
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function comparePassword(password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
