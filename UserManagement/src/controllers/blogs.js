'use strict';

const { validationResult } = require('express-validator');
const BlogPost = require('../models/BlogPost');

async function callOpenAIForBlog(topic) {
  const provider = (process.env.AI_PROVIDER || '').toLowerCase();
  const apiKey = process.env.AI_API_KEY;

  if (provider !== 'openai' || !apiKey) {
    // Deterministic stub content
    const content = [
      `Title: An Introduction to ${topic}`,
      '',
      `In this blog post, we explore the essentials of ${topic}.`,
      'We start by understanding core concepts, then discuss practical applications,',
      'and wrap up with tips and resources to go deeper.',
      '',
      'Key Takeaways:',
      `- What ${topic} is and why it matters`,
      '- Practical examples to get started',
      '- Common pitfalls and how to avoid them',
      '',
      `Conclusion: ${topic} offers many opportunities to build and learn.`,
    ].join('\n');
    return { model: 'stub', content, tokensUsed: content.split(/\s+/).length };
  }

  // OpenAI integration
  try {
    // Lazy require to avoid dependency if unused
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey });

    const prompt = `Write a concise blog article about '${topic}' with an engaging introduction, 3-5 key takeaways as bullet points, and a short conclusion.`;

    // Use responses API (compatible with latest openai package)
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful blogging assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const text = response?.choices?.[0]?.message?.content?.trim?.() || '';
    const tokens = response?.usage?.total_tokens || text.split(/\s+/).length;
    return { model: process.env.OPENAI_MODEL || 'gpt-4o-mini', content: text, tokensUsed: tokens };
  } catch (err) {
    console.error('OpenAI generation failed, falling back to stub:', err.message);
    const fallback = [
      `Title: Exploring ${topic}`,
      '',
      'We attempted to use AI to generate this blog post, but encountered an issue.',
      `Here's a helpful overview of ${topic} instead.`,
    ].join('\n');
    return { model: 'stub-fallback', content: fallback, tokensUsed: fallback.split(/\s+/).length };
  }
}

class BlogsController {
  /**
   * Generate a blog post for the current user based on topic.
   */
  async generate(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { topic } = req.body;
    try {
      const result = await callOpenAIForBlog(topic);
      const post = await BlogPost.create({
        userId,
        topic,
        content: result.content,
        model: result.model,
        tokensUsed: result.tokensUsed,
      });
      return res.status(201).json({
        id: post._id,
        topic: post.topic,
        content: post.content,
        model: post.model,
        tokensUsed: post.tokensUsed,
        createdAt: post.createdAt,
      });
    } catch (err) {
      console.error('Generate blog error:', err);
      return res.status(500).json({ message: 'Failed to generate blog post' });
    }
  }

  /**
   * Paginated history for the current user.
   */
  async history(req, res) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const skip = (page - 1) * limit;

    try {
      const [items, total] = await Promise.all([
        BlogPost.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
        BlogPost.countDocuments({ userId }),
      ]);
      return res.status(200).json({
        items: items.map((p) => ({
          id: p._id,
          topic: p.topic,
          model: p.model,
          tokensUsed: p.tokensUsed,
          createdAt: p.createdAt,
        })),
        page,
        limit,
        total,
      });
    } catch (err) {
      console.error('History error:', err);
      return res.status(500).json({ message: 'Failed to retrieve history' });
    }
  }

  /**
   * Get a single blog post by id if it belongs to current user.
   */
  async getById(req, res) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;
    try {
      const post = await BlogPost.findById(id);
      if (!post) return res.status(404).json({ message: 'Not found' });
      if (post.userId.toString() !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      return res.status(200).json({
        id: post._id,
        topic: post.topic,
        content: post.content,
        model: post.model,
        tokensUsed: post.tokensUsed,
        createdAt: post.createdAt,
      });
    } catch (err) {
      console.error('Get post error:', err);
      return res.status(500).json({ message: 'Failed to retrieve post' });
    }
  }
}

module.exports = new BlogsController();
