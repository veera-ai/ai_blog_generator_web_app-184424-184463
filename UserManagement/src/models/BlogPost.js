'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * BlogPost schema: stores generated blog posts per user.
 */
const blogPostSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    topic: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    model: { type: String, default: 'stub' },
    tokensUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index for userId + createdAt to support history queries
blogPostSchema.index({ userId: 1, createdAt: -1 });

const BlogPost = mongoose.model('BlogPost', blogPostSchema);
module.exports = BlogPost;
